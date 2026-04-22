import type { CSSProperties, ReactNode } from "react";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type PanelProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function Panel({ children, style }: PanelProps) {
  return <div style={{ ...styles.panel, ...style }}>{children}</div>;
}

const styles: Record<string, CSSProperties> = {
  panel: {
    background: `linear-gradient(180deg, ${colors.panel} 0%, ${colors.panelStrong} 100%)`,
    border: `1px solid ${colors.border}`,
    borderRadius: 24,
    boxShadow: `0 12px 40px ${colors.shadow}`,
    padding: spacing.lg,
  },
};