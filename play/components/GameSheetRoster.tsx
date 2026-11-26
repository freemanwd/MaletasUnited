"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/lib/types";
import { GAME_TZ } from "@/lib/format";
import type { SheetSnapshot } from "@/lib/sheets/fetch";
import { sheetEditUrl } from "@/lib/sheets/parse";

function formatSynced(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString("en-US", {
    timeZone: GAME_TZ,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }) + " ET";
}

export function GameSheetRoster({ game }: { game: Game }) {
  const sheetId = game.sheetId;
  const [sheet, setSheet] = useState<SheetSnapshot | null>(null);
  const [failed, setFailed] = useState(false);
  const editUrl = sheetId ? sheetEditUrl(sheetId) : "";
  const cta = game.sheetSignupLabel || "Sign up on the sheet";

  useEffect(() => {
    if (!sheetId) return;
    const params = new URLSearchParams({
      sheetId,
      gid: game.sheetGid || "0",
    });
    let cancelled = false;
    setFailed(false);
    fetch(`/api/sheet?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: SheetSnapshot) => {
        if (!cancelled) setSheet(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sheetId, game.sheetGid]);

  if (!sheetId) return null;

  const capacity = sheet?.capacity ?? game.spots;
  const taken = sheet ? sheet.hosts.length + sheet.players.length : null;
  const roster = sheet ? [...sheet.hosts, ...sheet.players] : [];
  const slots = Array.from({ length: capacity || roster.length }, (_, i) => roster[i] ?? "");
  const hostSet = new Set(sheet?.hosts ?? []);

  return (
    <div className="sheet-sync">
      <div
        className={`meter ${sheet?.full ? "full" : ""}`}
        role="img"
        aria-label={taken != null ? `${taken} of ${capacity} spots taken` : "Loading sign-up count"}
      >
        <b style={{ width: `${taken != null && capacity ? Math.min(100, (taken / capacity) * 100) : 0}%` }} />
      </div>
      <div className="row between">
        <span className="small muted num">
          {sheet
            ? `${taken} of ${capacity} signed up${sheet.full ? " · FULL" : ""} (including hosts)`
            : failed
              ? "Couldn’t load the count just now"
              : "Loading the sign-up sheet…"}
        </span>
        {sheet?.full ? <span className="tag full">FULL</span> : null}
      </div>

      <div className="sheet">
        <h4>Sign-up sheet · {game.when}</h4>
        {failed ? (
          <p className="muted">Couldn’t load the sheet right now. You can still open it below.</p>
        ) : !sheet ? (
          <p className="muted">Loading names…</p>
        ) : (
          <>
            {sheet.hosts.length ? (
              <p className="small">
                Hosts: {sheet.hosts.join(", ")}
              </p>
            ) : null}
            <ol>
              {slots.map((name, i) => (
                <li key={i}>
                  <span className="num">{i + 1}</span>
                  {name}
                  {name && hostSet.has(name) ? <span className="tag rec">Host</span> : null}
                </li>
              ))}
            </ol>
            {sheet.waitlist.length ? (
              <div className="waitlist">
                <h4>Waitlist</h4>
                <ol>
                  {sheet.waitlist.map((name, i) => (
                    <li key={i}>
                      <span className="num">{i + 1}</span>
                      {name}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </>
        )}
      </div>

      <p>
        <a className="btn primary" href={editUrl} target="_blank" rel="noopener noreferrer">
          {cta}
        </a>
      </p>
      <p className="small muted">
        {sheet
          ? `Synced from sheet · ${formatSynced(sheet.syncedAt)}`
          : "Synced from the host’s Google Sheet."}{" "}
        Names only. The host or list keeper keeps the official list.
      </p>
    </div>
  );
}
