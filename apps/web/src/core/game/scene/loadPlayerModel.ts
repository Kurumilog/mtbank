import { AbstractMesh, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders";

import { resolveCharacterModelUrl } from "@/core/characters/registry";

import { GAME_CONSTANTS } from "../constants";

export interface LoadedPlayerModel {
  root: AbstractMesh;
  dispose(): void;
}

/**
 * Loads the .glb character model referenced by `characterId` and returns
 * its root mesh. Falls back to the default `blob` model if the requested
 * character has no real asset yet.
 */
export async function loadPlayerModel(
  scene: Scene,
  characterId: string,
): Promise<LoadedPlayerModel> {
  const modelUrl = resolveCharacterModelUrl(characterId);
  const result = await SceneLoader.ImportMeshAsync("", "", modelUrl, scene);
  const root = result.meshes[0];

  if (!root) {
    throw new Error(`Character model "${characterId}" has no root mesh`);
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
