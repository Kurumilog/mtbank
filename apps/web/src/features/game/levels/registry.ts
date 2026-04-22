import type { LevelData } from "@/core/game/types";

import level001 from "./001.json";
import level002 from "./002.json";
import level003 from "./003.json";
import level004 from "./004.json";
import level005 from "./005.json";

/**
 * Hand-authored story levels shipped with the build.
 *
 * Additional levels (up to 60) are scaffolded as "coming soon" in the menu
 * until hand-authored or procedurally generated variants are added.
 */
export const HANDCRAFTED_LEVELS: LevelData[] = [
  level001 as LevelData,
  level002 as LevelData,
  level003 as LevelData,
  level004 as LevelData,
  level005 as LevelData,
];

export function findLevel(id: number): LevelData | undefined {
  return HANDCRAFTED_LEVELS.find((level) => level.id === id);
}
