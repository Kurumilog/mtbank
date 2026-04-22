import { Color4, Engine, Scene } from "@babylonjs/core";

import { colors } from "@/shared/theme/colors";

import { GAME_CONSTANTS } from "../constants";
import type { Direction, LevelData, LevelResult, Vec2 } from "../types";
import { DIRECTION_VECTORS } from "../types";
import { buildCollectibles, StarMesh } from "./Collectibles";
import { buildMaze, isWalkable, MazeBuildResult, slideDestination } from "./Maze";
import { Player } from "./Player";
import { attachSwipeInput } from "./SwipeInput";
import { createLighting } from "../scene/createLighting";
import { createSceneCamera } from "../scene/createSceneCamera";
import { loadPlayerModel } from "../scene/loadPlayerModel";

export interface LevelRunnerCallbacks {
  onStarsChanged?: (collected: number, total: number) => void;
  onLevelComplete?: (result: LevelResult) => void;
  onReady?: () => void;
}

export interface LevelRunnerHandle {
  reset(): void;
  dispose(): void;
}

/**
 * Creates a full Babylon.js scene for a single level, wires input and returns
 * a handle for external control (reset, dispose).
 *
 * The runner is intentionally self-contained — all scene resources are owned
 * by it and cleaned up via `dispose()`.
 */
export async function runLevel(
  engine: Engine,
  canvas: HTMLCanvasElement,
  level: LevelData,
  callbacks: LevelRunnerCallbacks = {},
): Promise<LevelRunnerHandle> {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString(`${colors.paper}ff`);

  createSceneCamera(scene, canvas, level.width, level.height);
  createLighting(scene);

  const maze: MazeBuildResult = buildMaze(scene, level);
  const collectibles = buildCollectibles(
    scene,
    maze.starCells,
    maze.finishCell,
    maze.width,
    maze.height,
  );

  const playerModel = await loadPlayerModel(scene);
  const player = new Player(
    playerModel.root,
    maze.startCell,
    maze.width,
    maze.height,
  );

  const totalStars = collectibles.stars.length;
  let collected = 0;
  let completed = false;
  const startTime = performance.now();

  const collectStarAt = (cell: Vec2) => {
    const star: StarMesh | undefined = collectibles.stars.find(
      (entry) => !entry.collected && entry.cell.x === cell.x && entry.cell.y === cell.y,
    );
    if (!star) return;
    star.collected = true;
    star.mesh.dispose();
    collected += 1;
    callbacks.onStarsChanged?.(collected, totalStars);
  };

  const checkFinish = () => {
    if (completed) return;
    const current = player.cell;
    if (current.x === maze.finishCell.x && current.y === maze.finishCell.y) {
      completed = true;
      const timeSeconds = (performance.now() - startTime) / 1000;
      const ratio = totalStars === 0 ? 1 : collected / totalStars;
      const rating: 1 | 2 | 3 = ratio >= 1 ? 3 : ratio >= 0.6 ? 2 : 1;
      callbacks.onLevelComplete?.({
        levelId: level.id,
        starsCollected: collected,
        totalStars,
        rating,
        timeSeconds,
      });
    }
  };

  // Collect any star the player spawned on (edge case) and notify initial state.
  collectStarAt(player.cell);
  callbacks.onStarsChanged?.(collected, totalStars);

  const onSwipe = (direction: Direction) => {
    if (completed || player.isSliding) return;
    const vec = DIRECTION_VECTORS[direction];
    const dest = slideDestination(maze.cells, player.cell, vec);
    if (!isWalkable(maze.cells, dest)) return;
    player.slideTo(dest, direction);
  };

  const detachInput = attachSwipeInput(canvas, onSwipe);

  const renderObserver = scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;
    player.update(dt, (cell) => {
      collectStarAt(cell);
    });
    if (!player.isSliding) {
      checkFinish();
    }
  });

  engine.runRenderLoop(() => scene.render());

  callbacks.onReady?.();

  return {
    reset() {
      for (const star of collectibles.stars) {
        if (star.collected) {
          // Re-create collected stars would require re-buildCollectibles;
          // for now reset() triggers a full level reload from the runner caller.
        }
      }
      player.teleport(maze.startCell);
      completed = false;
    },
    dispose() {
      detachInput();
      scene.onBeforeRenderObservable.remove(renderObserver);
      engine.stopRenderLoop();
      collectibles.dispose();
      playerModel.dispose();
      maze.root.dispose();
      scene.dispose();
    },
  };
}

/** Re-exported for convenience so callers don't need to know internal types. */
export type { LevelData, LevelResult };
export { GAME_CONSTANTS };
