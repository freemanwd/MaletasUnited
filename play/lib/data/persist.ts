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
    if (parsed.version !== 3) return seed;
    return {
      ...seed,
      ...parsed,
      version: 3,
      games: (parsed.games?.length ? parsed.games : seed.games).map((game) => {
        const fromSeed = seed.games.find((row) => row.id === game.id);
        return {
          ...game,
          lat: game.lat ?? fromSeed?.lat,
          lon: game.lon ?? fromSeed?.lon,
          durationMinutes: game.durationMinutes ?? fromSeed?.durationMinutes,
          sheetId: game.sheetId ?? fromSeed?.sheetId,
          sheetGid: game.sheetGid ?? fromSeed?.sheetGid,
          sheetSignupLabel: game.sheetSignupLabel ?? fromSeed?.sheetSignupLabel,
        };
      }),
      posts: parsed.posts?.length
        ? parsed.posts.map((post) => ({
            ...post,
            imageDataUrl: post.imageDataUrl ?? "",
            comments: post.comments ?? [],
          }))
        : seed.posts,
      vendors: parsed.vendors?.length ? parsed.vendors : seed.vendors,
      hosts: parsed.hosts?.length ? parsed.hosts : seed.hosts,
      products: parsed.products?.length ? parsed.products : seed.products,
      players: parsed.players?.length ? parsed.players : seed.players,
      listings: parsed.listings?.length ? parsed.listings : seed.listings,
      ads: parsed.ads?.length ? parsed.ads : seed.ads,
      friendships: parsed.friendships?.length ? parsed.friendships : seed.friendships,
      blocks: parsed.blocks ?? seed.blocks,
      reports: parsed.reports ?? seed.reports,
      vouchers: parsed.vouchers?.length ? parsed.vouchers : seed.vouchers,
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
