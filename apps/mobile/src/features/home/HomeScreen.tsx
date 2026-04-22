import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../core/theme/colors";
import { radius } from "../../core/theme/radius";
import { spacing } from "../../core/theme/spacing";
import { useScaledSize } from "../../core/utils/layout";
import { AppButton } from "../../shared/ui/AppButton";
import { SectionCard } from "../../shared/ui/SectionCard";
import { useAuthStore } from "../auth/auth-store";

const quickActions = ["Пополнить", "Перевести", "Оплатить", "Баллы"] as const;
const tabs = ["Главная", "Продукты", "Питомец", "Чат", "Ещё"] as const;

export function HomeScreen() {
  const nameSize = useScaledSize(20, 0.94, 1.1);
  const amountSize = useScaledSize(40, 0.9, 1.08);

  const { homeData, logout } = useAuthStore((state) => ({
    homeData: state.homeData,
    logout: state.logout,
  }));

  const profileName = useMemo(() => homeData?.profile.full_name.split(" ")[0] ?? "Пользователь", [homeData?.profile.full_name]);

  if (!homeData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <SectionCard tone="hero">
            <View style={styles.headerRow}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{profileName.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </View>

              <View style={styles.headerTextWrap}>
                <Text style={[styles.headerName, { fontSize: nameSize }]} numberOfLines={1}>
                  {profileName}
                </Text>
              </View>
            </View>

            <View style={styles.accountCard}>
              <View style={styles.accountMetaRow}>
                <View style={styles.accountChip}>
                  <Text style={styles.accountChipText}>{homeData.account.title}</Text>
                </View>
                <View style={styles.accountChip}>
                  <Text style={styles.accountChipText}>{homeData.cards[0]?.masked_pan ?? "----"}</Text>
                </View>
              </View>

              <View style={styles.balanceRow}>
                <View>
                  <Text style={[styles.balanceText, { fontSize: amountSize }]}>{formatMoney(homeData.account.balance)}</Text>
                  <Text style={styles.balanceCurrency}>{homeData.account.currency}</Text>
                </View>
                <View style={styles.balanceIcon}>
                  <Text style={styles.balanceIconText}>+</Text>
                </View>
              </View>

              <View style={styles.quickActionRow}>
                {quickActions.map((label) => (
                  <View key={label} style={styles.quickActionItem}>
                    <Pressable style={styles.quickActionButton}>
                      <Text style={styles.quickActionGlyph}>{glyphForAction(label)}</Text>
                    </Pressable>
                    <Text style={styles.quickActionLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </SectionCard>

          {homeData.transactions[0] ? (
            <SectionCard>
              <View style={styles.transactionRow}>
                <View style={styles.transactionIconWrap}>
                  <Text style={styles.transactionIcon}>{glyphForTransaction(homeData.transactions[0].icon_key)}</Text>
                </View>
                <View style={styles.transactionCopy}>
                  <Text style={styles.transactionTitle}>{homeData.transactions[0].title}</Text>
                  <Text style={styles.transactionSubtitle}>{homeData.transactions[0].subtitle}</Text>
                </View>
                <Text style={styles.transactionAmount}>{formatSignedMoney(homeData.transactions[0].amount)}</Text>
              </View>
            </SectionCard>
          ) : null}

          {homeData.promoBanners.map((banner) => (
            <SectionCard key={banner.id} tone={banner.tone === "primary" ? "hero" : "default"}>
              <Text style={[styles.promoTitle, banner.tone === "primary" ? styles.promoTitleLight : null]}>{banner.title}</Text>
              <Text style={[styles.promoSubtitle, banner.tone === "primary" ? styles.promoSubtitleLight : null]}>{banner.subtitle}</Text>
            </SectionCard>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Мои карты</Text>
            <Text style={styles.sectionLink}>Все</Text>
          </View>

          {homeData.cards.map((card) => (
            <SectionCard key={card.id}>
              <View style={styles.cardRow}>
                <View style={styles.cardBrand}>
                  <View style={styles.cardBrandBar} />
                  <View style={styles.cardBrandBar} />
                  <View style={styles.cardBrandBar} />
                </View>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardSubtitle}>
                    {card.masked_pan} · {card.expires_at}
                  </Text>
                </View>
                <Text style={styles.cardBalance}>
                  {formatMoney(card.balance)} {card.currency}
                </Text>
              </View>
            </SectionCard>
          ))}

          <AppButton label="Выйти" onPress={() => void logout()} variant="secondary" />
        </ScrollView>

        <View style={styles.tabBar}>
          {tabs.map((tab, index) => {
            const isActive = index === 0;

            return (
              <View key={tab} style={styles.tabItem}>
                <Text style={[styles.tabIcon, isActive ? styles.tabActive : null]}>{glyphForTab(tab)}</Text>
                <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>{tab}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSignedMoney(value: number) {
  const sign = value > 0 ? "+" : "-";
  return `${sign}${formatMoney(Math.abs(value))}`;
}

function glyphForAction(label: (typeof quickActions)[number]) {
  switch (label) {
    case "Пополнить":
      return "+";
    case "Перевести":
      return "↔";
    case "Оплатить":
      return "◉";
    case "Баллы":
      return "★";
  }
}

function glyphForTransaction(iconKey: string) {
  switch (iconKey) {
    case "coffee":
      return "☕";
    case "topup":
      return "+";
    case "subscription":
      return "♪";
    default:
      return "•";
  }
}

function glyphForTab(tab: (typeof tabs)[number]) {
  switch (tab) {
    case "Главная":
      return "⌂";
    case "Продукты":
      return "◫";
    case "Питомец":
      return "◉";
    case "Чат":
      return "☰";
    case "Ещё":
      return "⋯";
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  avatarText: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "700",
  },
  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    minWidth: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },
  headerTextWrap: {
    flex: 1,
  },
  headerName: {
    color: colors.surface,
    fontWeight: "700",
  },
  accountCard: {
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  accountMetaRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  accountChip: {
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accountChipText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balanceText: {
    color: colors.surface,
    fontWeight: "500",
  },
  balanceCurrency: {
    color: "rgba(255,255,255,0.78)",
    marginTop: -spacing.sm,
    fontSize: 22,
  },
  balanceIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  balanceIconText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  quickActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  quickActionButton: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 72,
  },
  quickActionGlyph: {
    color: colors.surface,
    fontSize: 20,
    fontWeight: "700",
  },
  quickActionLabel: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: "600",
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  transactionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
  },
  transactionIcon: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  transactionCopy: {
    flex: 1,
    gap: spacing.xxs,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  transactionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  transactionAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  promoTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  promoTitleLight: {
    color: colors.surface,
  },
  promoSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  promoSubtitleLight: {
    color: "rgba(255,255,255,0.84)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardBrand: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    gap: spacing.xxs,
  },
  cardBrandBar: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  cardMeta: {
    flex: 1,
    gap: spacing.xxs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  cardBalance: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  tabIcon: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "700",
  },
  tabActive: {
    color: colors.primary,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.primary,
  },
});
