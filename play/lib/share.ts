export function playOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_PLAY_URL ?? "https://maletas-play.vercel.app";
  return raw.replace(/\/$/, "");
}

export function playUrl(path = "/"): string {
  const origin = playOrigin();
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Prefill for the user’s own share sheet or network. No auto-posting. */
export function shareCopy(body: string, path: string): { title: string; text: string; url: string } {
  const url = playUrl(path);
  const trimmed = body.replace(/\s+/g, " ").trim();
  const text = trimmed ? `${trimmed}\n\nvia Maletas Play\n${url}` : `via Maletas Play\n${url}`;
  return { title: trimmed ? trimmed.slice(0, 80) : "Maletas Play", text, url };
}
