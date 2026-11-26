import Link from "next/link";
import { connection } from "next/server";
import { authReady, emailConfigured, googleConfigured } from "@/auth";
import { realSignupEnabled } from "@/lib/beta/flag";
import { hasDatabase } from "@/lib/db";
import {
  acceptTermsAction,
  issueVoucherAction,
  redeemVoucherAction,
  signOutAction,
  updateNameAction,
} from "@/lib/beta/actions";
import { getViewer, hostVoucherSummary, isHostAnywhere, myVipBadge } from "@/lib/beta/service";
import { ActionForm, SubmitButton } from "./ActionForm";
import { SignInForm } from "./SignInForm";

const DATE = { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" } as const;

function safeNext(raw: unknown): string {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/games/jax-glen-kernan";
}

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "That email already signed in another way. Use the same method as before.",
  Verification: "That sign-in link expired or was already used. Request a new one.",
  AccessDenied: "Sign-in was cancelled.",
  Configuration: "Sign-in isn’t fully set up on this preview yet.",
};

export async function BetaAccount({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const next = safeNext(params.next);

  if (!realSignupEnabled()) {
    return (
      <div className="card">
        <p>Real accounts are coming soon. For now, sign up for games on each host’s sheet.</p>
        <Link className="btn" href="/">
          Back to games
        </Link>
      </div>
    );
  }

  if (!authReady()) {
    const missing = [
      !hasDatabase() && "database (Neon Postgres)",
      !process.env.AUTH_SECRET && "AUTH_SECRET",
      !(googleConfigured() || emailConfigured()) && "a sign-in method (Google or email link)",
    ].filter(Boolean);
    return (
      <div className="card">
        <p>Real sign-up is almost ready for testing on this preview.</p>
        <p className="small muted">Still waiting on: {missing.join(", ")}.</p>
      </div>
    );
  }

  const viewer = await getViewer();
  const errorKey = typeof params.error === "string" ? params.error : "";
  const checkEmail = params.check === "email";

  if (!viewer) {
    return (
      <div className="card">
        <p>
          This is a private test of real sign-up for hosts and the list keeper. Sign in, then RSVP on the{" "}
          <Link href="/games/jax-glen-kernan">Glen Kernan game</Link>.
        </p>
        {checkEmail ? <p className="notice">Check your email for a sign-in link. It works for 30 minutes.</p> : null}
        {errorKey ? <p className="beta-error small">{ERRORS[errorKey] ?? "Sign-in didn’t work. Try again."}</p> : null}
        <SignInForm next={next} google={googleConfigured()} email={emailConfigured()} />
      </div>
    );
  }

  const [badge, host] = await Promise.all([myVipBadge(viewer), isHostAnywhere(viewer.email)]);
  const canHost = host || viewer.isAdmin;
  const vouchers = canHost && viewer.termsAccepted ? await hostVoucherSummary(viewer) : null;

  return (
    <>
      <div className="card">
        <div className="row between">
          <p>
            Signed in as <b>{viewer.displayName}</b> <span className="small muted">{viewer.email}</span>
          </p>
          <form action={signOutAction}>
            <button className="btn sm" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <p className="row">
          {canHost ? <span className="tag rec">Host</span> : <span className="tag">Player</span>}
          {viewer.isAdmin ? <span className="tag">Beta admin</span> : null}
          {badge ? (
            <span className="tag club">
              VIP guest of {badge.hostName} · until {badge.until.toLocaleDateString("en-US", DATE)}
            </span>
          ) : null}
        </p>

        {!viewer.termsAccepted ? (
          <ActionForm action={acceptTermsAction}>
            <label className="check" htmlFor="accept-terms">
              <input id="accept-terms" name="terms" type="checkbox" required />
              <span>
                I agree that Maletas is only a matchmaker and is not liable for anything involving players, hosts or
                fields. I play at my own risk. <Link href="/terms">Read the terms</Link>.
              </span>
            </label>
            <SubmitButton>Agree and continue</SubmitButton>
          </ActionForm>
        ) : (
          <p>
            <Link className="btn primary" href={next}>
              Go RSVP
            </Link>
          </p>
        )}

        <ActionForm action={updateNameAction}>
          <label>
            Name on the list
            <input name="displayName" defaultValue={viewer.displayName} maxLength={40} required />
          </label>
          <SubmitButton className="btn">Save name</SubmitButton>
        </ActionForm>
      </div>

      {viewer.termsAccepted ? (
        <div className="card">
          <h3>Redeem a VIP guest voucher</h3>
          <p className="small muted">A host can give you a 1-year voucher. It shows as “VIP guest of &lt;host&gt;”.</p>
          <ActionForm action={redeemVoucherAction}>
            <label>
              Voucher code
              <input name="code" placeholder="MAL-VIP-XXXX-XXXX" required />
            </label>
            <SubmitButton className="btn">Redeem</SubmitButton>
          </ActionForm>
        </div>
      ) : null}

      {vouchers ? (
        <div className="card">
          <h3>Guest vouchers</h3>
          <p className="small">
            {vouchers.remaining} of 25 left this year. Each voucher gives one guest a year as a VIP guest of you.
          </p>
          <ActionForm action={issueVoucherAction}>
            <input type="hidden" name="gameId" value="jax-glen-kernan" />
            <label>
              Note (optional, e.g. the guest’s name)
              <input name="note" maxLength={80} />
            </label>
            <SubmitButton className="btn" >Create a voucher</SubmitButton>
          </ActionForm>
          {vouchers.issued.length ? (
            <ul className="beta-list">
              {vouchers.issued.map((v) => (
                <li key={v.id} className="row between">
                  <span>
                    <code>{v.code}</code> {v.note ? <span className="small muted">· {v.note}</span> : null}
                  </span>
                  <span className="small muted">
                    {v.redeemedByName
                      ? `Redeemed by ${v.redeemedByName}`
                      : `Unused · redeem by ${v.redeemBy.toLocaleDateString("en-US", DATE)}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="small muted">
        Test only: this beta runs on preview links. Maletas is only a matchmaker and does not run games.
      </p>
    </>
  );
}
