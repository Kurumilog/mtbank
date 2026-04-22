export type Direction = "up" | "down" | "left" | "right";

export type CellType = "wall" | "floor" | "start" | "finish" | "star";

export interface Vec2 {
  x: number;
  y: number;
}

/**
 * Level declaration. Kept intentionally simple so new levels can be authored
 * by hand as JSON or generated procedurally later.
 *
 * Grid characters:
 *   W — wall
 *   . — floor
 *   S — player spawn (exactly one per level)
 *   F — finish portal (exactly one per level)
 *   * — collectible star
 */
export interface LevelData {
  id: number;
  name: string;
  width: number;
  height: number;
  grid: string[];
}

export interface LevelResult {
  levelId: number;
  starsCollected: number;
  totalStars: number;
  /** Derived rating: 1, 2 or 3 stars based on collection ratio. */
  rating: 1 | 2 | 3;
  timeSeconds: number;
}

export const DIRECTION_VECTORS: Record<Direction, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
