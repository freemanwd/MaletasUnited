"use client";

import { siteConfig, vipBenefits } from "@/lib/site";
import { usePlay } from "@/lib/play-context";
import { VipCard } from "../VipCard";

export function VipView() {
  const { vip, state, repo, showToast, requireUser, openModal } = usePlay();

  async function start(plan: "monthly" | "yearly") {
    if (requireUser()) return;
    await repo.setVip(plan);
    showToast(plan === "yearly" ? "VIP yearly is on in this demo" : "VIP monthly is on in this demo");
  }

  async function cancel() {
    await repo.setVip(null);
    showToast("VIP cancelled in this demo");
  }

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Maletas VIP</h2>
        <span className="tag plus">Demo</span>
      </div>
      <p className="muted">
        Searching by city, ZIP and format is free. VIP is for private and invite-only hosted games,
        host email lists, radius alerts, match alerts, and watch-party alerts. Culhane&apos;s Irish
        Pub was Maletas&apos; 2026 World Cup spot — an example of the watch-party alerts VIP will
        send. Checkout is a demo; nothing is charged.
      </p>
      <div className="cols">
        <div className="stack">
          <div className="card">
            <div className="row between">
              <h3>Monthly</h3>
              <span className="price num">
                {siteConfig.vipMonthly}
                <span className="small muted" style={{ fontFamily: "var(--body)" }}>
                  {" "}
                  / month
                </span>
              </span>
            </div>
            <p className="small muted">Cancel any time. Maps to Stripe Billing later.</p>
            {vip && state.user?.vipPlan === "monthly" ? (
              <span className="tag vip">Active in this demo</span>
            ) : (
              <button className="btn primary" type="button" onClick={() => start("monthly")}>
                Start monthly (demo)
              </button>
            )}
          </div>
          <div className="card">
            <div className="row between">
              <h3>Yearly</h3>
              <span className="price num">
                {siteConfig.vipYearly}
                <span className="small muted" style={{ fontFamily: "var(--body)" }}>
                  {" "}
                  / year
                </span>
              </span>
            </div>
            <p>
              Billed as {siteConfig.vipYearly} instead of {siteConfig.vipYearlyWas}. You save{" "}
              {siteConfig.vipYearlySave}.
            </p>
            {vip && state.user?.vipPlan === "yearly" ? (
              <span className="tag vip">Active in this demo</span>
            ) : (
              <button className="btn pitch" type="button" onClick={() => start("yearly")}>
                Start yearly (demo)
              </button>
            )}
          </div>
          <div className="card">
            <h3>What you get</h3>
            <ul className="clean">
              {vipBenefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {vip ? (
              <>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={state.hostEmailOptIn}
                    onChange={(event) => repo.setVipAlerts({ hostEmailOptIn: event.target.checked })}
                  />
                  <span>Host email lists</span>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={state.alertRadius}
                    onChange={(event) => repo.setVipAlerts({ alertRadius: event.target.checked })}
                  />
                  <span>Radius / geographic search alerts</span>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={state.alertMatches}
                    onChange={(event) => repo.setVipAlerts({ alertMatches: event.target.checked })}
                  />
                  <span>Match alerts</span>
                </label>
                <label className="check">
                  <input
                    type="checkbox"
                    checked={state.alertWatch}
                    onChange={(event) => repo.setVipAlerts({ alertWatch: event.target.checked })}
                  />
                  <span>Watch-party alerts</span>
                </label>
                <div className="row between">
                  <span className="tag vip">Active in this demo</span>
                  <button className="btn sm" type="button" onClick={cancel}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button className="btn primary" type="button" onClick={() => (requireUser() ? null : openModal({ type: "vip" }))}>
                Choose a plan (demo)
              </button>
            )}
          </div>
        </div>
        <aside className="stack">
          <VipCard />
        </aside>
      </div>
    </div>
  );
}
