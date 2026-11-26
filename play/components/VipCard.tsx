"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";
import { membershipCaption } from "@/lib/format";
import { clubBenefits, siteConfig } from "@/lib/site";
import { TIER } from "@/lib/tier";

export function VipCard({ compact = false }: { compact?: boolean }) {
  const { vip, user, repo, showToast, openModal } = usePlay();
  const caption = membershipCaption(user);
  const guest = user?.vipPlan === "sponsored";

  async function cancel() {
    await repo.setVip(null);
    showToast(`${TIER.name} cancelled in this demo`);
  }

  return (
    <div className="card">
      <div className="row between">
        <h3>{TIER.productName}</h3>
        <span className="price num">
          {siteConfig.clubMonthly}
          <span className="small muted" style={{ fontFamily: "var(--body)" }}>
            {" "}
            / month
          </span>
        </span>
      </div>
      <p className="small muted">
        or {siteConfig.clubYearly} / year (save {siteConfig.clubYearlySave} vs{" "}
        {siteConfig.clubYearlyWas}).
      </p>
      <ul className="clean">
        {clubBenefits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="small muted">Demo: no card is taken and nothing is charged.</p>
      {vip ? (
        <div className="row between">
          <span className={`tag ${guest ? "vip" : "club"}`}>{caption ?? "Active"}</span>
          <button className="btn sm" type="button" onClick={cancel}>
            Cancel
          </button>
        </div>
      ) : compact ? (
        <Link className="btn primary" href={TIER.path}>
          Start {TIER.name}
        </Link>
      ) : (
        <button className="btn primary" type="button" onClick={() => openModal({ type: "club" })}>
          Start {TIER.name}
        </button>
      )}
    </div>
  );
}
