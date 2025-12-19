// scripts/setup-database.js - Initialize database schema

import { initializeDatabase, closeDatabase } from "../db.js";

async function setup() {
  try {
    console.log("\n🔧 Setting up database...\n");
    
    await initializeDatabase();
    
    console.log("\n✅ Database setup complete!");
    console.log("\nYou can now:");
    console.log("  1. Ingest documents: npm run ingest");
    console.log("  2. Start server: npm start\n");
    
    await closeDatabase();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    console.error("\nPlease check:");
    console.error("  - DATABASE_URL is correct in .env");
    console.error("  - NeonDB instance is running");
    console.error("  - pgvector extension is available\n");
    
    await closeDatabase();
    process.exit(1);
  }
}

setup();