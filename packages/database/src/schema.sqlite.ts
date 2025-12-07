import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

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
  duration: real("duration"),
  fileSize: integer("file_size"),
  status: text("status").notNull().default("queued"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
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
  content: text("content"),
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
  task: text("task").notNull(),
  assignee: text("assignee"),
  isCompleted: integer("is_completed", { mode: "boolean" }).default(false),
  priority: text("priority").default("medium"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).default(
    sql`(unixepoch() * 1000)`
  ),
});

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  recordings: many(recordings),
  transcripts: many(transcripts),
  summaries: many(summaries),
  actionItems: many(actionItems),
}));

export const recordingsRelations = relations(recordings, ({ one, many }) => ({
  user: one(users, {
    fields: [recordings.userId],
    references: [users.id],
  }),
  transcripts: many(transcripts),
  summaries: many(summaries),
  actionItems: many(actionItems),
}));

export const transcriptsRelations = relations(transcripts, ({ one, many }) => ({
  recording: one(recordings, {
    fields: [transcripts.recordingId],
    references: [recordings.id],
  }),
  user: one(users, {
    fields: [transcripts.userId],
    references: [users.id],
  }),
  summaries: many(summaries),
}));

export const summariesRelations = relations(summaries, ({ one, many }) => ({
  transcript: one(transcripts, {
    fields: [summaries.transcriptId],
    references: [transcripts.id],
  }),
  recording: one(recordings, {
    fields: [summaries.recordingId],
    references: [recordings.id],
  }),
  user: one(users, {
    fields: [summaries.userId],
    references: [users.id],
  }),
  actionItems: many(actionItems),
}));

export const actionItemsRelations = relations(actionItems, ({ one }) => ({
  summary: one(summaries, {
    fields: [actionItems.summaryId],
    references: [summaries.id],
  }),
  recording: one(recordings, {
    fields: [actionItems.recordingId],
    references: [recordings.id],
  }),
  user: one(users, {
    fields: [actionItems.userId],
    references: [users.id],
  }),
}));

// Inferred types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Recording = typeof recordings.$inferSelect;
export type NewRecording = typeof recordings.$inferInsert;

export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;

export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;

export type ActionItem = typeof actionItems.$inferSelect;
export type NewActionItem = typeof actionItems.$inferInsert;
