import { drizzle } from "drizzle-orm/sqlite-proxy";
import { invoke } from "@tauri-apps/api/core";
import * as schema from "@workspace/database/schema/sqlite";

type Row = {
  columns: string[];
  values: string[];
};

export const nativeDb = drizzle(
  async (sql, params, method) => {
    try {
      const rows = await invoke<Row[]>("run_sql", {
        query: { sql, params },
      });

      if (rows.length === 0 && method === "get") {
        // Workaround for Drizzle ORM SQLite Proxy .get() bug
        return {} as { rows: string[] };
      }

      return method === "get"
        ? { rows: rows[0]!.values.map((v) => (v === "" ? null : v)) }
        : {
            rows: rows.map((r) => r.values.map((v) => (v === "" ? null : v))),
          };
    } catch (e: unknown) {
      console.error("Error from sqlite proxy server: ", e);
      return { rows: [] };
    }
  },
  {
    schema,
    logger: true,
  }
);
