CREATE TABLE `sports_cache` (
	`source_url` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`league` text,
	`payload` text NOT NULL,
	`fetched_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`last_error` text
);
--> statement-breakpoint
CREATE INDEX `sports_cache_kind_league_idx` ON `sports_cache` (`kind`,`league`);--> statement-breakpoint
CREATE INDEX `sports_cache_expires_at_idx` ON `sports_cache` (`expires_at`);