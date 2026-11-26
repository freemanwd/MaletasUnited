import type { PlayState } from "../types";
import { STORAGE_KEY } from "./repository";
import { createSeedState } from "./seed";

export function loadState(): PlayState {
  const seed = createSeedState();
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<PlayState>;
    if (parsed.version !== 2) return seed;
    return {
      ...seed,
      ...parsed,
      version: 2,
      games: parsed.games?.length ? parsed.games : seed.games,
      posts: parsed.posts?.length ? parsed.posts : seed.posts,
      vendors: parsed.vendors?.length ? parsed.vendors : seed.vendors,
      hosts: parsed.hosts?.length ? parsed.hosts : seed.hosts,
      products: parsed.products?.length ? parsed.products : seed.products,
      players: parsed.players?.length ? parsed.players : seed.players,
      listings: parsed.listings?.length ? parsed.listings : seed.listings,
      ads: parsed.ads?.length ? parsed.ads : seed.ads,
      friendships: parsed.friendships?.length ? parsed.friendships : seed.friendships,
      blocks: parsed.blocks ?? seed.blocks,
      reports: parsed.reports ?? seed.reports,
    };
  } catch {
    return seed;
  }
}

export function saveState(state: PlayState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode — keep working in memory.
  }
}
