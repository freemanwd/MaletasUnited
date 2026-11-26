export const siteConfig = {
  name: "Maletas United",
  tagline: "Where Soccer and Laughter Never Get Old",
  description:
    "Maletas United is a pickup soccer group of older gentlemen in Jacksonville, FL. Games have historically been weekends — mostly Saturday mornings — plus some weeknights when there's enough daylight. No entrance fees, not a nonprofit, and no fixed schedule.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.maleta.net",
  email: "maletasunited@gmail.com",
  facebook:
    "https://www.facebook.com/profile.php?id=100064926492230",
  location: "Jacksonville, FL",
  author: "Dr. W. David Freeman",
} as const;

export function absoluteUrl(path = "/") {
  const base = siteConfig.url.replace(/\/$/, "");
  if (path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
