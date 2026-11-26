"use client";

import { plusBenefits, siteConfig } from "@/lib/site";
import { usePlay } from "@/lib/play-context";
import { PlusCard } from "../PlusCard";

export function PlusView() {
  const { plus, repo, showToast, requireUser, openModal } = usePlay();

  async function start() {
    if (requireUser()) return;
    openModal({ type: "plus" });
  }

  async function cancel() {
    await repo.setPlus(false);
    showToast("Plus cancelled in this demo");
  }

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Maletas Plus</h2>
        <span className="tag plus">Demo</span>
      </div>
      <p className="muted">
        Browsing by city is free. Plus unlocks ZIP and region search. This preview does not take
        a card. Production uses Stripe Billing at {siteConfig.plusPrice} / {siteConfig.plusPeriod}.
      </p>
      <div className="cols">
        <div className="stack">
          <div className="card">
            <div className="row between">
              <h3>What you get</h3>
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
            {plus ? (
              <div className="row between">
                <span className="tag plus">Active in this demo</span>
                <button className="btn sm" type="button" onClick={cancel}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn primary" type="button" onClick={start}>
                Start Plus (demo)
              </button>
            )}
          </div>
        </div>
        <aside className="stack">
          <PlusCard />
        </aside>
      </div>
    </div>
  );
}
