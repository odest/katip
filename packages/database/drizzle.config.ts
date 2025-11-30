import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.sqlite.ts",
  dialect: "sqlite",
});
