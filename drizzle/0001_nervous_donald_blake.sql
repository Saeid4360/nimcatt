CREATE TABLE IF NOT EXISTS `fixtures` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`league` text,
	`season_year` integer,
	`round_number` integer,
	`kickoff_at` text,
	`home_team_id` text,
	`away_team_id` text,
	`status` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `fixtures_provider_external_uidx` ON `fixtures` (`provider`,`external_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `fixtures_league_season_round_idx` ON `fixtures` (`league`,`season_year`,`round_number`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `match_events` (
	`id` text PRIMARY KEY NOT NULL,
	`fixture_id` text NOT NULL,
	`provider` text NOT NULL,
	`external_id` text,
	`sequence` integer,
	`period` integer,
	`minute` integer,
	`second` integer,
	`team_id` text,
	`player_id` text,
	`event_type` text NOT NULL,
	`outcome` text,
	`start_x` real,
	`start_y` real,
	`end_x` real,
	`end_y` real,
	`qualifiers_json` text,
	`raw_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `match_events_fixture_idx` ON `match_events` (`fixture_id`,`sequence`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `match_events_player_idx` ON `match_events` (`player_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `player_match_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`fixture_id` text NOT NULL,
	`team_id` text NOT NULL,
	`provider` text NOT NULL,
	`starter` integer,
	`position` text,
	`minutes` real,
	`goals` real,
	`assists` real,
	`rating` real,
	`shots_total` real,
	`shots_on_target` real,
	`passes_total` real,
	`passes_accurate` real,
	`key_passes` real,
	`duels_total` real,
	`duels_won` real,
	`dribbles_attempted` real,
	`dribbles_completed` real,
	`tackles` real,
	`interceptions` real,
	`clearances` real,
	`possession_lost` real,
	`fouls_committed` real,
	`fouls_won` real,
	`yellow_cards` real,
	`red_cards` real,
	`xg` real,
	`xa` real,
	`stats_json` text NOT NULL,
	`provider_updated_at` integer,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `player_match_provider_uidx` ON `player_match_stats` (`player_id`,`fixture_id`,`provider`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_match_player_idx` ON `player_match_stats` (`player_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_match_fixture_idx` ON `player_match_stats` (`fixture_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `player_provider_ids` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `player_provider_external_uidx` ON `player_provider_ids` (`provider`,`external_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_provider_player_idx` ON `player_provider_ids` (`player_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `player_season_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`provider` text NOT NULL,
	`league` text,
	`season_year` integer,
	`appearances` real,
	`minutes` real,
	`goals` real,
	`assists` real,
	`rating` real,
	`stats_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_season_player_idx` ON `player_season_stats` (`player_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_season_league_idx` ON `player_season_stats` (`league`,`season_year`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `player_team_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`team_id` text NOT NULL,
	`league` text,
	`season_year` integer,
	`jersey_number` text,
	`position` text,
	`valid_from` text,
	`valid_to` text,
	`is_current` integer DEFAULT true NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_team_player_idx` ON `player_team_periods` (`player_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `player_team_team_idx` ON `player_team_periods` (`team_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_fa` text,
	`first_name_en` text,
	`last_name_en` text,
	`slug` text,
	`date_of_birth` text,
	`birth_place` text,
	`nationality` text,
	`citizenship_code` text,
	`gender` text,
	`height_cm` real,
	`weight_kg` real,
	`preferred_foot` text,
	`primary_position` text,
	`photo_url` text,
	`status` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `players_name_en_idx` ON `players` (`name_en`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `players_name_fa_idx` ON `players` (`name_fa`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`external_id` text NOT NULL,
	`league` text,
	`name_en` text,
	`name_fa` text,
	`logo_url` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `teams_provider_external_uidx` ON `teams` (`provider`,`external_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `teams_league_idx` ON `teams` (`league`);