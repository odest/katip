ALTER TABLE "action_items" RENAME COLUMN "content" TO "task";--> statement-breakpoint
ALTER TABLE "recordings" ALTER COLUMN "file_size" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "summaries" ALTER COLUMN "content" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "action_items" ADD COLUMN "assignee" text;