"use client";

import { FormEvent, useMemo, useState } from "react";
import { siteConfig } from "@/lib/site";

type Interest = "play" | "global" | "both";

const interestLabels: Record<Interest, string> = {
  play: "Playing on a Sunday morning",
  global: "The going-global app (hosts and players)",
  both: "Both — play locally and the future app",
};

type InterestFormProps = {
  defaultInterest?: Interest;
};

export function InterestForm({ defaultInterest = "play" }: InterestFormProps) {
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [interest, setInterest] = useState<Interest>(defaultInterest);
  const [note, setNote] = useState("");

  const mailto = useMemo(() => {
    const subject = `Maletas United interest — ${interestLabels[interest]}`;
    const body = [
      `Name: ${name || "(not given)"}`,
      `Email: ${fromEmail || "(not given)"}`,
      `Interest: ${interestLabels[interest]}`,
      "",
      note || "(no extra note)",
    ].join("\n");
    return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [fromEmail, interest, name, note]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.href = mailto;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="paper-grain rounded-3xl border border-pitch/10 p-5 shadow-[0_20px_50px_rgba(16,38,28,0.08)] sm:p-7"
    >
      <div className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-semibold text-pitch">
          Name
          <input
            className="h-12 rounded-2xl border border-pitch/15 bg-white px-4 text-base font-normal text-ink outline-none ring-turf/30 focus:border-turf focus:ring-4"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-pitch">
          Your email
          <input
            className="h-12 rounded-2xl border border-pitch/15 bg-white px-4 text-base font-normal text-ink outline-none ring-turf/30 focus:border-turf focus:ring-4"
            name="email"
            type="email"
            autoComplete="email"
            value={fromEmail}
            onChange={(event) => setFromEmail(event.target.value)}
          />
        </label>
        <fieldset className="grid gap-2">
          <legend className="text-sm font-semibold text-pitch">
            What are you writing about?
          </legend>
          {(Object.keys(interestLabels) as Interest[]).map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-pitch/10 bg-white px-4 py-3 text-sm"
            >
              <input
                className="mt-1"
                type="radio"
                name="interest"
                value={value}
                checked={interest === value}
                onChange={() => setInterest(value)}
              />
              <span>{interestLabels[value]}</span>
            </label>
          ))}
        </fieldset>
        <label className="grid gap-1.5 text-sm font-semibold text-pitch">
          Note (optional)
          <textarea
            className="min-h-28 rounded-2xl border border-pitch/15 bg-white px-4 py-3 text-base font-normal text-ink outline-none ring-turf/30 focus:border-turf focus:ring-4"
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-gold px-6 text-sm font-extrabold uppercase tracking-[0.12em] text-pitch shadow-[0_10px_24px_rgba(201,162,39,0.35)] hover:brightness-105"
      >
        Email the Maletas
      </button>
      <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
        This form does not store anything. It opens your email app to{" "}
        <a className="font-semibold underline" href={`mailto:${siteConfig.email}`}>
          {siteConfig.email}
        </a>
        .
      </p>
    </form>
  );
}
