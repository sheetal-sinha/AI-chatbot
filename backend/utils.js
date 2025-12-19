// utils.js - Simple text processing utilities

import fs from "fs";
import path from "path";

/**
 * Split text into chunks with overlap
 */
export function splitTextIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  // Clean up the text
  text = text.replace(/\r\n/g, "\n").trim();

  while (start < text.length) {
    let end = start + chunkSize;

    // If not at the end, try to break at sentence boundary
    if (end < text.length) {
      const nextPeriod = text.indexOf(".", end);
      const nextNewline = text.indexOf("\n", end);
      
      // Find the closest sentence boundary within 100 chars
      if (nextPeriod !== -1 && nextPeriod < end + 100) {
        end = nextPeriod + 1;
      } else if (nextNewline !== -1 && nextNewline < end + 100) {
        end = nextNewline + 1;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Move start position with overlap
    start = end - overlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

/**
 * Read text file
 */
export function readTextFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return content;
}

/**
 * Get all files in a directory
 */
export function getFilesInDirectory(directoryPath, extensions = [".txt"]) {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Directory not found: ${directoryPath}`);
  }

  const files = fs.readdirSync(directoryPath);
  
  return files
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return extensions.includes(ext);
    })
    .map(file => path.join(directoryPath, file));
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/**
 * Get file info
 */
export function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  const content = fs.readFileSync(filePath, "utf-8");
  
  return {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
    sizeFormatted: formatFileSize(stats.size),
    lines: content.split("\n").length,
    characters: content.length,
    modified: stats.mtime
  };
}

/**
 * Simple sentence tokenizer
 */
export function splitIntoSentences(text) {
  // Simple sentence splitting (can be improved)
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Clean text for processing
 */
export function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")           // Normalize line endings
    .replace(/\n{3,}/g, "\n\n")       // Remove excessive newlines
    .replace(/\t/g, " ")              // Replace tabs with spaces
    .replace(/[ ]{2,}/g, " ")         // Remove excessive spaces
    .trim();
}