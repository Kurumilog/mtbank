import { create } from "zustand";

import { normalizeLogin } from "../../core/utils/auth";
import { apiRequest, clearTokens, persistTokens, readAccessToken } from "../../services/api/client";
import type { Account, Card, HomeData, Profile, PromoBanner, Transaction } from "./types";

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    login: string;
    fullName: string;
  };
};

type AuthStore = {
  isReady: boolean;
  isAuthenticated: boolean;
  isSubmitting: boolean;
  error: string | null;
  profile: Profile | null;
  homeData: HomeData | null;
  bootstrap: () => Promise<void>;
  login: (login: string, password: string) => Promise<void>;
  register: (fullName: string, login: string, password: string) => Promise<void>;
  refreshHome: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

async function fetchHomeData(): Promise<HomeData | null> {
  const accessToken = await readAccessToken();

  if (!accessToken) {
    return null;
  }

  return apiRequest<HomeData>("/home", undefined, accessToken);
}

export const useAuthStore = create<AuthStore>((set) => ({
  isReady: false,
  isAuthenticated: false,
  isSubmitting: false,
  error: null,
  profile: null,
  homeData: null,
  bootstrap: async () => {
    try {
      const accessToken = await readAccessToken();

      if (!accessToken) {
        set({ isReady: true, isAuthenticated: false, profile: null, homeData: null });
        return;
      }

      const homeData = await fetchHomeData();

      set({
        isReady: true,
        isAuthenticated: Boolean(homeData),
        profile: homeData?.profile ?? null,
        homeData,
        error: null,
      });
    } catch (error) {
      set({
        isReady: true,
        isAuthenticated: false,
        profile: null,
        homeData: null,
        error: error instanceof Error ? error.message : "Не удалось инициализировать сессию",
      });
    }
  },
  login: async (login, password) => {
    set({ isSubmitting: true, error: null });

    try {
      const auth = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ login, password }),
      });

      await persistTokens(auth.accessToken, auth.refreshToken);

      const homeData = await fetchHomeData();

      set({
        isSubmitting: false,
        isAuthenticated: Boolean(homeData),
        profile: homeData?.profile ?? null,
        homeData,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Не удалось войти",
      });
    }
  },
  register: async (fullName, login, password) => {
    set({ isSubmitting: true, error: null });

    try {
      const auth = await apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          login: normalizeLogin(login),
          password,
        }),
      });

      await persistTokens(auth.accessToken, auth.refreshToken);

      const homeData = await fetchHomeData();

      set({
        isSubmitting: false,
        isAuthenticated: Boolean(homeData),
        profile: homeData?.profile ?? null,
        homeData,
      });
    } catch (error) {
      set({
        isSubmitting: false,
        error: error instanceof Error ? error.message : "Не удалось создать аккаунт",
      });
    }
  },
  refreshHome: async () => {
    const homeData = await fetchHomeData();

    set({
      isAuthenticated: Boolean(homeData),
      profile: homeData?.profile ?? null,
      homeData,
    });
  },
  logout: async () => {
    await clearTokens();
    set({ isAuthenticated: false, profile: null, homeData: null, error: null });
  },
  clearError: () => set({ error: null }),
}));
