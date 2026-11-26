import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap">
      <h2>Page not found</h2>
      <p className="muted">That sheet is not on this pitch.</p>
      <Link className="btn pitch" href="/">
        Back to games
      </Link>
    </div>
  );
}
