import type { PlayState } from "../types";
import { loadState, saveState } from "./persist";
import { createSeedState } from "./seed";

let current: PlayState | null = null;
const listeners = new Set<() => void>();

function ensure(): PlayState {
  if (!current) {
    current = typeof window === "undefined" ? createSeedState() : loadState();
  }
  return current;
}

export function subscribePlay(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPlaySnapshot(): PlayState {
  return ensure();
}

export function getPlayServerSnapshot(): PlayState {
  return createSeedState();
}

export function mutatePlay(updater: (prev: PlayState) => PlayState): PlayState {
  current = updater(ensure());
  saveState(current);
  listeners.forEach((listener) => listener());
  return current;
}
