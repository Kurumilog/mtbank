import { useMemo, useState } from "react";

import { findLevel } from "@/features/game/levels/registry";
import type { LevelResult } from "@/core/game/types";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

import { useGameStore } from "../domain/useGameStore";
import { GameCanvas } from "./GameCanvas";
import { GameHud } from "./GameHud";
import { LevelCompleteOverlay } from "./LevelCompleteOverlay";

export function GameScreen() {
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const sessionStars = useGameStore((state) => state.sessionStars);
  const sessionStarsTotal = useGameStore((state) => state.sessionStarsTotal);
  const phase = useGameStore((state) => state.phase);
  const selectedCharacterId = useGameStore((state) => state.selectedCharacterId);
  const setSessionStars = useGameStore((state) => state.setSessionStars);
  const finishLevel = useGameStore((state) => state.finishLevel);
  const openMenu = useGameStore((state) => state.openMenu);
  const startLevel = useGameStore((state) => state.startLevel);
  const setPhase = useGameStore((state) => state.setPhase);

  const [resetKey, setResetKey] = useState(0);
  const [lastResult, setLastResult] = useState<LevelResult | null>(null);

  const level = useMemo(
    () => (currentLevelId != null ? findLevel(currentLevelId) : undefined),
    [currentLevelId],
  );

  if (!level) {
    // Defensive: fall back to the menu if the store has an invalid level id.
    openMenu();
    return null;
  }

  const handleLevelComplete = (result: LevelResult) => {
    setLastResult(result);
    finishLevel(result);
  };

  const handleRetry = () => {
    setLastResult(null);
    startLevel(level.id);
    setResetKey((key) => key + 1);
  };

  const nextLevel = findLevel(level.id + 1);

  const handleNext = () => {
    if (!nextLevel) return;
    setLastResult(null);
    startLevel(nextLevel.id);
    setResetKey((key) => key + 1);
  };

  return (
    <div style={styles.page} data-testid="game-screen">
      <div style={styles.stage}>
        <GameCanvas
          level={level}
          characterId={selectedCharacterId}
          resetKey={resetKey}
          onReady={() => setPhase("playing")}
          onStarsChanged={(collected, total) => setSessionStars(collected, total)}
          onLevelComplete={handleLevelComplete}
        />

        <GameHud
          levelId={level.id}
          levelName={level.name}
          stars={sessionStars}
          totalStars={sessionStarsTotal}
          onExit={openMenu}
        />

        {phase === "loading" && (
          <div style={styles.loading} data-testid="loading-overlay">
            <div style={styles.loadingDot} />
            <span>Загружаем уровень…</span>
          </div>
        )}

        {phase === "complete" && lastResult && (
          <LevelCompleteOverlay
            result={lastResult}
            hasNextLevel={Boolean(nextLevel)}
            onRetry={handleRetry}
            onNext={handleNext}
            onMenu={openMenu}
          />
        )}

        <div style={styles.hint} data-testid="game-hint">
          Свайп ↑ ↓ ← → — персонаж скользит до стены
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: `radial-gradient(circle at top, ${colors.paperSoft} 0%, ${colors.paper} 55%, ${colors.paperDeep} 100%)`,
    color: colors.ink,
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    width: "100%",
  },
  stage: {
    flex: 1,
    minHeight: 0,
    position: "relative" as const,
    width: "100%",
  },
  loading: {
    alignItems: "center",
    background: "rgba(244, 234, 214, 0.6)",
    bottom: 0,
    color: colors.ink,
    display: "flex",
    fontSize: 16,
    fontWeight: 700,
    gap: spacing.sm,
    justifyContent: "center",
    left: 0,
    position: "absolute" as const,
    right: 0,
    top: 0,
    zIndex: 5,
  },
  loadingDot: {
    animation: "pulse 1.1s ease-in-out infinite",
    background: colors.accent,
    borderRadius: "50%",
    height: 14,
    width: 14,
  },
  hint: {
    bottom: spacing.md,
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: 600,
    left: "50%",
    pointerEvents: "none" as const,
    position: "absolute" as const,
    textAlign: "center" as const,
    transform: "translateX(-50%)",
    whiteSpace: "nowrap" as const,
  },
};
