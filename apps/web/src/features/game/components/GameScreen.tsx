import { useEffect, useRef } from "react";

import type { HostBridge } from "@/core/bridge/hostBridge";
import { createHostBridge } from "@/core/bridge/hostBridge";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";
import { Panel } from "@/shared/ui/Panel";
import { GameCanvas } from "./GameCanvas";
import { GameHud } from "./GameHud";
import { useGameStore } from "../domain/useGameStore";

export function GameScreen() {
  const bridgeRef = useRef<HostBridge | null>(null);
  const { phase, coins, xp, level, streak, progress } = useGameStore((state) => ({
    phase: state.phase,
    coins: state.coins,
    xp: state.xp,
    level: state.level,
    streak: state.streak,
    progress: state.progress,
  }));

  if (!bridgeRef.current) {
    bridgeRef.current = createHostBridge();
  }

  const bridge = bridgeRef.current;

  useEffect(() => {
    bridge.ready();
    bridge.send("game:ready", {
      platform: bridge.platform,
    });
  }, [bridge]);

  useEffect(() => {
    bridge.send("game:state", {
      coins,
      level,
      phase,
      progress,
      streak,
      xp,
    });
  }, [bridge, coins, level, phase, progress, streak, xp]);

  const platformLabel =
    bridge.platform === "telegram"
      ? "Telegram Mini App"
      : bridge.platform === "webview"
        ? "WebView"
        : "Browser";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>MTBank Game</div>
          <h1 style={styles.title}>Top-down pet arena</h1>
          <p style={styles.subtitle}>Babylon.js shell ready for WebView and Telegram Mini App hosting.</p>
        </div>

        <Panel style={styles.platformPanel}>
          <div style={styles.platformLabel}>{platformLabel}</div>
          <div style={styles.platformHint}>{phase === "playing" ? "Scene live" : "Booting scene"}</div>
        </Panel>
      </header>

      <main style={styles.stageLayout}>
        <div style={styles.stageSurface}>
          <GameCanvas />

          <div style={styles.overlayLeft}>
            <GameHud platform={platformLabel} />
          </div>
        </div>

        <Panel style={styles.actionsPanel}>
          <div style={styles.actionsTitle}>Bridge actions</div>
          <div style={styles.actionsRow}>
            <ActionButton
              label="Feed"
              onClick={() => bridge.send("game:action", { action: "feed" })}
            />
            <ActionButton
              label="Train"
              onClick={() => bridge.send("game:action", { action: "train" })}
            />
            <ActionButton
              label="Quest"
              onClick={() => bridge.send("game:action", { action: "quest" })}
            />
          </div>
        </Panel>
      </main>
    </div>
  );
}

type ActionButtonProps = {
  label: string;
  onClick: () => void;
};

function ActionButton({ label, onClick }: ActionButtonProps) {
  return (
    <button type="button" onClick={onClick} style={styles.actionButton}>
      {label}
    </button>
  );
}

const styles = {
  page: {
    background: `radial-gradient(circle at top, rgba(55, 197, 138, 0.18), transparent 35%), linear-gradient(180deg, #081321 0%, ${colors.canvas} 100%)`,
    color: colors.text,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.lg,
    height: "100%",
    padding: spacing.lg,
  },
  header: {
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.12,
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 28,
    lineHeight: 1.05,
    margin: 0,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 1.5,
    marginTop: 8,
    maxWidth: 720,
  },
  platformPanel: {
    alignItems: "flex-start",
    display: "flex",
    gap: 4,
    minWidth: 170,
  },
  platformLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 700,
  },
  platformHint: {
    color: colors.muted,
    fontSize: 12,
  },
  stageLayout: {
    display: "grid",
    gap: spacing.lg,
    gridTemplateColumns: "minmax(0, 1fr)",
    flex: 1,
    minHeight: 0,
  },
  stageSurface: {
    display: "flex",
    minHeight: 0,
    position: "relative" as const,
    flex: 1,
  },
  overlayLeft: {
    left: spacing.lg,
    maxWidth: 360,
    position: "absolute" as const,
    top: spacing.lg,
    width: "min(100%, 360px)",
  },
  actionsPanel: {
    display: "flex",
    gap: spacing.md,
  },
  actionsTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.08,
    textTransform: "uppercase" as const,
  },
  actionsRow: {
    display: "grid",
    gap: spacing.sm,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  actionButton: {
    background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accentStrong} 100%)`,
    border: "none",
    borderRadius: 16,
    color: colors.canvas,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    padding: `${spacing.md}px ${spacing.lg}px`,
  },
};