import { useEffect, useMemo, useState } from "react";

import { App as SharedGameApp } from "@/app/App";
import { createHostBridge } from "@/core/bridge/hostBridge";
import { useGameStore } from "@/features/game/domain/useGameStore";
import { HANDCRAFTED_LEVELS } from "@/features/game/levels/registry";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

type MiniAppScreen = "home" | "play" | "leaderboard";

type TelegramUser = {
  first_name?: string;
  username?: string;
};

type TelegramWebApp = {
  colorScheme?: "light" | "dark";
  initDataUnsafe?: {
    start_param?: string;
    user?: TelegramUser;
  };
  openTelegramLink?: (url: string) => void;
  openLink?: (url: string) => void;
  shareMessage?: (messageId: string) => void;
  ready?: () => void;
  expand?: () => void;
};

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
};

function getTelegramWebApp(): TelegramWebApp | undefined {
  return (window as TelegramWindow).Telegram?.WebApp;
}

function buildMiniAppUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_TELEGRAM_APP_URL?.trim() || window.location.origin;
  return `${baseUrl}${path}`;
}

function shareViaTelegram(text: string, url: string) {
  const telegram = getTelegramWebApp();
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

  if (telegram?.openTelegramLink) {
    telegram.openTelegramLink(shareUrl);
    return;
  }

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

function parseStartParam(rawParam?: string): { type: "ref" | "challenge" | null; value: string | null } {
  if (!rawParam) {
    return { type: null, value: null };
  }

  if (rawParam.startsWith("ref_")) {
    return { type: "ref", value: rawParam.slice(4) || null };
  }

  if (rawParam.startsWith("challenge_")) {
    return { type: "challenge", value: rawParam.slice(10) || null };
  }

  return { type: null, value: rawParam };
}

function formatUserName(user?: TelegramUser): string {
  if (!user) {
    return "Игрок";
  }

  return user.first_name || user.username || "Игрок";
}

export function TelegramMiniApp() {
  const [screen, setScreen] = useState<MiniAppScreen>("home");
  const totalStars = useGameStore((state) => state.totalStars());
  const levelProgress = useGameStore((state) => state.levelProgress);

  const telegram = getTelegramWebApp();
  const user = telegram?.initDataUnsafe?.user;
  const startParam = telegram?.initDataUnsafe?.start_param;
  const entryContext = useMemo(() => parseStartParam(startParam), [startParam]);
  const nextLevelId = useMemo(() => {
    return (
      HANDCRAFTED_LEVELS.find((level) => (levelProgress[level.id]?.stars ?? 0) < 3)?.id ??
      HANDCRAFTED_LEVELS[0]?.id ??
      1
    );
  }, [levelProgress]);

  useEffect(() => {
    const bridge = createHostBridge();
    bridge.ready();
    bridge.send("game:ready", {
      surface: "telegram-mini-app",
      entryContext,
    });
  }, [entryContext]);

  useEffect(() => {
    document.body.style.background =
      telegram?.colorScheme === "dark" ? "#191714" : colors.paper;
  }, [telegram?.colorScheme]);

  if (screen === "play") {
    return (
      <div style={styles.playShell}>
        <button type="button" style={styles.floatingBackButton} onClick={() => setScreen("home")}>
          Назад в Mini App
        </button>
        <div style={styles.gameContainer}>
          <SharedGameApp />
        </div>
      </div>
    );
  }

  if (screen === "leaderboard") {
    return (
      <div style={styles.page}>
        <TopBar title="Лидерборды" onBack={() => setScreen("home")} />
        <div style={styles.content}>
          <section style={styles.card}>
            <div style={styles.sectionKicker}>Skeleton</div>
            <h2 style={styles.sectionTitle}>Контур под social competition</h2>
            <p style={styles.bodyText}>
              По документам проекта здесь нужны глобальный, friends и weekly рейтинги. В каркасе
              оставлен готовый экран Mini App, чтобы потом подключить реальные данные без смены
              структуры приложения.
            </p>
          </section>

          <section style={styles.cardList}>
            {[
              { title: "Global", subtitle: "Все игроки MTBank Pet Game", accent: "#e06a3e" },
              { title: "Friends", subtitle: "Друзья из Telegram", accent: "#d99a22" },
              { title: "Weekly", subtitle: "Недельный challenge sprint", accent: "#70995f" },
            ].map((item, index) => (
              <article key={item.title} style={styles.rankRow}>
                <div style={{ ...styles.rankBadge, background: item.accent }}>{index + 1}</div>
                <div style={styles.rankCopy}>
                  <div style={styles.rankTitle}>{item.title}</div>
                  <div style={styles.rankSubtitle}>{item.subtitle}</div>
                </div>
                <div style={styles.rankMeta}>Soon</div>
              </article>
            ))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <TopBar title="MTBank Pet Game" />

      <div style={styles.content}>
        <section style={styles.heroCard}>
          <div style={styles.sectionKicker}>Telegram Mini App</div>
          <h1 style={styles.heroTitle}>Привет, {formatUserName(user)}</h1>
          <p style={styles.bodyText}>
            Та же игра, что и в банковском WebView: короткие забеги по лабиринту, сбор звёзд,
            challenge-ссылки и social entry point через Telegram.
          </p>

          <div style={styles.metricsGrid}>
            <MetricCard label="Звёзды" value={String(totalStars)} />
            <MetricCard label="Следующий уровень" value={`#${nextLevelId}`} />
            <MetricCard label="Контент" value="60 + Daily" />
          </div>

          {entryContext.type && (
            <div style={styles.noticeBox}>
              <strong style={styles.noticeTitle}>
                {entryContext.type === "ref" ? "Реферальный вход" : "Вызов от друга"}
              </strong>
              <span style={styles.noticeText}>
                {entryContext.type === "ref"
                  ? `Mini App открыт по invite-ссылке ${entryContext.value ?? "без кода"}.`
                  : `Mini App открыт по challenge-ссылке ${entryContext.value ?? "без кода"}.`}
              </span>
            </div>
          )}

          <div style={styles.actionRow}>
            <button type="button" style={styles.primaryButton} onClick={() => setScreen("play")}>
              Играть
            </button>
            <button type="button" style={styles.secondaryButton} onClick={() => setScreen("leaderboard")}>
              Лидерборды
            </button>
          </div>
        </section>

        <section style={styles.cardList}>
          <ActionCard
            title="Пригласить друга"
            description="Поделиться входом в Mini App как верхом воронки: friend-first, bank-second."
            actionLabel="Share invite"
            onAction={() => {
              const botName = import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.trim();
              const inviteUrl = botName
                ? `https://t.me/${botName}?startapp=ref_${user?.username ?? "mtbank_friend"}`
                : buildMiniAppUrl("/?startapp=ref_mtbank_friend");

              shareViaTelegram(
                "Залетай в MTBank Pet Game. Это тот же Telegram Mini App с лабиринтами и питомцем.",
                inviteUrl,
              );
            }}
          />

          <ActionCard
            title="Бросить challenge"
            description="Поделиться конкретным social object: побей мой результат и забери место в будущем leaderboard."
            actionLabel="Share challenge"
            onAction={() => {
              const botName = import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.trim();
              const challengeId = `lvl${nextLevelId}_stars${totalStars}`;
              const challengeUrl = botName
                ? `https://t.me/${botName}?startapp=challenge_${challengeId}`
                : buildMiniAppUrl(`/?startapp=challenge_${challengeId}`);

              shareViaTelegram(
                `Я иду на уровень ${nextLevelId}. Попробуй побить мой заход в MTBank Pet Game.`,
                challengeUrl,
              );
            }}
          />

          <ActionCard
            title="Что дальше"
            description="Каркас уже учитывает deep links, shared game client и отдельный экран под leaderboards. Следующий шаг — привязать backend для challenge history, referrals и rankings."
            actionLabel="Открыть игру"
            onAction={() => setScreen("play")}
          />
        </section>
      </div>
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header style={styles.topBar}>
      <div>
        <div style={styles.topBarKicker}>MTBank</div>
        <div style={styles.topBarTitle}>{title}</div>
      </div>
      {onBack ? (
        <button type="button" style={styles.topBarButton} onClick={onBack}>
          Назад
        </button>
      ) : null}
    </header>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={styles.metricValue}>{value}</div>
    </article>
  );
}

function ActionCard({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <article style={styles.actionCard}>
      <div>
        <div style={styles.cardTitle}>{title}</div>
        <p style={styles.cardDescription}>{description}</p>
      </div>
      <button type="button" style={styles.inlineButton} onClick={onAction}>
        {actionLabel}
      </button>
    </article>
  );
}

const styles = {
  page: {
    background: `radial-gradient(circle at top, ${colors.paperSoft} 0%, ${colors.paper} 55%, ${colors.paperDeep} 100%)`,
    color: colors.ink,
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100%",
  },
  content: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.lg,
    padding: `${spacing.lg}px ${spacing.lg}px ${spacing.xxl}px`,
  },
  topBar: {
    alignItems: "center",
    background: "rgba(255, 250, 242, 0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    padding: `${spacing.md}px ${spacing.lg}px`,
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  topBarKicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.2,
    textTransform: "uppercase" as const,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 800,
  },
  topBarButton: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    color: colors.ink,
    cursor: "pointer",
    font: "inherit",
    fontWeight: 700,
    padding: "10px 14px",
  },
  heroCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.62) 0%, rgba(255,248,237,0.95) 100%)",
    border: `1px solid ${colors.border}`,
    borderRadius: 24,
    boxShadow: `0 18px 36px ${colors.shadow}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
    padding: spacing.lg,
  },
  card: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    boxShadow: `0 12px 24px ${colors.shadow}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  cardList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
  },
  sectionKicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.2,
    textTransform: "uppercase" as const,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 1.1,
    margin: 0,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 1,
    margin: 0,
  },
  bodyText: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 1.5,
    margin: 0,
  },
  metricsGrid: {
    display: "grid",
    gap: spacing.sm,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  metricCard: {
    background: "rgba(255, 255, 255, 0.72)",
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    padding: spacing.md,
  },
  metricLabel: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 800,
  },
  noticeBox: {
    background: "rgba(224, 106, 62, 0.12)",
    border: "1px solid rgba(224, 106, 62, 0.24)",
    borderRadius: 16,
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    padding: spacing.md,
  },
  noticeTitle: {
    fontSize: 14,
  },
  noticeText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 1.4,
  },
  actionRow: {
    display: "flex",
    gap: spacing.sm,
  },
  primaryButton: {
    background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accentStrong} 100%)`,
    border: "none",
    borderRadius: 16,
    boxShadow: `0 10px 22px rgba(214, 74, 42, 0.34)`,
    color: "#fff",
    cursor: "pointer",
    flex: 1,
    font: "inherit",
    fontSize: 16,
    fontWeight: 800,
    padding: "14px 16px",
  },
  secondaryButton: {
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    color: colors.ink,
    cursor: "pointer",
    flex: 1,
    font: "inherit",
    fontSize: 16,
    fontWeight: 800,
    padding: "14px 16px",
  },
  actionCard: {
    alignItems: "flex-start",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 20,
    boxShadow: `0 12px 24px ${colors.shadow}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 6,
  },
  cardDescription: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 1.45,
    margin: 0,
  },
  inlineButton: {
    background: colors.paperSoft,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    color: colors.ink,
    cursor: "pointer",
    font: "inherit",
    fontWeight: 700,
    padding: "10px 14px",
  },
  playShell: {
    height: "100%",
    position: "relative" as const,
  },
  floatingBackButton: {
    background: "rgba(255, 250, 242, 0.94)",
    border: `1px solid ${colors.border}`,
    borderRadius: 999,
    boxShadow: `0 10px 20px ${colors.shadow}`,
    color: colors.ink,
    cursor: "pointer",
    font: "inherit",
    fontWeight: 700,
    left: spacing.md,
    padding: "10px 14px",
    position: "fixed" as const,
    top: spacing.md,
    zIndex: 20,
  },
  gameContainer: {
    height: "100%",
  },
  rankRow: {
    alignItems: "center",
    background: colors.panel,
    border: `1px solid ${colors.border}`,
    borderRadius: 18,
    display: "flex",
    gap: spacing.md,
    padding: spacing.md,
  },
  rankBadge: {
    alignItems: "center",
    borderRadius: 14,
    color: "#fff",
    display: "flex",
    fontSize: 18,
    fontWeight: 800,
    height: 42,
    justifyContent: "center",
    minWidth: 42,
  },
  rankCopy: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: 800,
  },
  rankSubtitle: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 2,
  },
  rankMeta: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase" as const,
  },
  sectionTitleSpacer: {
    marginTop: spacing.md,
  },
};
