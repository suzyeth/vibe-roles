import type { Quest, FateCard } from "@/lib/schema";
type Entry = { quest: Quest; fateCards: FateCard[] };
const store = new Map<string, Entry>();
export function createQuest(id: string, quest: Quest): void { store.set(id, { quest, fateCards: [] }); }
export function getQuest(id: string): Entry | undefined { return store.get(id); }
export function addFateCard(id: string, card: FateCard): boolean {
  const e = store.get(id); if (!e) return false; e.fateCards.push(card); return true;
}
export function listFateCards(id: string): FateCard[] { return store.get(id)?.fateCards ?? []; }
