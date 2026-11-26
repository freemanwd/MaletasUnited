"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePlay } from "@/lib/play-context";

export function JoinView({ code }: { code: string }) {
  const { repo, openModal, user } = usePlay();

  useEffect(() => {
    void repo.setPendingReferral(code);
  }, [code, repo]);

  return (
    <div className="wrap">
      <h2>You&apos;re invited</h2>
      <div className="card">
        <p>
          Invite code <span className="code">{code}</span>
        </p>
        <p className="muted">
          Create a free player card to put your name on Jacksonville sheets. Referral tracking in
          this preview is stored in your browser only.
        </p>
        {user ? (
          <p>
            You&apos;re already in as {user.name}.{" "}
            <Link href="/">Find a game</Link>
          </p>
        ) : (
          <button className="btn primary" type="button" onClick={() => openModal({ type: "signup" })}>
            Create my player card
          </button>
        )}
      </div>
    </div>
  );
}
