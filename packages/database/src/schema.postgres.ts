import {
  pgTable,
  text,
  uuid,
  jsonb,
  bigint,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recordings = pgTable("recordings", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileHash: text("file_hash"),
  duration: doublePrecision("duration"),
  fileSize: bigint("file_size", { mode: "number" }),
  status: text("status").notNull().default("queued"),
  isFavorite: boolean("is_favorite").default(false),
  tags: jsonb("tags").$type<string[]>(),
  isSynced: boolean("is_synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const transcripts = pgTable("transcripts", {
  id: uuid("id").primaryKey(),
  recordingId: uuid("recording_id")
    .notNull()
    .references(() => recordings.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  language: text("language"),
  model: text("model"),
  segments: jsonb("segments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const summaries = pgTable("summaries", {
  id: uuid("id").primaryKey(),
  transcriptId: uuid("transcript_id").references(() => transcripts.id, {
    onDelete: "cascade",
  }),
  recordingId: uuid("recording_id")
    .notNull()
    .references(() => recordings.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  provider: text("provider"),
  model: text("model"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const actionItems = pgTable("action_items", {
  id: uuid("id").primaryKey(),
  summaryId: uuid("summary_id").references(() => summaries.id, {
    onDelete: "cascade",
  }),
  recordingId: uuid("recording_id")
    .notNull()
    .references(() => recordings.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  task: text("task").notNull(),
  assignee: text("assignee"),
  isCompleted: boolean("is_completed").default(false),
  priority: text("priority").default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
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
