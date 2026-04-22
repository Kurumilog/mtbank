import { GAME_CONSTANTS } from "../constants";
import type { Direction } from "../types";

export type SwipeHandler = (direction: Direction) => void;

/**
 * Attaches pointer-based swipe detection to the given element.
 *
 * Works with both touch and mouse so the game is playable inside a WebView,
 * Telegram Mini App and on desktop during development.
 *
 * Returns a disposer that removes all listeners.
 */
export function attachSwipeInput(
  target: HTMLElement,
  onSwipe: SwipeHandler,
): () => void {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const onPointerDown = (event: PointerEvent) => {
    tracking = true;
    startX = event.clientX;
    startY = event.clientY;
    target.setPointerCapture?.(event.pointerId);
  };

  const resolveDirection = (dx: number, dy: number): Direction | null => {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < GAME_CONSTANTS.swipeMinDistance) return null;
    if (absX > absY) return dx > 0 ? "right" : "left";
    return dy > 0 ? "down" : "up";
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!tracking) return;
    tracking = false;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const direction = resolveDirection(dx, dy);
    if (direction) onSwipe(direction);
    target.releasePointerCapture?.(event.pointerId);
  };

  const onPointerCancel = () => {
    tracking = false;
  };

  // Fallback for keyboards — useful during development and accessibility.
  const onKeyDown = (event: KeyboardEvent) => {
    const map: Record<string, Direction> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    const dir = map[event.key];
    if (dir) {
      event.preventDefault();
      onSwipe(dir);
    }
  };

  target.addEventListener("pointerdown", onPointerDown);
  target.addEventListener("pointerup", onPointerUp);
  target.addEventListener("pointercancel", onPointerCancel);
  window.addEventListener("keydown", onKeyDown);

  return () => {
    target.removeEventListener("pointerdown", onPointerDown);
    target.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointercancel", onPointerCancel);
    window.removeEventListener("keydown", onKeyDown);
  };
}
