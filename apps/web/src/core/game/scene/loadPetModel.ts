import { Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";

import blobModelUrl from "../../../../../../shared/assets/models/blob.glb?url";
import { GAME_CONSTANTS } from "../constants";

export async function loadPetModel(scene: Scene) {
  const result = await SceneLoader.ImportMeshAsync("", "", blobModelUrl, scene);
  const rootMesh = result.meshes[0];

  if (rootMesh) {
    rootMesh.scaling = new Vector3(
      GAME_CONSTANTS.petScale,
      GAME_CONSTANTS.petScale,
      GAME_CONSTANTS.petScale,
    );
    rootMesh.position = new Vector3(0, GAME_CONSTANTS.petHoverHeight, 0);
  }

  return rootMesh ?? null;
}