import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../../core/theme/colors";
import { radius } from "../../core/theme/radius";
import { spacing } from "../../core/theme/spacing";

type SectionCardProps = {
  children: ReactNode;
  tone?: "default" | "muted" | "hero";
};

export function SectionCard({ children, tone = "default" }: SectionCardProps) {
  return <View style={[styles.card, tone === "muted" ? styles.muted : null, tone === "hero" ? styles.hero : null]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
  },
  hero: {
    backgroundColor: colors.hero,
    borderColor: colors.hero,
  },
});
