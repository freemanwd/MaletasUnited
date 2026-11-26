"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { AuthAdapter } from "./auth/types";
import {
  getPlayServerSnapshot,
  getPlaySnapshot,
  mutatePlay,
  subscribePlay,
} from "./data/client-store";
import { LocalPlayStore } from "./data/local-repository";
import type { DataRepository } from "./data/repository";
import { shortName } from "./format";
import type { ClerkRole, Game, PlayState, ProfileInput, SessionUser } from "./types";
import { WAIVER_VERSION } from "./types";

export type ModalKind =
  | { type: "signup" }
  | { type: "host" }
  | { type: "plus" }
  | { type: "checkout" }
  | { type: "waiver"; gameId: string }
  | null;

type PlayContextValue = {
  ready: boolean;
  state: PlayState;
  user: SessionUser | null;
  plus: boolean;
  isAdmin: boolean;
  modal: ModalKind;
  toast: string;
  repo: DataRepository & AuthAdapter;
  myName: string;
  openModal: (modal: ModalKind) => void;
  closeModal: () => void;
  showToast: (message: string) => void;
  requireUser: () => boolean;
  isOnSheet: (game: Game) => boolean;
  hasRole: (role: ClerkRole) => boolean;
  register: (input: ProfileInput) => Promise<void>;
  updateProfile: (input: ProfileInput) => Promise<void>;
  joinWithWaiver: (gameId: string) => Promise<Game>;
};

const PlayContext = createContext<PlayContextValue | null>(null);

const repo: DataRepository & AuthAdapter = new LocalPlayStore(
  getPlaySnapshot,
  mutatePlay,
);

export function PlayProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribePlay,
    getPlaySnapshot,
    getPlayServerSnapshot,
  );
  const [modal, setModal] = useState<ModalKind>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const openModal = useCallback((next: ModalKind) => setModal(next), []);
  const closeModal = useCallback(() => setModal(null), []);
  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }, []);

  const requireUser = useCallback(() => {
    if (getPlaySnapshot().user) return false;
    setModal({ type: "signup" });
    showToast("Create a free profile first");
    return true;
  }, [showToast]);

  const user = state.user;
  const plus = Boolean(user?.plus);
  const isAdmin = Boolean(user && (user.roles.includes("admin") || state.demoAdmin));
  const myName = user ? shortName(user.name) : "";

  const value = useMemo<PlayContextValue>(
    () => ({
      ready: true,
      state,
      user,
      plus,
      isAdmin,
      modal,
      toast,
      repo,
      myName,
      openModal,
      closeModal,
      showToast,
      requireUser,
      isOnSheet: (game) => Boolean(myName && game.roster.includes(myName)),
      hasRole: (role) => repo.hasRole(role),
      register: async (input) => {
        await repo.register(input);
        closeModal();
        showToast(`Welcome to Maletas, ${input.name.split(/\s+/)[0]}`);
      },
      updateProfile: async (input) => {
        await repo.updateProfile(input);
        closeModal();
        showToast("Profile saved");
      },
      joinWithWaiver: async (gameId) => {
        const current = getPlaySnapshot().user;
        if (!current) throw new Error("Not signed in.");
        const game = await repo.joinGame(gameId, current, {
          version: WAIVER_VERSION,
          acceptedAt: new Date().toISOString(),
          gameId,
        });
        closeModal();
        return game;
      },
    }),
    [
      state,
      user,
      plus,
      isAdmin,
      modal,
      toast,
      myName,
      openModal,
      closeModal,
      showToast,
      requireUser,
    ],
  );

  return <PlayContext.Provider value={value}>{children}</PlayContext.Provider>;
}

export function usePlay(): PlayContextValue {
  const ctx = useContext(PlayContext);
  if (!ctx) throw new Error("usePlay must be used within PlayProvider");
  return ctx;
}
