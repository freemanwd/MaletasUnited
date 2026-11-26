import Link from "next/link";
import { connection } from "next/server";
import { realSignupEnabled } from "@/lib/beta/flag";
import { hasDatabase } from "@/lib/db";
import { authReady } from "@/auth";
import { utcToZonedInput } from "@/lib/beta/rules";
import { getGameBoard, getViewer, type BoardEntry } from "@/lib/beta/service";
import {
  addGuestAction,
  addHostAction,
  gameSettingsAction,
  removeGuestAction,
  removeHostAction,
  rsvpAction,
  sheetOfficialAction,
} from "@/lib/beta/actions";
import { ActionForm, SubmitButton } from "./ActionForm";

function fmt(date: Date, tz: string) {
  return (
    date.toLocaleString("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }) + " ET"
  );
}

function Name({ e }: { e: BoardEntry }) {
  return (
    <span className="beta-entry">
      {e.name}
      {e.role === "host" ? <span className="tag rec">Host</span> : null}
      {e.role === "guest" ? <span className="tag">Guest{e.invitedBy ? ` of ${e.invitedBy}` : ""}</span> : null}
      {e.vipOf ? <span className="tag club">VIP guest of {e.vipOf}</span> : null}
    </span>
  );
}

/** Database RSVPs for a game. Renders nothing unless the beta flag is on. */
export async function BetaRsvpSection({ gameId }: { gameId: string }) {
  await connection();
  if (!realSignupEnabled()) return null;

  const heading = "Test RSVPs (beta)";
  if (!hasDatabase() || !authReady()) {
    return (
      <div className="card beta-card">
        <h3>{heading}</h3>
        <p className="small muted">
          Real sign-up is being set up for testing. {hasDatabase() ? "The sign-in provider" : "The database"} isn’t
          connected yet, so nothing here is live.
        </p>
      </div>
    );
  }

  const viewer = await getViewer();
  const board = await getGameBoard(gameId, viewer);
  if (!board) return null;
  const { game, going, waitlist, me, viewerIsHost } = board;
  const official = !game.sheetIsOfficial;
  const tz = game.timezone;
  const nextPath = `/games/${gameId}`;
  const guests = going.concat(waitlist).filter((e) => e.role === "guest");

  return (
    <div className="card beta-card" id="beta-rsvps">
      <div className="row between">
        <h3>{official ? "RSVPs" : heading}</h3>
        <span className="tag sample">{official ? "Official list" : "Beta test"}</span>
      </div>
      <p className="small muted">
        {official
          ? "This game now uses app RSVPs as the official list."
          : "The Google Sheet above is still the official list. These app RSVPs are a private test for hosts and the list keeper."}
      </p>
      <p className="small">
        {fmt(game.startsAt, tz)} · {game.venue} · {game.feeModel}
      </p>

      <div className={`meter ${going.length >= game.cap ? "full" : ""}`} role="img" aria-label={`${going.length} of ${game.cap} in`}>
        <b style={{ width: `${Math.min(100, (going.length / game.cap) * 100)}%` }} />
      </div>
      <p className="small muted num">
        {going.length} of {game.cap} in (including hosts and guests)
        {waitlist.length ? ` · ${waitlist.length} on the waitlist` : ""}
      </p>

      <div className="sheet">
        <h4>In</h4>
        {going.length ? (
          <ol>
            {going.map((e, i) => (
              <li key={e.id}>
                <span className="num">{i + 1}</span>
                <Name e={e} />
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted small">No app RSVPs yet.</p>
        )}
        {waitlist.length ? (
          <div className="waitlist">
            <h4>Waitlist</h4>
            <ol>
              {waitlist.map((e, i) => (
                <li key={e.id}>
                  <span className="num">{i + 1}</span>
                  <Name e={e} />
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>

      {!viewer ? (
        <p>
          <Link className="btn primary" href={`/beta?next=${encodeURIComponent(nextPath)}`}>
            Sign in to RSVP
          </Link>
        </p>
      ) : !viewer.termsAccepted ? (
        <p>
          <Link className="btn primary" href={`/beta?next=${encodeURIComponent(nextPath)}`}>
            Accept the matchmaker terms to RSVP
          </Link>
        </p>
      ) : (
        <ActionForm action={rsvpAction} className="row">
          <input type="hidden" name="gameId" value={gameId} />
          <span className="small">
            Signed in as <b>{viewer.displayName}</b>
            {me && me.status !== "out" ? ` · you’re ${me.status === "in" ? "in" : "on the waitlist"}` : ""}
          </span>
          {me && me.status !== "out" ? (
            <SubmitButton className="btn" name="intent" value="out">
              I’m out
            </SubmitButton>
          ) : (
            <SubmitButton name="intent" value="in">
              I’m in
            </SubmitButton>
          )}
        </ActionForm>
      )}

      {viewer && viewerIsHost ? (
        <div className="beta-tools">
          <h4>Host tools</h4>
          <ActionForm action={addGuestAction}>
            <input type="hidden" name="gameId" value={gameId} />
            <label>
              Add a guest (only hosts can add guests; guests can’t invite guests)
              <input name="guestName" maxLength={60} placeholder="Guest’s name" required />
            </label>
            <SubmitButton className="btn">Add guest</SubmitButton>
          </ActionForm>
          {guests.length ? (
            <ul className="beta-list">
              {guests.map((g) => (
                <li key={g.id} className="row between">
                  <span>
                    {g.name} <span className="small muted">({g.status === "in" ? "in" : "waitlist"})</span>
                  </span>
                  <ActionForm action={removeGuestAction} className="" inline>
                    <input type="hidden" name="gameId" value={gameId} />
                    <input type="hidden" name="rsvpId" value={g.id} />
                    <SubmitButton className="btn sm">Remove</SubmitButton>
                  </ActionForm>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {viewer?.isAdmin ? (
        <details className="beta-tools">
          <summary>Admin settings (Dave and the list keeper)</summary>
          <ActionForm action={sheetOfficialAction} className="row">
            <input type="hidden" name="gameId" value={gameId} />
            <span className="small">
              Official list: <b>{game.sheetIsOfficial ? "Google Sheet" : "App RSVPs"}</b>
            </span>
            <SubmitButton className="btn sm" name="sheetIsOfficial" value={game.sheetIsOfficial ? "false" : "true"}>
              {game.sheetIsOfficial ? "Make app RSVPs official" : "Go back to the Google Sheet"}
            </SubmitButton>
          </ActionForm>
          <ActionForm action={gameSettingsAction}>
            <input type="hidden" name="gameId" value={gameId} />
            <input type="hidden" name="timezone" value={tz} />
            <div className="two">
              <label>
                Kick-off (ET)
                <input type="datetime-local" name="startsAt" defaultValue={utcToZonedInput(game.startsAt, tz)} />
              </label>
              <label>
                Cap (incl. hosts)
                <input type="number" name="cap" min={2} max={60} defaultValue={game.cap} />
              </label>
            </div>
            <label>
              Venue
              <input name="venue" defaultValue={game.venue} maxLength={120} />
            </label>
            <label>
              Fee model (set by the host)
              <input name="feeModel" defaultValue={game.feeModel} maxLength={120} />
            </label>
            <SubmitButton className="btn">Save game</SubmitButton>
          </ActionForm>
          <h4>Hosts</h4>
          <ul className="beta-list">
            {board.hosts.map((h) => (
              <li key={h.email} className="row between">
                <span>
                  {h.label ?? h.email} <span className="small muted">{h.label ? h.email : ""}</span>
                </span>
                <ActionForm action={removeHostAction} className="" inline>
                  <input type="hidden" name="gameId" value={gameId} />
                  <input type="hidden" name="email" value={h.email} />
                  <SubmitButton className="btn sm">Remove</SubmitButton>
                </ActionForm>
              </li>
            ))}
          </ul>
          <ActionForm action={addHostAction}>
            <input type="hidden" name="gameId" value={gameId} />
            <div className="two">
              <label>
                Host’s sign-in email
                <input type="email" name="email" required />
              </label>
              <label>
                Name
                <input name="label" maxLength={40} />
              </label>
            </div>
            <SubmitButton className="btn">Add host</SubmitButton>
          </ActionForm>
        </details>
      ) : null}

      <p className="small muted">
        Maletas is only a matchmaker. The hosts run this game; play at your own risk.{" "}
        {viewer ? <Link href="/beta">Your beta account</Link> : null}
      </p>
    </div>
  );
}
