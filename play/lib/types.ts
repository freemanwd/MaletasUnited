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

export const FORMATS: Format[] = ["5v5", "7v7", "11v11"];
export const REPEATS: Repeat[] = ["Weekly", "Every 2 weeks", "One-off"];
export const POSITIONS: Position[] = [
  "Utility",
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Forward",
];

export const WAIVER_VERSION = "play-at-your-own-risk-v1" as const;

export interface WaiverAck {
  version: typeof WAIVER_VERSION;
  acceptedAt: string;
  gameId: string;
}

export interface PlayerProfile {
  city: string;
  zip: string;
  position: Position;
  bio: string;
  social: string;
  inviteCode: string;
  invites: number;
  referredBy: string | null;
}

/**
 * Session user shaped for a later Clerk swap.
 * `id` becomes the Clerk user id; `roles` maps to `publicMetadata.roles`.
 */
export interface SessionUser {
  id: string;
  name: string;
  email: string | null;
  imageUrl: string | null;
  roles: ClerkRole[];
  plus: boolean;
  profile: PlayerProfile;
}

export interface Game {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  field: string;
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
  roster: string[];
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
}

export interface Post {
  id: string;
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
  sample: boolean;
}

export interface GameFilters {
  city: string;
  format: string;
  zipPrefix: string;
}

export interface CreateGameInput {
  title: string;
  field: string;
  city: string;
  zip: string;
  date: string;
  time: string;
  repeat: Repeat;
  format: Format;
  spots: number;
  fee: string;
}

export interface ProfileInput {
  name: string;
  rolesLabel: "Player" | "Host" | "Player and host";
  position: Position;
  city: string;
  zip: string;
  social: string;
  bio: string;
}

export interface AdminSnapshot {
  players: number;
  hosts: number;
  inviteJoinRate: number;
  plusSubscribers: number;
  plusRevenue: number;
  shopCommission: number;
  weeksPlayers: number[];
  weeksHosts: number[];
  sample: true;
}

export interface PlayState {
  version: 1;
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
  referralCounts: Record<string, number>;
  pendingReferral: string | null;
  waivers: WaiverAck[];
  demoAdmin: boolean;
}
