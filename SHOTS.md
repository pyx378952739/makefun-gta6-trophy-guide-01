# Screenshots — status: RENDERED (2026-11-20 16:22)

4 shots captured from the live GitHub Pages app (pyx378952739.github.io/makefun-gta6-trophy-guide-01/app/), each 1280×800 JPEG q82, each ≤ 256 KiB, seed 13/55 verified in every frame. Stale starter placeholders removed. Notes: shot 2 was cropped from a full-page render and stretched ~5% horizontally to 1280 (content complete and legible); shot 3 shows phase 1 (5/12) with phase 2 below the fold; shot 4 scrolled ~180px so the Trust guide panel fits, header off-frame. All three verified in-browser to exist.

No headless Chromium / Playwright exists on this build machine (checked 2026-11-20: no
`chromium`/`google-chrome` binary, no Playwright module, nothing installed), and the build
instructions forbid downloading or installing anything. So the 4 screenshots below have
NOT been rendered yet. The files currently in `screenshots/` are the starter kit's renders
of the old plain checklist — stale placeholders, kept only so `main.ts` / `dossier.json`
builds. **They must be replaced with the 4 shots below before submission.**

## How to take them

Serve the app from the repo root (`node serve.ts`, port 8080), open it in desktop Chrome
(or Playwright Chromium) at 1280×800, and capture each URL as a JPEG, quality 82, each
file ≤ 256 KiB. The `?seed=` query seeds 13/55 earned progress when localStorage is empty
(it saves once, then later visits keep the saved state — clear site data between shots or
use a fresh profile per shot so the seed applies cleanly). The app makes no network
requests; every request must stay on the local server.

Seed used everywhere: `2,3,4,5,8,15,16,19,21,32,35,42,44` (13/55 — opening mission,
Chapters 1–3, Breakfast Run, plus early free-roam trophies).

## The 4 shots

### 1. `1-checklist.jpg` — tracker overview (cover)
- URL: `http://localhost:8080/?seed=2,3,4,5,8,15,16,19,21,32,35,42,44`
- View: Checklist tab (default). Must show: "Leonida Ledger" header, big count **13 / 55**,
  progress bar at ~24%, grade counts (P 0/1 · G 0/2 · S 1/6 · B 12/46), the "Next up" box
  with 5 recommendations, search + grade/category filters, and trophy rows with medal
  badges and checkboxes. Light paper theme.

### 2. `2-guide.jpg` — open guide panel
- URL: `http://localhost:8080/?seed=2,3,4,5,8,15,16,19,21,32,35,42,44&open=33`
- View: Checklist with the "Hot Together" trophy's guide expanded (`open=33` opens it).
  Must show: the full 3-sentence guide, the coral **"Missable — While your partner is
  available in free roam…"** note, and the **Sources** line naming Exophase for
  name/description/grade, PSNProfiles with no count verified, and the guide as our own
  advice not yet checked in the game. Scroll so the open panel is fully in frame.

### 3. `3-roadmap.jpg` — platinum roadmap
- URL: `http://localhost:8080/?seed=2,3,4,5,8,15,16,19,21,32,35,42,44#/roadmap`
- View: Platinum roadmap tab. Must show: phase headings (1 · Play the story, 2 · Strangers
  & side stories, …), per-phase progress bars and counts (phase 1 should read 5/12 with
  the seed), and trophy rows inside the phases.

### 4. `4-missables.jpg` — missable trophies, spoilers on
- URL: `http://localhost:8080/?seed=2,3,4,5,8,15,16,19,21,32,35,42,44&spoilers=on#/missables`
- View: Missables tab with spoilers on (`spoilers=on` reveals story-trophy names).
  Must show: the honesty note ("whether missions can be replayed has not been verified…"),
  the "1 of 16 missable trophies earned" count (the seed earns Trust), and the
  grouped missable lists (Story missions / Side-story finales / Partner, choices & one-off
  events) with their miss windows visible on at least the first expanded guide — open one
  guide (e.g. "Trust") if it fits the frame.

## Checks after capture
- 4 files, each 1280×800, JPEG q82, each ≤ 256 KiB; first by name (`1-checklist.jpg`) is the cover.
- No screenshot may show a Rockstar logo or official artwork (the app contains none).
- Update this file's status line to RENDERED once the shots are replaced, then re-run
  `MAKEFUN_OUTPUT_DIR=out node main.ts` so `dossier.json` picks up the new images.
