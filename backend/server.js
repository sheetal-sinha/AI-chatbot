// server.js - Express backend for Simple RAG

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  ingestDocuments,
  generateRAGAnswer,
  generateRAGAnswerStream
} from "./rag.js";

import {
  initializeDatabase,
  
  getDocumentCount,
  clearAllDocuments
} from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ========= Middleware ========= */
app.use(cors());
app.use(express.json());

/* ========= Root ========= */
app.get("/", (req, res) => {
  res.json({
    message: "RAG Backend is running",
    endpoints: [
      "GET  /api/health",
      "POST /api/chat",
      "POST /api/chat/stream",
      "POST /api/ingest",
      "GET  /api/documents",
      "DELETE /api/documents"
    ]
  });
});

/* ========= Health ========= */
app.get("/api/health", async (req, res) => {
  try {
    const db = await checkDatabaseHealth();
    res.json({
      status: "ok",
      database: db.connected ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/* ========= RAG CHAT ========= */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Valid 'message' field is required"
      });
    }

    const ragResult = await generateRAGAnswer(message);

    // 🔑 VERY IMPORTANT: frontend expects these exact keys
    res.json({
      answer: ragResult.answer,
      relevantChunks: ragResult.sources || []
    });

  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ error: "Failed to generate answer" });
  }
});

/* ========= STREAMING CHAT ========= */
app.post("/api/chat/stream", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "message required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const onChunk = (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    };

    const result = await generateRAGAnswerStream(message, onChunk);

    res.write(`data: ${JSON.stringify({ done: true, sources: result.sources })}\n\n`);
    res.end();

  } catch (err) {
    console.error("❌ Streaming error:", err.message);
    res.end();
  }
});

/* ========= DOCUMENT INGEST ========= */
app.post("/api/ingest", async (req, res) => {
  try {
    const { filePath, fileType } = req.body;

    if (!filePath || !fileType) {
      return res.status(400).json({
        error: "filePath and fileType are required"
      });
    }

    const count = await ingestDocuments(filePath, fileType);

    res.json({
      message: "Document ingested",
      chunksStored: count,
      totalChunks: await getDocumentCount()
    });

  } catch (err) {
    console.error("❌ Ingest error:", err.message);
    res.status(500).json({ error: "Failed to ingest document" });
  }
});

/* ========= DOCUMENT INFO ========= */
app.get("/api/documents", async (req, res) => {
  const count = await getDocumentCount();
  res.json({ documentChunks: count });
});

app.delete("/api/documents", async (req, res) => {
  await clearAllDocuments();
  res.json({ message: "All documents cleared" });
});

/* ========= START SERVER ========= */
async function start() {
  try {
    await initializeDatabase();
    console.log("✅ Database ready");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
  }
}

start();
