"use client";

import Link from "next/link";
import { ClubhousePost } from "../ClubhousePost";
import { usePlay } from "@/lib/play-context";

export function PostPermalinkView({ id }: { id: string }) {
  const { ready, state } = usePlay();
  const post = state.posts.find((item) => item.id === id);

  if (!ready) {
    return (
      <div className="wrap">
        <p className="muted">Loading post…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="wrap">
        <h2>Post not found</h2>
        <p className="muted">That Clubhouse post is not in this browser’s data.</p>
        <Link className="btn pitch" href="/clubhouse">
          Back to Clubhouse
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap stack">
      <p className="small muted">
        <Link href="/clubhouse">Clubhouse</Link> / post
      </p>
      <ClubhousePost post={post} />
    </div>
  );
}
