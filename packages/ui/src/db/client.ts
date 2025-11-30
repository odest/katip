import { SQLocalDrizzle } from "sqlocal/drizzle";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { isTauri } from "@tauri-apps/api/core";
import * as schema from "@workspace/database/schema/sqlite";

let clientDb: any = null;
let sqlDriver: any = null;

if (!isTauri()) {
  const { driver, sql } = new SQLocalDrizzle({
    databasePath: "katip.sqlite3",
    verbose: true,
    onInit: (sql) => {
      return [
        sql`PRAGMA foreign_keys = ON;`,
        sql`PRAGMA journal_mode = WAL;`,
        sql`PRAGMA synchronous = NORMAL;`,
      ];
    },
    onConnect: () => {
      console.log("Client database connected successfully.");
    },
  });

  sqlDriver = sql;

  // Create the Drizzle instance using the sqlite-proxy driver
  clientDb = drizzle(driver, {
    schema,
    logger: true,
  });
}

export { clientDb, sqlDriver };
