"use client";

import { POSITIONS } from "@/lib/types";
import { rolesLabel, slugHandle } from "@/lib/format";
import { usePlay } from "@/lib/play-context";
import { MatchmakerNotice } from "./MatchmakerNotice";

export function ProfileForm() {
  const { user, register, updateProfile, closeModal } = usePlay();
  const editing = Boolean(user);

  async function onSubmit(formData: FormData) {
    const social = String(formData.get("social") ?? "").trim();
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
      social,
      bio: String(formData.get("bio") ?? "").trim(),
      privacy: (String(formData.get("privacy") ?? "public") === "friends-only"
        ? "friends-only"
        : "public") as "public" | "friends-only",
    };
    if (editing) await updateProfile(input);
    else await register(input);
  }

  return (
    <>
      <h2>{editing ? "Edit profile" : "Join Maletas"}</h2>
      <MatchmakerNotice variant="signup" />
      <form className="form" action={onSubmit}>
        <label htmlFor="f_name">
          Name
          <input
            id="f_name"
            name="name"
            type="text"
            required
            autoComplete="name"
            defaultValue={user?.name ?? ""}
          />
        </label>
        <label htmlFor="f_handle">
          Public handle
          <input
            id="f_handle"
            name="handle"
            type="text"
            required
            defaultValue={user?.profile.handle ?? ""}
            placeholder="your-name"
          />
        </label>
        <div className="two">
          <label htmlFor="f_role">
            I am a
            <select id="f_role" name="role" defaultValue={user ? rolesLabel(user.roles) : "Player"}>
              {["Player", "Host", "Player and host"].map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label htmlFor="f_position">
            Position
            <select
              id="f_position"
              name="position"
              defaultValue={user?.profile.position ?? "Utility"}
            >
              {POSITIONS.map((pos) => (
                <option key={pos}>{pos}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="two">
          <label htmlFor="f_city">
            City
            <input
              id="f_city"
              name="city"
              type="text"
              required
              defaultValue={user?.profile.city ?? "Jacksonville"}
            />
          </label>
          <label htmlFor="f_zip">
            ZIP or postcode
            <input id="f_zip" name="zip" type="text" defaultValue={user?.profile.zip ?? ""} />
          </label>
        </div>
        <label htmlFor="f_privacy">
          Profile privacy
          <select id="f_privacy" name="privacy" defaultValue={user?.profile.privacy ?? "public"}>
            <option value="public">Public — anyone can read your card</option>
            <option value="friends-only">Friends only</option>
          </select>
        </label>
        <label htmlFor="f_social">
          Social link
          <input
            id="f_social"
            name="social"
            type="url"
            placeholder="https://instagram.com/you"
            defaultValue={user?.profile.social ?? ""}
          />
        </label>
        <label htmlFor="f_bio">
          Bio
          <textarea
            id="f_bio"
            name="bio"
            maxLength={160}
            placeholder="Left foot, late runs, brings the ball."
            defaultValue={user?.profile.bio ?? ""}
          />
        </label>
        <p className="small muted">
          Demo: accounts coming soon. Your profile is saved only on this device for now — it is not
          a real account yet. Public profiles live at /players/your-handle.
        </p>
        <div className="row">
          <button className="btn primary" type="submit">
            {editing ? "Save" : "Create my player card"}
          </button>
          <button className="btn" type="button" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
