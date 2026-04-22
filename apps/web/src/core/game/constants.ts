/**
 * Global tuning constants for the maze game.
 *
 * Edit these to change the feel of the game without touching engine code.
 */
export const GAME_CONSTANTS = {
  /** Side length of a single maze cell in world units. */
  cellSize: 2,
  /** Height of the wall blocks. */
  wallHeight: 1.6,
  /** How high above the floor the player model floats. */
  playerHoverHeight: 0.8,
  /** Subtle vertical bobbing parameters for the idle player. */
  playerFloatAmplitude: 0.06,
  playerFloatSpeed: 2.6,
  /** Player slide speed in cells per second. */
  slideSpeed: 14,
  /** Minimum pointer travel (in CSS px) to register a swipe. */
  swipeMinDistance: 20,
  /** Camera tilt (beta). Lower = more top-down. PI/8 ≈ 22°. */
  cameraBeta: Math.PI / 8,
  /** Camera azimuth (alpha). */
  cameraAlpha: -Math.PI / 2,
  /** Camera distance multiplier applied after fitting the arena to the viewport. */
  cameraRadiusFactor: 1.08,
  /** Total number of story levels in the game. */
  totalLevels: 60,
} as const;
