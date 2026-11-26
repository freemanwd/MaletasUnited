"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { TIER } from "@/lib/tier";
import { usePlay } from "@/lib/play-context";
import { currentTab, TabIcon, TABS } from "./Icons";
import { Overlay } from "./Modals";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const tab = currentTab(pathname);
  const { user } = usePlay();
  const profileHref = user?.profile.handle
    ? `/players/${user.profile.handle}`
    : user
      ? "/me"
      : "/signup";

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
            {TABS.map((item) => {
              const href = item.id === "me" ? profileHref : item.href;
              const label = item.id === "me" && !user ? "Join" : item.label;
              const current = item.id === "me" ? tab === "me" : tab === item.id;
              return (
                <Link key={item.id} href={href} aria-current={current ? "page" : undefined}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <span className="spacer" />
          <span className="row" style={{ flexWrap: "nowrap" }}>
            <a className="btn sm" href={siteConfig.marketingSiteUrl}>
              Website
            </a>
            <ThemeToggle />
            <Link
              className="btn sm"
              href="/admin"
              aria-current={tab === "admin" ? "page" : undefined}
            >
              Admin
            </Link>
            {user ? (
              <Link className="btn sm" href={profileHref} aria-current={tab === "me" ? "page" : undefined}>
                @{user.profile.handle || "me"}
              </Link>
            ) : (
              <Link className="btn sm primary join-cta" href="/signup" aria-label="Join / Sign up">
                <span className="join-short">Join</span>
                <span className="join-long">Join / Sign up</span>
              </Link>
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
            <Link href={TIER.path}>{TIER.name}</Link>
            {" · "}
            <Link href="/advertise">Advertise</Link>
            {" · "}
            <a href={siteConfig.marketingSiteUrl}>Maletas United website</a>
          </p>
        </div>
      </footer>
      <nav className="tabbar" aria-label="Sections">
        {TABS.map((item) => {
          const href = item.id === "me" ? (user ? profileHref : "/signup") : item.href;
          const label = item.id === "me" && !user ? "Join" : item.label;
          const current = item.id === "me" ? tab === "me" : tab === item.id;
          return (
            <Link key={item.id} href={href} aria-current={current ? "page" : undefined}>
              <TabIcon name={item.id} />
              {label}
            </Link>
          );
        })}
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
