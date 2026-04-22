export type GamePhase = "menu" | "loading" | "playing" | "paused" | "complete";

export interface LevelProgress {
  levelId: number;
  stars: number; // 0..3 rating achieved
  bestTime: number | null;
}

export interface GameState {
  phase: GamePhase;
  currentLevelId: number | null;
  /** Stars currently collected in the active level session. */
  sessionStars: number;
  /** Total stars available in the active level. */
  sessionStarsTotal: number;
  /** Aggregated rating per level (persisted). */
  levelProgress: Record<number, LevelProgress>;
  /** Currently selected character id (persisted). */
  selectedCharacterId: string;
}
