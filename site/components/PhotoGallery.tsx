"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { photos } from "@/lib/content";

export function PhotoGallery() {
  const titleId = useId();
  const [active, setActive] = useState<(typeof photos)[number] | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <li
            key={photo.src}
            className={index === 0 ? "sm:col-span-2" : undefined}
          >
            <figure className="overflow-hidden rounded-3xl border border-pitch/10 bg-paper shadow-[0_16px_40px_rgba(16,38,28,0.08)]">
              <button
                type="button"
                className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turf"
                onClick={() => setActive(photo)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  className={`w-full object-cover ${index === 0 ? "max-h-80" : "max-h-[28rem]"}`}
                  sizes={index === 0 ? "100vw" : "(min-width: 640px) 50vw, 100vw"}
                />
              </button>
              <figcaption className="px-4 py-3 text-sm leading-relaxed text-ink-soft">
                {photo.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {active
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={() => setActive(null)}
            >
              <div
                className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-3xl bg-pitch p-3 text-cream shadow-2xl sm:p-4"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <p id={titleId} className="px-1 text-sm leading-relaxed">
                    {active.caption}
                  </p>
                  <button
                    type="button"
                    className="shrink-0 rounded-full bg-cream px-3 py-1 text-sm font-bold text-pitch"
                    onClick={() => setActive(null)}
                  >
                    Close
                  </button>
                </div>
                <Image
                  src={active.src}
                  alt={active.alt}
                  width={active.width}
                  height={active.height}
                  className="max-h-[75vh] w-full rounded-2xl object-contain"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
