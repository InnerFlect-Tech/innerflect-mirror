/**
 * Static, captured-ahead-of-time thumbnails for the ecosystem board's
 * inspector panel (`/design/ecosystem`) — one PNG per `ECOSYSTEM_PAGES` entry,
 * named by page id so the board can reference `/ecosystem-thumbnails/<id>.png`
 * by convention, no registry field needed.
 *
 * In-repo pages are captured from a running dev server (`ECOSYSTEM_CAPTURE_BASE_URL`,
 * default `http://localhost:3000`); pages whose `href` is already an absolute
 * URL (Studio, Admin, the main website) are captured directly from their real
 * host. A page behind a sign-in wall captures whatever an unauthenticated
 * visitor sees (its sign-in screen) — never authenticated content — which is
 * the only thing this public repository could show anyway.
 *
 * Not yet wired into `npm run check` or a `capture:*` script — `package.json`
 * is under active claim. Run directly (dev server already running):
 *
 *   npx esbuild scripts/capture-ecosystem-thumbnails.ts --bundle --platform=node \
 *     --format=esm --outfile=node_modules/.cache/capture-ecosystem-thumbnails.mjs \
 *     --log-level=error --alias:@=. && node node_modules/.cache/capture-ecosystem-thumbnails.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ECOSYSTEM_PAGES } from '../lib/design/ecosystem';

const OUT_DIR = 'public/ecosystem-thumbnails';
const BASE_URL = process.env.ECOSYSTEM_CAPTURE_BASE_URL ?? 'http://localhost:3000';

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.ECOSYSTEM_CAPTURE_CHROME_PATH,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  let ok = 0;
  let failed = 0;
  for (const entry of ECOSYSTEM_PAGES) {
    const url = entry.href.startsWith('http') ? entry.href : BASE_URL + entry.href;
    const outPath = path.join(OUT_DIR, `${entry.id}.png`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // Fixed settle wait, not just a network-idle check — several of these
      // pages (the main website's hero included) fade content in with CSS/JS
      // after the document is otherwise idle, which network-idle wouldn't
      // catch and which produced a blank first-capture bug.
      await page.waitForTimeout(2000);
      await page.screenshot({ path: outPath });
      console.log(`ok    ${entry.id} <- ${url}`);
      ok++;
    } catch (err) {
      console.log(`FAIL  ${entry.id} <- ${url} — ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\n${ok} captured, ${failed} failed`);
  process.exit(failed > 0 && ok === 0 ? 1 : 0);
}

void main();
