import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
});

export const recordings = sqliteTable("recordings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileHash: text("file_hash"),
  duration: integer("duration"),
  fileSize: integer("file_size"),
  status: text("status").notNull().default("queued"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  color: text("color"),
  isSynced: integer("is_synced", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const transcripts = sqliteTable("transcripts", {
  id: text("id").primaryKey(),
  recordingId: text("recording_id")
    .notNull()
    .references(() => recordings.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  language: text("language"),
  model: text("model"),
  segments: text("segments", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
});

export const summaries = sqliteTable("summaries", {
  id: text("id").primaryKey(),
  transcriptId: text("transcript_id").references(() => transcripts.id, {
    onDelete: "cascade",
  }),
  recordingId: text("recording_id")
    .notNull()
    .references(() => recordings.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content", { mode: "json" }),
  provider: text("provider"),
  model: text("model"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
});

export const actionItems = sqliteTable("action_items", {
  id: text("id").primaryKey(),
  summaryId: text("summary_id").references(() => summaries.id, {
    onDelete: "cascade",
  }),
  recordingId: text("recording_id")
    .notNull()
    .references(() => recordings.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  priority: text("priority").default("medium"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
});
