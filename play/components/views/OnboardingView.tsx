"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { POSITIONS } from "@/lib/types";
import { slugHandle } from "@/lib/format";
import { usePlay } from "@/lib/play-context";
import { MatchmakerNotice } from "../MatchmakerNotice";

export function OnboardingView({ nextPath }: { nextPath?: string }) {
  const { user, register, updateProfile } = usePlay();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const destination = nextPath ?? (user?.profile.handle ? `/players/${user.profile.handle}` : "/me");

  useEffect(() => {
    if (user && step === 1 && nextPath) router.replace(destination);
  }, [user, step, nextPath, destination, router]);

  async function onSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const input = {
      name,
      handle: String(formData.get("handle") ?? "").trim() || slugHandle(name),
      rolesLabel: String(formData.get("role") ?? "Player") as
        | "Player"
        | "Host"
        | "Player and host",
      position: String(formData.get("position") ?? "Utility") as (typeof POSITIONS)[number],
      city: String(formData.get("city") ?? "").trim(),
      zip: String(formData.get("zip") ?? "").trim(),
      social: String(formData.get("social") ?? "").trim(),
      bio: String(formData.get("bio") ?? "").trim(),
      privacy: (String(formData.get("privacy") ?? "public") === "friends-only"
        ? "friends-only"
        : "public") as "public" | "friends-only",
    };
    if (user) await updateProfile(input);
    else await register(input);
    router.push("/me");
  }

  return (
    <div className="wrap">
      <h2>Join / Sign up</h2>
      <p className="muted">Create a free player profile. It takes two short steps.</p>
      <p className="notice">
        Demo: accounts coming soon. For now this profile is saved only on this device — it is not a
        real account yet.
      </p>
      <MatchmakerNotice variant="signup" />
      <div className="chips" role="group" aria-label="Onboarding steps">
        <span className="chip" aria-pressed={step === 1}>
          1. Who you are
        </span>
        <span className="chip" aria-pressed={step === 2}>
          2. Player card
        </span>
      </div>
      <form
        className="form card"
        action={step === 1 ? undefined : onSubmit}
        onSubmit={
          step === 1
            ? (event) => {
                event.preventDefault();
                setStep(2);
              }
            : undefined
        }
      >
        <div hidden={step !== 1}>
          <label htmlFor="ob_name">
            Name
            <input
              id="ob_name"
              name="name"
              type="text"
              required
              autoComplete="name"
              defaultValue={user?.name ?? ""}
            />
          </label>
          <div className="two">
            <label htmlFor="ob_city">
              City
              <input
                id="ob_city"
                name="city"
                type="text"
                required
                defaultValue={user?.profile.city || "Jacksonville"}
              />
            </label>
            <label htmlFor="ob_zip">
              ZIP or postcode
              <input id="ob_zip" name="zip" type="text" defaultValue={user?.profile.zip ?? ""} />
            </label>
          </div>
          <label htmlFor="ob_role">
            I am a
            <select id="ob_role" name="role" defaultValue="Player">
              {["Player", "Host", "Player and host"].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <button className="btn primary" type="submit">
            Continue
          </button>
        </div>
        <div hidden={step !== 2}>
          <label htmlFor="ob_handle">
            Public handle
            <input
              id="ob_handle"
              name="handle"
              type="text"
              placeholder="your-name"
              defaultValue={user?.profile.handle ?? ""}
            />
          </label>
          <label htmlFor="ob_position">
            Position
            <select id="ob_position" name="position" defaultValue={user?.profile.position ?? "Utility"}>
              {POSITIONS.map((pos) => (
                <option key={pos}>{pos}</option>
              ))}
            </select>
          </label>
          <label htmlFor="ob_privacy">
            Profile privacy
            <select id="ob_privacy" name="privacy" defaultValue={user?.profile.privacy ?? "public"}>
              <option value="public">Public</option>
              <option value="friends-only">Friends only</option>
            </select>
          </label>
          <label htmlFor="ob_bio">
            Bio
            <textarea
              id="ob_bio"
              name="bio"
              maxLength={160}
              placeholder="Left foot, late runs."
              defaultValue={user?.profile.bio ?? ""}
            />
          </label>
          <label htmlFor="ob_social">
            Social link
            <input
              id="ob_social"
              name="social"
              type="url"
              placeholder="https://"
              defaultValue={user?.profile.social ?? ""}
            />
          </label>
          <div className="row">
            <button className="btn" type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn primary" type="submit">
              Create my player card
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
