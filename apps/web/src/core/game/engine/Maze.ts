import {
  Color3,
  MeshBuilder,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";

import { colors } from "@/shared/theme/colors";

import { GAME_CONSTANTS } from "../constants";
import type { CellType, LevelData, Vec2 } from "../types";

const hex3 = (hex: string) => Color3.FromHexString(hex);

export interface MazeBuildResult {
  root: TransformNode;
  cells: CellType[][];
  width: number;
  height: number;
  startCell: Vec2;
  finishCell: Vec2;
  /** Coordinates of every cell that originally contained a star. */
  starCells: Vec2[];
}

/** Converts a cell character from the level grid into a semantic cell type. */
function cellTypeFromChar(char: string): CellType {
  switch (char) {
    case "W":
      return "wall";
    case "S":
      return "start";
    case "F":
      return "finish";
    case "*":
      return "star";
    default:
      return "floor";
  }
}

/**
 * Converts a maze cell coordinate (col, row) into the world-space position
 * of its center. The maze is centered around the origin on the XZ plane.
 */
export function cellToWorld(cell: Vec2, width: number, height: number): Vector3 {
  const { cellSize } = GAME_CONSTANTS;
  const x = (cell.x - (width - 1) / 2) * cellSize;
  const z = ((height - 1) / 2 - cell.y) * cellSize;
  return new Vector3(x, 0, z);
}

/**
 * Builds the static maze geometry (floor tiles + walls) for a level.
 *
 * Returns the parsed cell grid so the runner can query walkability and
 * the positions of stars / start / finish.
 */
export function buildMaze(scene: Scene, level: LevelData): MazeBuildResult {
  const { width, height, grid } = level;
  const { cellSize, wallHeight } = GAME_CONSTANTS;

  const root = new TransformNode(`maze-${level.id}`, scene);

  const cells: CellType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => "floor" as CellType),
  );

  let startCell: Vec2 = { x: 1, y: 1 };
  let finishCell: Vec2 = { x: width - 2, y: height - 2 };
  const starCells: Vec2[] = [];

  // Materials reused across the maze.
  const floorMat = new StandardMaterial("paper-floor", scene);
  floorMat.diffuseColor = hex3(colors.floor);
  floorMat.specularColor = new Color3(0, 0, 0);
  floorMat.emissiveColor = hex3(colors.floor).scale(0.35);

  const floorAltMat = new StandardMaterial("paper-floor-alt", scene);
  floorAltMat.diffuseColor = hex3(colors.floorAlt);
  floorAltMat.specularColor = new Color3(0, 0, 0);
  floorAltMat.emissiveColor = hex3(colors.floorAlt).scale(0.3);

  const wallMat = new StandardMaterial("paper-wall", scene);
  wallMat.diffuseColor = hex3(colors.wall);
  wallMat.specularColor = new Color3(0, 0, 0);
  wallMat.emissiveColor = hex3(colors.wall).scale(0.18);

  const wallTopMat = new StandardMaterial("paper-wall-top", scene);
  wallTopMat.diffuseColor = hex3(colors.wallTop);
  wallTopMat.specularColor = new Color3(0, 0, 0);
  wallTopMat.emissiveColor = hex3(colors.wallTop).scale(0.25);

  for (let y = 0; y < height; y += 1) {
    const row = grid[y] ?? "";
    for (let x = 0; x < width; x += 1) {
      const char = row[x] ?? "W";
      const type = cellTypeFromChar(char);
      cells[y][x] = type;

      const worldPos = cellToWorld({ x, y }, width, height);

      if (type === "wall") {
        const wall = MeshBuilder.CreateBox(
          `wall-${x}-${y}`,
          { width: cellSize, depth: cellSize, height: wallHeight },
          scene,
        );
        wall.position = new Vector3(worldPos.x, wallHeight / 2, worldPos.z);
        wall.material = wallMat;
        wall.parent = root;

        // Decorative top cap for paper-style layered look.
        const cap = MeshBuilder.CreateBox(
          `wall-cap-${x}-${y}`,
          { width: cellSize * 0.95, depth: cellSize * 0.95, height: 0.12 },
          scene,
        );
        cap.position = new Vector3(worldPos.x, wallHeight + 0.06, worldPos.z);
        cap.material = wallTopMat;
        cap.parent = root;
      } else {
        // Floor tile — checkerboard pattern for subtle paper grid.
        const tile = MeshBuilder.CreateGround(
          `floor-${x}-${y}`,
          { width: cellSize, height: cellSize, subdivisions: 1 },
          scene,
        );
        tile.position = new Vector3(worldPos.x, 0, worldPos.z);
        tile.material = (x + y) % 2 === 0 ? floorMat : floorAltMat;
        tile.parent = root;

        if (type === "start") {
          startCell = { x, y };
        } else if (type === "finish") {
          finishCell = { x, y };
        } else if (type === "star") {
          starCells.push({ x, y });
        }
      }
    }
  }

  return { root, cells, width, height, startCell, finishCell, starCells };
}

/** Returns true if the given cell is inside the grid and walkable. */
export function isWalkable(cells: CellType[][], cell: Vec2): boolean {
  const row = cells[cell.y];
  if (!row) return false;
  const type = row[cell.x];
  if (type === undefined) return false;
  return type !== "wall";
}

/**
 * Casts a ray from `origin` in the given `direction` vector and returns the
 * furthest walkable cell reached before hitting a wall or the grid border.
 *
 * The origin cell itself is always returned if no movement is possible.
 */
export function slideDestination(
  cells: CellType[][],
  origin: Vec2,
  direction: Vec2,
): Vec2 {
  let current = origin;
  while (true) {
    const next: Vec2 = { x: current.x + direction.x, y: current.y + direction.y };
    if (!isWalkable(cells, next)) {
      return current;
    }
    current = next;
  }
}
