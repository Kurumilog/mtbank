import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../core/theme/colors";
import { radius } from "../../core/theme/radius";
import { spacing } from "../../core/theme/spacing";
import { AppButton } from "../../shared/ui/AppButton";
import { AppTextField } from "../../shared/ui/AppTextField";
import { SectionCard } from "../../shared/ui/SectionCard";
import { useAuthStore } from "./auth-store";
import type { AuthMode } from "./types";

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [fullName, setFullName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const { login: loginAction, register, isSubmitting, error, clearError } = useAuthStore((state) => ({
    login: state.login,
    register: state.register,
    isSubmitting: state.isSubmitting,
    error: state.error,
    clearError: state.clearError,
  }));

  useEffect(() => {
    clearError();
  }, [mode, clearError]);

  const isDisabled = useMemo(() => {
    if (!login.trim() || !password.trim()) {
      return true;
    }

    if (mode === "register" && !fullName.trim()) {
      return true;
    }

    return false;
  }, [fullName, login, mode, password]);

  const onSubmit = async () => {
    if (mode === "login") {
      await loginAction(login, password);
      return;
    }

    await register(fullName, login, password);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.kicker}>MTBank</Text>
            <Text style={styles.title}>Банк, который ощущается живым</Text>
            <Text style={styles.subtitle}>Простой вход по логину и паролю. На регистрации нужен только логин, пароль и ФИО.</Text>
          </View>

          <SectionCard>
            <View style={styles.tabRow}>
              <Pressable onPress={() => setMode("login")} style={[styles.tab, mode === "login" ? styles.tabActive : null]}>
                <Text style={[styles.tabLabel, mode === "login" ? styles.tabLabelActive : null]}>Вход</Text>
              </Pressable>
              <Pressable onPress={() => setMode("register")} style={[styles.tab, mode === "register" ? styles.tabActive : null]}>
                <Text style={[styles.tabLabel, mode === "register" ? styles.tabLabelActive : null]}>Регистрация</Text>
              </Pressable>
            </View>

            <View style={styles.form}>
              {mode === "register" ? (
                <AppTextField
                  label="ФИО"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Иван Иванов"
                  autoCapitalize="words"
                />
              ) : null}

              <AppTextField label="Логин" value={login} onChangeText={setLogin} placeholder="misha" />
              <AppTextField
                label="Пароль"
                value={password}
                onChangeText={setPassword}
                placeholder="Минимум 6 символов"
                secureTextEntry
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <AppButton
                label={isSubmitting ? "Подождите..." : mode === "login" ? "Войти" : "Создать аккаунт"}
                onPress={onSubmit}
                disabled={isDisabled || isSubmitting}
              />
            </View>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.xl,
  },
  hero: {
    gap: spacing.md,
  },
  kicker: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.xxs,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: colors.text,
  },
  form: {
    gap: spacing.lg,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
