/**
 * Public surfaces stay reachable, and stay in the system.
 *
 * Written after an axe pass found what nobody had noticed: `/open-mirror`,
 * `/shops/os` and `/shops/forge` each had zero outbound links. Three public
 * pages were dead ends, and no gate could tell, because every existing check
 * looked at the registry rather than at what the pages actually contain.
 *
 * These assertions are deliberately structural rather than visual — they read
 * the route files as text. That is enough to catch the class of regression
 * that happened here (a surface shipping with no way out of it), without
 * pretending a static check can judge a rendered page.
 *
 * Wired into `npm run check` as `check:surfaces`.
 */
import fs from 'node:fs';
import { ECOSYSTEM_PAGES } from '../lib/design/ecosystem';
import { SHOPS, allShopItems } from '../data/shops';

let failed = 0;
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed++;
};

// Every public, in-repo surface must carry the shared nav. Without it a
// visitor can arrive and not leave, which is how all three shipped.
const publicPages = ECOSYSTEM_PAGES.filter(
  (page) => page.access === 'public' && page.state === 'live' && !page.href.startsWith('http'),
);

check('There are public surfaces to check', publicPages.length > 0, `${publicPages.length} found`);

for (const page of publicPages) {
  const source = fs.existsSync(page.file) ? fs.readFileSync(page.file, 'utf8') : '';
  check(`Public page "${page.id}" has a way out of it`, source.includes('<PublicNav'), page.file);
  check(`Public page "${page.id}" declares a description`, /description:/.test(source), page.file);
}

// A catalogue item must have somewhere to go, and the route that serves it
// must exist. The list and the detail page are generated from one record, so
// this is really a check that the record still drives both.
const detailRoute = 'app/shops/[shop]/[item]/page.tsx';
check('The shop item route exists', fs.existsSync(detailRoute), detailRoute);

for (const { shop, item } of allShopItems()) {
  const entry = SHOPS[shop as keyof typeof SHOPS].items.find((i) => i.id === item);
  check(
    `Shop item "${shop}/${item}" names the layer it builds`,
    Boolean(entry?.buildsLayer),
    entry?.buildsLayer ?? 'no layer — an orphan in the catalogue',
  );
}

console.log(
  failed ? `\n${failed} check(s) failed` : '\nevery public surface is reachable and accounted for',
);
process.exit(failed ? 1 : 0);
