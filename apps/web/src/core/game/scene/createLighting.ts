import {
  Color3,
  DirectionalLight,
  HemisphericLight,
  Scene,
  Vector3,
} from "@babylonjs/core";

/**
 * Soft paper-friendly lighting: hemispheric fill + a warm key light that
 * gives walls a slight drop shadow feel without expensive shadow maps.
 */
export function createLighting(scene: Scene) {
  const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.75;
  hemi.diffuse = new Color3(1, 0.98, 0.92);
  hemi.groundColor = new Color3(0.75, 0.7, 0.62);

  const key = new DirectionalLight("key", new Vector3(-0.4, -1, -0.25), scene);
  key.intensity = 0.65;
  key.diffuse = new Color3(1, 0.9, 0.78);
  key.specular = new Color3(0, 0, 0);
}
