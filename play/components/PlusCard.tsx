"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";
import { plusBenefits, siteConfig } from "@/lib/site";

export function PlusCard({ compact = false }: { compact?: boolean }) {
  const { plus, repo, showToast, openModal } = usePlay();

  async function cancel() {
    await repo.setPlus(false);
    showToast("Plus cancelled in this demo");
  }

  return (
    <div className="card">
      <div className="row between">
        <h3>Maletas Plus</h3>
        <span className="price num">
          {siteConfig.plusPrice}
          <span className="small muted" style={{ fontFamily: "var(--body)" }}>
            {" "}
            / {siteConfig.plusPeriod}
          </span>
        </span>
      </div>
      <ul className="clean">
        {plusBenefits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="small muted">Demo: no card is taken and nothing is charged.</p>
      {plus ? (
        <div className="row between">
          <span className="tag plus">Active</span>
          <button className="btn sm" type="button" onClick={cancel}>
            Cancel
          </button>
        </div>
      ) : compact ? (
        <Link className="btn primary" href="/plus">
          Start Plus
        </Link>
      ) : (
        <button className="btn primary" type="button" onClick={() => openModal({ type: "plus" })}>
          Start Plus
        </button>
      )}
    </div>
  );
}
