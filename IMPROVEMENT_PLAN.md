# IMPROVEMENT_PLAN.md

Prioritised roadmap derived from [AUDIT.md](AUDIT.md). Evidence and conditions are in [BASELINE.md](BASELINE.md); constraints are in [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md).

**Nothing in this plan has been implemented.** Each phase waits for your approval. Items that change dependencies, deployment, or how the site looks are flagged.

## 0. Ground rules for every change

1. **Preserve the design philosophy.** No new palette, typeface (beyond resolving Q1), card chrome, gradients or decorative motion. Fixes go through existing tokens.
2. **One change set per branch, reviewed locally, never pushed to `main` without your say-so** (a push deploys to the live site).
3. **Before/after evidence for anything visible:** screenshots from the matrix in BASELINE.md §7 (routes × light/dark × 390/768/1440) and a numeric diff or side-by-side review.
4. **Before/after measurements for anything performance-related:** same tool, same throttling, 5 runs, median and range.
5. **Run `npm run lint` and `npm run build` at the end of every item.**
6. Items marked **[approval: deps]** change `package.json`/lockfile; **[approval: deploy]** change `.github/workflows/deploy.yml` or the build pipeline; **[decision]** need an owner answer first.

## 1. Decisions needed from you first

| # | Decision | Blocks | Recommended default |
|---|---|---|---|
| D1 | Typography: restore declared Inter/Roboto (self-hosted) **or** adopt the system stack deliberately (DESIGN_PRINCIPLES Q1) | ENG-01, UI-01, A11Y-06 tuning | Look at the site with and without the fonts (I can prepare both screenshots) and choose. Self-hosting is best for performance and privacy if you want the declared fonts. |
| D2 | About / Contact / Résumé pages: delete or write? | UX-01 | Delete the three routes now (the sidebar already links to the PDF résumé); add a contact line later if wanted. |
| D3 | Contrast headroom: how much may the muted tone and micro-label sizes change? (Q2, Q3) | A11Y-06, UI-01 | Raise tokens by the smallest amount that reaches AA and review screenshots. |
| D4 | Delete the dead collection-card code (667 lines) or keep for a planned feature? | ENG-05 | Delete (it remains in git history). |
| D5 | Add analytics/RUM? | Measuring gamification and field CWV | Optional; a privacy-friendly first-party `web-vitals` beacon is the minimum. Default: no. |
| D6 | Approve dependency work: remove 3 unused packages, bump patch/minor versions, add ESLint with `react-hooks` + `jsx-a11y`, enable stricter TypeScript | ENG-07, ENG-08 | Yes, in a separate branch. |
| D7 | Approve deployment-pipeline change for per-route HTML (SEO-01) | SEO-01/03 | Yes after a local proof. |
| D8 | Install the pinned Chrome DevTools MCP and/or `@playwright/test` for Lighthouse and visual regression? | BASELINE gaps | Yes (isolated, headless, telemetry off). |
| D9 | Archive accent lines: add accents or drop the effect? (Q4) | UI-04 | Add accents to match the Mobile Releases items if you like the effect. |

## 2. Roadmap

Effort: **S** < 1 h, **M** 1–4 h, **L** 0.5–2 days. Risk is regression risk.

### P0: urgent credibility and risk (do first, small)

| ID | Item | Effort | Risk | Depends on |
|---|---|---|---|---|
| UX-01 | Remove (or replace) the placeholder `/about`, `/contact`, `/resume` routes and pages | S | None | D2 |
| UX-04 | Replace the dead `thegdwc.com` link | S | None | Your replacement URL |

