"use client";

import { useRouter } from "next/navigation";
import { FORMATS, REPEATS } from "@/lib/types";
import { usePlay } from "@/lib/play-context";

export function HostForm() {
  const { user, repo, closeModal, showToast } = usePlay();
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    if (!user) return;
    try {
      const game = await repo.createGame(
        {
          title: String(formData.get("title") ?? "").trim(),
          field: String(formData.get("field") ?? "").trim(),
          city: String(formData.get("city") ?? "").trim(),
          zip: String(formData.get("zip") ?? "").trim(),
          date: String(formData.get("date") ?? ""),
          time: String(formData.get("time") ?? "09:00"),
          repeat: String(formData.get("repeat") ?? "Weekly") as (typeof REPEATS)[number],
          format: String(formData.get("fmt") ?? "7v7") as (typeof FORMATS)[number],
          spots: Number(formData.get("spots") ?? 10),
          fee: String(formData.get("fee") ?? "").trim() || "Free",
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
          Field
          <input
            id="f_field"
            name="field"
            type="text"
            required
            placeholder="Field name or area (keep real addresses private)"
          />
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
            Fee per player
            <input id="f_fee" name="fee" type="text" placeholder="Free" />
          </label>
        </div>
        <p className="small muted">
          Maletas games are weekends, mostly Saturday mornings, and weeknights while there is
          daylight. Sundays are not used.
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
