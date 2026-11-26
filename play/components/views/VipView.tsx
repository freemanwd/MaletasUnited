"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { membershipCaption } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { TIER } from "@/lib/tier";
import { usePlay } from "@/lib/play-context";
import { VipCard } from "../VipCard";

export function VipView() {
  const { vip, state, user, repo, showToast, requireUser, openModal } = usePlay();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const caption = membershipCaption(user);

  useEffect(() => {
    const preset = searchParams.get("voucher");
    if (preset) setCode(preset);
  }, [searchParams]);

  async function start(plan: "monthly" | "yearly") {
    if (requireUser()) return;
    await repo.setVip(plan);
    showToast(
      plan === "yearly"
        ? `${TIER.name} yearly is on in this demo`
        : `${TIER.name} monthly is on in this demo`,
    );
  }

  async function cancel() {
    await repo.setVip(null);
    showToast(`${TIER.name} cancelled in this demo`);
  }

  async function redeem() {
    if (requireUser() || !user) return;
    try {
      await repo.redeemVoucher(code, user);
      showToast("Voucher redeemed");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not redeem that code");
    }
  }

  return (
    <div className="wrap">
      <div className="row between">
        <h2>{TIER.productName}</h2>
        <span className="tag plus">Demo</span>
      </div>
      <p className="muted">
        Searching by city, ZIP and format is free. {TIER.name} is for private and invite-only hosted
        games, host email lists, radius alerts, match alerts, and watch-party alerts. Culhane&apos;s
        Irish Pub was Maletas&apos; 2026 World Cup spot — an example of the watch-party alerts{" "}
        {TIER.name} will send. Checkout is a demo; nothing is charged. Hosts can also gift a 1-year
        membership voucher instead of each guest paying $1.99/mo.
      </p>
      {caption ? <p className="tag vip">{caption}</p> : null}
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
            <h3>Redeem a host voucher</h3>
            <p className="muted">
              A host can gift you a 1-year {TIER.productName} membership. Paste the code or open the
              link they sent. Also works from <code>/plus?voucher=</code>.
            </p>
            <form
              className="form"
              onSubmit={(event) => {
                event.preventDefault();
                void redeem();
              }}
            >
              <label htmlFor="voucher_code">
                Voucher code
                <input
                  id="voucher_code"
                  name="voucher"
                  type="text"
                  autoCapitalize="characters"
                  placeholder="MAL-GIFT-202629"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
              </label>
              <button className="btn primary" type="submit">
                Redeem
              </button>
            </form>
            <p className="small muted">
              Sample codes from Dave: MAL-GIFT-202629 and MAL-GIFT-202630. MAL-GIFT-202628 is
              already redeemed by River.
            </p>
          </div>
          <div className="card">
            <h3>Alerts</h3>
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
                  <span className="tag vip">{caption ?? "Active in this demo"}</span>
                  <button className="btn sm" type="button" onClick={cancel}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn primary"
                type="button"
                onClick={() => (requireUser() ? null : openModal({ type: "vip" }))}
              >
                Choose a plan (demo)
              </button>
            )}
          </div>
        </div>
        <aside className="stack">
          <VipCard />
          <div className="card">
            <h3>Hosts</h3>
            <p className="muted">
              Gift guests a year of {TIER.productName} instead of $1.99/month. Demo price $20 per
              voucher, bulk 10 for $180.
            </p>
            <Link className="btn pitch" href="/hosts/vouchers">
              Host voucher tools
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
