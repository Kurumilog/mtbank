import { AbstractMesh, Quaternion, Scene, Vector3 } from "@babylonjs/core";

import { GAME_CONSTANTS } from "../constants";
import type { Direction, Vec2 } from "../types";
import { cellToWorld } from "./Maze";

/**
 * Stateful player controller.
 *
 * Holds the logical cell position (`cell`) and animates the visual mesh
 * toward the target cell at a constant speed, similar to the slide feel
 * of Tomb of the Mask.
 */
export class Player {
  private readonly worldWidth: number;
  private readonly worldHeight: number;
  private readonly mesh: AbstractMesh;

  private currentCell: Vec2;
  private targetCell: Vec2;
  private worldPosition: Vector3;
  private worldTarget: Vector3;
  private sliding = false;
  private elapsed = 0;
  private facing: Direction = "down";

  constructor(mesh: AbstractMesh, spawn: Vec2, width: number, height: number) {
    this.mesh = mesh;
    this.currentCell = { ...spawn };
    this.targetCell = { ...spawn };
    this.worldWidth = width;
    this.worldHeight = height;

    const spawnWorld = cellToWorld(spawn, width, height);
    spawnWorld.y = GAME_CONSTANTS.playerHoverHeight;
    this.worldPosition = spawnWorld.clone();
    this.worldTarget = spawnWorld.clone();
    mesh.position = spawnWorld.clone();
  }

  get cell(): Vec2 {
    return { ...this.currentCell };
  }

  get isSliding(): boolean {
    return this.sliding;
  }

  /** Commands the player to slide to `destination` facing `direction`. */
  slideTo(destination: Vec2, direction: Direction) {
    if (destination.x === this.currentCell.x && destination.y === this.currentCell.y) {
      return;
    }
    this.targetCell = { ...destination };
    const world = cellToWorld(destination, this.worldWidth, this.worldHeight);
    world.y = GAME_CONSTANTS.playerHoverHeight;
    this.worldTarget = world;
    this.sliding = true;
    this.facing = direction;
    this.faceDirection(direction);
  }

  /** Instantly teleport to a cell (used on level reset). */
  teleport(cell: Vec2) {
    this.currentCell = { ...cell };
    this.targetCell = { ...cell };
    const world = cellToWorld(cell, this.worldWidth, this.worldHeight);
    world.y = GAME_CONSTANTS.playerHoverHeight;
    this.worldPosition = world.clone();
    this.worldTarget = world.clone();
    this.mesh.position = world.clone();
    this.sliding = false;
  }

  /**
   * Advances the slide animation. Must be called every frame with the delta
   * time in seconds. Invokes the optional `onCellEntered` callback exactly
   * once per cell the player passes over (including the destination).
   */
  update(deltaSeconds: number, onCellEntered?: (cell: Vec2) => void) {
    this.elapsed += deltaSeconds;

    if (this.sliding) {
      const direction = this.worldTarget.subtract(this.worldPosition);
      const distance = direction.length();
      const step = GAME_CONSTANTS.slideSpeed * GAME_CONSTANTS.cellSize * deltaSeconds;

      if (distance <= step || distance === 0) {
        // Snap to target and mark arrival.
        // Determine which cells we passed over to notify the runner.
        this.notifyCellsBetween(this.currentCell, this.targetCell, onCellEntered);
        this.currentCell = { ...this.targetCell };
        this.worldPosition = this.worldTarget.clone();
        this.mesh.position = this.worldPosition.clone();
        this.sliding = false;
      } else {
        const move = direction.normalize().scale(step);
        this.worldPosition = this.worldPosition.add(move);
        this.mesh.position = this.worldPosition.clone();
      }
    }

    // Subtle idle/slide hover bobbing on Y axis.
    const bob =
      Math.sin(this.elapsed * GAME_CONSTANTS.playerFloatSpeed) *
      GAME_CONSTANTS.playerFloatAmplitude;
    this.mesh.position.y = GAME_CONSTANTS.playerHoverHeight + bob;
  }

  private notifyCellsBetween(
    from: Vec2,
    to: Vec2,
    onCellEntered?: (cell: Vec2) => void,
  ) {
    if (!onCellEntered) return;
    const dx = Math.sign(to.x - from.x);
    const dy = Math.sign(to.y - from.y);
    let cx = from.x + dx;
    let cy = from.y + dy;
    while (true) {
      onCellEntered({ x: cx, y: cy });
      if (cx === to.x && cy === to.y) break;
      cx += dx;
      cy += dy;
    }
  }

  private faceDirection(direction: Direction) {
    if (!this.mesh.rotationQuaternion) {
      this.mesh.rotationQuaternion = Quaternion.Identity();
    }
    const yaw = {
      up: Math.PI,
      down: 0,
      left: Math.PI / 2,
      right: -Math.PI / 2,
    }[direction];
    this.mesh.rotationQuaternion = Quaternion.RotationAxis(Vector3.Up(), yaw);
  }

  static createScene(_scene: Scene) {
    // Placeholder for future: particles, trails, etc.
  }
}
