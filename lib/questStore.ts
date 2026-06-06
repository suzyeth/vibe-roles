import type { Quest, FateCard, StoryState } from "@/lib/schema";

type Entry = { quest: Quest; fateCards: FateCard[]; storyState: StoryState };
// Next.js evaluates each API route's module graph separately, so a plain module-level
// Map is NOT shared across /api/quest, /api/roll, /api/fate, etc. Pin it to globalThis
// so every route (and HMR reload) sees the same in-memory store within the process.
const g = globalThis as unknown as { __vibeRolesStore?: Map<string, Entry> };
const store: Map<string, Entry> = g.__vibeRolesStore ?? (g.__vibeRolesStore = new Map<string, Entry>());

function emptyState(): StoryState {
  return { known_clues: [], location_status: {}, character_status: {}, relationships: [], active_consequences: [] };
}

export function createQuest(id: string, quest: Quest): void {
  store.set(id, { quest, fateCards: [], storyState: emptyState() });
}
export function getQuest(id: string): Entry | undefined { return store.get(id); }
export function addFateCard(id: string, card: FateCard): boolean {
  const e = store.get(id); if (!e) return false; e.fateCards.push(card); return true;
}
export function listFateCards(id: string): FateCard[] { return store.get(id)?.fateCards ?? []; }

export function getStoryState(id: string): StoryState { return store.get(id)?.storyState ?? emptyState(); }
export function mergeStoryState(id: string, upd: Partial<StoryState>): void {
  const e = store.get(id); if (!e) return;
  const s = e.storyState;
  if (upd.known_clues?.length) s.known_clues = [...s.known_clues, ...upd.known_clues];
  if (upd.relationships?.length) s.relationships = [...s.relationships, ...upd.relationships];
  if (upd.active_consequences?.length) s.active_consequences = [...s.active_consequences, ...upd.active_consequences];
  if (upd.character_status) s.character_status = { ...s.character_status, ...upd.character_status };
  if (upd.location_status) s.location_status = { ...s.location_status, ...upd.location_status };
}
