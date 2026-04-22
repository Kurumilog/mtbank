import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";

import { GAME_CONSTANTS } from "../constants";

export function createTopDownCamera(scene: Scene) {
  const camera = new ArcRotateCamera(
    "topDownCamera",
    -Math.PI / 4,
    GAME_CONSTANTS.cameraBeta,
    GAME_CONSTANTS.cameraRadius,
    Vector3.Zero(),
    scene,
  );

  camera.lowerRadiusLimit = GAME_CONSTANTS.cameraRadius;
  camera.upperRadiusLimit = GAME_CONSTANTS.cameraRadius;
  camera.lowerBetaLimit = GAME_CONSTANTS.cameraBeta;
  camera.upperBetaLimit = GAME_CONSTANTS.cameraBeta;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 999999;
  camera.inertia = 0;

  return camera;
}