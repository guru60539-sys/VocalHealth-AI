import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";

const globalForNeon = globalThis as typeof globalThis & {
  neonPool?: Pool;
};

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  globalForNeon.neonPool ??= new Pool({ connectionString: databaseUrl });
  return drizzle(globalForNeon.neonPool, { schema });
}
