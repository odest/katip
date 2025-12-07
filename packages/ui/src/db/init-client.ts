import { sqlDriver } from "@workspace/ui/db/client";
import { MIGRATIONS } from "@workspace/database/migrations";

let initializationPromise: Promise<void> | null = null;

export const initClientDb = () => {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      await sqlDriver`
        CREATE TABLE IF NOT EXISTS "_migrations" (
          "id" integer PRIMARY KEY AUTOINCREMENT,
          "name" text NOT NULL,
          "applied_at" integer DEFAULT (unixepoch() * 1000)
        );
      `;

      const appliedMigrations =
        (await sqlDriver`SELECT name FROM "_migrations"`) as {
          name: string;
        }[];
      const appliedMigrationNames = new Set(
        appliedMigrations.map((m) => m.name)
      );

      for (const migration of MIGRATIONS) {
        if (!appliedMigrationNames.has(migration.name)) {
          try {
            await sqlDriver`BEGIN TRANSACTION`;
            // Split statements by statement-breakpoint
            const statements = migration.sql.split("--> statement-breakpoint");

            for (const statement of statements) {
              if (statement.trim()) {
                await sqlDriver(statement);
              }
            }

            await sqlDriver`INSERT INTO "_migrations" (name) VALUES (${migration.name})`;
            await sqlDriver`COMMIT`;
          } catch (error) {
            await sqlDriver`ROLLBACK`;
            console.error(
              `Migration failed, changes rolled back: ${migration.name}`,
              error
            );
            throw error;
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize client database:", error);
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};
