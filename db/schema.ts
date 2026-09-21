import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
