import "dotenv/config";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { createClient, sql } from "@vercel/postgres";

// Use sql from @vercel/postgres which automatically uses pooled connection
// Make sure POSTGRES_URL is set to a pooled connection string (ends with ?pgbouncer=true)

const client = createClient({
  connectionString: process.env.POSTGRES_URL,
});
export const database = drizzle(client);
