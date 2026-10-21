// Post-build check for the generated static pages (see seo-pages.ts). Run by the deploy workflow after
// `npm run build`: node scripts/verify-routes.mjs [dist]. Exits non-zero, listing every failure, so a broken
// route page, sitemap or 404 document cannot be published. Node built-ins only.
//
// EXPECTED is written out in full on purpose: it is an independent check of the plugin, not a copy of its logic.
// When a page is added, add it here as well (the check then fails until both agree).
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.argv[2] || 'dist');
const SITE = 'https://cdsid10.github.io';
const NAME = 'Siddhant Rathor';

const EXPECTED = [
  { file: 'index.html', url: `${SITE}/`, title: NAME, description: 'Game design portfolio of Siddhant Rathor. Featured work: Katavader, Self Apart, Mobile Releases.' },
  { file: 'project/katavader/index.html', url: `${SITE}/project/katavader/`, title: `Katavader | ${NAME}`, description: 'A combat-focused action RPG where every encounter demands a decision.' },
  { file: 'project/selfapart/index.html', url: `${SITE}/project/selfapart/`, title: `Self Apart | ${NAME}`, description: 'A chaotic physics-puzzler where you play as Mr. Limbs, a fragmented monster trying to rebuild his body piece by piece.' },
  { file: 'other-works/index.html', url: `${SITE}/other-works/`, title: `Archive | ${NAME}`, description: 'A curated collection of personal projects, competitive game jam prototypes, and professional commercial releases developed over the years.' },
  { file: 'mobile-works/index.html', url: `${SITE}/mobile-works/`, title: `Mobile Releases | ${NAME}`, description: 'A dedicated showcase of professional mobile titles and experimental works published across iOS and Android platforms.' },
];

const failures = [];
const fail = (msg) => failures.push(msg);
const read = (rel) => {
  const p = path.join(DIST, rel);
  if (!fs.existsSync(p)) { fail(`missing file: ${rel}`); return null; }
  return fs.readFileSync(p, 'utf8');
};
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const tag = (html, re) => { const m = html.match(re); return m ? decode(m[1]) : null; };
const expectEq = (label, actual, expected) => { if (actual !== expected) fail(`${label}: expected "${expected}", got ${actual === null ? 'nothing' : `"${actual}"`}`); };
const assets = (html) => [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1]).sort().join(' ');

// 1. Every route page: file exists, correct title / description / canonical / og:url / twitter, one canonical, app shell.
const home = read('index.html');
for (const e of EXPECTED) {
  const html = read(e.file);
  if (html === null) continue;
  const at = e.file;
  expectEq(`${at} <title>`, tag(html, /<title>([^<]*)<\/title>/), e.title);
  expectEq(`${at} description`, tag(html, /<meta name="description" content="([^"]*)"/), e.description);
  expectEq(`${at} canonical`, tag(html, /<link rel="canonical" href="([^"]*)"/), e.url);
  expectEq(`${at} og:url`, tag(html, /<meta property="og:url" content="([^"]*)"/), e.url);
  expectEq(`${at} og:title`, tag(html, /<meta property="og:title" content="([^"]*)"/), e.title);
  expectEq(`${at} og:description`, tag(html, /<meta property="og:description" content="([^"]*)"/), e.description);
  expectEq(`${at} twitter:title`, tag(html, /<meta name="twitter:title" content="([^"]*)"/), e.title);
  const image = tag(html, /<meta property="og:image" content="([^"]*)"/);
  if (!image || !image.startsWith(`${SITE}/images/`)) fail(`${at} og:image should be an absolute ${SITE}/images/ URL, got ${image}`);
  else if (!fs.existsSync(path.join(DIST, decodeURI(image.slice(SITE.length))))) fail(`${at} og:image points at a file that is not in the build: ${image}`);
  if ((html.match(/rel="canonical"/g) || []).length !== 1) fail(`${at} must have exactly one canonical`);
  if (/name="robots"[^>]*noindex/.test(html)) fail(`${at} must not be noindex`);
  if (!html.includes('<div id="root"></div>')) fail(`${at} is missing the app root`);
  if (home && assets(html) !== assets(home)) fail(`${at} loads different script/style assets than index.html`);
}

// 2. Dedicated 404 document: noindex, not-found copy, and none of the page or social metadata.
const nf = read('404.html');
if (nf !== null) {
  expectEq('404.html <title>', tag(nf, /<title>([^<]*)<\/title>/), `Page not found | ${NAME}`);
  if (!/<meta name="robots" content="noindex"/.test(nf)) fail('404.html must contain noindex');
  if (/rel="canonical"/.test(nf)) fail('404.html must not have a canonical');
  if (/property="og:|name="twitter:/.test(nf)) fail('404.html must not have Open Graph or Twitter tags');
  if (/Featured work:/.test(nf)) fail('404.html carries the Home description');
  if (!nf.includes('<div id="root"></div>')) fail('404.html is missing the app root (the wildcard NotFound route needs it)');
  if (home && assets(nf) !== assets(home)) fail('404.html loads different script/style assets than index.html');
}

// 3. Sitemap lists exactly the expected canonical URLs; robots.txt points at it.
const sitemap = read('sitemap.xml');
if (sitemap !== null) {
  const locs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decode(m[1]));
  const want = EXPECTED.map((e) => e.url);
  for (const u of want) if (!locs.includes(u)) fail(`sitemap.xml is missing ${u}`);
  for (const u of locs) if (!want.includes(u)) fail(`sitemap.xml lists an unexpected URL: ${u}`);
}
const robots = read('robots.txt');
if (robots !== null) {
  if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail('robots.txt does not point at the sitemap');
  if (/^\s*Disallow:\s*\/\s*$/m.test(robots)) fail('robots.txt disallows the whole site');
}

// 4. The font files the CSS refers to are in the build.
for (const f of ['fonts/inter-latin-var.woff2', 'fonts/roboto-latin-var.woff2']) {
  if (!fs.existsSync(path.join(DIST, f))) fail(`missing file: ${f}`);
}

if (failures.length) {
  console.error(`verify-routes: ${failures.length} problem(s) in ${DIST}`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`verify-routes: OK (${EXPECTED.length} route pages, 404.html, sitemap.xml, robots.txt, fonts)`);
