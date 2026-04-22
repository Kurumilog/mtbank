import type { CSSProperties } from "react";

import { GAME_CONSTANTS } from "@/core/game/constants";
import { HANDCRAFTED_LEVELS } from "@/features/game/levels/registry";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

import { useGameStore } from "../domain/useGameStore";

interface LevelNode {
  id: number;
  available: boolean;
  name?: string;
}

function buildRoster(): LevelNode[] {
  return Array.from({ length: GAME_CONSTANTS.totalLevels }, (_, index) => {
    const id = index + 1;
    const handcrafted = HANDCRAFTED_LEVELS.find((level) => level.id === id);
    return { id, available: Boolean(handcrafted), name: handcrafted?.name };
  });
}

/**
 * Computes the snake-like horizontal offset for a level node.
 *
 * Produces a repeating S curve similar to the Duolingo path:
 * center → right → center → left → center → ...
 */
function horizontalOffsetFor(index: number): number {
  // 8-level period gives a nice wide swing without feeling too busy.
  const t = (index / 8) * Math.PI * 2;
  const amplitude = 72;
  return Math.sin(t) * amplitude;
}

export function MainMenu() {
  const startLevel = useGameStore((state) => state.startLevel);
  const levelProgress = useGameStore((state) => state.levelProgress);
  const totalStars = useGameStore((state) => state.totalStars());

  const roster = buildRoster();
  // Find the first level that hasn't been 3-starred yet — the "next" to focus.
  const focusedId =
    roster.find((node) => node.available && (levelProgress[node.id]?.stars ?? 0) < 3)
      ?.id ?? roster[0].id;

  return (
    <div style={styles.page} data-testid="main-menu">
      <header style={styles.header}>
        <div style={styles.headerTextBlock}>
          <div style={styles.kicker}>MTBank · Pet game</div>
          <h1 style={styles.title}>Лабиринт питомца</h1>
        </div>

        <div style={styles.starsSummary} data-testid="total-stars-summary">
          <span style={styles.starsSummaryIcon} aria-hidden>
            ★
          </span>
          <div>
            <div style={styles.starsSummaryLabel}>Звёзды</div>
            <div style={styles.starsSummaryValue}>{totalStars}</div>
          </div>
        </div>
      </header>

      <main style={styles.pathWrapper}>
        <div style={styles.path} data-testid="level-path">
          {roster.map((node, index) => (
            <LevelBubble
              key={node.id}
              node={node}
              offset={horizontalOffsetFor(index)}
              rating={levelProgress[node.id]?.stars ?? 0}
              focused={node.id === focusedId}
              onStart={() => startLevel(node.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

interface LevelBubbleProps {
  node: LevelNode;
  offset: number;
  rating: number;
  focused: boolean;
  onStart: () => void;
}

function LevelBubble({ node, offset, rating, focused, onStart }: LevelBubbleProps) {
  const locked = !node.available;
  const completed = rating > 0;

  return (
    <div style={{ ...styles.nodeRow, transform: `translateX(${offset}px)` }}>
      {focused && !locked && (
        <div style={styles.focusLabel} data-testid={`focus-label-${node.id}`}>
          ИГРАТЬ
        </div>
      )}
      <button
        type="button"
        style={{
          ...styles.bubble,
          ...(locked
            ? styles.bubbleLocked
            : completed
              ? styles.bubbleCompleted
              : focused
                ? styles.bubbleFocused
                : styles.bubbleAvailable),
        }}
        onClick={locked ? undefined : onStart}
        disabled={locked}
        data-testid={`level-tile-${node.id}`}
        aria-label={`Уровень ${node.id}${node.name ? `: ${node.name}` : ""}`}
      >
        <span style={styles.bubbleNumber}>
          {locked ? <span aria-hidden>🔒</span> : node.id}
        </span>
      </button>
      <div style={styles.bubbleCaption}>
        {node.name && !locked ? node.name : locked ? "Скоро" : `Уровень ${node.id}`}
      </div>
      {completed && (
        <div style={styles.ratingRow}>
          {[1, 2, 3].map((p) => (
            <span
              key={p}
              style={{
                ...styles.ratingStar,
                color: p <= rating ? colors.star : "rgba(45, 42, 38, 0.2)",
              }}
              aria-hidden
            >
              ★
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    background: `radial-gradient(circle at top, ${colors.paperSoft} 0%, ${colors.paper} 55%, ${colors.paperDeep} 100%)`,
    color: colors.ink,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  header: {
    alignItems: "center",
    background: colors.paperSoft,
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    gap: spacing.md,
    justifyContent: "space-between",
    padding: `${spacing.md}px ${spacing.lg}px`,
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  headerTextBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.1,
    margin: 0,
  },
  starsSummary: {
    alignItems: "center",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    boxShadow: `0 4px 14px ${colors.shadow}`,
    display: "flex",
    gap: spacing.sm,
    padding: `6px 12px`,
  },
  starsSummaryIcon: {
    color: colors.star,
    fontSize: 22,
    lineHeight: 1,
  },
  starsSummaryLabel: {
    color: colors.inkSoft,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.12,
    textTransform: "uppercase",
  },
  starsSummaryValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: 800,
    lineHeight: 1,
  },
  pathWrapper: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    WebkitOverflowScrolling: "touch",
  },
  path: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    margin: "0 auto",
    maxWidth: 440,
    padding: `${spacing.xl}px ${spacing.lg}px ${spacing.xxl * 2}px`,
    position: "relative",
  },
  nodeRow: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    position: "relative",
    transition: "transform 220ms ease",
  },
  bubble: {
    alignItems: "center",
    background: colors.panel,
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    fontFamily: "inherit",
    fontSize: 26,
    fontWeight: 800,
    height: 80,
    justifyContent: "center",
    padding: 0,
    position: "relative",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    width: 80,
  },
  bubbleAvailable: {
    background: colors.panel,
    boxShadow: `0 6px 0 ${colors.paperDeep}, 0 10px 20px ${colors.shadow}`,
    color: colors.ink,
  },
  bubbleFocused: {
    background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accentStrong} 100%)`,
    boxShadow: `0 8px 0 ${colors.accentStrong}, 0 12px 28px rgba(214, 74, 42, 0.35)`,
    color: "#fff",
    transform: "scale(1.05)",
  },
  bubbleCompleted: {
    background: `linear-gradient(180deg, ${colors.star} 0%, ${colors.starDeep} 100%)`,
    boxShadow: `0 8px 0 ${colors.starDeep}, 0 12px 24px rgba(217, 152, 34, 0.3)`,
    color: "#fff",
  },
  bubbleLocked: {
    background: colors.paperDeep,
    boxShadow: `0 4px 0 rgba(45, 42, 38, 0.08)`,
    color: colors.muted,
    cursor: "not-allowed",
  },
  bubbleNumber: {
    lineHeight: 1,
  },
  bubbleCaption: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
  },
  focusLabel: {
    background: colors.panel,
    border: `2px solid ${colors.accent}`,
    borderRadius: 999,
    bottom: "100%",
    boxShadow: `0 6px 14px ${colors.shadow}`,
    color: colors.accent,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.2,
    marginBottom: 6,
    padding: "4px 10px",
    position: "absolute",
  },
  ratingRow: {
    display: "flex",
    gap: 2,
  },
  ratingStar: {
    fontSize: 12,
    lineHeight: 1,
  },
};
