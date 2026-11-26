import type {
  Ad,
  AdminSnapshot,
  CreateGameInput,
  DirectoryPlayer,
  ExternalListing,
  Game,
  GameFilters,
  Host,
  Post,
  Product,
  SessionUser,
  Vendor,
  VipPlan,
  WaiverAck,
} from "../types";

/**
 * Data-access surface for the play app.
 *
 * This version: `createLocalRepository` (localStorage + seed).
 * Next version: a Postgres implementation (Prisma or Drizzle) with the same
 * method names so screens do not need to be rewritten.
 */
export interface DataRepository {
  listGames(filters: GameFilters): Promise<Game[]>;
  getGame(id: string): Promise<Game | null>;
  createGame(input: CreateGameInput, host: SessionUser): Promise<Game>;
  joinGame(id: string, user: SessionUser, waiver: WaiverAck): Promise<Game>;
  leaveGame(id: string, user: SessionUser): Promise<Game>;
  requestJoin(id: string, user: SessionUser): Promise<Game>;
  approveJoin(id: string, playerId: string, host: SessionUser): Promise<Game>;

  listHosts(): Promise<Host[]>;
  listListings(filters: GameFilters): Promise<ExternalListing[]>;
  listAds(): Promise<Ad[]>;
  listPlayers(): Promise<DirectoryPlayer[]>;
  getPlayerByHandle(handle: string): Promise<DirectoryPlayer | null>;

  listPosts(): Promise<Post[]>;
  createPost(text: string, user: SessionUser): Promise<Post>;
  toggleLike(postId: string): Promise<Post | null>;
  setNewsletter(subscribed: boolean): Promise<boolean>;

  listProducts(): Promise<Product[]>;
  listVendors(): Promise<Vendor[]>;
  getCart(): Promise<string[]>;
  addToCart(productId: string): Promise<string[]>;
  removeFromCart(index: number): Promise<string[]>;

  setVip(plan: VipPlan | null): Promise<boolean>;
  setVipAlerts(patch: {
    hostEmailOptIn?: boolean;
    alertRadius?: boolean;
    alertMatches?: boolean;
    alertWatch?: boolean;
  }): Promise<void>;
  setFilters(patch: Partial<GameFilters> & { zip?: string }): Promise<void>;
  setVendorRate(vendorId: string, rate: number): Promise<Vendor | null>;
  getAdminSnapshot(): Promise<AdminSnapshot>;

  setPendingReferral(code: string | null): Promise<void>;

  sendFriendRequest(fromId: string, toId: string): Promise<void>;
  acceptFriendRequest(userId: string, otherId: string): Promise<void>;
  unfriend(userId: string, otherId: string): Promise<void>;
  blockPlayer(blockerId: string, blockedId: string): Promise<void>;
  unblockPlayer(blockerId: string, blockedId: string): Promise<void>;
  reportTarget(
    reporterId: string,
    targetType: "player" | "post" | "game",
    targetId: string,
    reason: string,
  ): Promise<void>;
}

export const STORAGE_KEY = "maletas-play-v2";
