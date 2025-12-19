import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect()
  .then(() => {
    console.log("✅ Database connected successfully!");
    return client.end();
  })
  .catch(err => console.error("❌ Database connection failed:", err));
