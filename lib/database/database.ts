import { drizzle } from "drizzle-orm/node-postgres";
import "dotenv/config";

// Use sql from @vercel/postgres which automatically uses pooled connection
// Make sure POSTGRES_URL is set to a pooled connection string (ends with ?pgbouncer=true)

export const database = drizzle(process.env.POSTGRES_URL!);
