"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";
import { HostForm } from "../HostForm";

export function HostGameView() {
  const { user, openModal } = usePlay();

  if (!user) {
    return (
      <div className="wrap">
        <h2>Host a game</h2>
        <div className="card">
          <p>Create a free profile first, then publish a one-off, weekly, or fortnightly game.</p>
          <button className="btn primary" type="button" onClick={() => openModal({ type: "signup" })}>
            Join Maletas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/hosts">Hosts</Link> / new game
      </p>
      <div className="card">
        <HostForm />
      </div>
    </div>
  );
}
