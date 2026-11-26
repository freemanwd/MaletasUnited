import { playOgImage, ogSize } from "@/lib/og-card";

export const alt = "Maletas Play Clubhouse";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return playOgImage({
    kicker: "Maletas Play",
    title: "Clubhouse",
    lines: ["Local posts, photos, and optional workout stats from players near you."],
  });
}
