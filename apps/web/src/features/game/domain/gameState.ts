export type GamePhase = "boot" | "loading" | "playing" | "paused" | "summary";

export type GameAction = "feed" | "train" | "quest" | "shop";

export interface GameState {
  phase: GamePhase;
  coins: number;
  xp: number;
  level: number;
  streak: number;
  progress: number;
  petReady: boolean;
}