ALTER TABLE `action_items` RENAME COLUMN "content" TO "task";--> statement-breakpoint
ALTER TABLE `action_items` ADD `assignee` text;