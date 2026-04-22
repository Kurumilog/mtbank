import { create } from "zustand";

import { GAME_CONSTANTS } from "@/core/game/constants";
import type { GamePhase, GameState } from "./gameState";

type GameStore = GameState & {
  setPhase: (phase: GamePhase) => void;
  setPetReady: (petReady: boolean) => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  setProgress: (progress: number) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  phase: "boot",
  coins: GAME_CONSTANTS.defaultCoins,
  xp: GAME_CONSTANTS.defaultXp,
  level: GAME_CONSTANTS.defaultLevel,
  streak: GAME_CONSTANTS.defaultStreak,
  progress: GAME_CONSTANTS.defaultProgress,
  petReady: false,
  setPhase: (phase) => set({ phase }),
  setPetReady: (petReady) => set({ petReady }),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  setProgress: (progress) => set({ progress }),
}));