**Acceptance:** the three URLs redirect to Home; no placeholder text remains in the bundle (`grep zenportfolio` finds nothing); every external link returns 2xx/3xx (LinkedIn's 999 excluded).
**Verify:** `curl` the link list; load `/contact` in a browser; build output search.
**Regression risk:** none expected; check that the routing redirect also catches them.

### P1: high-impact usability, accessibility, reliability, performance

Recommended implementation order (each independent unless stated):

| Order | ID(s) | Item | Effort | Risk | Depends on |
|---|---|---|---|---|---|
| 1 | A11Y-01 | Drawer: `inert` when closed below `lg`, `aria-expanded`/`aria-controls`, Escape, focus in/out | S | Low | none |
| 2 | ENG-03 | Hoist `NavGroup` out of `Sidebar` (fixes focus loss) | S | Low | none |
| 3 | A11Y-04 | Name the scroll dots, add `aria-current`, enlarge hit areas invisibly | S | None | none |
| 4 | A11Y-03 | Make lightbox images real buttons; remove stray `tabindex`; real video play/pause buttons | S–M | Low | none |
| 5 | A11Y-02 | Dialog semantics + focus management + Escape for gallery fullscreen and doc modal (native `<dialog>` or manual) | M | Low–Med | none |
| 6 | ENG-04 | Top-level `ErrorBoundary`; guard `JSON.parse` in markdown renderers | S | Low | none |
| 7 | ENG-10 | Inline pre-paint theme script; shared theme state | S | Low | none |
| 8 | PERF-01 | Stop mount-time `play()` on all videos; IntersectionObserver-only playback; posters | S | Low | none |
| 9 | PERF-02 | First hero `eager` + `fetchpriority="high"`; responsive `srcset` variants | S–M | Low | none |
| 10 | SEO-02 | Head metadata: description, canonical, Open Graph/Twitter, social image, theme-color, `<noscript>` | S | Low | A social image choice |
| 11 | ENG-01 | Resolve fonts per D1 | S–M | **Visible change** | **D1** |
| 12 | SEO-01 | Emit per-route `index.html` at build so deep links return 200; keep `404.html` | M | Medium | **D7** [approval: deploy] |

**Acceptance criteria (per item)**
- **A11Y-01:** at 390 px with the drawer closed, Tab order from page start is header link → theme → menu → page content; with it open, focus is inside and Escape closes and returns focus to the toggle; `aria-expanded` toggles.
- **ENG-03:** after tabbing to a sidebar link and changing the active section, `document.activeElement` is unchanged.
- **A11Y-04:** every scroll dot has an accessible name; hit area ≥ 24 × 24 px; visible dot sizes unchanged (pixel diff 0).
- **A11Y-03:** Enter/Space on a lightbox image opens it; Tab stops on a project page equal the number of operable controls; each video has a named play/pause button.
- **A11Y-02:** both overlays expose `role=dialog` (or are native `<dialog>`), focus moves in, Tab is trapped, Escape closes, focus returns to the trigger; page behind is `inert`.
- **ENG-04:** a deliberately malformed `imagegrid` shows a contained fallback, not a blank app.
- **ENG-10:** with a dark OS preference, the first painted frame is dark (no `#FAFAFA` frame in a 4× CPU capture); only one source of theme truth.
- **PERF-01:** on first paint of `/project/katavader`, ≤ 1 video request; other videos start only when scrolled to; Media bytes in the first 3 s drop from ≈ 2.4 MB to ≤ ~0.6 MB (starting target); median LCP/TBT improve or stay equal under identical throttling.
- **PERF-02:** the LCP request has `fetchpriority=high` and is not lazy; LCP median under the mobile profile improves versus BASELINE 4.2.
- **SEO-02:** link-preview debuggers show title, description and image for `/`.
- **ENG-01:** screenshots show the chosen typography on Windows/Mac/Android; `document.fonts` loaded faces match the CSS; no layout-shift regression (CLS 0); font bytes within the 100 KB starter budget.
- **SEO-01:** `curl -I` returns 200 for every real route and 404 for unknown paths; client routing unaffected.

**Regression risks:** modal/focus work can break scroll lock or swipe gestures (test touch on a real iPhone and iPad); `inert` support is good in current browsers; self-hosted fonts change text metrics, so re-check line breaks and the sidebar fit; changing the build pipeline can break deploys, so test on a branch deploy or locally with `vite preview`.

### P2: consistency, interaction quality, maintainability

| ID | Item | Effort | Risk | Depends on |
|---|---|---|---|---|
| A11Y-06 + UI-01 | Contrast through tokens; raise sub-12 px functional text; screenshot sign-off | S–M | Visible (mild) | D3 |
| A11Y-07 + M1 | `MotionConfig reducedMotion="user"` + CSS reduced-motion block | S | Low | none |
| A11Y-05 | Skip link, labelled `nav`s, one `h1` per route, heading levels, `footer` | S–M | Low | none |
| A11Y-08 | Focusable scroller / key handling on Home | S | Low | none |
| UX-02 | Wheel accumulation + settle window; hardware test | M | Medium (feel) | Hardware |
| ENG-02 + UI-02 | Replace dynamic Tailwind class strings and `transition-all` with literal, scoped classes | S–M | Low (transitions will start to appear) | none |
| ENG-09 | Align sidebar width and content margin to one constant | S | Low | none |
| ENG-05 | Remove dead collection-card code | S | Low | D4 |
| ENG-06 | `useMediaQuery` / `useIsCoarsePointer` hooks; one breakpoint constant | M | Medium (touch) | none |
| ENG-08 | Remove `@google/genai`, `dotenv`, `autoprefixer`; dedupe `vite`; patch/minor updates; rewrite README | S–M | Low | D6 [approval: deps] |
| ENG-07 | `strict` TypeScript in steps; ESLint (`react-hooks`, `jsx-a11y`); smoke tests | L | Low | D6 [approval: deps] |
| ENG-11 | CI: add `npm run lint`, align Node, optional a11y/e2e step | S | Low | D6/D7 [approval: deploy] |
| PERF-03 | Lazy-load `ProjectOverview`/`DocModal`/markdown stack; move article Markdown to lazy modules | M | Low–Med | ENG-05 first |
| SEO-03 | `robots.txt` + `sitemap.xml` | S | None | SEO-01 |
| UI-04 | Archive accents or remove dead effect | S | None | D9 |
| UX-05 | Make next-project banner a `<Link>`; new-tab hints on external links | S | Low | none |
| UX-06 | Short-viewport sidebar spacing | S | Visible (mild) | none |
| A11Y-09, A11Y-10 | Invisible hit-area growth; keyboard pause for videos | S | Low | PERF-01 |
| UI-03, UI-05, UI-06 | Dead CSS/token cleanup, heading-level consistency, CSS-first responsive logic | M | Low | none |

**Acceptance (key items):** axe/Lighthouse shows no contrast failures in both themes; reduced-motion emulation leaves no infinite animation running; one `h1` per route and no skipped heading levels; `npm audit` shows no critical and no direct high advisories (after D6); bundle gzip ≤ ~200 KB for the entry chunk as a **starting target** with project pages in a lazy chunk; ESLint clean with `jsx-a11y`.

### P3: optional refinements and experiments

| ID | Item | Notes |
|---|---|---|
| G1 | Quiet "seen" marker in the sidebar | Needs your yes; measurable only with analytics or a small reviewer test |
| G2 | Keyboard shortcuts overlay (`?`) | Pairs well with A11Y-08 |
| M3, M4, M8, M9 | Motion refinements: hardware-tested scroll feel, hover-scramble cooldown, designed focus ring, poster crossfade | All *preference*; each needs screenshots/video review |
| SEO-04 | `Person` JSON-LD | Low value |
| PERF-05 | Re-encode or move large videos/images; trim repo weight | Pairs with PERF-01 |
| — | View Transitions API for route changes (Baseline in 2026 per the vendored performance skill) | Experiment; keep the 0.18 s feel; reduced-motion aware |
| — | Add a minimal first-party `web-vitals` beacon for field data | Only with D5 |

## 3. Suggested sequence and batching

| Batch | Contents | Why together |
|---|---|---|
| **Batch A** (P0, ~1–2 h) | UX-01, UX-04 | Zero risk, immediate credibility |
| **Batch B** (P1 accessibility, ~1 day) | A11Y-01…04, ENG-03, ENG-04, ENG-10 | All keyboard/AT and reliability; no visual change; one test pass |
| **Batch C** (P1 media + metadata, ~½–1 day) | PERF-01, PERF-02, SEO-02 | Biggest measurable gain with the lowest risk |
| **Batch D** (decision-gated) | ENG-01 (after D1), SEO-01 (after D7) | Visible change / deployment change |
| **Batch E** (P2 hygiene) | ENG-02/05/06/08/09, UI-02/03/05, contrast tokens after D3, reduced motion | Easier to review after A–D; reduces risk for later work |
| **Batch F** (P2 quality net) | ESLint + strict TS + smoke tests + CI step | Locks in the gains |
| **Batch G** (P3) | G1/G2, motion experiments | Only after the above |

## 4. Verification toolkit to set up (needs your approval, D8)

1. **Chrome DevTools MCP**, pinned `chrome-devtools-mcp@1.11.0`, `--isolated --headless --no-usage-statistics --no-performance-crux`: Lighthouse (a11y/SEO/best-practices), performance traces and insights, accessibility snapshots.
2. **`@playwright/test`** as a pinned devDependency (or screenshot comparison scripts reusing the probes from this audit): visual matrix regression (`toHaveScreenshot`), keyboard-journey tests, reduced-motion and dark-mode projects.
3. **Manual**: NVDA + Chrome and VoiceOver + Safari on drawer, modals, gallery; real iPhone and Android for touch, tap-bloom and swipe; a trackpad and a notched mouse for the wheel handler.
4. **Field**: PageSpeed Insights/CrUX for the origin; optional `web-vitals` beacon (D5).

## 5. Definition of done for the whole programme

- No keyboard or screen-reader barrier remains in the five core journeys (Home browse, open project, open gallery, open doc, navigate via drawer).
- Contrast, reduced-motion and landmark/heading checks pass automated tools and manual spot checks.
- Deep links are 200 and have shareable metadata.
- Katavader page initial transfer is dominated by the hero and article, not by videos.
- `npm audit` has no critical or direct-high findings; CI runs type-check and tests.
- Before/after screenshots show **no unintended visual change** other than decisions you approved (fonts, contrast).
