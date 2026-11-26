"use client";

import Link from "next/link";
import { usePlay } from "@/lib/play-context";
import { siteConfig, vipBenefits } from "@/lib/site";

export function VipCard({ compact = false }: { compact?: boolean }) {
  const { vip, repo, showToast, openModal } = usePlay();

  async function cancel() {
    await repo.setVip(null);
    showToast("VIP cancelled in this demo");
  }

  return (
    <div className="card">
      <div className="row between">
        <h3>Maletas VIP</h3>
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
          <span className="tag vip">Active</span>
          <button className="btn sm" type="button" onClick={cancel}>
            Cancel
          </button>
        </div>
      ) : compact ? (
        <Link className="btn primary" href="/vip">
          Start VIP
        </Link>
      ) : (
        <button className="btn primary" type="button" onClick={() => openModal({ type: "vip" })}>
          Start VIP
        </button>
      )}
    </div>
  );
}
