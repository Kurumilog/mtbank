import { StyleSheet, Text } from "react-native";

import { colors } from "../../core/theme/colors";
import { spacing } from "../../core/theme/spacing";
import { Panel } from "../../shared/ui/Panel";

export function ProfilePreview() {
  return (
    <Panel>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>Anonymous user / mock data</Text>
      <Text style={styles.text}>Bank rank: Silver</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
});