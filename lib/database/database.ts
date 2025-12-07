import "dotenv/config";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

// Use sql from @vercel/postgres which automatically uses pooled connection
// Make sure POSTGRES_URL is set to a pooled connection string (ends with ?pgbouncer=true)
export const database = drizzle();
