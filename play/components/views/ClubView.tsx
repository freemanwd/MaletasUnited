"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { membershipCaption, membershipUntil } from "@/lib/format";
import { clubBenefits, siteConfig } from "@/lib/site";
import {
  CAPTAIN,
  CLUB,
  HOST_LEVEL,
  OPEN_PLAY,
  TIER,
  VOUCHER_PRICING,
} from "@/lib/tier";
import { usePlay } from "@/lib/play-context";
import { VipCard } from "../VipCard";

export function ClubView() {
  const { vip, state, user, repo, showToast, requireUser, openModal } = usePlay();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const caption = membershipCaption(user);
  const until = membershipUntil(user);

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
      showToast("Club voucher redeemed");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not redeem that code");
    }
  }

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Membership</h2>
        <span className="tag plus">Demo</span>
      </div>
      <p className="muted">
        {OPEN_PLAY.name} is free. {TIER.productName} is {TIER.monthly}/month or {TIER.yearly}/year
        for private games and alerts. {HOST_LEVEL.name}s pay no monthly dues. Checkout is a demo;
        nothing is charged. A host-granted 1-year Club voucher shows as a VIP guest badge, not a
        plan.
      </p>
      {caption ? (
        <p className={`tag ${user?.vipPlan === "sponsored" ? "vip" : "club"}`}>
          {caption}
          {until ? ` · until ${until}` : ""}
        </p>
      ) : null}

      <h3>Compare levels</h3>
      <div className="compare">
        <article className="card">
          <h3>{OPEN_PLAY.name}</h3>
          <p className="price num">{OPEN_PLAY.price}</p>
          <ul className="clean">
            {OPEN_PLAY.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="card featured">
          <h3>{CLUB.name}</h3>
          <p className="price num">
            {CLUB.monthly}
            <span className="small muted" style={{ fontFamily: "var(--body)" }}>
              {" "}
              / mo or {CLUB.yearly}/yr
            </span>
          </p>
          <ul className="clean">
            {CLUB.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h3>{HOST_LEVEL.name}</h3>
          <p className="price num">{HOST_LEVEL.price}</p>
          <ul className="clean">
            {HOST_LEVEL.features.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="small muted">{HOST_LEVEL.takeNote}</p>
        </article>
      </div>
      <p className="small muted">{CAPTAIN.note}</p>

      <div className="cols">
        <div className="stack">
          <div className="card">
            <div className="row between">
              <h3>Monthly</h3>
              <span className="price num">
                {siteConfig.clubMonthly}
                <span className="small muted" style={{ fontFamily: "var(--body)" }}>
                  {" "}
                  / month
                </span>
              </span>
            </div>
            <p className="small muted">Cancel any time. Maps to Stripe Billing later.</p>
            {vip && state.user?.vipPlan === "monthly" ? (
              <span className="tag club">Active in this demo</span>
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
                {siteConfig.clubYearly}
                <span className="small muted" style={{ fontFamily: "var(--body)" }}>
                  {" "}
                  / year
                </span>
              </span>
            </div>
            <p>
              Billed as {siteConfig.clubYearly} instead of {siteConfig.clubYearlyWas}. You save{" "}
              {siteConfig.clubYearlySave}.
            </p>
            {vip && state.user?.vipPlan === "yearly" ? (
              <span className="tag club">Active in this demo</span>
            ) : (
              <button className="btn pitch" type="button" onClick={() => start("yearly")}>
                Start yearly (demo)
              </button>
            )}
          </div>
          <div className="card">
            <h3>Redeem a host voucher</h3>
            <p className="muted">
              A host can gift you a 1-year {TIER.productName} membership. You then show as a VIP
              guest of that host. Paste the code or open the link. Also works from{" "}
              <code>/plus?voucher=</code> and <code>/vip?voucher=</code>.
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
            <h3>Club alerts</h3>
            <ul className="clean">
              {clubBenefits.map((item) => (
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
                  <span>Geo search alerts</span>
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
                  <span className={`tag ${user?.vipPlan === "sponsored" ? "vip" : "club"}`}>
                    {caption ?? "Active in this demo"}
                  </span>
                  <button className="btn sm" type="button" onClick={cancel}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button
                className="btn primary"
                type="button"
                onClick={() => (requireUser() ? null : openModal({ type: "club" }))}
              >
                Choose Club (demo)
              </button>
            )}
          </div>
        </div>
        <aside className="stack">
          <VipCard />
          <div className="card">
            <h3>Hosts</h3>
            <p className="muted">
              Gift guests a year of {TIER.productName} instead of {TIER.monthly}/month. Demo price
              $20 per voucher, bulk {VOUCHER_PRICING.bulkCount} for $
              {VOUCHER_PRICING.bulkPrice}. Cap: {VOUCHER_PRICING.yearlyCap} per host per year.
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
