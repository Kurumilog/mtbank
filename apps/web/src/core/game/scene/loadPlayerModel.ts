import {
  AbstractMesh,
  Quaternion,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders";

import blobModelUrl from "../../../../../../shared/assets/models/blob.glb?url";

import { GAME_CONSTANTS } from "../constants";

export interface LoadedPlayerModel {
  root: AbstractMesh;
  dispose(): void;
}

/**
 * Loads the blob.glb character model and returns its root mesh.
 *
 * The model is normalized so its visual size is roughly one maze cell and
 * its pivot sits on the floor — the caller only needs to move `root.position`.
 */
export async function loadPlayerModel(scene: Scene): Promise<LoadedPlayerModel> {
  const result = await SceneLoader.ImportMeshAsync("", "", blobModelUrl, scene);
  const root = result.meshes[0];

  if (!root) {
    throw new Error("blob.glb did not contain a root mesh");
  }

  // Normalize scale so the character visually fits a single maze cell.
  const targetSize = GAME_CONSTANTS.cellSize * 0.55;
  const { min, max } = root.getHierarchyBoundingVectors(true);
  const size = max.subtract(min);
  const longest = Math.max(size.x, size.y, size.z);
  const scale = longest > 0 ? targetSize / longest : 1;
  root.scaling = new Vector3(scale, scale, scale);

  // Ensure we can rotate the character around Y using quaternion math.
  root.rotationQuaternion = Quaternion.Identity();

  return {
    root,
    dispose() {
      result.meshes.forEach((mesh) => mesh.dispose());
    },
  };
}
