# BASELINE.md

Measured baseline for https://cdsid10.github.io/, taken 2026-10-21 against source commit `fa79853` (`main`). Read this together with [AUDIT.md](AUDIT.md). Nothing in this file was estimated unless it says so.

## 1. Tooling actually used

| Tool | Version | Used for |
|---|---|---|
| Google Chrome (headless, driven over the DevTools Protocol by throwaway Node scripts using Node's built-in `WebSocket`/`fetch`) | 155.0.8059.85 | Rendering, screenshots, network, Performance/PerformanceObserver metrics, keyboard and wheel input, accessibility-tree-adjacent DOM checks |
| Node / npm | 24.14.0 / 11.9.0 | `tsc`, `vite build`, `npm audit`, `npm outdated`, probe scripts |
| `curl` | system | Response headers, status codes, external-link checks |
| TypeScript, Vite, Tailwind | 5.8.3, 6.4.1, 4.2.2 (already in `node_modules`) | Type-check and production build |

**Not used (not installed, and not installed for this audit):** Lighthouse, axe-core, Playwright, Chrome DevTools MCP, any screen reader, Safari, Firefox, real mobile devices. Lighthouse category scores (Performance, Accessibility, SEO, Best Practices) were therefore **not produced**, and none are quoted anywhere in the reports.

The vendored `web-quality-audit`, `accessibility`, `core-web-vitals`, `performance` and `seo` skills were loaded and used as checklists and threshold references. The seven custom `/…` skills are manual-only and could not be invoked by the assistant. See section 8.

The probe scripts live in the session scratchpad (`…\scratchpad\scripts\*.mjs`, outputs in `…\scratchpad\out\`), which is temporary. They can be committed to the repo as `scripts/audit/` if you approve.

## 2. Test conditions

- Machine: Windows 11, one residential connection to GitHub Pages' CDN (Fastly). Timings depend on that path and are **noisy** (see section 4 variance).
- Every page load: **cold cache** (`Network.setCacheDisabled`), new tab, no extensions, throwaway profile.
- Viewports: desktop 1440×900 @1×; mobile 390×844 @2.625 with touch emulation (device emulation only, not a real phone).
- "Throttled" = Chrome DevTools emulation of **1.6 Mbps down / 150 ms RTT + 4× CPU slowdown**. This is similar to, but not identical to, Lighthouse's simulated throttling, so numbers are not comparable with Lighthouse scores.
- Themes: light and dark through `prefers-color-scheme` emulation. Reduced motion through `prefers-reduced-motion: reduce` emulation.
- All figures are **lab data**. No field data (CrUX/RUM) was available or collected.
- The site was read-only throughout. No forms exist. No third-party system was tested beyond one GET of each public link.

## 3. Build, type-check and dependency results

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passes, no errors (5.2 s). **Caveat:** `tsconfig.json` has no `"strict"`, so this is a weak check. There are 48 `any` uses in `src/`. |
| `npx vite build` (output redirected to scratchpad; repo `dist/` untouched) | Succeeds in 5.7 s, 2,402 modules. |
| Build warnings | (1) CSS: `@import rules must precede all rules aside from @charset and @layer statements` (the Google Fonts `@import`). (2) Chunk > 500 kB after minification. |
| JS bundle | `index-*.js` **868.94 kB raw / 267.10 kB gzip**, a single chunk. |
| CSS bundle | `index-*.css` **57.09 kB raw / 9.50 kB gzip**. |
| Local build vs live | JS is byte-identical in size to live (868,936 B). CSS differs by 887 B (56,203 live vs 57,090 local), consistent with a different Tailwind patch version locally (4.2.2 local; CI resolves from the lockfile). Source vs live behaviour agreed in every test. |
| `npm audit` | 12 findings: 1 critical, 8 high, 2 moderate, 1 low. Direct: `vite` (high), `react-router-dom` (high). The critical is `protobufjs`, pulled in by **`@google/genai`, which nothing in `src/` imports**. `ws` (high) comes from the same package. Others are transitive (`postcss`, `nanoid`, `browserslist`, `source-map-js`, `@babel/core`). All report "fix available". This is a static site with no server code. Exposure of most items is dev/build-time only (not verified per advisory). |
| `npm outdated` | Behind: React/ReactDOM 19.2.4 → 19.3.1, react-router-dom 7.13.2 → 7.18.4, vite 6.4.1 → 6.4.5 (wanted), Tailwind 4.2.2 → 4.3.3, motion 12.38 → 12.43; major bumps available for `@google/genai`, `dotenv`, `lucide-react`, `motion`, `typescript`, `vite`. |
| Tests / linters | None. No test runner, ESLint or Prettier in the project. CI (`deploy.yml`) runs `npm ci` and `npm run build` only (Node 20; local is Node 24). |
| Secrets | Pattern scan of the tree found no keys or tokens. README references `GEMINI_API_KEY`, but no code reads it. `.env*` files are gitignored and none exist. |

## 4. Performance measurements (lab)

### 4.1 First load, cold cache, single run per row (2026-10-21)

| Page / profile | FCP | LCP (element) | CLS | TBT≈ | Transfer | Requests |
|---|---|---|---|---|---|---|
| `/` desktop, unthrottled | 992 ms | 1,344 ms (Katavader hero `<img>`) | 0 | 0 | 968 KB | 7 |
| `/` desktop, dark | 680 ms | 2,160 ms (same image) | 0 | 0 | 953 KB | 6 |
| `/` desktop, throttled | 2,176 ms | 2,176 ms (sidebar brand text) | 0 | 303 ms | 953 KB | 6 |
| `/` mobile, unthrottled | 640 ms | 3,652 ms (hero image) | 0 | 0 | 953 KB | 6 |
| `/` mobile, throttled | 2,352 ms | 5,892 ms (hero image) | 0 | 405 ms | 953 KB | 6 |
| `/project/katavader` desktop | 3,392 ms | 3,392 ms (brand text) | 0 | 2,423 ms (2 long tasks) | 3,045 KB | 9 |
| `/project/katavader` mobile, throttled | 4,436 ms | 6,256 ms | 0 | 911 ms | 613 KB at capture (videos still loading) | 9 |
| `/project/selfapart` desktop | 1,860 ms | 3,452 ms | 0 | 9 ms | 469 KB | 4 |
| `/other-works` desktop | 768 ms | 2,092 ms | 0 | 0 | 693 KB | 13 |
| `/other-works` mobile | 2,596 ms | 5,344 ms | 0 | 0 | 1,067 KB | 13 |
| `/mobile-works` desktop | 1,212 ms | 1,616 ms | 0 | 0 | 1,054 KB | 7 |
| `/about`, `/contact`, `/resume` | 0.9–2.3 s | 1.9–3.3 s | 0 | 0 | 273 KB | 3 |

TBT is approximated as the sum of (long task − 50 ms) from the Long Tasks API. It is not Lighthouse TBT.

### 4.2 Variance (5 runs each, cold cache)

| Config | LCP range (median) | FCP range (median) | TBT≈ range | Transfer |
|---|---|---|---|---|
| `/` desktop, unthrottled | 696–5,460 ms (3,860) | 696–2,088 ms (988) | 0 | 457–953 KB |
| `/` mobile, slow-4G + 4× CPU | 2,572–5,864 ms (5,708) | 2,156–2,364 ms (2,176) | 279–299 ms | 614–953 KB |
| `/project/katavader` desktop | 1,980–5,488 ms (2,676) | 928–2,764 ms (1,720) | 53–60 ms | 613 KB at capture |
| `/project/katavader` mobile, slow-4G + 4× CPU | 5,084–7,884 ms (7,612) | 2,804–4,296 ms (3,404) | 800–821 ms | 613 KB at capture |

**Interpretation limits:** the spread (up to 8×) means single numbers in 4.1 are indicative only. LCP is sensitive to when the lazily-loaded hero image is requested. The CLS result (0 on every page and profile) was stable. Do not treat any row as pass/fail against Core Web Vitals, since those are defined on field p75.

### 4.3 Interaction responsiveness (INP proxy)

Synthetic clicks at 4× CPU on `/` desktop: theme toggle, scroll-dot, sidebar nav links, page click. Five interactions, worst `click` duration **48 ms** (input delay ≤ 2 ms, processing ≤ 17 ms). All well under 200 ms. This is a small synthetic sample and not field INP.

### 4.4 Resources

| Item | Value |
|---|---|
| HTML shell | 474 B, empty `<div id="root">`, no `<noscript>` |
| Fonts requested at runtime | **0** (see AUDIT ENG-01). `document.fonts.size = 0`; the page renders in Segoe UI (system). |
| Home first view | JS 263 KB (gz) + CSS 10 KB (gz) + 3 images 679 KB. First card hero `Level_5_SS_NEW.webp` 339 KB, `loading="lazy"`. |
| Images (public) | 9.6 MB total, all WebP. Largest: `Katavader/Blog/Unity_Final_Concept.webp` 1.67 MB; then 474 KB, 386 KB, 347 KB. Card thumbnails are 2560×1440 rendered at ~904 px wide desktop (2.8×), 469 px in Archive (4–5.5×), 342 px on mobile Home (7.5×). The file `Mobile/Level_5_SS_NEW_Mobile.webp` is byte-identical in size (346,942 B) to the desktop file. |
| Videos (public) | 16 MB, five MP4s: 7.0 MB, 4.3 MB, 2.3 MB, 1.3 MB, 1.2 MB. All 5 start downloading when `/project/katavader` opens on desktop: **2,433 KB transferred in the first seconds**. They are muted looping `<video autoplay>` with `preload="metadata"`, no poster, no controls, no captions track. |
| Caching | `Cache-Control: max-age=600` on every response, including content-hashed assets and 7 MB videos (GitHub Pages default; not configurable on this host). |
| Compression | gzip on HTML/JS/CSS; images and video are not recompressible. |
| Transport | HTTPS with HSTS (`max-age=31556952`). |

## 5. Accessibility measurements (automated-style DOM checks + manual keyboard probes)

These are custom checks run in Chrome, **not** axe or Lighthouse. Contrast was computed from computed styles (colour × ancestor opacity over the nearest opaque background). Elements with ancestor opacity 0 (Home sections not yet scrolled into view) were excluded as false positives.

| Check | Result |
|---|---|
| Contrast, light theme | "Dark Mode" label **1.99:1** (10 px); Archive eyebrow **1.95:1** (14 px); sidebar "Featured Works" heading **2.44:1** (12 px); copyright **2.62:1** (9 px); "Source" links **2.51:1** (12 px); inactive nav links **3.36:1** (14 px); "GAME DESIGNER" **3.54:1**; muted small text **3.4:1**. AA requires 4.5:1 for these sizes. |
| Contrast, dark theme | "Light Mode" **2.57:1**; "More" **3.31:1**; "Game Design Portfolio" **3.59:1**; inactive nav (e.g. Behance) **4.19:1**. |
| Landmarks | `main` ×1, `aside` ×1, `header` ×1–2, `nav` ×2 **without labels**, `footer` ×0, skip link: none. |
| Headings | Project page: **3 `h1`** (sidebar brand, project title, first markdown heading) and `h3` nav labels before the first `h1`. Mobile Home: **no `h1`**. Archive and Mobile Releases: `h1` is commented out in source; the only `h1` is the sidebar brand on desktop. |
| Unnamed controls (Home desktop) | 3 scroll-indicator `<button>`s with no accessible name; each 16 px wide (42/16/16 px tall). |
| Hidden-but-tabbable (390 px viewport) | 11 drawer links sit at x = −220 px with the drawer closed and receive keyboard focus (Tab stops 4–14). The menu toggle has no `aria-expanded`/`aria-controls`. Escape does not close the drawer. |
| Project page tab order | 45+ stops. 22 markdown images are focusable (`tabindex=0`, added by Motion's `whileTap`). Pressing **Enter or Space on a focused image does not open the lightbox**. |
| Gallery fullscreen | No `role=dialog`/`aria-modal`; focus stays behind the overlay; Tab moves through the page underneath; Escape closes. |
| Doc modal | No `role=dialog`; focus not moved in; **Escape does not close it**. |
| Focus indicator | Browser default (`outline: auto 1px`) is present on all tested stops. No custom `:focus-visible` styling exists. |
| Keyboard scrolling on Home | With nothing focused, ArrowDown / PageDown / Space / End scroll **0 px**. After one click on the page, ArrowDown and PageDown advance one section. |
| Reduced motion | With `prefers-reduced-motion: reduce`, the infinite `master-shine` animation keeps running. No `prefers-reduced-motion` rule exists in the built CSS. |
| Target size < 24 px | Home scroll dots 16 px; gallery dots 18 px (adjacent); mobile scroll arrows 20×20; theme toggle (mobile) 20×28; Archive "Source" links 75×18 (isolated, likely pass the spacing exception). |
| Reflow | No horizontal overflow at 320, 360, 390, 768, 1024, 1280, 1920 px on `/`, `/project/katavader`, `/other-works`. |
| Images | `alt` present on all inspected images (14 `alt=` in source plus markdown alt text). Quality of alt text not reviewed in depth. |
| Videos | 5 autoplaying muted loops, no controls and no keyboard-accessible pause (click-only wrapper `div`). |
| Screen reader | **Not tested.** |

## 6. Network, routing and SEO measurements

| Check | Result |
|---|---|
| `GET /` | 200, `text/html`, 474 B. |
| `GET /project/katavader`, `/about`, `/other-works` (any non-root route) | **HTTP 404** with the SPA shell as body (GitHub Pages serves `404.html`, a copy of `index.html`). The app renders in a browser, but the status is 404. |
| `GET /robots.txt`, `/sitemap.xml`, `/favicon.ico` | 404 (HTML 404 body). |
| Unknown route (`/does-not-exist`) | App redirects client-side to Home (`<Navigate to="/" replace/>`); status 404. |
| `<title>` | Static shell title "Siddhant Rathor"; per-route titles set client-side ("Home \| …", "Katavader \| …", "Archive \| …"). |
| Meta description, canonical, Open Graph, Twitter card, `theme-color`, JSON-LD | **All absent.** `lang="en"` and viewport present. |
| External links (35 unique URLs from source) | 33 × 200, 1 × 999 (LinkedIn, bot-blocking, not a defect), **1 × 404**: `https://thegdwc.com/pages/game.php?game_guid=6bfe1aaf-…` (`src/data/projects.ts:624`). |

## 7. Visual and behavioural records

- Screenshots captured (desktop and mobile, light and dark, hover bloom, fullscreen gallery, doc modal, mobile drawer, 320 px and 1024 px reflow, Archive, About/Contact/Resume). Stored in the scratchpad `out/` folder. Not committed.
- **Theme flash (dark-mode visitors):** first paint at 56 ms is a blank `#FAFAFA` page; the `dark` class is applied at 1,663 ms (1× CPU) or 2,465 ms (4× CPU), at the same moment the first content paints. The "flash" is a light blank frame before content in dark OS mode. The size of the effect depends on JS load time.
- **Wheel behaviour (synthetic):** one `wheel` event with `deltaY = 2` advanced a full section (900 px). A 70-event stream of `deltaY = 3` at 16 ms intervals (~1.1 s, similar to a trackpad inertia tail) advanced **2 sections**. Real trackpad hardware was not tested.
- **Sidebar focus loss:** after tabbing to "Self Apart" and scrolling to the next Home section, `document.activeElement` became `body`.
- **Layout geometry (1440 px):** sidebar right edge 300 px, content wrapper left edge 280 px (a 20 px overlap).

## 8. Skill and tool usage record

| Item | Status |
|---|---|
| `web-quality-audit`, `accessibility`, `core-web-vitals`, `performance`, `seo` (vendored, project-local) | **Loaded via the Skill tool** and used as checklist and threshold references. They also describe Lighthouse/DevTools-MCP routes that were unavailable. |
| `game-design` (user-level) | **Loaded** and applied to the gamification section of AUDIT.md (5-component filter, Numbers Policy). |
| `/frontend-review`, `/ui-ux-review`, `/accessibility-audit`, `/performance-audit`, `/technical-seo`, `/visual-qa`, `/gamification-design` (custom, manual-only) | **Not invoked.** The harness refuses assistant invocation of `disable-model-invocation` skills ("reserved for explicit user invocation"). The audit followed the prompt's own phases, not those skill files. You can run any of them yourself to cross-check. |
| Taste (`Leonxlnx/taste-skill`), Impeccable (`pbakaus/impeccable`), Emil Kowalski (`emilkowalski/skills`) | **Researched and read from read-only clones; not installed or invoked.** Emil Kowalski's published motion standards were used as a reference rubric for the motion review. See AUDIT.md section 9. |
| Chrome DevTools MCP, Playwright, Lighthouse | Not installed or run. |

## 9. Missing measurements and how to get them

| Gap | How to obtain |
|---|---|
| Lighthouse (mobile + desktop) for Performance/A11y/SEO/Best Practices | Run in Chrome DevTools, or approve the pinned, isolated Chrome DevTools MCP (see AUDIT_SETUP.md section 4). Repeat 5× and report the median. |
| Field Core Web Vitals | Check PageSpeed Insights / CrUX for the origin. A low-traffic site may have no data, in which case add a minimal first-party `web-vitals` beacon (needs your decision on analytics). |
| Screen reader behaviour | Test with NVDA (Windows) + Chrome, and VoiceOver (iOS Safari) on the drawer, gallery, doc modal, scroll dots and project page. |
| Real mobile performance and touch behaviour (including the 575 ms tap-bloom delay and swipe handling) | Test on a physical mid-range Android phone and an iPhone via remote debugging. |
| Safari and Firefox | Manually test `color-mix`, `100dvh`, snap scrolling, `:has`/`@starting-style` uses, wheel hijack, video autoplay. Not tested. |
| Real trackpad / Magic Mouse wheel behaviour | Hardware test on the Home page. |
| Visual regression baseline | Approve `@playwright/test` (a pinned devDependency) or capture manual screenshots after fixes using the same matrix. |
| Bundle composition | Run a bundle visualizer once (not installed). Until then the "which dependency is how big" breakdown is a hypothesis. |
| Contrast with an independent tool | Re-check the numbers in section 5 with axe or Lighthouse. They were computed by a custom script. |
