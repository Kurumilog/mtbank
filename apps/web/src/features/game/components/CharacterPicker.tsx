import type { CSSProperties } from "react";

import {
  CHARACTERS,
  isCharacterUnlocked,
  type CharacterDefinition,
} from "@/core/characters/registry";
import { colors } from "@/shared/theme/colors";
import { spacing } from "@/shared/theme/spacing";

import { useGameStore } from "../domain/useGameStore";

/**
 * Horizontal carousel of selectable characters. Locked characters are
 * rendered as silhouettes with an unlock hint.
 */
export function CharacterPicker() {
  const selectedId = useGameStore((state) => state.selectedCharacterId);
  const selectCharacter = useGameStore((state) => state.selectCharacter);
  const totalStars = useGameStore((state) => state.totalStars());

  return (
    <section style={styles.wrapper} data-testid="character-picker">
      <div style={styles.header}>
        <span style={styles.kicker}>Питомец</span>
      </div>
      <div style={styles.row}>
        {CHARACTERS.map((character) => {
          const unlocked = isCharacterUnlocked(character, totalStars);
          const selected = unlocked && character.id === selectedId;
          return (
            <CharacterBubble
              key={character.id}
              character={character}
              unlocked={unlocked}
              selected={selected}
              totalStars={totalStars}
              onPick={() => unlocked && selectCharacter(character.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

interface BubbleProps {
  character: CharacterDefinition;
  unlocked: boolean;
  selected: boolean;
  totalStars: number;
  onPick: () => void;
}

function CharacterBubble({
  character,
  unlocked,
  selected,
  totalStars,
  onPick,
}: BubbleProps) {
  const lockLabel =
    !unlocked && character.unlock.type === "stars"
      ? `★ ${totalStars} / ${character.unlock.threshold}`
      : null;

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!unlocked}
      data-testid={`character-${character.id}`}
      aria-pressed={selected}
      style={{
        ...styles.bubble,
        ...(selected ? styles.bubbleSelected : {}),
        ...(unlocked ? {} : styles.bubbleLocked),
        borderColor: selected ? character.accent : "transparent",
      }}
    >
      <div
        style={{
          ...styles.avatar,
          background: unlocked
            ? `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), ${character.accent})`
            : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), ${colors.paperDeep})`,
        }}
      >
        <span style={styles.avatarGlyph} aria-hidden>
          {unlocked ? character.name.charAt(0) : "🔒"}
        </span>
      </div>
      <div style={styles.meta}>
        <div style={styles.name}>{character.name}</div>
        <div style={styles.description}>
          {unlocked ? character.description : lockLabel ?? "Скоро"}
        </div>
      </div>
    </button>
  );
}

const styles: Record<string, CSSProperties> = {
  wrapper: {
    borderTop: `1px solid ${colors.border}`,
    padding: `${spacing.md}px ${spacing.lg}px`,
  },
  header: {
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  kicker: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.18,
    textTransform: "uppercase",
  },
  row: {
    display: "flex",
    gap: spacing.sm,
    overflowX: "auto",
    paddingBottom: 4,
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  },
  bubble: {
    alignItems: "center",
    background: colors.panel,
    border: "2px solid transparent",
    borderRadius: 18,
    boxShadow: `0 4px 12px ${colors.shadow}`,
    color: colors.ink,
    cursor: "pointer",
    display: "flex",
    flex: "0 0 auto",
    fontFamily: "inherit",
    gap: spacing.sm,
    padding: `${spacing.sm}px ${spacing.md}px`,
    scrollSnapAlign: "start",
    transition: "transform 160ms ease, box-shadow 160ms ease",
  },
  bubbleSelected: {
    boxShadow: `0 6px 18px ${colors.shadow}`,
    transform: "translateY(-1px)",
  },
  bubbleLocked: {
    cursor: "not-allowed",
    opacity: 0.6,
  },
  avatar: {
    alignItems: "center",
    borderRadius: "50%",
    display: "flex",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarGlyph: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: 800,
    textShadow: "0 1px 0 rgba(255,255,255,0.4)",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    maxWidth: 140,
  },
  name: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1,
  },
  description: {
    color: colors.inkSoft,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
