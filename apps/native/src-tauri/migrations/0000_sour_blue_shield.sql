CREATE TABLE `action_items` (
	`id` text PRIMARY KEY NOT NULL,
	`summary_id` text,
	`recording_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`is_completed` integer DEFAULT false,
	`priority` text DEFAULT 'medium',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`summary_id`) REFERENCES `summaries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recording_id`) REFERENCES `recordings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `recordings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`file_path` text NOT NULL,
	`file_hash` text,
	`duration` integer,
	`file_size` integer,
	`status` text DEFAULT 'queued' NOT NULL,
	`is_favorite` integer DEFAULT false,
	`tags` text,
	`color` text,
	`is_synced` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` text PRIMARY KEY NOT NULL,
	`transcript_id` text,
	`recording_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text,
	`provider` text,
	`model` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`transcript_id`) REFERENCES `transcripts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recording_id`) REFERENCES `recordings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transcripts` (
	`id` text PRIMARY KEY NOT NULL,
	`recording_id` text NOT NULL,
	`user_id` text NOT NULL,
	`language` text,
	`model` text,
	`segments` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`recording_id`) REFERENCES `recordings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`avatar_url` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000)
);
