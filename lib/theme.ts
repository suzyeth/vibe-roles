/**
 * theme.ts — color system shared across the app.
 *
 * Two things live here:
 *  1. Per-player accent colors (borrowed from the vibe-dice reference) so each
 *     member reads as a distinct person in the chat, in BOTH light and dark.
 *  2. Per-storyline DM (Dungeon Master) personas — different themes get a
 *     different narrator name + avatar, so the story has a "host" with flavor.
 *
 * Light/dark surface + text colors are CSS variables in globals.css; this file
 * only deals with the vivid accents that stay constant across themes.
 */

/** Distinct member accents (no green — green is reserved for the human "You"). */
export const PLAYER_ACCENTS = [
  '#6366F1', // indigo
  '#A78BFA', // violet
  '#F59E0B', // amber
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F43F5E', // rose
  '#3B82F6', // blue
  '#B45309', // brown
];

/** The human ("You") always reads as Zymix brand green — it's "your" color. */
export const YOU_ACCENT = '#1DB954';

/**
 * Stable accent color for a player. "You" is brand green; everyone else gets a
 * distinct hue by their order among the non-You players.
 */
export function accentFor(name: string, players: { name: string }[]): string {
  if (name === 'You') return YOU_ACCENT;
  const others = players.filter((p) => p.name !== 'You');
  const i = others.findIndex((p) => p.name === name);
  return PLAYER_ACCENTS[(i < 0 ? 0 : i) % PLAYER_ACCENTS.length];
}

export interface DM {
  name: string;
  avatar: string;
}

/** Default storyteller when a theme has no bespoke DM. */
export const DEFAULT_DM: DM = { name: 'The Dungeon Master', avatar: '🎲' };

/**
 * Per-theme DM personas. Keys match story `theme` strings (Test Mode stories and
 * the live fallback variants). Unknown themes fall back to {@link DEFAULT_DM}.
 */
export const DM_BY_THEME: Record<string, DM> = {
  // Test Mode stories
  'Group Chat on Trial': { name: 'The Group Admin', avatar: '🧑‍⚖️' },
  'The Ring Light Goes Dark': { name: 'The Algorithm', avatar: '📈' },
  'Locked In at Honeycomb': { name: 'The Gamemaster', avatar: '🔦' },
  'Two Texts, One Group Chat': { name: 'Cupid (Unhinged)', avatar: '💘' },
  // Live / fallback variants
  'The 404 Customer': { name: 'The Night Shift', avatar: '🌙' },
  'Space Station SOS': { name: 'Station AI', avatar: '🛰️' },
  'Last Train Home': { name: 'The Night Conductor', avatar: '🚇' },
  'Dorm Kitchen Mystery': { name: 'The House Spirit', avatar: '🍜' },
};

/** Resolve the DM persona for a theme (case the story sends its theme string). */
export function dmFor(theme?: string | null): DM {
  if (theme && DM_BY_THEME[theme]) return DM_BY_THEME[theme];
  return DEFAULT_DM;
}
