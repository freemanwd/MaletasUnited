import type { Metadata } from "next";
import { SEED_POSTS } from "@/lib/data/seed";
import { playUrl } from "@/lib/share";
import { PostPermalinkView } from "@/components/views/PostPermalinkView";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return SEED_POSTS.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = SEED_POSTS.find((item) => item.id === id);
  const title = post ? `${post.who} on Clubhouse` : "Clubhouse post";
  const description = post?.text ?? "A Maletas Play Clubhouse post.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: playUrl(`/p/${id}`),
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  return <PostPermalinkView id={id} />;
}
