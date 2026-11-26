import type { AuthAdapter } from "../auth/types";
import {
  ensureHostRole,
  formatWhen,
  makeInviteCode,
  rolesFromLabel,
  shortName,
  zipPrefix,
} from "../format";
import type {
  AdminSnapshot,
  CreateGameInput,
  Game,
  GameFilters,
  PlayState,
  ProfileInput,
  SessionUser,
  WaiverAck,
} from "../types";
import { WAIVER_VERSION } from "../types";
import type { DataRepository } from "./repository";
import { getPlaySnapshot, mutatePlay } from "./client-store";
import { BASE_ADMIN, WEEKS_HOSTS, WEEKS_PLAYERS } from "./seed";

export class LocalPlayStore implements DataRepository, AuthAdapter {
  constructor(
    private getState: () => PlayState = getPlaySnapshot,
    private setState: (updater: (prev: PlayState) => PlayState) => PlayState | void = mutatePlay,
  ) {}

  private update(patch: (prev: PlayState) => PlayState): PlayState {
    const next = this.setState(patch);
    return next ?? this.getState();
  }

  async listGames(filters: GameFilters): Promise<Game[]> {
    return filterGames(this.getState().games, filters);
  }

  async getGame(id: string): Promise<Game | null> {
    return this.getState().games.find((game) => game.id === id) ?? null;
  }

  async createGame(input: CreateGameInput, host: SessionUser): Promise<Game> {
    const formatted = formatWhen(input.date, input.time, input.repeat);
    if (!formatted) {
      throw new Error(
        "Maletas games are not scheduled on Sundays. Pick a Saturday morning or a weeknight while there is daylight.",
      );
    }
    const game: Game = {
      id: `g-${Date.now()}`,
      title: input.title,
      hostId: host.id,
      hostName: host.name,
      field: input.field,
      city: input.city,
      country: "",
      zip: input.zip,
      format: input.format,
      weekday: formatted.weekday,
      kickoff: input.time,
      when: formatted.when,
      repeat: input.repeat,
      spots: Math.max(2, Math.min(40, input.spots || 10)),
      fee: input.fee || "Free",
      roster: [shortName(host.name)],
      sample: false,
    };
    this.update((prev) => ({
      ...prev,
      games: [game, ...prev.games],
      city: input.city,
      format: "All",
      zip: "",
      user: prev.user
        ? { ...prev.user, roles: ensureHostRole(prev.user.roles) }
        : prev.user,
      posts: [
        {
          id: `p-${Date.now()}`,
          who: host.name,
          role: "Host",
          city: input.city,
          text: `New game: ${input.title} at ${input.field}, ${formatted.when}. The sign-up sheet is open.`,
          likes: 0,
          liked: false,
          sample: false,
        },
        ...prev.posts,
      ],
    }));
    return game;
  }

  async joinGame(
    id: string,
    user: SessionUser,
    waiver: WaiverAck,
  ): Promise<Game> {
    if (waiver.version !== WAIVER_VERSION) {
      throw new Error("Please accept the current play-at-your-own-risk waiver.");
    }
    const mine = shortName(user.name);
    const current = this.getState().games.find((game) => game.id === id);
    if (!current) throw new Error("Game not found.");
    if (current.roster.length >= current.spots && !current.roster.includes(mine)) {
      throw new Error("That sheet is full.");
    }
    let joined: Game = current;
    this.update((prev) => {
      const games = prev.games.map((game) => {
        if (game.id !== id) return game;
        if (game.roster.includes(mine)) {
          joined = game;
          return game;
        }
        joined = { ...game, roster: [...game.roster, mine] };
        return joined;
      });
      return {
        ...prev,
        games,
        waivers: [
          ...prev.waivers.filter((item) => item.gameId !== id),
          { ...waiver, gameId: id, acceptedAt: new Date().toISOString() },
        ],
      };
    });
    return joined;
  }

