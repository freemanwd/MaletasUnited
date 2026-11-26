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
import { MATCHMAKER_NOTICE_VERSION, WAIVER_VERSION } from "./types";
import { hashText, isVip } from "./visibility";

export type ModalKind =
  | { type: "signup" }
  | { type: "host" }
  | { type: "club" }
  | { type: "checkout" }
  | { type: "waiver"; gameId: string }
  | null;

type PlayContextValue = {
  ready: boolean;
  state: PlayState;
  user: SessionUser | null;
  vip: boolean;
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
  const vip = isVip(user);
  const isAdmin = Boolean(user && (user.roles.includes("admin") || state.demoAdmin));
  const myName = user ? shortName(user.name) : "";

  const value = useMemo<PlayContextValue>(
    () => ({
      ready: true,
      state,
      user,
      vip,
      isAdmin,
      modal,
      toast,
      repo,
      myName,
      openModal,
      closeModal,
      showToast,
      requireUser,
      isOnSheet: (game) =>
        Boolean(
          user &&
            (game.rosterIds.includes(user.id) || (myName && game.roster.includes(myName))),
        ),
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
        const game = getPlaySnapshot().games.find((item) => item.id === gameId);
        if (!game) throw new Error("Game not found.");
        const joined = await repo.joinGame(gameId, current, {
          version: WAIVER_VERSION,
          matchmakerVersion: MATCHMAKER_NOTICE_VERSION,
          acceptedAt: new Date().toISOString(),
          gameId,
          hostWaiverHash: hashText(game.hostWaiver),
        });
        closeModal();
        return joined;
      },
    }),
    [
      state,
      user,
      vip,
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
