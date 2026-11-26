import type {
  AdminSnapshot,
  CreateGameInput,
  Game,
  GameFilters,
  Host,
  Post,
  Product,
  SessionUser,
  Vendor,
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
  joinGame(
    id: string,
    user: SessionUser,
    waiver: WaiverAck,
  ): Promise<Game>;
  leaveGame(id: string, user: SessionUser): Promise<Game>;

  listHosts(): Promise<Host[]>;

  listPosts(): Promise<Post[]>;
  createPost(text: string, user: SessionUser): Promise<Post>;
  toggleLike(postId: string): Promise<Post | null>;
  setNewsletter(subscribed: boolean): Promise<boolean>;

  listProducts(): Promise<Product[]>;
  listVendors(): Promise<Vendor[]>;
  getCart(): Promise<string[]>;
  addToCart(productId: string): Promise<string[]>;
  removeFromCart(index: number): Promise<string[]>;

  setPlus(enabled: boolean): Promise<boolean>;
  setFilters(patch: Partial<GameFilters> & { zip?: string }): Promise<void>;
  setVendorRate(vendorId: string, rate: number): Promise<Vendor | null>;
  getAdminSnapshot(): Promise<AdminSnapshot>;

  setPendingReferral(code: string | null): Promise<void>;
}

export const STORAGE_KEY = "maletas-play-v1";
