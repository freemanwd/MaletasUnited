import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Big_Shoulders, Instrument_Sans } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import { ThemeScript } from "@/components/ThemeScript";
import { PlayProvider } from "@/lib/play-context";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_PLAY_URL ?? "https://maletas-play.vercel.app"),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Maletas",
    "pickup soccer",
    "Jacksonville soccer",
    "pickup football",
    "fútbol",
  ],
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  category: "sports",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f5c3a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1610" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full`}
      suppressHydrationWarning
    >
      <body>
        <ThemeScript />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <PlayProvider>
          <Suspense fallback={<ShellFallback />}>
            <AppShell>{children}</AppShell>
          </Suspense>
        </PlayProvider>
      </body>
    </html>
  );
}

function ShellFallback() {
  return (
    <header className="top">
      <div className="wrap">
        <span className="logo">
          <i />
          Maletas
        </span>
      </div>
    </header>
  );
}
