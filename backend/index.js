import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    message: "Ollama Chatbot API is running",
    status: "ok"
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2",
        prompt: message,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error("Ollama not responding");
    }

    const data = await response.json();

    res.json({
      reply: data.response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to connect to Ollama"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
