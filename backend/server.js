// server.js - Express backend for RAG
import express from "express";
import cors from "cors";
import { generateRAGAnswer } from "./rag.js";
import { initializeDatabase, pool } from "./db.js";

const app = express();

/* ===== Middleware ===== */
app.use(cors());
app.use(express.json());

/* ===== Health Check ===== */
app.get("/api/health", async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      dbTime: dbRes.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/* ===== RAG Chat Endpoint ===== */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Valid 'message' field is required" });
    }

    const ragResponse = await generateRAGAnswer(message);

    res.json({
      answer: ragResponse.answer,
      relevantChunks: ragResponse.sources || []
    });
  } catch (err) {
    console.error("❌ Chat error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ===== Start Server ===== */
async function startServer() {
  try {
    await initializeDatabase();
    console.log("✅ Database connected");

    app.listen(3001, () => {
      console.log("✅ Backend running at http://localhost:3001");
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
  }
}

startServer();
