import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const sportsCache = sqliteTable(
  "sports_cache",
  {
    sourceUrl: text("source_url").primaryKey(),
    kind: text("kind").notNull(),
    league: text("league"),
    payload: text("payload").notNull(),
    fetchedAt: integer("fetched_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
    lastError: text("last_error"),
  },
  (table) => [
    index("sports_cache_kind_league_idx").on(table.kind, table.league),
    index("sports_cache_expires_at_idx").on(table.expiresAt),
  ],
);

export const players = sqliteTable(
  "players",
  {
    id: text("id").primaryKey(),
    nameEn: text("name_en").notNull(),
    nameFa: text("name_fa"),
    firstNameEn: text("first_name_en"),
    lastNameEn: text("last_name_en"),
    slug: text("slug"),
    dateOfBirth: text("date_of_birth"),
    birthPlace: text("birth_place"),
    nationality: text("nationality"),
    citizenshipCode: text("citizenship_code"),
    gender: text("gender"),
    heightCm: real("height_cm"),
    weightKg: real("weight_kg"),
    preferredFoot: text("preferred_foot"),
    primaryPosition: text("primary_position"),
    photoUrl: text("photo_url"),
    status: text("status"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("players_name_en_idx").on(table.nameEn), index("players_name_fa_idx").on(table.nameFa)],
);

export const playerProviderIds = sqliteTable(
  "player_provider_ids",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").notNull(),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
    firstSeenAt: integer("first_seen_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
  },
  (table) => [uniqueIndex("player_provider_external_uidx").on(table.provider, table.externalId), index("player_provider_player_idx").on(table.playerId)],
);

export const teams = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
    league: text("league"),
    nameEn: text("name_en"),
    nameFa: text("name_fa"),
    logoUrl: text("logo_url"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("teams_provider_external_uidx").on(table.provider, table.externalId), index("teams_league_idx").on(table.league)],
);

export const playerTeamPeriods = sqliteTable(
  "player_team_periods",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").notNull(),
    teamId: text("team_id").notNull(),
    league: text("league"),
    seasonYear: integer("season_year"),
    jerseyNumber: text("jersey_number"),
    position: text("position"),
    validFrom: text("valid_from"),
    validTo: text("valid_to"),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
    firstSeenAt: integer("first_seen_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
  },
  (table) => [index("player_team_player_idx").on(table.playerId), index("player_team_team_idx").on(table.teamId)],
);

export const fixtures = sqliteTable(
  "fixtures",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    externalId: text("external_id").notNull(),
    league: text("league"),
    seasonYear: integer("season_year"),
    roundNumber: integer("round_number"),
    kickoffAt: text("kickoff_at"),
    homeTeamId: text("home_team_id"),
    awayTeamId: text("away_team_id"),
    status: text("status"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("fixtures_provider_external_uidx").on(table.provider, table.externalId), index("fixtures_league_season_round_idx").on(table.league, table.seasonYear, table.roundNumber)],
);

export const playerMatchStats = sqliteTable(
  "player_match_stats",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").notNull(),
    fixtureId: text("fixture_id").notNull(),
    teamId: text("team_id").notNull(),
    provider: text("provider").notNull(),
    starter: integer("starter", { mode: "boolean" }),
    position: text("position"),
    minutes: real("minutes"),
    goals: real("goals"),
    assists: real("assists"),
    rating: real("rating"),
    shotsTotal: real("shots_total"),
    shotsOnTarget: real("shots_on_target"),
    passesTotal: real("passes_total"),
    passesAccurate: real("passes_accurate"),
    keyPasses: real("key_passes"),
    duelsTotal: real("duels_total"),
    duelsWon: real("duels_won"),
    dribblesAttempted: real("dribbles_attempted"),
    dribblesCompleted: real("dribbles_completed"),
    tackles: real("tackles"),
    interceptions: real("interceptions"),
    clearances: real("clearances"),
    possessionLost: real("possession_lost"),
    foulsCommitted: real("fouls_committed"),
    foulsWon: real("fouls_won"),
    yellowCards: real("yellow_cards"),
    redCards: real("red_cards"),
    expectedGoals: real("xg"),
    expectedAssists: real("xa"),
    statsJson: text("stats_json").notNull(),
    providerUpdatedAt: integer("provider_updated_at"),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [uniqueIndex("player_match_provider_uidx").on(table.playerId, table.fixtureId, table.provider), index("player_match_player_idx").on(table.playerId), index("player_match_fixture_idx").on(table.fixtureId)],
);

export const playerSeasonStats = sqliteTable(
  "player_season_stats",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").notNull(),
    teamId: text("team_id").notNull(),
    provider: text("provider").notNull(),
    league: text("league"),
    seasonYear: integer("season_year"),
    appearances: real("appearances"),
    minutes: real("minutes"),
    goals: real("goals"),
    assists: real("assists"),
    rating: real("rating"),
    statsJson: text("stats_json").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("player_season_player_idx").on(table.playerId), index("player_season_league_idx").on(table.league, table.seasonYear)],
);

export const matchEvents = sqliteTable(
  "match_events",
  {
    id: text("id").primaryKey(),
    fixtureId: text("fixture_id").notNull(),
    provider: text("provider").notNull(),
    externalId: text("external_id"),
    sequence: integer("sequence"),
    period: integer("period"),
    minute: integer("minute"),
    second: integer("second"),
    teamId: text("team_id"),
    playerId: text("player_id"),
    eventType: text("event_type").notNull(),
    outcome: text("outcome"),
    startX: real("start_x"),
    startY: real("start_y"),
    endX: real("end_x"),
    endY: real("end_y"),
    qualifiersJson: text("qualifiers_json"),
    rawJson: text("raw_json").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [index("match_events_fixture_idx").on(table.fixtureId, table.sequence), index("match_events_player_idx").on(table.playerId)],
);

export const entityLocalizations = sqliteTable(
  "entity_localizations",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    locale: text("locale").notNull(),
    displayName: text("display_name").notNull(),
    source: text("source").notNull(),
    isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("entity_localizations_entity_locale_uidx").on(table.entityType, table.entityId, table.locale),
    index("entity_localizations_locale_name_idx").on(table.locale, table.displayName),
  ],
);

export const playerMedia = sqliteTable(
  "player_media",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id").notNull(),
    teamId: text("team_id"),
    kind: text("kind").notNull(),
    url: text("url"),
    source: text("source").notNull(),
    sourceRecordId: text("source_record_id"),
    sourceUrl: text("source_url"),
    license: text("license"),
    status: text("status").notNull(),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(true),
    capturedAt: integer("captured_at").notNull(),
    metadataJson: text("metadata_json").notNull(),
  },
  (table) => [
    uniqueIndex("player_media_player_team_kind_uidx").on(table.playerId, table.teamId, table.kind),
    index("player_media_player_idx").on(table.playerId, table.isCurrent),
  ],
);
