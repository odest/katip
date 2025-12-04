PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recordings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`file_path` text NOT NULL,
	`file_hash` text,
	`duration` real,
	`file_size` integer,
	`status` text DEFAULT 'queued' NOT NULL,
	`is_favorite` integer DEFAULT false,
	`tags` text,
	`is_synced` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_recordings`("id", "user_id", "title", "description", "file_path", "file_hash", "duration", "file_size", "status", "is_favorite", "tags", "is_synced", "created_at", "updated_at", "deleted_at") SELECT "id", "user_id", "title", "description", "file_path", "file_hash", "duration", "file_size", "status", "is_favorite", "tags", "is_synced", "created_at", "updated_at", "deleted_at" FROM `recordings`;--> statement-breakpoint
DROP TABLE `recordings`;--> statement-breakpoint
ALTER TABLE `__new_recordings` RENAME TO `recordings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;