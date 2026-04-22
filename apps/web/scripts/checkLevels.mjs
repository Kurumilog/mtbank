#!/usr/bin/env node
/**
 * Level solvability checker.
 *
 * For every level JSON in apps/web/src/features/game/levels/, runs a BFS over
 * the state space (playerCell, collectedStarsBitmask) to determine:
 *   1. Is the finish reachable at all?
 *   2. Can the player collect 100% of the stars and still reach the finish?
 *   3. Minimum number of swipes for each of those outcomes.
 *
 * Usage:
 *   node scripts/checkLevels.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const levelsDir = join(__dirname, "..", "src", "features", "game", "levels");

const DIRS = [
  { name: "up", dx: 0, dy: -1 },
  { name: "down", dx: 0, dy: 1 },
  { name: "left", dx: -1, dy: 0 },
  { name: "right", dx: 1, dy: 0 },
];

function parseLevel(raw) {
  const { id, name, width, height, grid } = raw;
  const cells = [];
  const stars = [];
  let start = null;
  let finish = null;
  for (let y = 0; y < height; y += 1) {
    const row = grid[y];
    const out = [];
    for (let x = 0; x < width; x += 1) {
      const c = row[x];
      out.push(c === "W" ? "W" : ".");
      if (c === "S") start = { x, y };
      if (c === "F") finish = { x, y };
      if (c === "*") stars.push({ x, y });
    }
    cells.push(out);
  }
  return { id, name, width, height, cells, start, finish, stars };
}

function isWalkable(cells, x, y) {
  if (y < 0 || y >= cells.length) return false;
  const row = cells[y];
  if (x < 0 || x >= row.length) return false;
  return row[x] !== "W";
}

function slideDestinationWithPath(cells, origin, dir) {
  let cur = origin;
  const visited = [];
  while (true) {
    const nx = cur.x + dir.dx;
    const ny = cur.y + dir.dy;
    if (!isWalkable(cells, nx, ny)) break;
    cur = { x: nx, y: ny };
    visited.push(cur);
  }
  return { end: cur, path: visited };
}

function check(level) {
  const starIndex = new Map();
  level.stars.forEach((s, i) => starIndex.set(`${s.x},${s.y}`, i));
  const starCount = level.stars.length;
  const fullMask = (1 << starCount) - 1;

  // BFS state: (x, y, mask) -> distance in swipes
  const startKey = (x, y, mask) => `${x},${y},${mask}`;
  const queue = [{ x: level.start.x, y: level.start.y, mask: 0, dist: 0 }];
  const seen = new Map();
  seen.set(startKey(level.start.x, level.start.y, 0), 0);

  let minToFinishAny = null;
  let minToFinishFull = null;

  while (queue.length) {
    const s = queue.shift();
    // Check finish
    if (s.x === level.finish.x && s.y === level.finish.y) {
      if (minToFinishAny === null) minToFinishAny = s.dist;
      if (s.mask === fullMask && minToFinishFull === null) {
        minToFinishFull = s.dist;
      }
    }
    for (const dir of DIRS) {
      const { end, path } = slideDestinationWithPath(level.cells, s, dir);
      if (end.x === s.x && end.y === s.y) continue; // no movement
      let nmask = s.mask;
      for (const p of path) {
        const idx = starIndex.get(`${p.x},${p.y}`);
        if (idx !== undefined) nmask |= 1 << idx;
      }
      const key = startKey(end.x, end.y, nmask);
      if (seen.has(key)) continue;
      seen.set(key, s.dist + 1);
      queue.push({ x: end.x, y: end.y, mask: nmask, dist: s.dist + 1 });
    }
  }

  return { starCount, minToFinishAny, minToFinishFull };
}

const files = readdirSync(levelsDir).filter((f) => /^\d+\.json$/.test(f)).sort();
let failures = 0;

console.log("#  | stars | finish | 100% | swipes100% | name");
console.log("-- | ----- | ------ | ---- | ---------- | ----");
for (const file of files) {
  const raw = JSON.parse(readFileSync(join(levelsDir, file), "utf8"));
  const level = parseLevel(raw);
  const r = check(level);
  const finish = r.minToFinishAny != null ? "ok" : "FAIL";
  const full = r.minToFinishFull != null ? "ok" : "FAIL";
  const swipes = r.minToFinishFull ?? "-";
  if (r.minToFinishAny == null || r.minToFinishFull == null) failures += 1;
  console.log(
    `${String(raw.id).padStart(2)} | ${String(r.starCount).padStart(5)} | ${finish.padStart(6)} | ${full.padStart(4)} | ${String(swipes).padStart(10)} | ${raw.name}`,
  );
}

if (failures > 0) {
  console.error(`\n${failures} level(s) unsolvable for 100% completion.`);
  process.exit(1);
} else {
  console.log("\nAll levels are 100%-solvable.");
}
