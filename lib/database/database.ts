import "dotenv/config";
import { drizzle } from "drizzle-orm/vercel-postgres";

export const database = drizzle();
