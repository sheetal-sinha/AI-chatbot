// ollama.js - Simple Ollama API client (No external dependencies)

import http from "http";
import dotenv from "dotenv";
import fetch from "node-fetch";


dotenv.config();

const OLLAMA_HOST = "127.0.0.1";
const OLLAMA_PORT = 11434;

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama2";
const OLLAMA_URL = process.env.OLLAMA_URL || `http://localhost:11434 `;


/**
 * Make HTTP request to Ollama API
 */
function makeOllamaRequest(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      },
      timeout: 300000 // 5 minutes timeout for large models
    };

    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Ollama request failed: ${error.message}`));
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.write(data);
    req.end();
  });
}

/**
 * Generate text embedding using Ollama
 */
export async function generateEmbedding(text) {
  try {
    const response = await makeOllamaRequest("/api/embeddings", {
      model: "nomic-embed-text",
      prompt: text
    });

    return response.embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    throw error;
  }
}

/**
 * Generate text completion using Ollama
 */
export async function generateText(prompt) {
  const res = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama2",
      prompt,
      stream: false
    })
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status}`);
  }

  const data = await res.json();   // ✅ This is valid JSON
  return data.response;
}


 

/**
 * Generate streaming text completion using Ollama
 */
export async function generateTextStream(prompt, onChunk) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: true,
      options: {
        temperature: parseFloat(process.env.TEMPERATURE) || 0.7
      }
    });

    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: "/api/generate",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      res.on("data", (chunk) => {
        const lines = chunk.toString().split("\n").filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              onChunk(data.response);
            }
            if (data.done) {
              resolve();
            }
          } catch (error) {
            // Ignore parse errors for partial chunks
          }
        }
      });

      res.on("end", () => {
        resolve();
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: OLLAMA_HOST,
      port: OLLAMA_PORT,
      path: "/api/tags",
      method: "GET",
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            available: true,
            models: parsed.models || []
          });
        } catch {
          resolve({ available: false });
        }
      });
    });

    req.on("error", () => {
      resolve({ available: false });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ available: false });
    });

    req.end();
  });
}