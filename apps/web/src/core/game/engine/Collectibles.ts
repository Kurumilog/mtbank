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
import { emitStarBurst } from "./ParticleEffects";

export interface StarMesh {
  cell: Vec2;
  root: TransformNode;
  collected: boolean;
}

export interface CollectiblesResult {
  root: TransformNode;
  stars: StarMesh[];
  portal: TransformNode;
  /** Call when a star is collected to trigger the visual burst. */
  collectStar(star: StarMesh): void;
  dispose(): void;
}

/**
 * Builds interactive elements placed on top of the maze — stars and the
 * finish portal — with extra visual polish (layered glow, particle bursts).
 */
export function buildCollectibles(
  scene: Scene,
  starCells: Vec2[],
  finishCell: Vec2,
  width: number,
  height: number,
): CollectiblesResult {
  const root = new TransformNode("collectibles", scene);

  // ----- Star material (warm pop) -----
  const starMat = new StandardMaterial("star-mat", scene);
  starMat.diffuseColor = Color3.FromHexString(colors.star);
  starMat.emissiveColor = Color3.FromHexString(colors.star).scale(0.7);
  starMat.specularColor = new Color3(0, 0, 0);

  const starGlowMat = new StandardMaterial("star-glow", scene);
  starGlowMat.diffuseColor = Color3.FromHexString(colors.star);
  starGlowMat.emissiveColor = Color3.FromHexString(colors.starDeep).scale(0.6);
  starGlowMat.alpha = 0.35;
  starGlowMat.specularColor = new Color3(0, 0, 0);
  starGlowMat.backFaceCulling = false;

  // ----- Portal materials (layered) -----
  const portalMat = new StandardMaterial("portal-mat", scene);
  portalMat.diffuseColor = Color3.FromHexString(colors.portal);
  portalMat.emissiveColor = Color3.FromHexString(colors.portal).scale(0.8);
  portalMat.specularColor = new Color3(0, 0, 0);

  const portalHaloMat = new StandardMaterial("portal-halo", scene);
  portalHaloMat.diffuseColor = Color3.FromHexString(colors.portal);
  portalHaloMat.emissiveColor = Color3.FromHexString(colors.portal).scale(0.5);
  portalHaloMat.alpha = 0.3;
  portalHaloMat.specularColor = new Color3(0, 0, 0);
  portalHaloMat.backFaceCulling = false;

  const portalInnerMat = new StandardMaterial("portal-inner", scene);
  portalInnerMat.diffuseColor = Color3.FromHexString(colors.portalDeep);
  portalInnerMat.emissiveColor = Color3.FromHexString(colors.portalDeep).scale(0.8);
  portalInnerMat.alpha = 0.55;
  portalInnerMat.specularColor = new Color3(0, 0, 0);

  // ----- Build stars (octahedron + halo ring) -----
  const stars: StarMesh[] = starCells.map((cell) => {
    const world = cellToWorld(cell, width, height);
    const group = new TransformNode(`star-${cell.x}-${cell.y}`, scene);
    group.position = new Vector3(
      world.x,
      GAME_CONSTANTS.playerHoverHeight,
      world.z,
    );
    group.parent = root;

    const core = MeshBuilder.CreatePolyhedron(
      `star-core-${cell.x}-${cell.y}`,
      { type: 3, size: GAME_CONSTANTS.cellSize * 0.24 },
      scene,
    );
    core.material = starMat;
    core.parent = group;

    const halo = MeshBuilder.CreateDisc(
      `star-halo-${cell.x}-${cell.y}`,
      { radius: GAME_CONSTANTS.cellSize * 0.45, tessellation: 24 },
      scene,
    );
    halo.material = starGlowMat;
    halo.rotation.x = Math.PI / 2;
    halo.position.y = -GAME_CONSTANTS.playerHoverHeight + 0.05;
    halo.parent = group;

    return { cell, root: group, collected: false };
  });

  // ----- Build portal (three layers) -----
  const portal = new TransformNode("portal", scene);
  const portalWorld = cellToWorld(finishCell, width, height);
  portal.position = new Vector3(
    portalWorld.x,
    GAME_CONSTANTS.playerHoverHeight,
    portalWorld.z,
  );
  portal.parent = root;

  const portalOuter = MeshBuilder.CreateTorus(
    "portal-outer",
    {
      diameter: GAME_CONSTANTS.cellSize * 1.05,
      thickness: 0.22,
      tessellation: 56,
    },
    scene,
  );
  portalOuter.material = portalMat;
  portalOuter.rotation.x = Math.PI / 2;
  portalOuter.parent = portal;

  const portalInner = MeshBuilder.CreateTorus(
    "portal-inner",
    {
      diameter: GAME_CONSTANTS.cellSize * 0.7,
      thickness: 0.12,
      tessellation: 48,
    },
    scene,
  );
  portalInner.material = portalInnerMat;
  portalInner.rotation.x = Math.PI / 2;
  portalInner.parent = portal;

  const portalHalo = MeshBuilder.CreateDisc(
    "portal-halo",
    { radius: GAME_CONSTANTS.cellSize * 0.7, tessellation: 32 },
    scene,
  );
  portalHalo.material = portalHaloMat;
  portalHalo.rotation.x = Math.PI / 2;
  portalHalo.position.y = -GAME_CONSTANTS.playerHoverHeight + 0.06;
  portalHalo.parent = portal;

  // ----- Animation loop: rotate / bob -----
  let elapsed = 0;
  const observer = scene.onBeforeRenderObservable.add(() => {
    elapsed += scene.getEngine().getDeltaTime() / 1000;
    for (const star of stars) {
      if (star.collected) continue;
      star.root.rotation.y += 0.04;
      star.root.position.y =
        GAME_CONSTANTS.playerHoverHeight +
        Math.sin(elapsed * 3 + star.cell.x * 0.6 + star.cell.y * 0.4) * 0.1;
    }
    portalOuter.rotation.z = elapsed * 0.9;
    portalInner.rotation.z = -elapsed * 1.4;
    const pulse = 1 + Math.sin(elapsed * 2.2) * 0.08;
    portal.scaling.set(pulse, pulse, pulse);
  });

  /** Public collect trigger — plays effects and hides the star mesh. */
  const collectStar = (star: StarMesh) => {
    if (star.collected) return;
    star.collected = true;
    emitStarBurst(scene, star.root.getAbsolutePosition());
    star.root.dispose();
  };

  return {
    root,
    stars,
    portal,
    collectStar,
    dispose() {
      scene.onBeforeRenderObservable.remove(observer);
      stars.forEach((star) => !star.collected && star.root.dispose());
      portal.dispose();
      root.dispose();
    },
  };
}
