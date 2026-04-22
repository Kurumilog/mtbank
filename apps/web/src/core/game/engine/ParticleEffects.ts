import {
  Color3,
  Color4,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from "@babylonjs/core";

import { colors } from "@/shared/theme/colors";

// Tiny base64 radial-gradient sprite used as the default particle texture.
// Avoids shipping an external asset just for a simple puff effect.
const PARTICLE_SPRITE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAiJJREFUeF7tmU1uwjAQhZ+TmBASIGV1JXoAegDuf4HuWLNgWbUgwpIApaQ/VWccSyCUiHE8ftE3kvWsyfjN8yT2KCAiIiI/qF6RB+wa6LcPqW/wNKGwNoVZ6pQeg5vwBNkABYJIOvU+0zzHCfwG/A6oBgkjPVL89iArAAAAAElFTkSuQmCC";

let cachedTexture: Texture | null = null;
function getParticleTexture(scene: Scene): Texture {
  if (cachedTexture && cachedTexture.getScene() === scene) return cachedTexture;
  const tex = new Texture(
    PARTICLE_SPRITE,
    scene,
    true,
    true,
    Texture.TRILINEAR_SAMPLINGMODE,
  );
  tex.hasAlpha = true;
  cachedTexture = tex;
  return tex;
}

/** Emits a short burst of particles at the given world position. */
export function emitStarBurst(scene: Scene, position: Vector3) {
  const ps = new ParticleSystem("star-burst", 36, scene);
  ps.particleTexture = getParticleTexture(scene);
  ps.emitter = position.clone();
  ps.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
  ps.maxEmitBox = new Vector3(0.1, 0.1, 0.1);
  ps.color1 = Color4.FromHexString(`${colors.star}ff`);
  ps.color2 = Color4.FromHexString(`${colors.accent}ff`);
  ps.colorDead = new Color4(1, 1, 1, 0);
  ps.minSize = 0.12;
  ps.maxSize = 0.32;
  ps.minLifeTime = 0.25;
  ps.maxLifeTime = 0.55;
  ps.emitRate = 500;
  ps.blendMode = ParticleSystem.BLENDMODE_ADD;
  ps.gravity = new Vector3(0, -3, 0);
  ps.direction1 = new Vector3(-1.2, 2.0, -1.2);
  ps.direction2 = new Vector3(1.2, 3.5, 1.2);
  ps.minEmitPower = 1;
  ps.maxEmitPower = 2;
  ps.updateSpeed = 0.016;
  ps.targetStopDuration = 0.25;
  ps.disposeOnStop = true;
  ps.start();
}

/** Emits a celebratory burst on level complete. */
export function emitConfetti(scene: Scene, position: Vector3) {
  const ps = new ParticleSystem("confetti", 160, scene);
  ps.particleTexture = getParticleTexture(scene);
  ps.emitter = position.clone();
  ps.minEmitBox = new Vector3(-0.3, 0, -0.3);
  ps.maxEmitBox = new Vector3(0.3, 0, 0.3);
  ps.color1 = Color4.FromHexString(`${colors.accent}ff`);
  ps.color2 = Color4.FromHexString(`${colors.mint}ff`);
  ps.colorDead = new Color4(1, 1, 1, 0);
  ps.minSize = 0.18;
  ps.maxSize = 0.45;
  ps.minLifeTime = 0.8;
  ps.maxLifeTime = 1.6;
  ps.emitRate = 400;
  ps.gravity = new Vector3(0, -4.5, 0);
  ps.direction1 = new Vector3(-3, 5, -3);
  ps.direction2 = new Vector3(3, 8, 3);
  ps.minEmitPower = 2;
  ps.maxEmitPower = 5;
  ps.targetStopDuration = 0.4;
  ps.disposeOnStop = true;
  ps.start();
}

/** Helper: hex string to Babylon Color3 (re-exported for external use). */
export function hexToColor3(hex: string): Color3 {
  return Color3.FromHexString(hex);
}
