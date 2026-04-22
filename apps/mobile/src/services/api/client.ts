import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiBaseUrl } from "../../core/config/api";

const accessTokenKey = "mtbank-access-token";
const refreshTokenKey = "mtbank-refresh-token";

type ApiEnvelope<T> = {
  data: T;
  error: string | null;
  status: number;
};

export async function apiRequest<T>(path: string, init?: RequestInit, accessToken?: string) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : null),
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
}

export async function persistTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setItem(accessTokenKey, accessToken);
  await AsyncStorage.setItem(refreshTokenKey, refreshToken);
}

export async function readAccessToken() {
  return AsyncStorage.getItem(accessTokenKey);
}

export async function clearTokens() {
  await AsyncStorage.removeItem(accessTokenKey);
  await AsyncStorage.removeItem(refreshTokenKey);
}
