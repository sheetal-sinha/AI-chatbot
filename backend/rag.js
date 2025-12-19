// rag.js - RAG ingestion and retrieval
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";          // for normal PDFs
import Tesseract from "tesseract.js";     // OCR for scanned PDFs
import { generateEmbedding,generateText,generateTextStream,  } from "./ollama.js";
import { storeDocument, searchSimilarDocuments } from "./db.js";
import { splitTextIntoChunks, cleanText } from "./utils.js";
import dotenv from "dotenv";               // Load environment variables
dotenv.config();                          // Load .env file


export async function ingestDocuments(filePath, type) {
  try {
    let text = "";

    if (type === "txt") {
      text = fs.readFileSync(filePath, "utf-8");
    }

    if (type === "pdf") {
      // Try reading normal PDF first
      const dataBuffer = fs.readFileSync(filePath);
      try {
        const data = await pdfParse(dataBuffer);
        text = data.text.trim();
      } catch (err) {
        console.warn("Normal PDF parse failed, trying OCR:", err.message);
      }

      // If PDF text is empty, use OCR
      if (!text || text.length === 0) {
        console.log("OCR fallback for PDF:", filePath);
        const { data: { text: ocrText } } = await Tesseract.recognize(filePath, "eng");
        text = ocrText.trim();
      }
    }

    if (!text || text.length === 0) {
      console.warn("Document is empty, skipping:", filePath);
      return 0;
    }

    text = cleanText(text);

    const chunkSize = parseInt(process.env.CHUNK_SIZE) || 1000;
    const chunkOverlap = parseInt(process.env.CHUNK_OVERLAP) || 200;
    const chunks = splitTextIntoChunks(text, chunkSize, chunkOverlap);

    let storedCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      const metadata = {
        source: filePath,
        fileType: type,
        chunkIndex: i,
        totalChunks: chunks.length,
        chunkSize: chunks[i].length,
      };
      await storeDocument(chunks[i], metadata, embedding);
      storedCount++;
    }

    console.log(`✅ Successfully ingested ${storedCount} chunks from ${filePath}`);
    return storedCount;

  } catch (error) {
    console.error(`❌ Error ingesting document ${filePath}:`, error.message);
    return 0;
  }
}

export async function retrieveRelevantDocuments(query, topK = 3) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const results = await searchSimilarDocuments(queryEmbedding, topK);
    return results;
  } catch (error) {
    console.error("Error retrieving documents:", error.message);
    return [];
  }
}

// --------------------- Build Context ---------------------
function buildContext(documents) {
  if (!documents || documents.length === 0) return "";
  return documents
    .map((doc, idx) => `[Source ${idx + 1}: ${doc.metadata?.source || "Unknown"}]\n${doc.content}`)
    .join("\n\n---\n\n");
}

// --------------------- Create RAG Prompt ---------------------
function createRAGPrompt(query, context) {
  return `You are a helpful AI assistant. Answer the question based on the provided context. If the answer cannot be found in the context, say so clearly.

Context:
${context}

Question: ${query}

Instructions:
- Only use information from the context above
- Be concise and accurate
- If unsure, say you don't know
- Cite which source you used when relevant

Answer:`;
}

// --------------------- Generate RAG Answer ---------------------
export async function generateRAGAnswer(query) {
  try {
    const relevantDocs = await retrieveRelevantDocuments(query, 4);

    // Build context ONLY if similarity is reasonable
    const usefulDocs = relevantDocs.filter(d => d.similarity >= 0.6);

    const context = usefulDocs.length
      ? buildContext(usefulDocs)
      : "";

    const prompt = createRAGPrompt(query, context);
    const answer = await generateText(prompt);

    return {
      answer: answer.trim(),
      relevantChunks: usefulDocs.length,
      sources: usefulDocs.map(d => ({
        content: d.content.slice(0, 200),
        similarity: d.similarity,
        metadata: d.metadata
      }))
    };

  } catch (err) {
    console.error("RAG error:", err.message);
    return {
      answer: "⚠️ Unable to process your request right now.",
      relevantChunks: 0,
      sources: []
    };
  }
}

// --------------------- Generate Streaming RAG Answer ---------------------
export async function generateRAGAnswerStream(query, onChunk) {
  try {
    const relevantDocs = await retrieveRelevantDocuments(query);

    if (!relevantDocs || relevantDocs.length === 0) {
      onChunk("I don't have any relevant information in my knowledge base to answer this question.");
      return { sources: [], relevantChunks: 0 };
    }

    const context = buildContext(relevantDocs);
    const prompt = createRAGPrompt(query, context);

    await generateTextStream(prompt, onChunk);

    return {
      sources: relevantDocs.map(doc => ({
        content: doc.content.substring(0, 200) + (doc.content.length > 200 ? "..." : ""),
        similarity: parseFloat(doc.similarity).toFixed(4),
        metadata: doc.metadata
      })),
      relevantChunks: relevantDocs.length
    };

  } catch (error) {
    console.error("❌ Error generating streaming RAG answer:", error.message);
    return { sources: [], relevantChunks: 0 };
  }
} 