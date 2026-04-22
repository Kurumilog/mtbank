import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import { colors } from "@/shared/theme/colors";

import { GAME_CONSTANTS } from "../constants";
import type { Vec2 } from "../types";
import { cellToWorld } from "./Maze";

export interface StarMesh {
  cell: Vec2;
  mesh: Mesh;
  collected: boolean;
}

export interface CollectiblesResult {
  root: TransformNode;
  stars: StarMesh[];
  portal: Mesh;
  dispose(): void;
}

/**
 * Builds interactive elements placed on top of the maze — stars to collect
 * and the finish portal. Returns mutable references so the runner can mark
 * stars as collected and animate them.
 */
export function buildCollectibles(
  scene: Scene,
  starCells: Vec2[],
  finishCell: Vec2,
  width: number,
  height: number,
): CollectiblesResult {
  const root = new TransformNode("collectibles", scene);

  const starMat = new StandardMaterial("star-mat", scene);
  starMat.diffuseColor = Color3.FromHexString(colors.star);
  starMat.emissiveColor = Color3.FromHexString(colors.star).scale(0.55);
  starMat.specularColor = new Color3(0, 0, 0);

  const portalMat = new StandardMaterial("portal-mat", scene);
  portalMat.diffuseColor = Color3.FromHexString(colors.portal);
  portalMat.emissiveColor = Color3.FromHexString(colors.portal).scale(0.65);
  portalMat.specularColor = new Color3(0, 0, 0);

  const stars: StarMesh[] = starCells.map((cell) => {
    const world = cellToWorld(cell, width, height);
    const star = MeshBuilder.CreatePolyhedron(
      `star-${cell.x}-${cell.y}`,
      { type: 3, size: GAME_CONSTANTS.cellSize * 0.22 },
      scene,
    );
    star.position = new Vector3(
      world.x,
      GAME_CONSTANTS.playerHoverHeight,
      world.z,
    );
    star.material = starMat;
    star.parent = root;
    return { cell, mesh: star, collected: false };
  });

  const portalWorld = cellToWorld(finishCell, width, height);
  const portal = MeshBuilder.CreateTorus(
    `portal-${finishCell.x}-${finishCell.y}`,
    {
      diameter: GAME_CONSTANTS.cellSize * 0.95,
      thickness: 0.18,
      tessellation: 48,
    },
    scene,
  );
  portal.position = new Vector3(
    portalWorld.x,
    GAME_CONSTANTS.playerHoverHeight,
    portalWorld.z,
  );
  portal.rotation.x = Math.PI / 2;
  portal.material = portalMat;
  portal.parent = root;

  let elapsed = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    elapsed += scene.getEngine().getDeltaTime() / 1000;
    for (const star of stars) {
      if (star.collected) continue;
      star.mesh.rotation.y += 0.03;
      star.mesh.position.y =
        GAME_CONSTANTS.playerHoverHeight + Math.sin(elapsed * 3 + star.cell.x) * 0.08;
    }
    portal.rotation.z = elapsed * 0.8;
  });

  return {
    root,
    stars,
    portal,
    dispose() {
      scene.onBeforeRenderObservable.remove(observer);
      stars.forEach((star) => star.mesh.dispose());
      portal.dispose();
      root.dispose();
    },
  };
}
