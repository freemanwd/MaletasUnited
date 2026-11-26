/** Shared domain types. Keep these UI-facing shapes stable when swapping storage. */

export const CLERK_ROLES = ["player", "host", "admin"] as const;
export type ClerkRole = (typeof CLERK_ROLES)[number];

export type Repeat = "One-off" | "Weekly" | "Every 2 weeks";
export type Format = "5v5" | "7v7" | "11v11";
export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
export type Position =
  | "Utility"
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Forward";
export type GameVisibility = "public" | "vip" | "invite";
export type Privacy = "public" | "friends-only";
export type VipPlan = "monthly" | "yearly";
export type ListingKind = "league" | "club" | "public-pickup";
export type AdPlacement = "feed" | "games" | "banner";

export const FORMATS: Format[] = ["5v5", "7v7", "11v11"];
export const REPEATS: Repeat[] = ["Weekly", "Every 2 weeks", "One-off"];
export const POSITIONS: Position[] = [
  "Utility",
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
];
export const VISIBILITIES: GameVisibility[] = ["public", "vip", "invite"];

export const WAIVER_VERSION = "play-at-your-own-risk-v1" as const;
export const MATCHMAKER_NOTICE_VERSION = "matchmaker-draft-v1" as const;

export interface WaiverAck {
  version: typeof WAIVER_VERSION;
  matchmakerVersion: typeof MATCHMAKER_NOTICE_VERSION;
  acceptedAt: string;
  gameId: string;
  hostWaiverHash: string;
}

export interface PlayerProfile {
  handle: string;
  city: string;
  zip: string;
  position: Position;
  bio: string;
  social: string;
  inviteCode: string;
  invites: number;
  referredBy: string | null;
  privacy: Privacy;
}

/**
 * Session user shaped for a later Clerk swap.
 * `id` becomes the Clerk user id; `roles` maps to `publicMetadata.roles`.
 * `vip` maps to a Stripe Billing subscription (Maletas VIP).
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  imageUrl: string | null;
  roles: ClerkRole[];
  vip: boolean;
  vipPlan: VipPlan | null;
  profile: PlayerProfile;
}

/** Public directory card. Seed rows are sample players only. */
export interface DirectoryPlayer {
  id: string;
  handle: string;
  name: string;
  city: string;
  zip: string;
  position: Position;
  bio: string;
  social: string;
  roles: ClerkRole[];
  privacy: Privacy;
  sample: boolean;
}

export interface Game {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  /** Area description always shown. */
  field: string;
  /** Exact address. Hidden when hideAddressUntilApproved and viewer is not approved. */
  fieldPrivate: string;
  hideAddressUntilApproved: boolean;
  city: string;
  country: string;
  zip: string;
  format: Format;
  weekday: Weekday;
  kickoff: string;
  when: string;
  repeat: Repeat;
  spots: number;
  fee: string;
  feePaidToHost: boolean;
  visibility: GameVisibility;
  hostTerms: string;
  hostWaiver: string;
  inviteCode: string;
  approvedIds: string[];
  pendingIds: string[];
  roster: string[];
  rosterIds: string[];
  sample: boolean;
}

export interface Host {
  id: string;
  name: string;
  city: string;
  fields: string;
  surface: string;
  since: string;
  sample: boolean;
  inviteCode: string;
  emailList: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorHandle: string;
  who: string;
  role: "Host" | "Player" | "News";
  city: string;
  text: string;
  likes: number;
  liked: boolean;
  sample: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  country: string;
  gmv: number;
  rate: number;
  sample: boolean;
}

export interface Product {
  id: string;
  name: string;
  vendorId: string;
  price: number;
  tile: string;
  url: string;
  kind: "affiliate" | "merch";
  sample: boolean;
}

export interface ExternalListing {
  id: string;
  title: string;
  kind: ListingKind;
  sourceName: string;
  sourceUrl: string;
  lastChecked: string;
  city: string;
  zip: string;
  format: string;
  when: string;
  notes: string;
  sample: true;
}

export interface Ad {
  id: string;
  placement: AdPlacement;
  advertiser: string;
  headline: string;
  blurb: string;
  href: string;
  sample: true;
}

export interface Friendship {
  id: string;
  fromId: string;
  toId: string;
  status: "pending" | "accepted";
}

export interface BlockRecord {
  blockerId: string;
  blockedId: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  targetType: "player" | "post" | "game";
  targetId: string;
  reason: string;
  createdAt: string;
}

export interface GameFilters {
  city: string;
  format: string;
  zipPrefix: string;
}

export interface CreateGameInput {
  title: string;
  field: string;
  fieldPrivate: string;
  hideAddressUntilApproved: boolean;
  city: string;
  zip: string;
  date: string;
  time: string;
  repeat: Repeat;
  format: Format;
  spots: number;
  fee: string;
  feePaidToHost: boolean;
  visibility: GameVisibility;
  hostTerms: string;
  hostWaiver: string;
}

export interface ProfileInput {
  name: string;
  handle: string;
  rolesLabel: "Player" | "Host" | "Player and host";
  position: Position;
  city: string;
  zip: string;
  social: string;
  bio: string;
  privacy: Privacy;
}

export interface AdminSnapshot {
  players: number;
  hosts: number;
  inviteJoinRate: number;
  vipSubscribers: number;
  vipRevenue: number;
  shopCommission: number;
  weeksPlayers: number[];
  weeksHosts: number[];
  sample: true;
}

export interface PlayState {
  version: 2;
  user: SessionUser | null;
  newsletter: boolean;
  city: string;
  format: string;
  zip: string;
  cart: string[];
  games: Game[];
  posts: Post[];
  vendors: Vendor[];
  hosts: Host[];
  products: Product[];
  players: DirectoryPlayer[];
  listings: ExternalListing[];
  ads: Ad[];
  friendships: Friendship[];
  blocks: BlockRecord[];
  reports: ReportRecord[];
  referralCounts: Record<string, number>;
  pendingReferral: string | null;
  waivers: WaiverAck[];
  demoAdmin: boolean;
  hostEmailOptIn: boolean;
  alertRadius: boolean;
  alertMatches: boolean;
  alertWatch: boolean;
}
