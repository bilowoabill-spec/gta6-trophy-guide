// Leonida Trophy Guide — entrypoint for gta6-trophy-guide-01 (Node 22, stdlib only).
// The guide itself is plain static files under app/ (index.html, style.css, app.js
// and data/trophies.json): no build step, no network at run time. This program
// hands the entry in: it copies app/ and screenshots/ from beside this file into
// the output directory and writes /output/dossier.json with the kit's vendored
// make.fun library, which is what the judge reads. vendor/makefun-frontend.ts is
// the kit's copy and must stay unchanged — the scorer rebuilds the dossier with
// its own copy and compares the two byte for byte.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's caps: at most 4 screenshots of 256 KiB each, at most 993 files
// and 48 MiB in app/, and the dossier text capped at 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
