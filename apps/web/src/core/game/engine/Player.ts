import { AbstractMesh, Quaternion, Scene, Vector3 } from "@babylonjs/core";

import { GAME_CONSTANTS } from "../constants";
import type { Direction, Vec2 } from "../types";
import { cellToWorld } from "./Maze";

/**
 * Stateful player controller.
 *
 * Holds the logical cell position (`cell`) and animates the visual mesh
 * toward the target cell at a constant speed, similar to the slide feel
 * of Tomb of the Mask. Includes subtle squash/stretch while sliding for
 * extra juice without requiring skeletal animation support in the model.
 */
export class Player {
  private readonly worldWidth: number;
  private readonly worldHeight: number;
  private readonly mesh: AbstractMesh;
  private readonly baseScale: Vector3;

  private currentCell: Vec2;
  private targetCell: Vec2;
  private worldPosition: Vector3;
  private worldTarget: Vector3;
  private sliding = false;
  private slideDirection: Direction = "down";
  private arrivalPulse = 0;
  private elapsed = 0;

  /** Bumped each time the player hits a wall — used for camera shake. */
  private _wallHits = 0;

  constructor(mesh: AbstractMesh, spawn: Vec2, width: number, height: number) {
    this.mesh = mesh;
    this.baseScale = mesh.scaling.clone();
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

  get wallHitsCount(): number {
    return this._wallHits;
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
    this.slideDirection = direction;
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
    this.arrivalPulse = 0;
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
        this.notifyCellsBetween(this.currentCell, this.targetCell, onCellEntered);
        this.currentCell = { ...this.targetCell };
        this.worldPosition = this.worldTarget.clone();
        this.mesh.position = this.worldPosition.clone();
        this.sliding = false;
        this.arrivalPulse = 1;
        this._wallHits += 1;
      } else {
        const move = direction.normalize().scale(step);
        this.worldPosition = this.worldPosition.add(move);
        this.mesh.position = this.worldPosition.clone();
      }
    }

    // Hover bob on Y.
    const bob =
      Math.sin(this.elapsed * GAME_CONSTANTS.playerFloatSpeed) *
      GAME_CONSTANTS.playerFloatAmplitude;
    this.mesh.position.y = GAME_CONSTANTS.playerHoverHeight + bob;

    this.updateSquash(deltaSeconds);
  }

  /**
   * Applies stretch along the slide direction while moving and a quick squash
   * on arrival. Works for any mesh since we manipulate only `scaling`.
   */
  private updateSquash(deltaSeconds: number) {
    const base = this.baseScale;
    let sx = base.x;
    let sy = base.y;
    let sz = base.z;

    if (this.sliding) {
      const isHorizontal =
        this.slideDirection === "left" || this.slideDirection === "right";
      const stretch = 1.15;
      const squeeze = 0.85;
      if (isHorizontal) {
        sx = base.x * stretch;
        sz = base.z * squeeze;
      } else {
        sz = base.z * stretch;
        sx = base.x * squeeze;
      }
      sy = base.y * 0.95;
    } else if (this.arrivalPulse > 0) {
      // Arrival squash: wide + flat then ease back to base.
      const t = this.arrivalPulse; // starts at 1, decays to 0
      sx = base.x * (1 + 0.25 * t);
      sz = base.z * (1 + 0.25 * t);
      sy = base.y * (1 - 0.35 * t);
      this.arrivalPulse = Math.max(0, this.arrivalPulse - deltaSeconds * 4);
    }

    this.mesh.scaling.set(sx, sy, sz);
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
    // Placeholder for future: trail ribbons, particle systems, etc.
  }
}
