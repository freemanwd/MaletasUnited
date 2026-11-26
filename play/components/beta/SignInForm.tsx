import Link from "next/link";
import { MATCHMAKER_SHORT } from "@/lib/legal";
import { signInAction } from "@/lib/beta/actions";
import { ActionForm, SubmitButton } from "./ActionForm";

export function SignInForm({ next, google, email }: { next: string; google: boolean; email: boolean }) {
  return (
    <ActionForm action={signInAction}>
      <input type="hidden" name="next" value={next} />
      <label className="check" htmlFor="beta-terms">
        <input id="beta-terms" name="terms" type="checkbox" required />
        <span>
          I agree that Maletas is only a matchmaker. It is not a nonprofit, host, field operator or organizer, and is
          not liable for anything involving players, hosts or fields. I play at my own risk.{" "}
          <Link href="/terms">Read the terms</Link>.
        </span>
      </label>
      <p className="small muted">{MATCHMAKER_SHORT}</p>
      {google ? (
        <SubmitButton name="provider" value="google">
          Continue with Google
        </SubmitButton>
      ) : null}
      {email ? (
        <>
          <label>
            Or get a sign-in link by email
            <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
          </label>
          <SubmitButton className="btn" name="provider" value="email">
            Email me a sign-in link
          </SubmitButton>
        </>
      ) : null}
      <p className="small muted">We never ask for or store a password.</p>
    </ActionForm>
  );
}
