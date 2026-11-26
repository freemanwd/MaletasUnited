"use client";

import { useRouter } from "next/navigation";
import { DEFAULT_HOST_TERMS, DEFAULT_HOST_WAIVER } from "@/lib/legal";
import { FORMATS, REPEATS, VISIBILITIES } from "@/lib/types";
import { usePlay } from "@/lib/play-context";
import { MatchmakerNotice } from "./MatchmakerNotice";

export function HostForm() {
  const { user, repo, closeModal, showToast } = usePlay();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    if (!user) return;
    try {
      const fee = String(formData.get("fee") ?? "").trim() || "Free";
      const game = await repo.createGame(
        {
          title: String(formData.get("title") ?? "").trim(),
          field: String(formData.get("field") ?? "").trim(),
          fieldPrivate: String(formData.get("fieldPrivate") ?? "").trim(),
          hideAddressUntilApproved: formData.get("hideAddress") === "on",
          city: String(formData.get("city") ?? "").trim(),
          zip: String(formData.get("zip") ?? "").trim(),
          date: String(formData.get("date") ?? ""),
          time: String(formData.get("time") ?? "09:00"),
          repeat: String(formData.get("repeat") ?? "Weekly") as (typeof REPEATS)[number],
          format: String(formData.get("fmt") ?? "7v7") as (typeof FORMATS)[number],
          spots: Number(formData.get("spots") ?? 10),
          fee,
          feePaidToHost: fee !== "Free",
          visibility: String(formData.get("visibility") ?? "public") as (typeof VISIBILITIES)[number],
          hostTerms: String(formData.get("hostTerms") ?? "").trim() || DEFAULT_HOST_TERMS,
          hostWaiver: String(formData.get("hostWaiver") ?? "").trim() || DEFAULT_HOST_WAIVER,
        },
        user,
      );
      closeModal();
      showToast("Your game is live and the sheet is open");
      router.push(`/games/${game.id}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not publish that game");
    }
  }

  return (
    <>
      <h2>Host a game</h2>
      <MatchmakerNotice variant="host" />
      <form className="form" action={onSubmit}>
        <label htmlFor="f_title">
          Game name
          <input
            id="f_title"
            name="title"
            type="text"
            required
            placeholder="Saturday morning 7s"
          />
        </label>
        <label htmlFor="f_field">
          Field (shown to everyone)
          <input
            id="f_field"
            name="field"
            type="text"
            required
            placeholder="Neighborhood or area"
          />
        </label>
        <label htmlFor="f_field_private">
          Exact address (optional)
          <input
            id="f_field_private"
            name="fieldPrivate"
            type="text"
            placeholder="Street address, shared after approval"
          />
        </label>
        <label className="check" htmlFor="f_hide">
          <input id="f_hide" name="hideAddress" type="checkbox" />
          <span>Hide the exact address until I approve a player</span>
        </label>
        <div className="two">
          <label htmlFor="hf_city">
            City
            <input
              id="hf_city"
              name="city"
              type="text"
              required
              defaultValue={user?.profile.city ?? "Jacksonville"}
            />
          </label>
          <label htmlFor="hf_zip">
            ZIP or postcode
            <input
              id="hf_zip"
              name="zip"
              type="text"
              required
              defaultValue={user?.profile.zip ?? "32204"}
            />
          </label>
        </div>
        <div className="two">
          <label htmlFor="f_date">
            First date
            <input id="f_date" name="date" type="date" required />
          </label>
          <label htmlFor="f_time">
            Kick-off
            <input id="f_time" name="time" type="time" required defaultValue="09:00" />
          </label>
        </div>
        <div className="two">
          <label htmlFor="f_repeat">
            Repeats
            <select id="f_repeat" name="repeat" defaultValue="Weekly">
              {REPEATS.map((repeat) => (
                <option key={repeat}>{repeat}</option>
              ))}
            </select>
          </label>
          <label htmlFor="f_fmt">
            Format
            <select id="f_fmt" name="fmt" defaultValue="7v7">
              {FORMATS.map((fmt) => (
                <option key={fmt}>{fmt}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="two">
          <label htmlFor="f_spots">
            Spots on the sheet
            <input id="f_spots" name="spots" type="number" min={2} max={40} required defaultValue={10} />
          </label>
          <label htmlFor="f_fee">
            Your fee
            <input id="f_fee" name="fee" type="text" placeholder="Free or an amount" />
          </label>
        </div>
        <p className="small muted">
          If you charge a fee, it is paid directly to you for now. Maletas does not collect it in
          this preview.
        </p>
        <label htmlFor="f_vis">
          Who can see and join
          <select id="f_vis" name="visibility" defaultValue="public">
            <option value="public">Public — anyone can join</option>
            <option value="vip">VIP only — Maletas VIP members</option>
            <option value="invite">Invite only — you approve each player</option>
          </select>
        </label>
        <label htmlFor="f_terms">
          Your terms
          <textarea id="f_terms" name="hostTerms" defaultValue={DEFAULT_HOST_TERMS} />
        </label>
        <label htmlFor="f_waiver">
          Your liability waiver (players must accept)
          <textarea id="f_waiver" name="hostWaiver" defaultValue={DEFAULT_HOST_WAIVER} />
        </label>
        <p className="small muted">
          Maletas games are weekends, mostly Saturday mornings, and weeknights while there is
          daylight. Sundays are not used. You, not Maletas, are the host.
        </p>
        <div className="row">
          <button className="btn primary" type="submit">
            Publish game and sheet
          </button>
          <button className="btn" type="button" onClick={closeModal}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
