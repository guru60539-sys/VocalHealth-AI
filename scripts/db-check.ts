import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured in the environment.");
  }

  const pool = new Pool({ connectionString });
  try {
    await pool.query("select 1");
    console.log("Neon PostgreSQL connection successful.");
  } finally {
    await pool.end();
  }
}

main().catch(() => {
  console.error("Neon PostgreSQL connection failed. Check DATABASE_URL and Neon network access.");
  process.exitCode = 1;
});
