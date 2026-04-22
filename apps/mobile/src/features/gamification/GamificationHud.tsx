import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../core/theme/colors";
import { spacing } from "../../core/theme/spacing";
import { Panel } from "../../shared/ui/Panel";

export function GamificationHud() {
  return (
    <Panel>
      <View style={styles.row}>
        <Text style={styles.label}>XP</Text>
        <Text style={styles.value}>1 240</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>8</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Streak</Text>
        <Text style={styles.value}>12 days</Text>
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});