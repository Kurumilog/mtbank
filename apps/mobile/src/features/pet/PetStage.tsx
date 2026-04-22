import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "../../core/theme/colors";
import { spacing } from "../../core/theme/spacing";
import { Panel } from "../../shared/ui/Panel";
import { GamificationHud } from "../gamification/GamificationHud";
import { ProfilePreview } from "../profile/ProfilePreview";
import { WalletSummary } from "../wallet/WalletSummary";

export function PetStage() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Panel>
          <Text style={styles.title}>Pet canvas</Text>
          <Text style={styles.subtitle}>GLB-ready R3F + Expo GL stage</Text>
        </Panel>
      </View>

      <GamificationHud />
      <WalletSummary />
      <ProfilePreview />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  hero: {
    minHeight: 280,
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
  },
});