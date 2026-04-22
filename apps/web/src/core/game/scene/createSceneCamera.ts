import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";

import { GAME_CONSTANTS } from "../constants";

/**
 * Computes the camera radius required to fit the whole maze inside the
 * current viewport given the camera's vertical FOV.
 *
 * Works for both portrait and landscape aspect ratios — picks whichever
 * distance makes both arena dimensions visible.
 */
function computeFitRadius(
  camera: ArcRotateCamera,
  engine: { getRenderWidth(): number; getRenderHeight(): number },
  arenaWidth: number,
  arenaHeight: number,
): number {
  const { cellSize, cameraRadiusFactor } = GAME_CONSTANTS;
  const fov = camera.fov; // radians, default 0.8
  const viewW = engine.getRenderWidth();
  const viewH = engine.getRenderHeight();
  const aspect = viewW > 0 && viewH > 0 ? viewW / viewH : 1;

  const worldWidth = arenaWidth * cellSize;
  const worldHeight = arenaHeight * cellSize;

  // Distance so the maze width fits horizontally.
  const radiusByWidth = worldWidth / (2 * Math.tan(fov / 2) * aspect);
  // Distance so the maze depth fits vertically.
  const radiusByHeight = worldHeight / (2 * Math.tan(fov / 2));

  return Math.max(radiusByWidth, radiusByHeight) * cameraRadiusFactor;
}

/**
 * Builds a locked near-top-down camera that frames the entire maze.
 *
 * The camera updates its radius on engine resize so the maze always fits on
 * mobile portrait, tablet and desktop viewports.
 */
export function createSceneCamera(
  scene: Scene,
  canvas: HTMLCanvasElement,
  arenaWidth: number,
  arenaHeight: number,
) {
  const { cameraAlpha, cameraBeta } = GAME_CONSTANTS;

  const camera = new ArcRotateCamera(
    "sceneCamera",
    cameraAlpha,
    cameraBeta,
    30, // placeholder; overwritten by computeFitRadius below.
    Vector3.Zero(),
    scene,
  );

  const engine = scene.getEngine();
  const fitRadius = () => {
    const radius = computeFitRadius(camera, engine, arenaWidth, arenaHeight);
    camera.radius = radius;
    camera.lowerRadiusLimit = radius;
    camera.upperRadiusLimit = radius;
  };

  fitRadius();

  camera.lowerBetaLimit = cameraBeta;
  camera.upperBetaLimit = cameraBeta;
  camera.lowerAlphaLimit = cameraAlpha;
  camera.upperAlphaLimit = cameraAlpha;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 999999;
  camera.inertia = 0;
  camera.attachControl(canvas, false);
  camera.inputs.clear();

  engine.onResizeObservable.add(fitRadius);

  return camera;
}
