"use client";

import { adminSnapshot } from "@/lib/data/local-repository";
import { money } from "@/lib/format";
import { usePlay } from "@/lib/play-context";

export function AdminView() {
  const { state, user, isAdmin, repo, requireUser, showToast } = usePlay();
  const snap = adminSnapshot(state);
  const gmv = state.vendors.reduce((sum, vendor) => sum + vendor.gmv, 0);
  const cut = snap.shopCommission;

  const W = 640;
  const Ht = 220;
  const L = 36;
  const B = 24;
  const T = 12;
  const max = 500;
  const bw = (W - L - 8) / 12;
  const y = (v: number) => T + (Ht - T - B) * (1 - v / max);
  const P = snap.weeksPlayers;
  const H = snap.weeksHosts;

  async function previewAdmin() {
    if (requireUser() || !user) return;
    await repo.setDemoAdmin(true);
    showToast("Admin role on for this demo (Clerk stand-in)");
  }

  return (
    <div className="wrap">
      <div className="row between">
        <h2>Admin</h2>
        <span className="tag">Sample figures</span>
      </div>
      <div className="banner">
        In production this view is limited to you and the admins you name, using roles in Clerk
        (player, host, admin). Sign-ups, Plus and commission below update as you use this preview.
        {!isAdmin ? (
          <>
            {" "}
            You are viewing it without the admin role.{" "}
            <button className="btn sm" type="button" onClick={previewAdmin}>
              Preview as admin (demo)
            </button>
          </>
        ) : (
          " You currently have the admin role in this browser."
        )}
      </div>
      <div className="kpis">
        <div className="kpi">
          <b className="num">{snap.players.toLocaleString()}</b>
          <span>Players</span>
        </div>
        <div className="kpi">
          <b className="num">{snap.hosts}</b>
          <span>Hosts</span>
        </div>
        <div className="kpi">
          <b className="num">{snap.inviteJoinRate.toFixed(2)}</b>
          <span>Invites that join, per user</span>
        </div>
        <div className="kpi">
          <b className="num">{snap.plusSubscribers}</b>
          <span>Plus subscribers</span>
        </div>
        <div className="kpi">
          <b className="num">{money(snap.plusRevenue)}</b>
          <span>Plus revenue per month</span>
        </div>
        <div className="kpi">
          <b className="num">{money(cut)}</b>
          <span>Shop commission, 30 days</span>
        </div>
      </div>
      <div className="card">
        <div className="row between">
          <h3>New sign-ups per week</h3>
          <div className="legend">
            <span>
              <i style={{ background: "var(--pitch)" }} />
              Players
            </span>
            <span>
              <i style={{ background: "var(--bib)" }} />
              Hosts
            </span>
          </div>
        </div>
        <svg
          className="chart"
          viewBox={`0 0 ${W} ${Ht}`}
          role="img"
          aria-label={`Weekly sign-ups for 12 weeks, rising to ${(P[11] ?? 0) + (H[11] ?? 0)}`}
        >
          {[0, 250, 500].map((v) => (
            <g key={v}>
              <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="var(--line)" />
              <text x={L - 6} y={y(v) + 4} textAnchor="end">
                {v}
              </text>
            </g>
          ))}
          {P.map((players, i) => {
            const hosts = H[i] ?? 0;
            const x = L + i * bw + bw * 0.18;
            const w = bw * 0.64;
            const yp = y(players);
            const yh = y(players + hosts);
            return (
              <g key={i}>
                <rect x={x} y={yp} width={w} height={y(0) - yp} fill="var(--pitch)" rx="2" />
                <rect x={x} y={yh} width={w} height={yp - yh} fill="var(--bib)" rx="2" />
                <text x={x + w / 2} y={Ht - 7} textAnchor="middle">
                  W{i + 1}
                </text>
                {i === 11 ? (
                  <text
                    x={x + w / 2}
                    y={yh - 5}
                    textAnchor="middle"
                    style={{ fontWeight: 700, fill: "var(--ink)" }}
                  >
                    {players + hosts}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="card">
        <h3>Vendors and commission</h3>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Country</th>
                <th className="r">Sales, 30 days</th>
                <th className="r">Cut %</th>
                <th className="r">Maletas earns</th>
              </tr>
            </thead>
            <tbody>
              {state.vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.country}</td>
                  <td className="r num">{money(vendor.gmv)}</td>
                  <td className="r">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={1}
                      value={vendor.rate}
                      aria-label={`Commission percent for ${vendor.name}`}
                      onChange={(event) =>
                        repo.setVendorRate(vendor.id, Number(event.target.value))
                      }
                    />
                  </td>
                  <td className="r num">{money((vendor.gmv * vendor.rate) / 100)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <strong>Total</strong>
                </td>
                <td className="r num">
                  <strong>{money(gmv)}</strong>
                </td>
                <td />
                <td className="r num">
                  <strong>{money(cut)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <h3>Admins</h3>
        <div className="row between">
          <span>
            You (CEO) <span className="small muted">· owner</span>
          </span>
          <span className="tag">Full control</span>
        </div>
        <div className="row between">
          <span className="muted">Two more admin seats to assign</span>
          <span className="tag">Open</span>
        </div>
      </div>
    </div>
  );
}
