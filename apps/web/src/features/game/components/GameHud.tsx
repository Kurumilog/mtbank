import type { CSSProperties } from "react";

import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

interface GameHudProps {
  levelName: string;
  levelId: number;
  stars: number;
  totalStars: number;
  onExit: () => void;
}

export function GameHud({ levelName, levelId, stars, totalStars, onExit }: GameHudProps) {
  return (
    <div style={styles.wrapper} data-testid="game-hud">
      <button
        type="button"
        style={styles.exitButton}
        onClick={onExit}
        data-testid="hud-exit-button"
        aria-label="К карте уровней"
      >
        ←
      </button>

      <div style={styles.centerPill} data-testid="hud-level-title">
        <span style={styles.levelKicker}>Уровень {levelId}</span>
        <span style={styles.levelName}>{levelName}</span>
      </div>

      <div style={styles.starsPill} data-testid="hud-stars">
        <span style={styles.starIcon} aria-hidden>
          ★
        </span>
        <span style={styles.starsText}>
          {stars}
          <span style={styles.starsTotal}>/{totalStars}</span>
        </span>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    alignItems: "center",
    display: "flex",
    gap: spacing.md,
    justifyContent: "space-between",
    left: 0,
    padding: `${spacing.md}px ${spacing.lg}px`,
    pointerEvents: "none",
    position: "absolute",
    right: 0,
    top: 0,
  },
  exitButton: {
    alignItems: "center",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    boxShadow: `0 6px 16px ${colors.shadow}`,
    color: colors.ink,
    cursor: "pointer",
    display: "flex",
    fontSize: 22,
    fontWeight: 700,
    height: 44,
    justifyContent: "center",
    pointerEvents: "auto",
    width: 44,
  },
  centerPill: {
    alignItems: "center",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    boxShadow: `0 6px 16px ${colors.shadow}`,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: `6px 14px`,
    pointerEvents: "auto",
  },
  levelKicker: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.18,
    textTransform: "uppercase",
  },
  levelName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: 700,
  },
  starsPill: {
    alignItems: "center",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    boxShadow: `0 6px 16px ${colors.shadow}`,
    display: "flex",
    gap: 8,
    padding: "8px 16px",
    pointerEvents: "auto",
  },
  starIcon: {
    color: colors.star,
    fontSize: 20,
    lineHeight: 1,
  },
  starsText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: 800,
  },
  starsTotal: {
    color: colors.inkSoft,
    fontSize: 14,
    fontWeight: 600,
  },
};
