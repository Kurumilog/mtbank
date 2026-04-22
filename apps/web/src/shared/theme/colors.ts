/**
 * Warm "paper" palette used by both the Babylon scene and the React UI.
 *
 * The idea: soft off-white paper background, warm pastel accents,
 * flat colored walls that feel like folded cardboard.
 */
export const colors = {
  // Surfaces
  paper: "#f4ead6",
  paperDeep: "#ebdcb6",
  paperSoft: "#faf3e2",
  ink: "#2d2a26",
  inkSoft: "#6b665c",
  muted: "#a8a090",

  // Scene surfaces
  floor: "#f1e4c6",
  floorAlt: "#e7d5ae",
  wall: "#d79a5b",
  wallTop: "#e5b57d",
  wallShadow: "#a86a32",

  // Accents
  accent: "#ef6c4a",
  accentStrong: "#d64a2a",
  mint: "#6fb89e",
  mintDeep: "#3b8c73",
  star: "#f5c451",
  starDeep: "#d99822",
  portal: "#7aa9ff",
  portalDeep: "#3e67c4",

  // Legacy tokens kept for existing Panel component compatibility.
  canvas: "#f4ead6",
  panel: "#ffffff",
  panelStrong: "#fdf7e7",
  text: "#2d2a26",
  warning: "#f5c451",
  danger: "#d64a2a",
  border: "rgba(45, 42, 38, 0.12)",
  shadow: "rgba(45, 42, 38, 0.18)",
} as const;
