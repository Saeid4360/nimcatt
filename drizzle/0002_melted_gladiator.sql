CREATE TABLE `entity_localizations` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`locale` text NOT NULL,
	`display_name` text NOT NULL,
	`source` text NOT NULL,
	`is_verified` integer DEFAULT false NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `entity_localizations_entity_locale_uidx` ON `entity_localizations` (`entity_type`,`entity_id`,`locale`);--> statement-breakpoint
CREATE INDEX `entity_localizations_locale_name_idx` ON `entity_localizations` (`locale`,`display_name`);--> statement-breakpoint
CREATE TABLE `player_media` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text,
	`kind` text NOT NULL,
	`url` text,
	`source` text NOT NULL,
	`source_record_id` text,
	`source_url` text,
	`license` text,
	`status` text NOT NULL,
	`is_current` integer DEFAULT true NOT NULL,
	`captured_at` integer NOT NULL,
	`metadata_json` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_media_player_team_kind_uidx` ON `player_media` (`player_id`,`team_id`,`kind`);--> statement-breakpoint
CREATE INDEX `player_media_player_idx` ON `player_media` (`player_id`,`is_current`);