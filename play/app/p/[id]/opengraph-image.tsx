import { SEED_POSTS } from "@/lib/data/seed";
import { workoutChips } from "@/lib/fitness";
import { playOgImage, ogSize } from "@/lib/og-card";

export const alt = "Maletas Play Clubhouse post";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = SEED_POSTS.find((item) => item.id === id);
  if (!post) {
    return playOgImage({
      kicker: "Maletas Play",
      title: "Clubhouse post",
      lines: ["A player post on Maletas Play."],
    });
  }
  const stats = post.workout ? workoutChips(post.workout).map((chip) => `${chip.value} ${chip.label}`) : [];
  return playOgImage({
    kicker: `${post.who} · Clubhouse`,
    title: post.text.slice(0, 140),
    lines: stats.length ? [stats.join(" · ")] : [post.city],
  });
}
