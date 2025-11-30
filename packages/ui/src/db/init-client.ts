import { sqlDriver } from "@workspace/ui/db/client";
import { MIGRATIONS } from "@workspace/database/migrations";

export const initClientDb = async () => {
  await sqlDriver`
    CREATE TABLE IF NOT EXISTS "_migrations" (
      "id" integer PRIMARY KEY AUTOINCREMENT,
      "name" text NOT NULL,
      "applied_at" integer DEFAULT (unixepoch() * 1000)
    );
  `;

  const appliedMigrations =
    (await sqlDriver`SELECT name FROM "_migrations"`) as { name: string }[];
  const appliedMigrationNames = new Set(appliedMigrations.map((m) => m.name));

  for (const migration of MIGRATIONS) {
    if (!appliedMigrationNames.has(migration.name)) {
      try {
        // Split statements by statement-breakpoint
        const statements = migration.sql.split("--> statement-breakpoint");

        for (const statement of statements) {
          if (statement.trim()) {
            await sqlDriver(statement);
          }
        }

        await sqlDriver`INSERT INTO "_migrations" (name) VALUES (${migration.name})`;
      } catch (error) {
        console.error(`Failed to apply migration ${migration.name}:`, error);
        throw error;
      }
    }
  }
};
