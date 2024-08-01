CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer DEFAULT (unixepoch() + 600) NOT NULL
);