  async leaveGame(id: string, user: SessionUser): Promise<Game> {
    const mine = shortName(user.name);
    let left: Game | null = null;
    this.update((prev) => ({
      ...prev,
      games: prev.games.map((game) => {
        if (game.id !== id) return game;
        left = { ...game, roster: game.roster.filter((name) => name !== mine) };
        return left;
      }),
    }));
    if (!left) throw new Error("Game not found.");
    return left;
  }

  async listHosts() {
    return this.getState().hosts;
  }

  async listPosts() {
    return this.getState().posts;
  }

  async createPost(text: string, user: SessionUser) {
    const post = {
      id: `p-${Date.now()}`,
      who: user.name,
      role: user.roles.includes("host") ? ("Host" as const) : ("Player" as const),
      city: user.profile.city,
      text,
      likes: 0,
      liked: false,
      sample: false,
    };
    this.update((prev) => ({ ...prev, posts: [post, ...prev.posts] }));
    return post;
  }

  async toggleLike(postId: string) {
    let result = null;
    this.update((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => {
        if (post.id !== postId) return post;
        result = {
          ...post,
          liked: !post.liked,
          likes: post.likes + (post.liked ? -1 : 1),
        };
        return result;
      }),
    }));
    return result;
  }

  async setNewsletter(subscribed: boolean) {
    this.update((prev) => ({ ...prev, newsletter: subscribed }));
    return subscribed;
  }

  async listProducts() {
    return this.getState().products;
  }

  async listVendors() {
    return this.getState().vendors;
  }

  async getCart() {
    return this.getState().cart;
  }

  async addToCart(productId: string) {
    let cart: string[] = [];
    this.update((prev) => {
      cart = [...prev.cart, productId];
      return { ...prev, cart };
    });
    return cart;
  }

  async removeFromCart(index: number) {
    let cart: string[] = [];
    this.update((prev) => {
      cart = prev.cart.filter((_, i) => i !== index);
      return { ...prev, cart };
    });
    return cart;
  }

  async setPlus(enabled: boolean) {
    this.update((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, plus: enabled } : prev.user,
      zip: enabled ? prev.zip : "",
    }));
    return enabled;
  }

  async setFilters(patch: Partial<GameFilters> & { zip?: string }) {
    this.update((prev) => ({
      ...prev,
      city: patch.city ?? prev.city,
      format: patch.format ?? prev.format,
      zip: patch.zip ?? patch.zipPrefix ?? prev.zip,
    }));
  }

  async setVendorRate(vendorId: string, rate: number) {
    const nextRate = Math.max(0, Math.min(50, rate));
    let vendor = null;
    this.update((prev) => ({
      ...prev,
      vendors: prev.vendors.map((item) => {
        if (item.id !== vendorId) return item;
        vendor = { ...item, rate: nextRate };
        return vendor;
      }),
    }));
    return vendor;
  }

  async getAdminSnapshot(): Promise<AdminSnapshot> {
    return adminSnapshot(this.getState());
  }

  async setPendingReferral(code: string | null) {
    this.update((prev) => ({
      ...prev,
      pendingReferral: code ? code.trim().toUpperCase() : null,
    }));
  }

  async getSession() {
    return this.getState().user;
  }

  async register(input: ProfileInput): Promise<SessionUser> {
    const prev = this.getState();
    const referredBy = prev.pendingReferral;
    const user: SessionUser = {
      id: `u-${Date.now()}`,
      name: input.name,
      email: null,
      imageUrl: null,
      roles: rolesFromLabel(input.rolesLabel),
      plus: false,
      profile: {
        city: input.city,
        zip: input.zip,
        position: input.position,
        bio: input.bio,
        social: sanitizeSocial(input.social),
        inviteCode: makeInviteCode(input.name),
        invites: 0,
        referredBy,
      },
    };
    this.update((state) => applyReferralJoin({ ...state, user, pendingReferral: null }, referredBy));
    return user;
  }

  async updateProfile(input: ProfileInput): Promise<SessionUser> {
    const prev = this.getState();
    if (!prev.user) throw new Error("Not signed in.");
    const oldShort = shortName(prev.user.name);
    const next: SessionUser = {
      ...prev.user,
      name: input.name,
      roles: rolesFromLabel(input.rolesLabel),
      profile: {
        ...prev.user.profile,
        city: input.city,
        zip: input.zip,
        position: input.position,
        bio: input.bio,
        social: sanitizeSocial(input.social),
      },
    };
    const newShort = shortName(next.name);
    this.update((state) => ({
      ...state,
      user: next,
      games: state.games.map((game) => ({
        ...game,
        hostName: game.hostName === prev.user?.name ? next.name : game.hostName,
        roster: game.roster.map((name) => (name === oldShort ? newShort : name)),
      })),
    }));
    return next;
  }

  async signOut() {
    this.update((prev) => ({
      ...prev,
      user: null,
      demoAdmin: false,
    }));
  }

  async signInWithClerk() {
    // No Clerk account exists yet. UI should open the local profile form.
  }

  hasRole(role: import("../types").ClerkRole): boolean {
    const { user, demoAdmin } = this.getState();
    if (role === "admin") return Boolean(user && (user.roles.includes("admin") || demoAdmin));
    return Boolean(user?.roles.includes(role));
  }

  async setDemoAdmin(enabled: boolean) {
    let user: SessionUser | null = null;
    this.update((prev) => {
      if (!prev.user) return prev;
      const roles = enabled
        ? Array.from(new Set([...prev.user.roles, "admin" as const]))
        : prev.user.roles.filter((role) => role !== "admin");
      user = { ...prev.user, roles };
      return { ...prev, user, demoAdmin: enabled };
    });
    return user;
  }
}

