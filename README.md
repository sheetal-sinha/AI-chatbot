# 🤖 AI Chatbot

> An intelligent, extensible, and high-performance conversational AI chatbot built with modern web technologies, LLM integrations, and Retrieval-Augmented Generation (RAG) for querying custom documents.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [✨ Key Features](#-key-features)
- [🔍 Retrieval-Augmented Generation (RAG)](#-retrieval-augmented-generation-rag)
- [🛠 Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [💡 Usage & Examples](#-usage--examples)
  - [Basic Integration](#basic-integration-example-client)
  - [RAG PDF Querying](#rag-document-querying-example)
- [📁 Project Structure](#-project-structure)
- [⚙️ Configuration & Model Providers](#️-configuration--model-providers)
- [🗺 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📫 Contact](#-contact)

---

## 🧐 About the Project

**AI Chatbot** is a modern conversational platform designed to provide intuitive, real-time interactive AI assistance. Built with streaming support, flexible LLM provider routing, context memory, and document retrieval, it serves as a robust base for customer support, personal knowledge bases, retrieval-augmented generation (RAG), and developer automation.

### Why AI Chatbot?

- ⚡ **Real-Time Streaming Response**: Low-latency output streaming using Server-Sent Events (SSE) / WebSockets.
- 📄 **Document & PDF Intelligence**: Chat directly with your uploaded PDF, DOCX, TXT, or Markdown documents via built-in RAG.
- 🧩 **Multi-Provider Support**: Seamlessly plug in OpenAI, Google Gemini, Anthropic Claude, or local models via Ollama.
- 🎨 **Sleek UI/UX**: Responsive interface with dark/light modes, Markdown formatting, syntax-highlighted code blocks, and copy-to-clipboard.
- 🧠 **Context & Memory**: Persistent conversation history and chat thread management.
- 🔌 **Tool Calling & Vector Store Ready**: Easily extendable with custom APIs, web search tools, and vector embeddings (Pinecone, Chroma, Qdrant).

---

## ✨ Key Features

- **💬 Real-Time Streaming Chats**: Smooth word-by-word streaming responses for natural conversation flow.
- **📄 RAG & PDF Document Querying**: Upload PDF, TXT, or Markdown files to query your private documents with semantic search vector embeddings.
- **📚 Rich Markdown & Code Highlighting**: Automatic rendering of Markdown, tables, latex math, and syntax-highlighted code blocks.
- **🗂 Session & History Management**: Save, rename, export, or delete past conversation threads stored locally or in a database.
- **⚙️ Custom System Prompts & Personas**: Configure bot personalities, temperature, max tokens, and system instructions on the fly.
- **🔒 Privacy & Security**: Enterprise-ready API key handling, secure environment storage, and rate limiting.
- **📱 Responsive & Accessible**: Fully optimized for desktop, tablet, and mobile browsers with dark mode support.

---

## 🔍 Retrieval-Augmented Generation (RAG)

AI Chatbot includes an end-to-end **RAG Pipeline** allowing users to upload documents and ground the chatbot's answers strictly in private knowledge bases.

```
       ┌─────────────────┐
       │   PDF / Document│
       └────────┬────────┘
                │ 1. Upload & Extract Text
                ▼
       ┌─────────────────┐
       │ Text Chunking   │ (Chunk Size: 1000, Overlap: 200)
       └────────┬────────┘
                │ 2. Embed Chunks
                ▼
       ┌─────────────────┐
       │ Vector Database │ (Pinecone / ChromaDB / Qdrant)
       └────────┬────────┘
                │
┌───────────────┴────────────────┐
│ User Query: "Summarize Sec 4"  │
└───────────────┬────────────────┘
                │ 3. Similarity Search (Top-K Chunks)
                ▼
       ┌─────────────────┐
       │ Relevant Chunks │ + System Prompt + Conversation Memory
       └────────┬────────┘
                │ 4. Prompt Synthesis & LLM Streaming Output
                ▼
       ┌─────────────────┐
       │ Chatbot Answer  │ (Grounded with Sources & Citations)
       └─────────────────┘
```

### Supported Vector Databases
- **Pinecone**: Cloud-managed scalable vector index.
- **ChromaDB**: Lightweight embedded or server vector store.
- **Qdrant**: High-performance vector engine.
- **In-Memory**: Quick development vector store (zero external dependencies).

---

## 🛠 Tech Stack

### Core Frameworks & Libraries
- **Frontend**: React / Next.js / Vite, CSS Modules / Vanilla CSS / Tailwind
- **Backend**: Node.js (Express / Fastify) or Python (FastAPI / LangChain)
- **AI Models & SDKs**: OpenAI API, Google GenAI (Gemini), Anthropic SDK, Ollama (Local LLMs)
- **RAG & Vector Frameworks**: LangChain / LlamaIndex, PDF-Parse, pdfjs-dist
- **Storage / Vector Database**: SQLite / PostgreSQL, Pinecone / ChromaDB / Qdrant

---

## 🚀 Getting Started

Follow these steps to set up and run the AI Chatbot locally on your machine.

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher
- **npm**, **yarn**, or **pnpm**
- **Git**
- *(Optional)* **Python 3.10+** if using Python-based backend service
- *(Optional)* **API Key** from OpenAI, Google AI Studio, Anthropic, or Pinecone

```bash
node -v
npm -v
```

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/ai-chatbot.git
   cd ai-chatbot
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` (or `.env`) file in the root directory:
   ```bash
   cp .env.example .env
   ```

   Add your API keys and configuration settings:
   ```env
   # Application Settings
   PORT=3000
   NEXT_PUBLIC_APP_NAME="AI Chatbot"

   # AI Provider Keys
   OPENAI_API_KEY=your_openai_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # Model Selection Default
   DEFAULT_MODEL=gpt-4o

   # RAG & Vector Store Configuration
   ENABLE_RAG=true
   VECTOR_DB_TYPE=pinecone          # Options: pinecone | chroma | qdrant | memory
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX=ai-chatbot-docs
   EMBEDDING_MODEL=text-embedding-3-small
   CHUNK_SIZE=1000
   CHUNK_OVERLAP=200
   ```

4. **Launch the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to start chatting and uploading documents!

---

## 💡 Usage & Examples

### Basic Integration Example (Client)

```javascript
import { fetchChatStream } from './services/aiService';

async function handleSendMessage(userMessage) {
  const stream = await fetchChatStream({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: userMessage }],
    temperature: 0.7
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}
```

### RAG Document Querying Example

```javascript
import { ingestDocument, queryDocumentStore } from './services/ragService';

// 1. Upload & Ingest PDF Document
const fileBuffer = fs.readFileSync('./documents/financial_report.pdf');
const docMetadata = await ingestDocument({
  fileBuffer,
  fileName: 'financial_report.pdf',
  fileType: 'pdf'
});
console.log(`Document indexed successfully: ${docMetadata.documentId}`);

// 2. Query Chatbot with Document Context
const response = await queryDocumentStore({
  question: 'What were the key revenue drivers in Q3?',
  documentId: docMetadata.documentId,
  topK: 4
});

console.log('RAG Answer:', response.answer);
console.log('Sources Used:', response.sources);
```

### Setting Custom System Persona

You can customize the system persona in `src/config/persona.js`:

```javascript
export const SYSTEM_PERSONA = {
  role: "system",
  content: "You are a helpful, expert AI pair programming assistant specializing in web applications, system design, and document analysis."
};
```

---

## 📁 Project Structure

```text
ai-chatbot/
├── public/                # Static assets (images, icons, favicons)
├── src/
│   ├── assets/            # Global styles and typography
│   ├── components/        # Reusable UI components
│   │   ├── Chat/          # Chat window, message bubbles, input field
│   │   ├── DocumentUpload/# Drag & drop PDF uploader, progress bar
│   │   ├── Sidebar/       # Chat history list, model selector, document manager
│   │   └── UI/            # Buttons, modals, tooltips
│   ├── config/            # System prompts, RAG settings, LLM configs
│   ├── hooks/             # Custom React hooks (useChat, useRAG, useStream)
│   ├── services/          # API services for OpenAI, Gemini, Ollama
│   │   ├── aiService.js   # LLM completion & streaming handlers
│   │   ├── ragService.js  # Document parsing, chunking & vector search
│   │   └── vectorStore.js # Vector DB interface (Pinecone/Chroma)
│   ├── utils/             # Markdown parser, PDF extractor, storage helpers
│   └── App.jsx            # Main app layout and routing
├── .env.example           # Template for environment variables
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
```

---

## ⚙️ Configuration & Model Providers

AI Chatbot supports multiple LLM backend providers out of the box:

| Provider | Supported Models | Setup Required |
| :--- | :--- | :--- |
| **OpenAI** | `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo` | Set `OPENAI_API_KEY` |
| **Google Gemini** | `gemini-1.5-pro`, `gemini-1.5-flash` | Set `GEMINI_API_KEY` |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-haiku` | Set `ANTHROPIC_API_KEY` |
| **Ollama (Local)** | `llama3`, `mistral`, `phi3` | Run Ollama locally on `http://localhost:11434` |

---

## 🗺 Roadmap

- [x] Multi-model provider routing (OpenAI, Gemini, Anthropic)
- [x] Markdown, syntax highlighting, and latex math rendering
- [x] Streamed responses via SSE
- [x] Retrieval-Augmented Generation (RAG) for custom PDFs & documents
- [x] Vector Database Integrations (Pinecone, Chroma, Qdrant)
- [ ] Voice input & Text-to-Speech (TTS) audio response output
- [ ] Custom web search tool integrations (Brave Search / Google Search)
- [ ] Multi-modal input support (Image uploads & vision models)

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve AI Chatbot, please follow these steps:

1. **Fork** the Repository
2. **Create** your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your Changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the Branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

## 📫 Contact & Support

For questions, feedback, or suggestions, feel free to open an issue or reach out:

- **GitHub Issues**: [https://github.com/your-username/ai-chatbot/issues](https://github.com/your-username/ai-chatbot/issues)
- **Project Link**: [https://github.com/your-username/ai-chatbot](https://github.com/your-username/ai-chatbot)
