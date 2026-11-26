"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlay } from "@/lib/play-context";
import { currentTab, TabIcon, TABS } from "./Icons";
import { Overlay } from "./Modals";


export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const tab = currentTab(pathname);
  const { user, openModal } = usePlay();

  return (
    <>
      <p className="demo-banner">
        Preview · matchmaker demo · sample data · Jacksonville is the first hub · not indexed yet
      </p>
      <header className="top">
        <div className="wrap">
          <Link className="logo" href="/" aria-label="Maletas home">
            <i />
            Maletas
          </Link>
          <nav className="main" aria-label="Sections">
            {TABS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                aria-current={tab === item.id ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="spacer" />
          <span className="row" style={{ flexWrap: "nowrap" }}>
            <ThemeToggle />
            <Link
              className="btn sm"
              href="/admin"
              aria-current={tab === "admin" ? "page" : undefined}
            >
              Admin
            </Link>
            {user ? null : (
              <button className="btn sm primary" type="button" onClick={() => openModal({ type: "signup" })}>
                Join
              </button>
            )}
          </span>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-foot">
        <div className="wrap">
          <p>
            Maletas is a matchmaker. It is not a nonprofit, not a host, and not liable for games,
            fields or players.{" "}
            <Link href="/terms">Terms / Disclaimer</Link>
            {" · "}
            <Link href="/vip">VIP</Link>
            {" · "}
            <Link href="/advertise">Advertise</Link>
          </p>
        </div>
      </footer>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={tab === item.id ? "page" : undefined}
          >
            <TabIcon name={item.id} />
            {item.label}
          </Link>
        ))}
      </nav>
      <Overlay />
    </>
  );
}

function ThemeToggle() {
  function cycle() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : current === "light" ? "" : "dark";
    if (next) {
      root.setAttribute("data-theme", next);
      localStorage.setItem("maletas-theme", next);
    } else {
      root.removeAttribute("data-theme");
      localStorage.removeItem("maletas-theme");
    }
  }

  return (
    <button className="btn sm" type="button" onClick={cycle} aria-label="Toggle color theme">
      Theme
    </button>
  );
}
