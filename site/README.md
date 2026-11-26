# Maletas United — marketing site

Modern, mobile-first site for the Jacksonville pickup soccer group.
Copy and photos come from the current Google Sites page at [maleta.net](https://www.maleta.net).

This app lives in `site/` so the existing GitHub Pages World Cup RSVP at the repo root (`index.html`, live at https://freemanwd.github.io/MaletasUnited/) stays untouched.

## Local

```bash
cd site
npm install
npm run dev
```

Production build:

```bash
cd site
npm run build
```

## Import into Vercel (Root Directory = `site`)

Do not change DNS from this repo. When you are ready to host the marketing site:

1. In Vercel, **Add New… → Project** and import `freemanwd/MaletasUnited`.
2. Set **Root Directory** to `site` (Framework Preset should detect Next.js).
3. Leave **Build Command** as `next build` / `npm run build` and **Output** as the Next.js default.
4. Optional: set `NEXT_PUBLIC_SITE_URL` to the canonical public URL (for example `https://www.maleta.net`) so the sitemap, robots, and Open Graph URLs match production.
5. Deploy. Do not point a domain at it until you intend to replace the current Google Sites page.

The site is indexable (`robots` allows all crawlers and emits `sitemap.xml`). The old Google Site used `noindex`.
