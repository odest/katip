import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@workspace/database/schema/postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const serverDb = drizzle(client, { schema });
