import blobModelUrl from "../../../../../shared/assets/models/blob.glb?url";

export type UnlockCondition =
  | { type: "always" }
  | { type: "stars"; threshold: number };

export interface CharacterDefinition {
  id: string;
  /** Short display name shown in the picker. */
  name: string;
  /** One-line lore/description shown under the name. */
  description: string;
  /**
   * URL of the `.glb` model. For characters that are still work-in-progress
   * this field is null and the picker shows a placeholder silhouette.
   */
  modelUrl: string | null;
  /** Which character model to fall back to when `modelUrl` is null. */
  fallbackId?: string;
  /** Palette accent used to colour the picker bubble. */
  accent: string;
  unlock: UnlockCondition;
}

/**
 * Registry of characters available to the player.
 *
 * Order matters: the first entry is the default character selected for new
 * users. Additional characters are unlocked once the total collected stars
 * passes the defined threshold.
 *
 * To add a new character: drop its `.glb` into `shared/assets/models/` and
 * append a new entry with the correct `modelUrl`.
 */
export const CHARACTERS: CharacterDefinition[] = [
  {
    id: "blob",
    name: "Блоб",
    description: "Пушистый клубочек, любимец MTBank",
    modelUrl: blobModelUrl,
    accent: "#6fb89e",
    unlock: { type: "always" },
  },
  {
    id: "coin-cat",
    name: "Кот-копилка",
    description: "Копит звёзды и мурчит после зачисления",
    modelUrl: null,
    fallbackId: "blob",
    accent: "#ef6c4a",
    unlock: { type: "stars", threshold: 9 },
  },
  {
    id: "paper-fox",
    name: "Лис-оригами",
    description: "Сложен из сотни благодарностей друзей",
    modelUrl: null,
    fallbackId: "blob",
    accent: "#f5c451",
    unlock: { type: "stars", threshold: 27 },
  },
  {
    id: "cloud-ghost",
    name: "Облачный дух",
    description: "Приходит к тем, кто не забывает про streak",
    modelUrl: null,
    fallbackId: "blob",
    accent: "#7aa9ff",
    unlock: { type: "stars", threshold: 60 },
  },
];

export const DEFAULT_CHARACTER_ID = CHARACTERS[0].id;

export function findCharacter(id: string): CharacterDefinition | undefined {
  return CHARACTERS.find((character) => character.id === id);
}

/**
 * Returns the model URL that should actually be rendered for a given
 * character id, following `fallbackId` links until a real asset is found.
 */
export function resolveCharacterModelUrl(id: string): string {
  const seen = new Set<string>();
  let current = findCharacter(id);
  while (current) {
    if (seen.has(current.id)) break;
    seen.add(current.id);
    if (current.modelUrl) return current.modelUrl;
    current = current.fallbackId ? findCharacter(current.fallbackId) : undefined;
  }
  return blobModelUrl;
}

export function isCharacterUnlocked(
  character: CharacterDefinition,
  totalStars: number,
): boolean {
  if (character.unlock.type === "always") return true;
  return totalStars >= character.unlock.threshold;
}
