import type { DirectoryPlayer, Game, PlayState, SessionUser } from "./types";

export function isVip(user: SessionUser | null | undefined): boolean {
  return Boolean(user?.vip);
}

export function canSeePrivateAddress(game: Game, user: SessionUser | null): boolean {
  if (!game.hideAddressUntilApproved) return true;
  if (!user) return false;
  if (user.id === game.hostId || user.name === game.hostName) return true;
  if (game.approvedIds.includes(user.id)) return true;
  if (game.rosterIds.includes(user.id)) return true;
  return false;
}

export function displayField(game: Game, user: SessionUser | null): string {
  if (canSeePrivateAddress(game, user) && game.fieldPrivate) return game.fieldPrivate;
  if (game.hideAddressUntilApproved) {
    return `${game.field} (address after the host approves you)`;
  }
  return game.field;
}

export function canJoinGame(game: Game, user: SessionUser | null): { ok: boolean; reason: string } {
  if (game.roster.length >= game.spots) return { ok: false, reason: "full" };
  if (game.visibility === "public") return { ok: true, reason: "" };
  if (game.visibility === "vip") {
    if (!user?.vip) return { ok: false, reason: "vip" };
    return { ok: true, reason: "" };
  }
  if (!user) return { ok: false, reason: "signin" };
  if (game.approvedIds.includes(user.id) || game.rosterIds.includes(user.id)) {
    return { ok: true, reason: "" };
  }
  if (game.pendingIds.includes(user.id)) return { ok: false, reason: "pending" };
  return { ok: false, reason: "invite" };
}

export function visibilityLabel(visibility: Game["visibility"]): string {
  if (visibility === "vip") return "VIP only";
  if (visibility === "invite") return "Invite only";
  return "Public";
}

export function areFriends(state: PlayState, a: string, b: string): boolean {
  return state.friendships.some(
    (row) =>
      row.status === "accepted" &&
      ((row.fromId === a && row.toId === b) || (row.fromId === b && row.toId === a)),
  );
}

export function friendRequestBetween(state: PlayState, fromId: string, toId: string) {
  return state.friendships.find(
    (row) =>
      (row.fromId === fromId && row.toId === toId) ||
      (row.fromId === toId && row.toId === fromId),
  );
}

export function isBlocked(state: PlayState, viewerId: string, otherId: string): boolean {
  return state.blocks.some(
    (row) =>
      (row.blockerId === viewerId && row.blockedId === otherId) ||
      (row.blockerId === otherId && row.blockedId === viewerId),
  );
}

export function canViewProfile(
  player: DirectoryPlayer,
  viewer: SessionUser | null,
  state: PlayState,
): boolean {
  if (player.privacy === "public") return true;
  if (!viewer) return false;
  if (viewer.id === player.id) return true;
  return areFriends(state, viewer.id, player.id);
}

export function friendsOf(state: PlayState, playerId: string): string[] {
  return state.friendships
    .filter(
      (row) =>
        row.status === "accepted" && (row.fromId === playerId || row.toId === playerId),
    )
    .map((row) => (row.fromId === playerId ? row.toId : row.fromId));
}

export function hashText(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return String(h);
}
