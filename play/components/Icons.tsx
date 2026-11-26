export const ICONS = {
  games: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l4 3-1.5 5h-5L8 10z" />
    </>
  ),
  hosts: (
    <>
      <path d="M3 20V8l9-5 9 5v12" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  feed: <path d="M4 5h16v11H9l-5 4z" />,
  shop: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8a3 3 0 016 0" />
    </>
  ),
  me: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-5 15-5 16 0" />
    </>
  ),
} as const;

export function TabIcon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

export const TABS = [
  { href: "/", id: "games", label: "Games" },
  { href: "/hosts", id: "hosts", label: "Hosts" },
  { href: "/clubhouse", id: "feed", label: "Clubhouse" },
  { href: "/shop", id: "shop", label: "Shop" },
  { href: "/me", id: "me", label: "Profile" },
] as const;

export function currentTab(pathname: string): string {
  if (pathname.startsWith("/hosts") || pathname.startsWith("/games/new")) return "hosts";
  if (pathname.startsWith("/clubhouse")) return "feed";
  if (pathname.startsWith("/shop")) return "shop";
  if (
    pathname.startsWith("/me") ||
    pathname.startsWith("/plus") ||
    pathname.startsWith("/vip") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/players")
  )
    return "me";
  if (pathname.startsWith("/admin")) return "admin";
  return "games";
}
