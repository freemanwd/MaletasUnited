import type { AuthAdapter } from "../auth/types";
import {
  displayFee,
  ensureHostRole,
  formatWhen,
  makeInviteCode,
  makeVoucherCode,
  rolesFromLabel,
  shortName,
  uniqueHandle,
  zipPrefix,
} from "../format";
import { TIER, voucherQuote } from "../tier";
import {
  MATCHMAKER_NOTICE_VERSION,
  WAIVER_VERSION,
  type AdminSnapshot,
  type BuyVouchersInput,
  type CreateGameInput,
  type DirectoryPlayer,
  type ExternalListing,
  type Game,
  type GameFilters,
  type MembershipVoucher,
  type PlayState,
  type ProfileInput,
  type SessionUser,
  type VipPlan,
  type WaiverAck,
} from "../types";
import { canJoinGame, hashText } from "../visibility";
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
    const hide = Boolean(input.hideAddressUntilApproved);
    const draft: Game = {
      id: `g-${Date.now()}`,
      title: input.title,
      hostId: host.id,
      hostName: host.name,
      field: input.field,
      fieldPrivate: input.fieldPrivate,
      hideAddressUntilApproved: hide,
      city: input.city,
      country: "",
      zip: input.zip,
      format: input.format,
      weekday: formatted.weekday,
      kickoff: input.time,
      when: formatted.when,
      timezone: "America/New_York",
      nextDate: formatted.nextDate,
      repeat: input.repeat,
      spots: Math.max(2, Math.min(40, input.spots || 10)),
      fee: input.fee || input.feeAmount || "Free",
      feeCadence: input.feeCadence,
      feeLabel: input.feeLabel,
      feeAmount: input.feeAmount,
      feePaidToHost: input.feeCadence !== "free",
      visibility: input.visibility,
      hostTerms: input.hostTerms,
      hostWaiver: input.hostWaiver,
      inviteCode: host.profile.inviteCode,
      approvedIds: [host.id],
      pendingIds: [],
      roster: [shortName(host.name)],
      rosterIds: [host.id],
      sample: false,
    };
    const game: Game = { ...draft, fee: displayFee(draft) };
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
          authorId: host.id,
          authorHandle: host.profile.handle,
          who: host.name,
          role: "Host",
          city: input.city,
          text: `New game: ${input.title} at ${input.field}, ${formatted.when}. The sign-up sheet is open.`,
          imageDataUrl: "",
          likes: 0,
          liked: false,
          comments: [],
          sample: false,
        },
        ...prev.posts,
      ],
    }));
    return game;
  }

  async joinGame(id: string, user: SessionUser, waiver: WaiverAck): Promise<Game> {
    if (waiver.version !== WAIVER_VERSION) {
      throw new Error("Please accept the current play-at-your-own-risk waiver.");
    }
    if (waiver.matchmakerVersion !== MATCHMAKER_NOTICE_VERSION) {
      throw new Error("Please accept the matchmaker notice.");
    }
    const mine = shortName(user.name);
    const current = this.getState().games.find((game) => game.id === id);
    if (!current) throw new Error("Game not found.");
    if (hashText(current.hostWaiver) !== waiver.hostWaiverHash) {
      throw new Error("Please accept this host’s current waiver.");
    }
    const access = canJoinGame(current, user);
    if (!access.ok && access.reason !== "") {
      if (access.reason === "vip") throw new Error(`This game is for ${TIER.productName} members.`);
      if (access.reason === "invite") throw new Error("This game is invite-only. Request a spot first.");
      if (access.reason === "pending") throw new Error("The host has not approved you yet.");
      if (access.reason === "full") throw new Error("That sheet is full.");
      if (access.reason === "signin") throw new Error("Create a profile first.");
    }
    if (current.roster.length >= current.spots && !current.roster.includes(mine)) {
      throw new Error("That sheet is full.");
    }
    let joined: Game = current;
    this.update((prev) => {
      const games = prev.games.map((game) => {
        if (game.id !== id) return game;
        if (game.roster.includes(mine) || game.rosterIds.includes(user.id)) {
          joined = game;
          return game;
        }
        joined = {
          ...game,
          roster: [...game.roster, mine],
          rosterIds: game.rosterIds.includes(user.id)
            ? game.rosterIds
            : [...game.rosterIds, user.id],
          approvedIds: game.approvedIds.includes(user.id)
            ? game.approvedIds
            : [...game.approvedIds, user.id],
          pendingIds: game.pendingIds.filter((pid) => pid !== user.id),
        };
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
        left = {
          ...game,
          roster: game.roster.filter((name) => name !== mine),
          rosterIds: game.rosterIds.filter((pid) => pid !== user.id),
        };
        return left;
      }),
    }));
    if (!left) throw new Error("Game not found.");
    return left;
  }

  async requestJoin(id: string, user: SessionUser): Promise<Game> {
    let next: Game | null = null;
    this.update((prev) => ({
      ...prev,
      games: prev.games.map((game) => {
        if (game.id !== id) return game;
        if (game.approvedIds.includes(user.id) || game.rosterIds.includes(user.id)) {
          next = game;
          return game;
        }
        next = {
          ...game,
          pendingIds: game.pendingIds.includes(user.id)
            ? game.pendingIds
            : [...game.pendingIds, user.id],
        };
        return next;
      }),
    }));
    if (!next) throw new Error("Game not found.");
    return next;
  }

  async approveJoin(id: string, playerId: string, host: SessionUser): Promise<Game> {
    let next: Game | null = null;
    this.update((prev) => ({
      ...prev,
      games: prev.games.map((game) => {
        if (game.id !== id) return game;
        if (game.hostId !== host.id && game.hostName !== host.name) return game;
        const player = prev.players.find((row) => row.id === playerId);
        const name = player ? shortName(player.name) : playerId;
        next = {
          ...game,
          pendingIds: game.pendingIds.filter((pid) => pid !== playerId),
          approvedIds: game.approvedIds.includes(playerId)
            ? game.approvedIds
            : [...game.approvedIds, playerId],
          roster: game.roster.includes(name) ? game.roster : [...game.roster, name],
          rosterIds: game.rosterIds.includes(playerId)
            ? game.rosterIds
            : [...game.rosterIds, playerId],
        };
        return next;
      }),
    }));
    if (!next) throw new Error("Game not found or you are not the host.");
    return next;
  }

  async listHosts() {
    return this.getState().hosts;
  }

  async listListings(filters: GameFilters) {
    return filterListings(this.getState().listings, filters);
  }

  async listAds() {
    return this.getState().ads;
  }

  async listPlayers() {
    return this.getState().players;
  }

  async getPlayerByHandle(handle: string) {
    const key = handle.toLowerCase();
    return this.getState().players.find((player) => player.handle.toLowerCase() === key) ?? null;
  }

  async listPosts() {
    return this.getState().posts;
  }

  async createPost(text: string, user: SessionUser, imageDataUrl = "") {
    const post = {
      id: `p-${Date.now()}`,
      authorId: user.id,
      authorHandle: user.profile.handle,
      who: user.name,
      role: user.roles.includes("host") ? ("Host" as const) : ("Player" as const),
      city: user.profile.city,
      text,
      imageDataUrl,
      likes: 0,
      liked: false,
      comments: [],
      sample: false,
    };
    this.update((prev) => ({ ...prev, posts: [post, ...prev.posts] }));
    return post;
  }

  async addComment(postId: string, text: string, user: SessionUser) {
    const trimmed = text.trim();
    if (!trimmed) return null;
    let result = null;
    this.update((prev) => ({
      ...prev,
      posts: prev.posts.map((post) => {
        if (post.id !== postId) return post;
        result = {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c-${Date.now()}`,
              authorId: user.id,
              authorName: user.name,
              authorHandle: user.profile.handle,
              text: trimmed,
              createdAt: new Date().toISOString(),
            },
          ],
        };
        return result;
      }),
    }));
    return result;
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

  async setVip(plan: VipPlan | null) {
    this.update((prev) => ({
      ...prev,
      user: prev.user
        ? {
            ...prev.user,
            vip: Boolean(plan),
            vipPlan: plan,
            sponsoredBy: plan === "sponsored" ? prev.user.sponsoredBy : null,
            sponsoredUntil: plan === "sponsored" ? prev.user.sponsoredUntil : null,
          }
        : prev.user,
    }));
    return Boolean(plan);
  }

  async setVipAlerts(patch: {
    hostEmailOptIn?: boolean;
    alertRadius?: boolean;
    alertMatches?: boolean;
    alertWatch?: boolean;
  }) {
    this.update((prev) => ({ ...prev, ...patch }));
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

  async listVouchers() {
    return this.getState().vouchers;
  }

  async buyVouchers(input: BuyVouchersInput, host: SessionUser): Promise<MembershipVoucher[]> {
    const quote = voucherQuote(input.count);
    const months = input.durationMonths || 12;
    const game = input.gameId
      ? this.getState().games.find((row) => row.id === input.gameId)
      : null;
    const batchId = `batch-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const perCents = Math.round((quote.total / quote.count) * 100);
    const created: MembershipVoucher[] = Array.from({ length: quote.count }, () => ({
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      code: makeVoucherCode(),
      batchId,
      hostId: host.id,
      hostName: host.name,
      gameId: game?.id ?? null,
      gameTitle: game?.title ?? null,
      durationMonths: months,
      createdAt,
      paidCents: perCents,
      redeemedById: null,
      redeemedByName: null,
      redeemedAt: null,
      sponsoredUntil: null,
    }));
    this.update((prev) => ({ ...prev, vouchers: [...created, ...prev.vouchers] }));
    return created;
  }

  async redeemVoucher(code: string, user: SessionUser): Promise<SessionUser> {
    const key = code.trim().toUpperCase();
    const row = this.getState().vouchers.find((item) => item.code.toUpperCase() === key);
    if (!row) throw new Error("That voucher code was not found.");
    if (row.redeemedById) throw new Error("That voucher has already been redeemed.");
    const until = new Date();
    until.setMonth(until.getMonth() + row.durationMonths);
    const sponsoredUntil = until.toISOString();
    let nextUser: SessionUser = user;
    this.update((prev) => {
      nextUser = {
        ...user,
        vip: true,
        vipPlan: "sponsored",
        sponsoredBy: row.hostName,
        sponsoredUntil,
      };
      return {
        ...prev,
        user: prev.user?.id === user.id ? nextUser : prev.user,
        vouchers: prev.vouchers.map((item) =>
          item.id === row.id
            ? {
                ...item,
                redeemedById: user.id,
                redeemedByName: user.name,
                redeemedAt: new Date().toISOString(),
                sponsoredUntil,
              }
            : item,
        ),
      };
    });
    return nextUser;
  }

  async sendFriendRequest(fromId: string, toId: string) {
    if (fromId === toId) return;
    this.update((prev) => {
      const existing = prev.friendships.find(
        (row) =>
          (row.fromId === fromId && row.toId === toId) ||
          (row.fromId === toId && row.toId === fromId),
      );
      if (existing) {
        if (existing.status === "accepted") return prev;
        if (existing.toId === fromId) {
          return {
            ...prev,
            friendships: prev.friendships.map((row) =>
              row.id === existing.id ? { ...row, status: "accepted" as const } : row,
            ),
          };
        }
        return prev;
      }
      return {
        ...prev,
        friendships: [
          ...prev.friendships,
          { id: `fr-${Date.now()}`, fromId, toId, status: "pending" as const },
        ],
      };
    });
  }

  async acceptFriendRequest(userId: string, otherId: string) {
    this.update((prev) => ({
      ...prev,
      friendships: prev.friendships.map((row) =>
        row.status === "pending" &&
        ((row.fromId === otherId && row.toId === userId) ||
          (row.fromId === userId && row.toId === otherId))
          ? { ...row, status: "accepted" as const }
          : row,
      ),
    }));
  }

  async unfriend(userId: string, otherId: string) {
    this.update((prev) => ({
      ...prev,
      friendships: prev.friendships.filter(
        (row) =>
          !((row.fromId === userId && row.toId === otherId) ||
            (row.fromId === otherId && row.toId === userId)),
      ),
    }));
  }

  async blockPlayer(blockerId: string, blockedId: string) {
    this.update((prev) => ({
      ...prev,
      blocks: prev.blocks.some(
        (row) => row.blockerId === blockerId && row.blockedId === blockedId,
      )
        ? prev.blocks
        : [...prev.blocks, { blockerId, blockedId }],
      friendships: prev.friendships.filter(
        (row) =>
          !((row.fromId === blockerId && row.toId === blockedId) ||
            (row.fromId === blockedId && row.toId === blockerId)),
      ),
    }));
  }

  async unblockPlayer(blockerId: string, blockedId: string) {
    this.update((prev) => ({
      ...prev,
      blocks: prev.blocks.filter(
        (row) => !(row.blockerId === blockerId && row.blockedId === blockedId),
      ),
    }));
  }

  async reportTarget(
    reporterId: string,
    targetType: "player" | "post" | "game",
    targetId: string,
    reason: string,
  ) {
    this.update((prev) => ({
      ...prev,
      reports: [
        ...prev.reports,
        {
          id: `rp-${Date.now()}`,
          reporterId,
          targetType,
          targetId,
          reason,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }

  async getSession() {
    return this.getState().user;
  }

  async register(input: ProfileInput): Promise<SessionUser> {
    const prev = this.getState();
    const referredBy = prev.pendingReferral;
    const taken = new Set(prev.players.map((player) => player.handle.toLowerCase()));
    const handle = uniqueHandle(input.handle || input.name, taken);
    const id = `u-${Date.now()}`;
    const user: SessionUser = {
      id,
      name: input.name,
      email: null,
      imageUrl: null,
      roles: rolesFromLabel(input.rolesLabel),
      vip: false,
      vipPlan: null,
      sponsoredBy: null,
      sponsoredUntil: null,
      profile: {
        handle,
        city: input.city,
        zip: input.zip,
        position: input.position,
        bio: input.bio,
        social: sanitizeSocial(input.social),
        inviteCode: makeInviteCode(input.name),
        invites: 0,
        referredBy,
        privacy: input.privacy,
      },
    };
    const card = directoryFromUser(user);
    this.update((state) =>
      applyReferralJoin(
        {
          ...state,
          user,
          pendingReferral: null,
          players: [...state.players.filter((row) => row.id !== id), card],
        },
        referredBy,
      ),
    );
    return user;
  }

  async updateProfile(input: ProfileInput): Promise<SessionUser> {
    const prev = this.getState();
    if (!prev.user) throw new Error("Not signed in.");
    const oldShort = shortName(prev.user.name);
    const taken = new Set(
      prev.players
        .filter((player) => player.id !== prev.user?.id)
        .map((player) => player.handle.toLowerCase()),
    );
    const handle = uniqueHandle(input.handle || input.name, taken);
    const next: SessionUser = {
      ...prev.user,
      name: input.name,
      roles: rolesFromLabel(input.rolesLabel),
      profile: {
        ...prev.user.profile,
        handle,
        city: input.city,
        zip: input.zip,
        position: input.position,
        bio: input.bio,
        social: sanitizeSocial(input.social),
        privacy: input.privacy,
      },
    };
    const newShort = shortName(next.name);
    const card = directoryFromUser(next);
    this.update((state) => ({
      ...state,
      user: next,
      players: [
        ...state.players.filter((row) => row.id !== next.id && row.handle !== handle),
        card,
      ],
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

export function filterListings(
  listings: ExternalListing[],
  filters: GameFilters,
): ExternalListing[] {
  const prefix = zipPrefix(filters.zipPrefix);
  return listings.filter((row) => {
    if (filters.city !== "All" && row.city !== filters.city) return false;
    if (filters.format !== "All" && row.format !== filters.format) return false;
    if (prefix && zipPrefix(row.zip) !== prefix) return false;
    return true;
  });
}

export function adminSnapshot(state: PlayState): AdminSnapshot {
  const user = state.user;
  let players = BASE_ADMIN.players;
  let hosts = BASE_ADMIN.hosts;
  let vipSubscribers = BASE_ADMIN.vipSubscribers;
  const weeksPlayers = [...WEEKS_PLAYERS];
  const weeksHosts = [...WEEKS_HOSTS];
  if (user) {
    if (!user.roles.includes("host") || user.roles.includes("player")) players += 1;
    if (user.roles.includes("host")) hosts += 1;
    weeksPlayers[11] = (weeksPlayers[11] ?? 0) + 1;
  }
  if (user?.vip) vipSubscribers += 1;
  const shopCommission = state.vendors.reduce(
    (sum, vendor) => sum + (vendor.gmv * vendor.rate) / 100,
    0,
  );
  const extraVouchers = state.vouchers.filter((row) => !row.id.startsWith("v-gk-")).length;
  const vouchersIssued = BASE_ADMIN.vouchersIssued + extraVouchers;
  const extraRedeemed = state.vouchers.filter(
    (row) => row.redeemedById && !row.id.startsWith("v-gk-"),
  ).length;
  const vouchersRedeemed = BASE_ADMIN.vouchersRedeemed + extraRedeemed;
  const voucherRevenue =
    (BASE_ADMIN.vouchersIssued * 20) / 12 +
    state.vouchers.reduce((sum, row) => sum + row.paidCents, 0) / 100;
  const vipRevenue =
    user?.vipPlan === "yearly"
      ? (vipSubscribers - 1) * 1.99 + 20 / 12
      : vipSubscribers * 1.99;
  return {
    players,
    hosts,
    inviteJoinRate: BASE_ADMIN.inviteJoinRate,
    vipSubscribers,
    vipRevenue,
    vouchersIssued,
    vouchersRedeemed,
    voucherRevenue,
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

function directoryFromUser(user: SessionUser): DirectoryPlayer {
  return {
    id: user.id,
    handle: user.profile.handle,
    name: user.name,
    city: user.profile.city,
    zip: user.profile.zip,
    position: user.profile.position,
    bio: user.profile.bio,
    social: user.profile.social,
    roles: user.roles,
    privacy: user.profile.privacy,
    sample: false,
  };
}

function applyReferralJoin(state: PlayState, code: string | null): PlayState {
  if (!code) return state;
  const counts = { ...state.referralCounts };
  counts[code] = (counts[code] ?? 0) + 1;
  return { ...state, referralCounts: counts };
}
