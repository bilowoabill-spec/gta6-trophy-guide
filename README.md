# Leonida Trophy Guide — GTA VI (PS5)

[![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/bilowoabill-spec/gta6-trophy-guide/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/bilowoabill-spec/gta6-trophy-guide/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **All 55 trophies** with their official names, descriptions and grades as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden), each with a guide written in this entry's own words and **cited sources** (GTABase, PlanetGTA6 / Exophase / PSNProfiles, OutputLag, KeenGamer / PowerPyx, WikiGTAVI). Where launch-era information is still unconfirmed, the guide says so instead of inventing a step.
- **Roadmap to the platinum** in four stages — story, character quests & strangers, 100% completion (A Long Road), clean-up — plus the one possibly missable trophy (Positive Mental Attitude) flagged in the roadmap, in the list, and in its guide.
- **Tracker**: tick trophies off; progress saves in the browser (localStorage), exports to a file and imports back. Filters for story, missable, collectibles, activities and online (there are no online trophies — all 55 are single-player), plus grade filter and search.
- **Spoiler setting**: hides the names and descriptions of story trophies until they are earned.
- **Offline**: static files under `app/` with no build step and no network requests at run time. Serve with `node serve.ts` and open http://localhost:8080.

## Layout

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — the 55 trophies: official name, description, grade, kind, hidden/missable flags, guide and sources.
- `main.ts` — hands the entry in: copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` via `buildDossier` from `vendor/makefun-frontend.ts` (kit copy, unchanged).
- `screenshots/` — real renders of the app in a browser.
- `serve.ts` — tiny static server for local testing.

## Run it

```sh
node serve.ts            # http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the entry
```

## License

MIT — see `LICENSE`.
