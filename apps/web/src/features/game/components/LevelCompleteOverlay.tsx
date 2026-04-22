import type { CSSProperties } from "react";

import type { LevelResult } from "@/core/game/types";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

interface LevelCompleteOverlayProps {
  result: LevelResult;
  hasNextLevel: boolean;
  onRetry: () => void;
  onNext: () => void;
  onMenu: () => void;
}

export function LevelCompleteOverlay({
  result,
  hasNextLevel,
  onRetry,
  onNext,
  onMenu,
}: LevelCompleteOverlayProps) {
  return (
    <div style={styles.backdrop} data-testid="level-complete-overlay">
      <div style={styles.card}>
        <div style={styles.kicker}>Уровень {result.levelId} пройден</div>
        <h2 style={styles.title}>Отличная работа!</h2>

        <div style={styles.starsRow} data-testid="level-complete-stars">
          {[1, 2, 3].map((position) => (
            <span
              key={position}
              style={{
                ...styles.star,
                color: position <= result.rating ? colors.star : colors.border,
                transform: position === 2 ? "scale(1.2) translateY(-6px)" : "scale(1)",
              }}
              aria-hidden
            >
              ★
            </span>
          ))}
        </div>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Собрано</span>
            <span style={styles.statValue}>
              {result.starsCollected}/{result.totalStars}
            </span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Время</span>
            <span style={styles.statValue}>{result.timeSeconds.toFixed(1)} с</span>
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.secondary }}
            onClick={onRetry}
            data-testid="overlay-retry-button"
          >
            Заново
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.secondary }}
            onClick={onMenu}
            data-testid="overlay-menu-button"
          >
            К карте
          </button>
          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.primary,
              opacity: hasNextLevel ? 1 : 0.5,
              cursor: hasNextLevel ? "pointer" : "not-allowed",
            }}
            onClick={hasNextLevel ? onNext : undefined}
            disabled={!hasNextLevel}
            data-testid="overlay-next-button"
          >
            {hasNextLevel ? "Далее" : "Скоро"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  backdrop: {
    alignItems: "center",
    background: "rgba(45, 42, 38, 0.35)",
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    left: 0,
    padding: spacing.lg,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  card: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 28,
    boxShadow: `0 24px 60px ${colors.shadow}`,
    maxWidth: 380,
    padding: `${spacing.xl}px ${spacing.xl}px ${spacing.lg}px`,
    width: "100%",
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.18,
    marginBottom: 6,
    textAlign: "center",
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    textAlign: "center",
  },
  starsRow: {
    alignItems: "center",
    display: "flex",
    gap: 12,
    justifyContent: "center",
    margin: `${spacing.lg}px 0`,
  },
  star: {
    fontSize: 52,
    lineHeight: 1,
    transition: "transform 240ms ease",
  },
  stats: {
    background: colors.paperSoft,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-around",
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  statItem: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.08,
    textTransform: "uppercase",
  },
  statValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: 800,
  },
  actions: {
    display: "grid",
    gap: spacing.sm,
    gridTemplateColumns: "1fr 1fr 1fr",
  },
  button: {
    border: "none",
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    padding: `${spacing.md}px ${spacing.sm}px`,
  },
  secondary: {
    background: colors.paperDeep,
    color: colors.ink,
  },
  primary: {
    background: colors.accent,
    color: "#fff",
  },
};
