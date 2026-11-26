"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";
import { membershipCaption } from "@/lib/format";
import { siteConfig, vipBenefits } from "@/lib/site";
import { TIER } from "@/lib/tier";

export function VipCard({ compact = false }: { compact?: boolean }) {
  const { vip, user, repo, showToast, openModal } = usePlay();
  const caption = membershipCaption(user);

  async function cancel() {
    await repo.setVip(null);
    showToast(`${TIER.name} cancelled in this demo`);
  }

  return (
    <div className="card">
      <div className="row between">
        <h3>{TIER.productName}</h3>
        <span className="price num">
          {siteConfig.vipMonthly}
          <span className="small muted" style={{ fontFamily: "var(--body)" }}>
            {" "}
            / month
          </span>
        </span>
      </div>
      <p className="small muted">
        or {siteConfig.vipYearly} / year (save {siteConfig.vipYearlySave} vs {siteConfig.vipYearlyWas}).
      </p>
      <ul className="clean">
        {vipBenefits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="small muted">Demo: no card is taken and nothing is charged.</p>
      {vip ? (
        <div className="row between">
          <span className="tag vip">{caption ?? "Active"}</span>
          <button className="btn sm" type="button" onClick={cancel}>
            Cancel
          </button>
        </div>
      ) : compact ? (
        <Link className="btn primary" href={TIER.path}>
          Start {TIER.name}
        </Link>
      ) : (
        <button className="btn primary" type="button" onClick={() => openModal({ type: "vip" })}>
          Start {TIER.name}
        </button>
      )}
    </div>
  );
}
