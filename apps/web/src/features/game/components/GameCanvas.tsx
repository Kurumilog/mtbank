import { useEffect, useRef } from "react";

import type { Scene } from "@babylonjs/core";

import { colors } from "@/shared/theme/colors";
import { useGameStore } from "../domain/useGameStore";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const setPhase = useGameStore((state) => state.setPhase);
  const setPetReady = useGameStore((state) => state.setPetReady);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) {
      return undefined;
    }

    setPhase("loading");

    let scene: Scene | null = null;
    let isDisposed = false;
    let engine: import("@babylonjs/core").Engine | null = null;

    const resizeCanvas = () => {
      engine?.resize();
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const start = async () => {
      try {
        const [{ Engine }, { createTopDownScene }] = await Promise.all([
          import("@babylonjs/core"),
          import("@/core/game/scene/createTopDownScene"),
        ]);

        if (isDisposed) {
          return;
        }

        engine = new Engine(canvas, true, {
          adaptToDeviceRatio: true,
          preserveDrawingBuffer: false,
          stencil: true,
        });

        const nextScene = await createTopDownScene(engine);

        if (isDisposed) {
          nextScene.dispose();
          return;
        }

        scene = nextScene;
        setPetReady(true);
        setPhase("playing");

        engine.runRenderLoop(() => {
          nextScene.render();
        });
      } catch (error) {
        console.error("Failed to start the Babylon scene", error);
        setPhase("paused");
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    void start();

    return () => {
      isDisposed = true;
      window.removeEventListener("resize", resizeCanvas);
      resizeObserver.disconnect();
      engine?.stopRenderLoop();
      scene?.dispose();
      engine?.dispose();
      setPetReady(false);
      setPhase("boot");
    };
  }, [setPetReady, setPhase]);

  return (
    <div ref={containerRef} style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}

const styles = {
  container: {
    background: colors.canvas,
    borderRadius: 32,
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.3)",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    position: "relative" as const,
    touchAction: "none" as const,
  },
  canvas: {
    display: "block",
    height: "100%",
    width: "100%",
  },
};