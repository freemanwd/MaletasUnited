# Maletas United 2026 — World Cup Watch Party 🏆⚽

RSVP site for the Maletas United pickup soccer crew's **World Cup watch party on
Saturday, July 4, 2026**. Friends pick a game time (12 PM or 4 PM), confirm
Yes / Maybe / No, and add their name. Responses tally live and are stored in a
Google Sheet.

🔗 **Live site:** https://freemanwd.github.io/MaletasUnited/

## How it works
- **`index.html`** — the self-contained landing page (hosted free on GitHub Pages).
- **Google Sheet** — stores every RSVP; the page reads/writes it through a small
  Google Apps Script web app bound to the Sheet.
- The page shows a live headcount for each game time and embeds the results sheet.

## Setup (one time)
1. **Attach the writer script to the Sheet:** in the responses Google Sheet,
   open **Extensions → Apps Script**, paste in `apps-script-backend.gs`, then
   **Deploy → New deployment → Web app** (*Execute as: Me*, *Who has access: Anyone*).
   Copy the resulting Web app URL.
2. **Point the page at it:** in `index.html`, set `APPS_SCRIPT_URL` to that URL.
3. **Publish:** upload `index.html` here and enable **Settings → Pages**
   (Deploy from branch → `main` / root).

Full walkthrough: see `DEPLOY-GITHUB-PAGES.md`.

## Editing later
Re-upload `index.html` to update the page; the Pages link stays the same.

---
*Maletas United 2026 · Pickup soccer & World Cup believers · Maletas Awards voting coming soon 🏅*
