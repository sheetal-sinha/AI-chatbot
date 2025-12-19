// db.js - NeonDB with pgvector setup for RAG
import { neon } from "@neondatabase/serverless";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing in .env");
}

// Pool for Postgres queries
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Neon serverless client (optional)
export const sql = neon(process.env.DATABASE_URL);

/**
 * Initialize database (pgvector + documents table)
 */
export async function initializeDatabase() {
  try {
    console.log("🔧 Initializing database...");

    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(${process.env.EMBEDDING_DIMENSIONS || 384}),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS documents_embedding_idx
      ON documents
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);
    `);

    console.log("✅ Database ready");
  } catch (err) {
    console.error("❌ Database init error:", err.message);
    throw err;
  }
}

/**
 * Store a document and its embedding
 */
export async function storeDocument(content, metadata, embedding) {
  try {
    const embeddingString = `[${embedding.join(",")}]`;

    const result = await pool.query(
      `INSERT INTO documents (content, metadata, embedding)
       VALUES ($1, $2, $3) RETURNING id`,
      [content, JSON.stringify(metadata), embeddingString]
    );

    return result.rows[0].id;
  } catch (err) {
    console.error("Error storing document:", err);
    throw err;
  }
}

/**
 * Search for similar documents using cosine similarity
 */
export async function searchSimilarDocuments(queryEmbedding, topK = 3) {
  try {
    const embeddingString = `[${queryEmbedding.join(",")}]`;

    const result = await pool.query(
      `SELECT id, content, metadata, 1 - (embedding <=> $1::vector) AS similarity
       FROM documents
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [embeddingString, topK]
    );

    return result.rows;
  } catch (err) {
    console.error("Error searching documents:", err);
    throw err;
  }
}

/**
 * Get total documents count
 */
export async function getDocumentCount() {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM documents");
    return parseInt(result.rows[0].count);
  } catch (err) {
    console.error("Error counting documents:", err);
    return 0;
  }
}

/**
 * Clear all documents
 */
export async function clearAllDocuments() {
  try {
    await pool.query("TRUNCATE TABLE documents RESTART IDENTITY");
    console.log("✅ All documents cleared");
  } catch (err) {
    console.error("Error clearing documents:", err);
    throw err;
  }
}

/**
 * Close database pool
 */
export async function closeDatabase() {
  try {
    await pool.end();
    console.log("✅ Database connection closed");
  } catch (err) {
    console.error("Error closing database:", err);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeDatabase();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await closeDatabase();
  process.exit(0);
});
