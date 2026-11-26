"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Crest } from "@/components/Crest";
import { PlayLink } from "@/components/PlayLink";
import { nav } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-pitch/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turf"
        >
          <Crest className="h-11 w-11 shrink-0" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight text-pitch">
              Maletas United
            </span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-leather">
              Jacksonville, FL
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-pitch text-cream"
                    : "text-ink-soft hover:bg-mist hover:text-pitch"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <PlayLink className="ml-1 inline-flex items-center gap-2 rounded-full bg-gold px-3.5 py-2 text-sm font-extrabold text-pitch">
            {siteConfig.playNavLabel}
            <span className="rounded-full bg-pitch px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
              Beta
            </span>
          </PlayLink>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-pitch/15 bg-paper text-pitch xl:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open ? (
        <div
          id={menuId}
          className="border-t border-pitch/10 bg-paper px-4 py-4 xl:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-4 py-3 text-base font-semibold ${
                    active ? "bg-pitch text-cream" : "text-ink hover:bg-mist"
                  }`}
                onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <PlayLink
              className="mt-2 inline-flex items-center justify-between rounded-2xl bg-gold px-4 py-3 text-base font-extrabold text-pitch"
              onClick={() => setOpen(false)}
            >
              {siteConfig.playNavLabel}
              <span className="rounded-full bg-pitch px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                Beta
              </span>
            </PlayLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
