import { useEffect, useRef } from "react";

import type { Engine } from "@babylonjs/core";

import { runLevel, type LevelRunnerHandle } from "@/core/game/engine/LevelRunner";
import type { LevelData, LevelResult } from "@/core/game/types";
import { colors } from "@/shared/theme/colors";

interface GameCanvasProps {
  level: LevelData;
  characterId: string;
  onStarsChanged: (collected: number, total: number) => void;
  onLevelComplete: (result: LevelResult) => void;
  onReady: () => void;
  /** Bumping this prop forces a full runner restart (used by "Play again"). */
  resetKey: number;
}

export function GameCanvas({
  level,
  characterId,
  onStarsChanged,
  onLevelComplete,
  onReady,
  resetKey,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let engine: Engine | null = null;
    let runner: LevelRunnerHandle | null = null;
    let disposed = false;

    const resizeCanvas = () => engine?.resize();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);
    window.addEventListener("resize", resizeCanvas);

    const boot = async () => {
      const { Engine: BabylonEngine } = await import("@babylonjs/core");
      if (disposed) return;

      engine = new BabylonEngine(canvas, true, {
        adaptToDeviceRatio: true,
        preserveDrawingBuffer: false,
        stencil: true,
      });

      try {
        runner = await runLevel(engine, canvas, level, characterId, {
          onStarsChanged,
          onLevelComplete,
          onReady,
        });
      } catch (error) {
        console.error("Failed to start level", error);
      }
    };

    void boot();

    return () => {
      disposed = true;
      window.removeEventListener("resize", resizeCanvas);
      resizeObserver.disconnect();
      runner?.dispose();
      engine?.dispose();
    };
    // resetKey / characterId trigger a full remount-like re-run of the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, resetKey, characterId]);

  return (
    <div ref={containerRef} style={styles.container} data-testid="game-canvas-container">
      <canvas ref={canvasRef} style={styles.canvas} data-testid="game-canvas" />
    </div>
  );
}

const styles = {
  container: {
    background: colors.paper,
    flex: 1,
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    position: "relative" as const,
    touchAction: "none" as const,
    width: "100%",
  },
  canvas: {
    display: "block",
    height: "100%",
    outline: "none",
    width: "100%",
  },
};
