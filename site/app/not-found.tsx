import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-leather">
        Offside
      </p>
      <h1 className="mt-3 font-display text-4xl text-pitch">
        That page wandered off the pitch
      </h1>
      <p className="mt-4 text-ink-soft">
        No entrance fees here either. Try home, or email if you were looking to
        play.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gold px-6 text-sm font-extrabold uppercase tracking-[0.12em] text-pitch"
      >
        Back to Maletas United
      </Link>
    </div>
  );
}
