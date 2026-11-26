"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/format";
import { TIER, VOUCHER_PRICING, hostVoucherYearStats, voucherQuote } from "@/lib/tier";
import { usePlay } from "@/lib/play-context";
import { QrCode } from "../QrCode";

export function HostVouchersView() {
  const { user, state, repo, requireUser, showToast, hasRole } = usePlay();
  const [count, setCount] = useState(1);
  const [months, setMonths] = useState<number>(VOUCHER_PRICING.defaultMonths);
  const [gameId, setGameId] = useState("");
  const [created, setCreated] = useState<string[]>([]);
  const stats = useMemo(
    () =>
      user
        ? hostVoucherYearStats(state.vouchers, user)
        : { year: new Date().getFullYear(), used: 0, cap: VOUCHER_PRICING.yearlyCap, remaining: VOUCHER_PRICING.yearlyCap },
    [state.vouchers, user],
  );
  const quote = voucherQuote(count, stats.remaining);
  const mine = useMemo(
    () =>
      state.vouchers.filter(
        (row) => user && (row.hostId === user.id || row.hostName === user.name),
      ),
    [state.vouchers, user],
  );
  const hostGames = state.games.filter(
    (game) => user && (game.hostId === user.id || game.hostName === user.name),
  );

  if (!user) {
    return (
      <div className="wrap">
        <h2>Host Club vouchers</h2>
        <p className="muted">
          Hosts can gift a 1-year {TIER.productName} membership so guests do not pay {TIER.monthly}
          /month. Guests then show as a VIP guest of the host. Default cap: {VOUCHER_PRICING.yearlyCap}{" "}
          vouchers per host per year.
        </p>
        <button className="btn primary" type="button" onClick={() => requireUser()}>
          Join / Sign up as a host
        </button>
      </div>
    );
  }

  if (!hasRole("host") && hostGames.length === 0) {
    return (
      <div className="wrap">
        <h2>Host Club vouchers</h2>
        <p className="muted">Publish a game first, then you can buy guest Club vouchers.</p>
        <Link className="btn pitch" href="/games/new">
          Host a game
        </Link>
      </div>
    );
  }

  async function buy() {
    if (!user) return;
    try {
      const rows = await repo.buyVouchers(
        {
          count: quote.count,
          durationMonths: months,
          gameId: gameId || null,
        },
        user,
      );
      setCreated(rows.map((row) => row.code));
      showToast(
        `Demo checkout: ${money(quote.total)} for ${quote.count} voucher${quote.count === 1 ? "" : "s"}`,
      );
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not buy vouchers");
    }
  }

  const origin = typeof window === "undefined" ? "https://play.maletas.com" : window.location.origin;

  return (
    <div className="wrap">
      <p className="small muted">
        <Link href="/hosts">Hosts</Link> / vouchers
      </p>
      <h2>Guest Club vouchers</h2>
      <p className="muted">
        Buy a 1-year {TIER.productName} voucher for a guest instead of them paying {TIER.monthly}
        /month. They show as a VIP guest of you. Demo Stripe stand-in: {money(VOUCHER_PRICING.unitPrice)}{" "}
        each, or {VOUCHER_PRICING.bulkCount} for {money(VOUCHER_PRICING.bulkPrice)}.
      </p>
      <p>
        <strong>
          {stats.used} of {stats.cap} used in {stats.year}
        </strong>
        {" · "}
        {stats.remaining} remaining this year. Default cap is {VOUCHER_PRICING.yearlyCap} per host per
        year.
      </p>
      <div className="cols">
        <form
          className="card form"
          onSubmit={(event) => {
            event.preventDefault();
            void buy();
          }}
        >
          <h3>Create vouchers</h3>
          <label htmlFor="v_count">
            How many
            <input
              id="v_count"
              type="number"
              min={1}
              max={Math.max(1, stats.remaining)}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              disabled={stats.remaining <= 0}
            />
          </label>
          <label htmlFor="v_months">
            Duration
            <select
              id="v_months"
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
            >
              <option value={12}>1 year (default)</option>
              <option value={6}>6 months</option>
              <option value={1}>1 month</option>
            </select>
          </label>
          <label htmlFor="v_game">
            Game or group
            <select id="v_game" value={gameId} onChange={(event) => setGameId(event.target.value)}>
              <option value="">Any game I host</option>
              {hostGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </label>
          <p>
            {quote.count} × {money(quote.per)} = <strong>{money(quote.total)}</strong>
            {quote.bulk ? " · bulk price applied" : ""}
          </p>
          <p className="small muted">Demo: no card is taken. Production uses Stripe Checkout.</p>
          <button className="btn primary" type="submit" disabled={stats.remaining <= 0 || quote.count < 1}>
            Pay {money(quote.total)} (demo)
          </button>
        </form>
        <aside className="stack">
          {created.length ? (
            <div className="card">
              <h3>New codes</h3>
              {created.map((code) => {
                const url = `${origin}/club?voucher=${code}`;
                return (
                  <div className="voucher-card" key={code}>
                    <QrCode value={url} size={140} />
                    <div>
                      <div className="code">{code}</div>
                      <a href={url}>{url.replace(/^https?:\/\//, "")}</a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </aside>
      </div>
      <div className="card">
        <h3>Your vouchers</h3>
        {mine.length ? (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Group</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="code">{row.code}</span>
                    </td>
                    <td>{row.gameTitle ?? "Any"}</td>
                    <td>
                      {row.redeemedByName
                        ? `Redeemed by ${row.redeemedByName}`
                        : "Open"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">None yet. Sample host Dave has a Glen Kernan batch in the seed.</p>
        )}
      </div>
    </div>
  );
}