export function filterGames(games: Game[], filters: GameFilters): Game[] {
  const prefix = zipPrefix(filters.zipPrefix);
  return games.filter((game) => {
    if (filters.city !== "All" && game.city !== filters.city) return false;
    if (filters.format !== "All" && game.format !== filters.format) return false;
    if (prefix && zipPrefix(game.zip) !== prefix) return false;
    return true;
  });
}

export function adminSnapshot(state: PlayState): AdminSnapshot {
  const user = state.user;
  let players = BASE_ADMIN.players;
  let hosts = BASE_ADMIN.hosts;
  let plusSubscribers = BASE_ADMIN.plusSubscribers;
  const weeksPlayers = [...WEEKS_PLAYERS];
  const weeksHosts = [...WEEKS_HOSTS];
  if (user) {
    if (!user.roles.includes("host") || user.roles.includes("player")) players += 1;
    if (user.roles.includes("host")) hosts += 1;
    weeksPlayers[11] = (weeksPlayers[11] ?? 0) + 1;
  }
  if (user?.plus) plusSubscribers += 1;
  const shopCommission = state.vendors.reduce(
    (sum, vendor) => sum + (vendor.gmv * vendor.rate) / 100,
    0,
  );
  return {
    players,
    hosts,
    inviteJoinRate: BASE_ADMIN.inviteJoinRate,
    plusSubscribers,
    plusRevenue: plusSubscribers * 1.99,
    shopCommission,
    weeksPlayers,
    weeksHosts,
    sample: true,
  };
}

function sanitizeSocial(value: string): string {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : "";
}

function applyReferralJoin(state: PlayState, code: string | null): PlayState {
  if (!code) return state;
  const counts = { ...state.referralCounts };
  counts[code] = (counts[code] ?? 0) + 1;
  const user = state.user
    ? {
        ...state.user,
        profile: {
          ...state.user.profile,
          invites:
            state.user.profile.inviteCode === code
              ? state.user.profile.invites
              : state.user.profile.invites,
        },
      }
    : state.user;
  return { ...state, referralCounts: counts, user };
}
