import type { CSSProperties } from "react";

import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { Panel } from "@/shared/ui/Panel";
import { useGameStore } from "../domain/useGameStore";

type GameHudProps = {
  platform: string;
};

export function GameHud({ platform }: GameHudProps) {
  const { coins, xp, level, streak, progress, phase, petReady } = useGameStore((state) => ({
    coins: state.coins,
    xp: state.xp,
    level: state.level,
    streak: state.streak,
    progress: state.progress,
    phase: state.phase,
    petReady: state.petReady,
  }));

  const progressLabel = `${Math.round(progress * 100)}%`;

  return (
    <Panel style={styles.panel}>
      <div style={styles.topRow}>
        <div>
          <div style={styles.kicker}>Bank XP</div>
          <div style={styles.metricRow}>
            <strong style={styles.metricValue}>{xp}</strong>
            <span style={styles.metricLabel}>XP</span>
          </div>
        </div>
        <div style={styles.platformBadge}>{platform}</div>
      </div>

      <div style={styles.progressBlock}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Progress</span>
          <span style={styles.progressLabel}>{progressLabel}</span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: progressLabel }} />
        </div>
      </div>

      <div style={styles.statsGrid}>
        <Stat label="Coins" value={coins.toLocaleString("en-US")} />
        <Stat label="Level" value={`#${level}`} />
        <Stat label="Streak" value={`${streak} days`} />
        <Stat label="State" value={phase} accent={petReady ? "ready" : "loading"} />
      </div>
    </Panel>
  );
}

type StatProps = {
  label: string;
  value: string;
  accent?: "ready" | "loading";
};

function Stat({ label, value, accent }: StatProps) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statLabel}>{label}</div>
      <div style={accent ? styles[accent] : styles.statValue}>{value}</div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  panel: {
    minWidth: 280,
    backdropFilter: "blur(12px)",
  },
  topRow: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kicker: {
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 0.08,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  metricRow: {
    alignItems: "baseline",
    display: "flex",
    gap: spacing.sm,
  },
  metricValue: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 1,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  platformBadge: {
    background: colors.accent,
    borderRadius: 999,
    color: colors.canvas,
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 12px",
    textTransform: "uppercase",
  },
  progressBlock: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.04,
  },
  progressTrack: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
  },
  progressFill: {
    background: `linear-gradient(90deg, ${colors.warning} 0%, ${colors.accent} 100%)`,
    borderRadius: 999,
    height: "100%",
    transition: "width 180ms ease",
  },
  statsGrid: {
    display: "grid",
    gap: spacing.sm,
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  statCard: {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    padding: `${spacing.sm}px ${spacing.md}px`,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 700,
  },
  ready: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: 700,
    textTransform: "capitalize",
  },
  loading: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: 700,
    textTransform: "capitalize",
  },
};