import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "../../core/theme/colors";
import { spacing } from "../../core/theme/spacing";

type PanelProps = {
  children: ReactNode;
};

export function Panel({ children }: PanelProps) {
  return <View style={styles.panel}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
  },
});