import type { Metadata } from "next";
import { PhotoGallery } from "@/components/PhotoGallery";

export const metadata: Metadata = {
  title: "Photos over the years",
  description:
    "Maletas United photos: the 2016 group, Maleta Supreme awards around 2018 and 2023, and the Nov 4th 2023 awards at Fogo de Chao.",
  alternates: { canonical: "/photos" },
};

export default function PhotosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-leather">
        From the existing album
      </p>
      <h1 className="mt-3 font-display text-4xl text-pitch sm:text-5xl">
        Photos over the years
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
        Captions are the ones from the current site. Tap a photo to open it
        larger.
      </p>
      <div className="mt-10">
        <PhotoGallery />
      </div>
    </div>
  );
}
