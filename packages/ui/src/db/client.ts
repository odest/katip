import { SQLocalDrizzle } from "sqlocal/drizzle";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "@workspace/database/schema/sqlite";

const { driver, sql } = new SQLocalDrizzle("katip.sqlite3");

export const sqlDriver = sql;

// Create the Drizzle instance using the sqlite-proxy driver
export const clientDb = drizzle(driver, {
  schema,
  logger: true,
});
