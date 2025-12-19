// scripts/ingest-docs.js
import fs from "fs";
import path from "path";
import { ingestDocuments } from "../rag.js";
import { closeDatabase } from "../db.js";

const DOCS_DIR = path.join(process.cwd(), "documents"); // ensure folder name is correct
const SUPPORTED = [".txt", ".pdf"];

async function ingest() {
  try {
    const files = fs.readdirSync(DOCS_DIR).filter(f =>
      SUPPORTED.includes(path.extname(f).toLowerCase())
    );

    if (files.length === 0) {
      console.log("⚠️ No documents found in", DOCS_DIR);
      await closeDatabase();
      process.exit(0);
    }

    console.log(`🚀 Found ${files.length} documents. Starting ingestion...\n`);
    let totalChunks = 0;

    for (const file of files) {
      const filePath = path.join(DOCS_DIR, file);
      const type = path.extname(file).replace(".", "").toLowerCase();

      try {
        const chunks = await ingestDocuments(filePath, type);
        totalChunks += chunks;
        console.log(`✅ ${file} → ${chunks} chunks ingested\n`);
      } catch (err) {
        console.error(`❌ Failed to ingest ${file}:`, err.message, "\n");
      }
    }

    console.log("=".repeat(60));
    console.log(`✅ Ingestion complete! Total chunks stored: ${totalChunks}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Error during ingestion:", error.message);
  } finally {
    await closeDatabase();
    process.exit(0);
  }
}

// Start ingestion
ingest();
