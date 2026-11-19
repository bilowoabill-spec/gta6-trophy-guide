# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/bilowoabill-spec/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/bilowoabill-spec/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy, with its official name, description and grade** exactly as PlayStation publishes them (list cross-checked against Exophase and PSNProfiles), plus a guide in our own words for each one: what to do, where and how, and when it can be missed.
- **Cited sources beside every guide** — chiefly PowerPyx's trophy guide and 100% checklist, GTABase's trophy guide, and Output Lag's trophy list. Where launch-week guides report a trigger as unconfirmed, this guide says so instead of inventing one.
- **Roadmap to the platinum** in five steps, built from the official descriptions: story chapters and missions, collectibles and their counts, in the order to earn them.
- **One missable trophy, flagged**: Positive Mental Attitude — Lucia's Chapter 1 balcony meditation disappears when Chapter 1 ends.
- **Tracker**: a checklist that saves in the browser (localStorage), exports to a file and imports back; filters for story, missable, collectibles, activities, online (there are none — all 55 are single-player), earned and still-to-do; a spoiler setting that hides story trophy names and descriptions until they are earned; search by name, mission or keyword.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Static files under `app/` only — no build step, no network at run time. `main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker
- `app/data/trophies.json` — all 55 trophies with official data, guides and sources
- `screenshots/` — 4 screenshots of the app running (the first by name is the cover)
- `main.ts` — the entry program; `vendor/makefun-frontend.ts` — the kit's library, unchanged
- `serve.ts` — a tiny static server for local testing

An unofficial fan guide. Grand Theft Auto and GTA are trademarks of Take-Two Interactive; this guide uses no Rockstar Games logo, artwork, box art or game screenshots.
