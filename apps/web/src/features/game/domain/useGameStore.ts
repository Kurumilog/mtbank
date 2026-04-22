import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_CHARACTER_ID } from "@/core/characters/registry";
import type { LevelResult } from "@/core/game/types";

import type { GamePhase, GameState, LevelProgress } from "./gameState";

interface GameStore extends GameState {
  openMenu: () => void;
  startLevel: (levelId: number) => void;
  setPhase: (phase: GamePhase) => void;
  setSessionStars: (collected: number, total: number) => void;
  finishLevel: (result: LevelResult) => void;
  selectCharacter: (characterId: string) => void;
  /** Returns the best rating achieved on a level (0 if not completed). */
  getStarsForLevel: (levelId: number) => number;
  /** Total stars across all levels — the number surfaced in mobile banking. */
  totalStars: () => number;
}

const initialState: GameState = {
  phase: "menu",
  currentLevelId: null,
  sessionStars: 0,
  sessionStarsTotal: 0,
  levelProgress: {},
  selectedCharacterId: DEFAULT_CHARACTER_ID,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      openMenu: () =>
        set({
          phase: "menu",
          currentLevelId: null,
          sessionStars: 0,
          sessionStarsTotal: 0,
        }),

      startLevel: (levelId) =>
        set({
          phase: "loading",
          currentLevelId: levelId,
          sessionStars: 0,
          sessionStarsTotal: 0,
        }),

      setPhase: (phase) => set({ phase }),

      setSessionStars: (collected, total) =>
        set({ sessionStars: collected, sessionStarsTotal: total }),

      selectCharacter: (characterId) => set({ selectedCharacterId: characterId }),

      finishLevel: (result) => {
        const existing = get().levelProgress[result.levelId];
        const nextProgress: LevelProgress = {
          levelId: result.levelId,
          stars: Math.max(existing?.stars ?? 0, result.rating),
          bestTime:
            existing?.bestTime == null
              ? result.timeSeconds
              : Math.min(existing.bestTime, result.timeSeconds),
        };
        set({
          phase: "complete",
          levelProgress: {
            ...get().levelProgress,
            [result.levelId]: nextProgress,
          },
        });
      },

      getStarsForLevel: (levelId) => get().levelProgress[levelId]?.stars ?? 0,

      totalStars: () =>
        Object.values(get().levelProgress).reduce((sum, p) => sum + p.stars, 0),
    }),
    {
      name: "mtbank-game-progress-v1",
      partialize: (state) => ({
        levelProgress: state.levelProgress,
        selectedCharacterId: state.selectedCharacterId,
      }),
    },
  ),
);
