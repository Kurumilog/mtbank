import { getSupabaseConfig, isSupabaseEnabled } from "./client";
import type { RemoteLevelProgress, SaveProgressInput } from "./types";

/**
 * Service for syncing level progress with Supabase.
 *
 * The real implementation is intentionally not connected yet — all methods
 * short-circuit when Supabase env vars are missing so the game works fully
 * offline during development.
 *
 * Once the backend is provisioned, enable it by:
 *   1. Adding VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY to .env
 *   2. Replacing the fetch calls below with `@supabase/supabase-js` queries.
 */
export const progressService = {
  isEnabled(): boolean {
    return isSupabaseEnabled();
  },

  async saveProgress(input: SaveProgressInput): Promise<void> {
    const config = getSupabaseConfig();
    if (!config) {
      // Offline mode — the zustand persist middleware handles local storage.
      console.debug("[progressService] Supabase disabled, skipping save", input);
      return;
    }

    // Placeholder REST call pattern — replace with supabase-js once installed.
    await fetch(`${config.url}/rest/v1/level_progress`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id: input.userId,
        level_id: input.levelId,
        stars: input.stars,
        best_time_ms: Math.round(input.timeSeconds * 1000),
      }),
    });
  },

  async fetchProgress(userId: string): Promise<RemoteLevelProgress[]> {
    const config = getSupabaseConfig();
    if (!config) return [];

    const response = await fetch(
      `${config.url}/rest/v1/level_progress?user_id=eq.${userId}`,
      {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
      },
    );
    if (!response.ok) return [];
    const rows: Array<{
      user_id: string;
      level_id: number;
      stars: number;
      best_time_ms: number | null;
      completed_at: string;
    }> = await response.json();

    return rows.map((row) => ({
      userId: row.user_id,
      levelId: row.level_id,
      stars: row.stars,
      bestTimeMs: row.best_time_ms,
      completedAt: row.completed_at,
    }));
  },
};
