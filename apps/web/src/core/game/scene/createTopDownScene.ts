import {
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

import { GAME_CONSTANTS } from "../constants";
import { createTopDownCamera } from "./createTopDownCamera";
import { loadPetModel } from "./loadPetModel";

export async function createTopDownScene(engine: Engine) {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.05, 0.08, 0.14, 1);

  createTopDownCamera(scene);

  const light = new HemisphericLight("mainLight", new Vector3(0.2, 1, 0.3), scene);
  light.intensity = 1.2;

  const floor = MeshBuilder.CreateGround(
    "arenaFloor",
    {
      width: GAME_CONSTANTS.arenaSize,
      height: GAME_CONSTANTS.arenaSize,
      subdivisions: 2,
    },
    scene,
  );

  const floorMaterial = new StandardMaterial("arenaFloorMaterial", scene);
  floorMaterial.diffuseColor = new Color3(0.93, 0.97, 0.98);
  floorMaterial.specularColor = new Color3(0.12, 0.15, 0.18);
  floorMaterial.emissiveColor = new Color3(0.06, 0.1, 0.16);
  floor.material = floorMaterial;

  const boundary = MeshBuilder.CreateTorus(
    "arenaBoundary",
    {
      diameter: GAME_CONSTANTS.arenaSize - 4,
      thickness: 0.35,
      tessellation: 64,
    },
    scene,
  );

  boundary.rotation.x = Math.PI / 2;
  boundary.position.y = 0.04;

  const boundaryMaterial = new StandardMaterial("arenaBoundaryMaterial", scene);
  boundaryMaterial.diffuseColor = new Color3(1, 0.86, 0.46);
  boundaryMaterial.emissiveColor = new Color3(0.72, 0.52, 0.14);
  boundary.material = boundaryMaterial;

  const petRoot = await loadPetModel(scene);

  const marker = MeshBuilder.CreateSphere(
    "marker",
    {
      diameter: 1.1,
      segments: 16,
    },
    scene,
  );

  marker.position = new Vector3(7, 0.55, -5);
  const markerMaterial = new StandardMaterial("markerMaterial", scene);
  markerMaterial.diffuseColor = new Color3(0.39, 0.95, 0.67);
  markerMaterial.emissiveColor = new Color3(0.2, 0.7, 0.5);
  marker.material = markerMaterial;

  let elapsed = 0;

  scene.onBeforeRenderObservable.add(() => {
    const deltaSeconds = engine.getDeltaTime() / 1000;
    elapsed += deltaSeconds;

    if (petRoot) {
      petRoot.position.y =
        GAME_CONSTANTS.petHoverHeight + Math.sin(elapsed * GAME_CONSTANTS.petFloatSpeed) * GAME_CONSTANTS.petFloatAmplitude;
    }
  });

  return scene;
}