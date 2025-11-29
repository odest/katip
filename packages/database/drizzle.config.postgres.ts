import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/postgres',
  schema: './src/schema.postgres.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
