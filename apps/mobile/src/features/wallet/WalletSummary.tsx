import { StyleSheet, Text } from "react-native";

import { colors } from "../../core/theme/colors";
import { spacing } from "../../core/theme/spacing";
import { Panel } from "../../shared/ui/Panel";

export function WalletSummary() {
  return (
    <Panel>
      <Text style={styles.title}>Balance</Text>
      <Text style={styles.amount}>125 400 ₽</Text>
      <Text style={styles.text}>Mock account data for hackathon MVP</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  amount: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  text: {
    color: colors.muted,
    fontSize: 13,
  },
});