import { useWindowDimensions } from "react-native";

export function useScaledSize(base: number, min = 0.92, max = 1.12) {
  const { width } = useWindowDimensions();
  const ratio = Math.min(max, Math.max(min, width / 393));

  return Math.round(base * ratio);
}
