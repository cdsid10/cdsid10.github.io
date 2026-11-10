# AUDIT.md

Comprehensive audit of https://cdsid10.github.io/ and its source (`D:\Git_Repos\cdsid10.github.io`, commit `fa79853`, branch `main`), 2026-10-21.

Companion documents: [BASELINE.md](BASELINE.md) (all measurements and test conditions), [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) (prioritised roadmap), [DESIGN_PRINCIPLES.md](DESIGN_PRINCIPLES.md) (identity and constraints).

**This was an audit only.** No application source, package manifest, lockfile, deployment workflow or asset was changed. Nothing was committed, pushed or deployed. The only files added to the repo are `CLAUDE.md`, `AUDIT_SETUP.md`, `.claude/…` (from the setup phase) and the four reports.

## How to read the evidence labels

| Label | Meaning |
|---|---|
| **Measured** | Observed in a real Chrome 155 session on the live site or on the production build (numbers in BASELINE.md). |
| **Observed in code** | Read directly from source or build output; behaviour not separately run. |
| **Hypothesis** | Reasoned from code or from partial data; needs a test to confirm. |
| **Defect / Improvement / Preference** | *Defect*: objectively wrong or inaccessible. *Improvement*: measurable benefit. *Preference*: taste; never grounds for changing the identity. |

---

## 1. Executive summary

The site has a **strong, coherent identity** and a first impression that works: a paper-and-ink gallery with one large piece of work per screen, a persistent sidebar index, and a hover "bloom" that tints the whole page with the project's accent. Layout is stable (CLS 0 everywhere, no overflow from 320 px to 1920 px), interactions are fast (≤ 48 ms in lab), and the code carries unusually clear intent comments. The design is worth protecting, and almost none of the findings below require touching it.

The problems sit underneath the look:

1. **Keyboard and assistive-technology operability is the biggest gap.** The mobile/narrow drawer leaves 11 invisible links in the tab order; both modal layers lack dialog semantics, focus management and (for the doc modal) Escape; 22 images on the Katavader page are focusable but cannot be activated by keyboard; the Home scroll dots have no names; there is no skip link, and headings and landmarks are inconsistent.
2. **The typography the CSS declares is not what visitors get.** The Google Fonts `@import` is dropped by the build, so no web fonts load; text renders in each visitor's system UI font. This is an identity question for you (DESIGN_PRINCIPLES.md Q1), not just a bug.
3. **Share, search and routing foundations are missing.** There is no meta description, Open Graph/Twitter card, canonical, robots or sitemap, and every deep link returns HTTP **404** (GitHub Pages SPA fallback) with the app as the body.
4. **Three unlinked placeholder pages are live** (`/about`, `/contact`, `/resume`) with template text, a fake email and someone else's résumé.
5. **Media loading is the main performance lever.** Opening the Katavader page pulls all five demo videos at once (2.4 MB in the first seconds, 16 MB in the repo), and the first card's hero image, which is the LCP element, is `loading="lazy"`.
6. **Engineering hygiene** is the long tail: non-strict TypeScript, ~670 lines of unreachable collection-card code, duplicated viewport/pointer logic in 8 places, Tailwind classes that are generated at runtime and therefore never exist, a sidebar sub-component that remounts on every render (and drops keyboard focus), three unused dependencies (one pulling in a critical npm advisory), and no tests.

**Overall (holistic) score: 68/100, provisional.** Details in section 4.

### Ten most important findings

| # | ID | Finding | Severity |
|---|---|---|---|
| 1 | A11Y-01 | Closed mobile drawer: 11 offscreen links still tabbable; toggle has no state; Escape does nothing | High |
| 2 | A11Y-02 | Fullscreen gallery and doc modal have no dialog role, no focus move/trap/return; doc modal ignores Escape | High |
| 3 | A11Y-03 | 22 inert tab stops on the Katavader page; Enter/Space don't open the lightbox | High |
| 4 | ENG-01 | No web fonts load: declared Inter/Roboto never reach visitors | High (decision needed) |
| 5 | SEO-01 | Every deep link returns HTTP 404 | High |
| 6 | SEO-02 | No description, Open Graph/Twitter, canonical; empty HTML shell | High |
| 7 | UX-01 | Placeholder About/Contact/Résumé pages are live | High |
| 8 | PERF-01 | Katavader page downloads all 5 videos immediately (2.4 MB measured) | High |
| 9 | A11Y-04 | Home scroll dots are unnamed 16 px buttons | High |
| 10 | A11Y-06 | Muted labels measure 1.95–3.5:1 contrast (AA needs 4.5:1) | Medium |

### Five highest-impact improvements (in order)

1. **Make the interactive layer keyboard/AT-operable** (A11Y-01…04, ENG-03): hide/inert the closed drawer, add dialog semantics and focus handling to both modals, remove the dead tab stops or make them real buttons, name the scroll dots. Highest user impact, no visual change.
2. **Decide and fix typography delivery** (ENG-01): either self-host the intended Inter/Roboto (changes how the site looks for everyone, including the weights you tuned) or consciously adopt the system stack and tune against that. Needs your decision first.
3. **Give the site a shareable, indexable foundation** (SEO-01/02/03): head metadata, a social image, and build-time per-route HTML so deep links return 200. No visual change.
4. **Remove or finish the placeholder pages** (UX-01). Small, urgent for credibility.
5. **Fix media loading** (PERF-01/02): start videos only when visible, add posters, load the first hero eagerly with high priority, and serve appropriately sized images. Biggest measurable performance gain.

---

## 2. Scope, architecture, and source-versus-deployed

**Stack.** Vite 6.4, React 19.2, TypeScript 5.8 (non-strict), Tailwind 4.2 (CSS-first `@theme` tokens), `react-router-dom` 7.13 (`BrowserRouter`, declarative routes), `motion` 12 (Framer Motion), `react-markdown` + `rehype-raw` + `remark-gfm`, `lucide-react`. Built and deployed by GitHub Actions to GitHub Pages (Node 20, `npm ci`, `npm run build`, `cp dist/index.html dist/404.html`).

**Routes** ([App.tsx](src/App.tsx)): `/` (Home; switches between `DesktopHome` and `MobileHome` at 1024 px), `/project/:id`, `/other-works` (Archive), `/mobile-works`, `/about`, `/resume`, `/contact`, `*` → redirect to `/`. All inside `Layout` (sidebar + animated `<main id="scroll-container">`).

**State.** No global store. Component-local `useState`; cross-component coordination is through **window `CustomEvent`s** (`activeProjectChanged`, `collectionItemHovered`, `mobileScrollToTop`), a `MutationObserver` on `body.sidebar-open`, and `document.querySelector('#scroll-container')`. Content lives in [src/data/projects.ts](src/data/projects.ts) (939 lines, including full Markdown articles as template strings) and `src/data/docs/*.md` (loaded with `import.meta.glob(…, { eager: true })`).

**Tests and tooling.** None beyond `tsc --noEmit`.

**Source vs deployed.** Deployed JS is the same size as a fresh local build; behaviour matched source in all probes. The README and the `@google/genai`/`dotenv` dependencies are leftovers of an AI Studio template and do not affect the deployed site.

---

## 3. Existing strengths to preserve

- **Identity**: paper/ink/muted tokens with a deliberately matte dark mode; accent used only as a revealed, per-project signal; restrained corners, borders and shadows.
- **Hover bloom**: tints the full page with a project accent using `color-mix`, 1.25 s expo-out; matched by the next-project banner on project pages. This is the site's signature.
- **One-project-per-screen Home** with snap scrolling and dot indicators.
- **Sidebar brand play**: slot-machine word roll and scramble with programming-word easter eggs. It is already a good example of restrained gamification.
- **Tokenised micro-labels** (`.eyebrow`, `.caption`) used consistently on five pages.
- **Stability and speed**: CLS 0 on all tested pages; ≤ 48 ms interactions in lab; no horizontal overflow from 320 to 1920 px; page-transition fade is a crisp 0.18 s.
- **Real anchors for navigation** (`NavLink`/`Link`/`<a>`): middle-click, copy-link and screen-reader link lists work for the sidebar and cards.
- **Browser focus ring is intact** (no `outline: none` reset anywhere).
- **Doc reading experience** (`DocModal`): generous measure, clear hierarchy.
- **Per-route `document.title`** (`usePageTitle`).
- **Content quality**: long-form design write-ups are the site's real depth; `alt` text exists on inspected images.
- **Code readability**: dense intent comments, `CONFIG` blocks, `[GLOBAL]/[DESKTOP]/[MOBILE]` tags.
- External links use `rel="noopener noreferrer"`; HTTPS + HSTS; no secrets in the tree; 34 of 35 external links healthy.

---

## 4. Scores

**Rubric (0–100).** 90+ exemplary and evidenced; 75–89 solid with minor gaps; 60–74 meaningful gaps but a sound base; 40–59 significant problems; below 40 largely missing. Scores weight severity × breadth of findings, and are marked **provisional** where key evidence was not collected. They are judgements, not benchmarks, and are not Lighthouse scores.

| Dimension | Score | Status | Justification |
|---|---|---|---|
| 1. UX and usability | **72** | Provisional (no user research) | Purpose clear in seconds, distinctive and credible work; navigation is predictable. Deductions: live placeholder pages (UX-01), hypersensitive wheel handling (UX-02), no visible contact path (UX-03), keyboard scrolling needs a prior click (A11Y-08), broken link (UX-04). |
| 2. Visual consistency and polish | **78** | Provisional (rendered fonts differ from intent; Safari/Firefox untested) | Coherent tokens and spacing across all 8 routes, strong hierarchy. Deductions: fonts not delivered (ENG-01), 20 px sidebar/content offset (ENG-09), tiny low-contrast labels (UI-01), Archive accent line never shows (UI-04). |
| 3. Frontend engineering | **55** | Firm | Clear intent comments and sensible data/view split, but non-strict TS (48 `any`), dead code (667 lines), duplicated logic (8 places), remount-on-render bug, no error boundary, no tests, unused deps, stale README. |
| 4. UI engineering | **62** | Firm | Good token base for labels; weaker on states: dynamic Tailwind classes never generated (ENG-02), 29 `transition-all`, 24 sub-12 px text declarations, hard-coded colours, inconsistent heading elements. |
| 5. Performance | **70** | Provisional (no Lighthouse, no field data) | Small CSS, gzip JS 267 KB, CLS 0, low TBT on Home. Deductions: eager videos (2.4 MB), lazy LCP image, oversized thumbnails, single un-split bundle, TBT 800 ms on Katavader at mobile profile, noisy LCP. |
| 6. Accessibility | **48** | Provisional (no screen reader, no axe/Lighthouse) | Real strengths (focus ring, alt text, lang, reflow). Several High barriers (A11Y-01…04), no skip link, contrast and reduced-motion gaps. |
| 7. SEO and discoverability | **30** | Firm for the listed facts | No description/OG/canonical/robots/sitemap, empty shell, deep links 404. |
| 8. Reliability | **58** | Provisional (no real-device or cross-browser testing) | Builds cleanly, 0 console errors on Home, redirects unknown routes. Deductions: no error boundary and an unguarded `JSON.parse` in render, 404 status on deep links, placeholder routes, one dead external link, 12 npm advisories. |
| 9. Interaction quality | **80** | Provisional (desktop lab only; no real trackpad/touch) | Excellent signature interactions and fast response. Deductions: no reduced-motion, focus loss on sidebar rerender, scroll hijack sensitivity, ungated hover logic. |
| 10. Overall experience | **68** | Provisional | Holistic judgement, not an average (the mean of 1–9 is 61). The distinctive design lifts the overall experience above the engineering average. |

---

## 5. Findings

Severity: **Critical / High / Medium / Low**. Confidence: High / Medium / Low. "Preserves philosophy" is **Yes** unless stated.

### 5.1 Summary table

| ID | Category | Title | Sev | Conf | Type |
|---|---|---|---|---|---|
| A11Y-01 | Accessibility | Closed drawer links remain tabbable; toggle has no state; no Escape | High | High | Defect |
| A11Y-02 | Accessibility | Modals lack dialog semantics, focus management; doc modal ignores Escape | High | High | Defect |
| A11Y-03 | Accessibility | Inert focusable images; lightbox not keyboard-operable; video click-only | High | High | Defect |
| A11Y-04 | Accessibility | Home scroll dots unnamed and 16 px | High | High | Defect |
| A11Y-05 | Accessibility | No skip link; unlabeled duplicate `nav`; heading hierarchy inconsistent | Medium | High | Defect |
| A11Y-06 | Accessibility | Low-contrast muted text (1.95–3.5:1) | Medium | High | Defect |
| A11Y-07 | Accessibility | No `prefers-reduced-motion` support | Medium | High | Defect |
| A11Y-08 | Accessibility | Keyboard scrolling on Home dead until the page is clicked | Medium | Medium | Defect |
| A11Y-09 | Accessibility | Small adjacent targets (gallery dots 18 px, mobile arrows 20 px) | Low | Medium | Defect |
| A11Y-10 | Accessibility | Autoplaying videos: no keyboard pause | Low | Medium | Defect |
| UX-01 | UX / content | Placeholder About/Contact/Résumé pages are live | High | High | Defect |
| UX-02 | UX | Wheel handler: any wheel event jumps a section; inertia can skip two | Medium | Medium | Improvement |
| UX-03 | UX | No visible contact route (no email or contact CTA) | Medium | Low | Improvement |
| UX-04 | Reliability | One external link returns 404 | Low | High | Defect |
| UX-05 | UX | Next-project banner is a `<button>`, not a link; external links open silently in new tabs | Low | Medium | Improvement |
| UX-06 | UX | Sidebar scrolls and cuts off footer at heights below about 830 px | Low | Medium | Improvement |
| PERF-01 | Performance | Katavader page downloads all five videos at once | High | High | Defect |
| PERF-02 | Performance | LCP hero is `loading="lazy"`; thumbnails 2.8–7.5× oversize; "mobile" image is the desktop file | Medium | High | Improvement |
| PERF-03 | Performance | Single 869 KB (267 KB gz) bundle with all content; TBT 0.3–0.8 s at mobile profile | Medium | Medium | Improvement |
| PERF-04 | Performance | `max-age=600` on everything including hashed assets and videos | Low | High | Platform |
| PERF-05 | Performance | Repo weight: 16 MB videos, 1.67 MB single image | Low | High | Improvement |
| SEO-01 | SEO | Every deep link returns HTTP 404 | High | High | Defect |
| SEO-02 | SEO | No description, Open Graph, Twitter card, canonical, theme-color; empty shell | High | High | Defect |
| SEO-03 | SEO | No robots.txt or sitemap | Medium | High | Improvement |
| SEO-04 | SEO | No structured data (`Person`/`CreativeWork`) | Low | Medium | Improvement |
| ENG-01 | Engineering / Design | Google Fonts `@import` dropped by the build: no web fonts load | High | High | Defect |
| ENG-02 | Engineering | Dynamic Tailwind class names (`duration-[${…}ms]`) never generated | Medium | High | Defect |
| ENG-03 | Engineering | `NavGroup` defined inside `Sidebar`: remounts on every render; drops focus | Medium | High | Defect |
| ENG-04 | Reliability | No error boundary; unguarded `JSON.parse` in markdown render | Medium | High | Defect |
| ENG-05 | Engineering | 667 lines of unreachable collection-card code | Medium | High | Improvement |
| ENG-06 | Engineering | Viewport/pointer/breakpoint logic duplicated in 8 places | Medium | High | Improvement |
| ENG-07 | Engineering | Non-strict TypeScript, 48 `any`, `lint` = `tsc` only, no tests | Medium | High | Improvement |
| ENG-08 | Security / deps | 3 unused deps; `npm audit` 12 findings (1 critical via unused pkg); stale README | Medium | High | Defect |
| ENG-09 | Engineering | 20 px overlap: sidebar 300 px vs content margin 280 px | Low | High | Defect |
| ENG-10 | Engineering | Dark-mode visitors see a blank light page first; two theme toggles hold separate state | Medium | High / Medium | Defect |
| ENG-11 | Deployment | CI: no type-check/tests; Node 20 vs local 24; 404 hack | Low | High | Improvement |
| UI-01 | UI | 24 declarations at 9–11 px, often also opacity-reduced | Medium | High | Improvement |
| UI-02 | UI | 29 `transition-all` (unbounded) | Low | High | Improvement |
| UI-03 | UI | Hard-coded colours bypass tokens; dead `.ken-burns` CSS | Low | High | Improvement |
| UI-04 | UI | Archive accent underline never shows (accent is `''` for all 10) | Low | High | Defect / unclear intent |
| UI-05 | UI | Card titles are `h2` on desktop, `h3` on mobile | Low | High | Improvement |
| MOT-01 | Motion | Framer `x/y/scale` shorthands; `mode="wait"` doubles route transition | Low | Low | Hypothesis |

### 5.2 Accessibility

#### A11Y-01 Closed drawer links stay in the tab order — High / High / Defect
- **Evidence (measured):** at 390 px, with the drawer closed, Tab stops 4–14 land on Katavader, Self Apart, Mobile Releases, Archive, Résumé, LinkedIn, Github, Itch.io, Twitter, Artstation, Behance at x = −220 px (not visible). The menu button has no `aria-expanded` or `aria-controls`. After opening, Escape leaves `sidebar-open` set. (BASELINE 5.)
- **Where:** [Sidebar.tsx:487-495](src/components/Sidebar.tsx#L487) (aside hidden only by `-translate-x-full`), [Sidebar.tsx:473-479](src/components/Sidebar.tsx#L473) (toggle). The same applies at any width below 1024 px, including narrow desktop windows and zoom ≥ 150%.
- **User impact:** keyboard and screen-reader users tab through 11 invisible links on every page; focus appears to vanish. Drawer state is not announced. WCAG 2.4.3, 2.4.7, 4.1.2.
- **Technical impact:** low risk to fix.
- **Recommendation:** apply `inert` (or `visibility:hidden` after the transition) to the closed `aside` below `lg`; add `aria-expanded`, `aria-controls`, and Escape-to-close; move focus into the drawer on open and back to the toggle on close.
- **Effort:** S. **Risk:** low; verify the slide animation is unaffected. **Verify:** Tab from the page start at 390 px: stops are header link, theme, menu, then page content; with the drawer open, Tab stays inside and Escape closes it.
- **Preserves philosophy:** Yes (no visual change).

#### A11Y-02 Modals lack dialog behaviour — High / High / Defect
- **Evidence (measured):** after opening the fullscreen gallery, `role` and `aria-modal` are absent, focus remains on the page behind, Tab walks through the inline gallery controls and page links underneath, then continues down the page. Escape closes it. The doc modal opens with focus still on the card, has no `role=dialog`, and **Escape does not close it** (the close "X" button is the only keyboard route; because the modal is not portalled it sits in the DOM after the document cards, so Tab reaches it only after the remaining cards).
- **Where:** [ImageGallery.tsx:405-426](src/components/ImageGallery.tsx#L405), [DocModal.tsx:205-264](src/components/DocModal.tsx#L205).
- **User impact:** keyboard users can be stranded behind an overlay; screen readers do not know a dialog opened. WCAG 2.1.2, 2.4.3, 4.1.2.
- **Recommendation:** `role="dialog" aria-modal="true" aria-label`; move focus to the close button on open and return it to the trigger on close; trap Tab; add Escape to `DocModal`; mark the rest of the app `inert` while open. A native `<dialog>` with `showModal()` provides most of this for free.
- **Effort:** M. **Risk:** low-medium (focus bugs, scroll-lock; note `body` is already fixed so the current `document.body.style.overflow` lock does nothing). **Verify:** keyboard-only open/close of both modals; focus returns to trigger; screen-reader announces a dialog.
- **Preserves philosophy:** Yes.

#### A11Y-03 Inert focusable images and click-only video — High / High / Defect
- **Evidence (measured):** Katavader page has 45+ tab stops; 22 are markdown `<img>` elements with `tabindex=0` (Motion adds this for `whileTap`), each with alt text, but **Enter and Space do not open the lightbox** (click-only handler). The `.vid-wrap` video toggle is a click-only `div`.
- **Where:** [ProjectOverview.tsx:34-61](src/pages/ProjectOverview.tsx#L34) and [DocModal.tsx:18-43](src/components/DocModal.tsx#L18) (`MarkdownImage`), [ProjectOverview.tsx:335-374](src/pages/ProjectOverview.tsx#L335) (video wrappers).
- **User impact:** 22 tab stops that do nothing; the lightbox is unreachable by keyboard. WCAG 2.1.1, 4.1.2.
- **Recommendation:** render lightbox-capable images as `<button>` wrapping the `<img>` (or add `role="button"` plus Enter/Space handling and keep the stop), and drop `whileTap` from non-interactive images. Give video wrappers a real button (play/pause) with an accessible name.
- **Effort:** S–M. **Risk:** low. **Verify:** Enter/Space opens the lightbox; Tab stops equal the number of real controls.
- **Preserves philosophy:** Yes.

#### A11Y-04 Scroll dots unnamed and tiny — High / High / Defect
- **Evidence (measured):** three `<button>`s on Home desktop with no accessible name, 16 px wide and 16–42 px tall, touching each other. Mobile equivalents ("Scroll Up/Down") are named but 20×20 px.
- **Where:** [Home.tsx:48-66](src/pages/Home.tsx#L48).
- **Recommendation:** `aria-label="Go to project: Katavader"` and `aria-current` on the active dot; enlarge the hit area (padding/pseudo-element) without changing the visible 6 px dot.
- **Effort:** S. **Risk:** none. **Verify:** accessibility tree shows named buttons; hit area ≥ 24 px.
- **Preserves philosophy:** Yes (visible dots unchanged).

#### A11Y-05 Structure: skip link, landmarks, headings — Medium / High / Defect
- **Evidence (measured):** no skip link; two unlabeled `nav` elements; no `footer`; project pages have three `h1`s (sidebar brand, project title, first Markdown heading) and `h3` nav labels before any `h1`; mobile Home has no `h1`; Archive and Mobile Releases have their `h1` commented out, leaving only the sidebar brand.
- **Where:** [Sidebar.tsx:506,528,539](src/components/Sidebar.tsx#L506), [OtherWorks.tsx:56-58](src/pages/OtherWorks.tsx#L56), markdown `h1` mapping in [ProjectOverview.tsx:66](src/pages/ProjectOverview.tsx#L66).
- **Recommendation:** a visually hidden "Skip to content" link targeting `#scroll-container`; `aria-label`s on both `nav`s; a single `h1` per route (visually unchanged: a screen-reader-only `h1` is acceptable where the design deliberately omits one); demote nav group titles to non-heading text or `h2`; map Markdown `#` to `h2`. WCAG 2.4.1, 1.3.1, 2.4.6.
- **Effort:** S–M. **Risk:** low. **Verify:** heading outline per route has one `h1` and no skipped levels.

#### A11Y-06 Contrast — Medium / High / Defect
- **Evidence (measured by custom script; re-verify with axe):** light: "Dark Mode" 1.99:1, Archive eyebrow 1.95:1, "Featured Works" 2.44:1, copyright (9 px) 2.62:1, "Source" 2.51:1, inactive nav 3.36:1, "GAME DESIGNER" 3.54:1, muted small text 3.4:1; dark: "Light Mode" 2.57:1, "More" 3.31:1. Needs 4.5:1 at these sizes. (BASELINE 5.)
- **Cause:** `--muted` (#888 / #868686) combined with extra opacity in `.eyebrow` (0.6), sidebar headings (0.75), copyright (0.8), toggle (0.6), inactive links (`text-ink/50`).
- **Recommendation (smallest change):** adjust the token values, not the system: darken light `--muted` to roughly `#6B6B6B` (≈ 5:1 on `#FAFAFA`, my estimate; verify), lift dark `--muted`, and reduce the stacked opacities so the visible result clears 4.5:1, preserving the soft, quiet look. Decide with before/after screenshots (**requires your sign-off**; Q3).
- **Effort:** S. **Risk:** visual change, mild. **Verify:** axe/Lighthouse contrast pass in both themes; visual diff.
- **Preserves philosophy:** Yes if done through tokens and approved.

#### A11Y-07 No reduced-motion support — Medium / High / Defect
- **Evidence (measured):** with `prefers-reduced-motion: reduce`, `master-shine` keeps running; the built CSS has no reduced-motion rule; Motion is not configured with `MotionConfig reducedMotion="user"`.
- **Recommendation:** wrap the app in `<MotionConfig reducedMotion="user">` (keeps opacity, drops transforms), and add a CSS media query that stops the shine, ken-burns-style zooms and the bloom travel (keep the colour change but shorten it). Keep the page fade.
- **Effort:** S. **Risk:** low. **Verify:** emulated reduce: no running infinite animations; hover still gives feedback.

#### A11Y-08 Keyboard scrolling on Home — Medium / Medium / Defect
- **Evidence (measured):** with nothing focused, ArrowDown/PageDown/Space/End scroll 0 px; after a click, ArrowDown advances one section. Cause: the real scroller is `#scroll-container`, not the viewport (`html, body { position: fixed; overflow: hidden }`).
- **Recommendation:** make the scroller programmatically focusable (`tabindex="-1"`) and focus it on route change, or add Arrow/PageUp/PageDown handling on Home.
- **Effort:** S. **Verify:** load Home, press PageDown immediately.

#### A11Y-09 Target sizes — Low / Medium / Defect
Gallery dots 18 px adjacent, mobile scroll arrows 20 px, mobile theme toggle 20×28. WCAG 2.5.8 (24 px) applies unless the spacing exception holds. Enlarge hit areas invisibly.

#### A11Y-10 Autoplaying video — Low / Medium / Defect
Five muted loops start automatically, no pause control available to keyboard users (click-only wrapper). WCAG 2.2.2. Combine with PERF-01: only play on visibility, offer a keyboard-operable pause, honour reduced-motion by showing the poster.

### 5.3 UX and content

#### UX-01 Placeholder pages are live — High / High / Defect
- **Evidence (observed in code and rendered):** `/contact` shows `hello@zenportfolio.com` and four social links with `href="#"`; `/resume` lists "thatgamecompany — Lead Designer 2006–2012", "USC MFA", "Tsinghua BS"; `/about` is generic template prose ("Currently based in a quiet studio…"). They are unlinked from navigation but routable and indexable by URL. The Résumé sidebar link correctly points to a Google Drive PDF.
- **Where:** [About.tsx](src/pages/About.tsx), [Contact.tsx:29,37](src/pages/Contact.tsx#L29), [Resume.tsx:26-47](src/pages/Resume.tsx#L26), [App.tsx:21-23](src/App.tsx#L21).
- **User impact:** anyone landing on these URLs sees someone else's data and a non-working email; undermines credibility.
- **Recommendation:** remove the three routes (and files) or replace them with real content. Smallest change: delete routes so they fall through to the redirect.
- **Effort:** S. **Risk:** none. **Verify:** `/contact` redirects to Home; no references remain.

#### UX-02 Wheel handler sensitivity — Medium / Medium / Improvement
- **Evidence (measured, synthetic):** a single wheel event of `deltaY = 2` advanced a whole section; 70 events × 3 px over ~1.1 s (like a trackpad inertia tail) advanced two sections.
- **Where:** [Home.tsx:358-375](src/pages/Home.tsx#L358): any non-zero `deltaY` triggers a section jump; a 500 ms lock then releases while inertia events continue.
- **Recommendation:** accumulate `deltaY` to a threshold (e.g. ~40–60; **starting value**, tune by test), ignore events until the stream pauses (~120–150 ms, **starting value**) before arming the next jump. Test on a real trackpad and a notched mouse wheel; pass/fail: a single swipe moves exactly one section 9 times in 10.
- **Effort:** M. **Risk:** medium (feel). **Preserves philosophy:** Yes (same one-per-screen behaviour).

#### UX-03 No visible contact route — Medium / Low / Improvement
The sidebar offers LinkedIn, GitHub, Itch.io, Twitter, ArtStation, Behance and the résumé, but no email or "get in touch" line anywhere. Whether this is intentional is unknown. If you want inbound contact, add a single quiet line in the sidebar footer (an email link) in the existing label style. *Preference/improvement; ask before acting.*

#### UX-04 Dead external link — Low / High / Defect
`https://thegdwc.com/pages/game.php?game_guid=6bfe1aaf-…` returns 404 ([projects.ts:624](src/data/projects.ts#L624)). Replace with a working URL (or archive.org copy) or remove. (LinkedIn returns 999 to bots, which is not a defect.)

#### UX-05 Next-project banner and new-tab links — Low / Medium / Improvement
The banner is a `<button>` that calls `navigate()`, so no middle-click, no "open in new tab" and no crawlable link. Make it a `<Link>`; keep the touch bloom delay in an `onClick`. External links open new tabs with no hint; consider an `aria-label` suffix or a visually hidden "(opens in new tab)".

#### UX-06 Short-viewport sidebar — Low / Medium / Improvement
At 1024×768 the sidebar overflows (scrollbar visible, copyright cut off). Compress vertical gaps at `max-height` breakpoints or let the footer block flow.

### 5.4 Performance

#### PERF-01 All five videos load at once — High / High / Defect
- **Evidence (measured):** opening `/project/katavader` on desktop transfers 2,433 KB of video in the first seconds across 5 requests; sources total 16 MB (7.0, 4.3, 2.3, 1.3, 1.2 MB). On the throttled mobile profile LCP was 5.1–7.9 s and TBT ≈ 0.8 s on this page, versus about 5.7 s / 0.28 s on Home.
- **Cause:** [ProjectOverview.tsx:335-374](src/pages/ProjectOverview.tsx#L335) calls `video.play()` on **every** `.vid-wrap` video at mount on non-touch devices, then the IntersectionObserver (lines 487-518) pauses those off-screen. `preload="metadata"` is overridden by `play()`.
- **User impact:** wasted bandwidth and CPU competing with the hero image and article; metered-data cost.
- **Recommendation:** remove the unconditional mount-time `play()`; let the IntersectionObserver start playback only when ≥ ~25% visible; add `poster` images; re-encode (H.264 ≈ 1.5–2.5 Mbps, 720p, ≤ ~1–2 MB each as a **starting target**); consider `preload="none"`.
- **Effort:** S (logic) + M (re-encode). **Risk:** low. **Verify:** Network panel on first paint shows ≤ 1 video request; others start on scroll; compare LCP/TBT before/after under identical throttling, 5 runs.

#### PERF-02 LCP image and image sizing — Medium / High / Improvement
- **Evidence (measured):** Home LCP element is the first card's `<img loading="lazy">` (`ProjectCard.tsx:314-322`), so it gets no priority and, because the app is client-rendered, is only discovered after the 263 KB JS runs. Card sources are 2560×1440 rendered at ~904 px (2.8×; Archive 4–5.5×; mobile Home 7.5× in a 342 px square). `Mobile/Level_5_SS_NEW_Mobile.webp` is byte-identical in size to the desktop file (346,942 B), so there is no mobile art direction.
- **Recommendation:** first card `loading="eager" fetchpriority="high"` (lazy for the rest); generate 800/1280/1920 px variants with `srcset`/`sizes`; produce a genuine ~900 px square mobile crop if you want mobile-specific framing. Bytes are already modest because the files are WebP, so the main gain is LCP priority and decode cost.
- **Effort:** S (priority) / M (variants). **Risk:** low. **Verify:** LCP resource has `fetchpriority=high`; LCP median vs baseline under identical conditions.

#### PERF-03 Bundle composition — Medium / Medium / Improvement
Single chunk 869 KB raw / 267 KB gzip (inside the 300 KB gzip starter budget, over Vite's 500 KB raw warning). It carries `react-markdown` + `remark-gfm` + `rehype-raw`, all project Markdown (939-line data file plus three docs), `motion`, and 667 lines of dead collection cards, on every route including Home. TBT at the mobile profile is 280–300 ms on Home, ≈ 800 ms on Katavader. *Hypothesis until a bundle visualiser is run.* Recommended: `React.lazy` for `ProjectOverview` (and `DocModal`), move article Markdown to lazily imported files, delete dead code (ENG-05), drop unused deps. Effort M, risk low-medium.

#### PERF-04 Caching headers — Low / High / Platform
Every response is `max-age=600`, including content-hashed assets and videos. GitHub Pages does not allow header control. If this ever matters, a CDN in front or a different host is required. No action recommended now.

#### PERF-05 Repository weight — Low / High / Improvement
`public/` is 25 MB (16 MB video, 9.6 MB images); `Unity_Final_Concept.webp` is 1.67 MB. Every clone and CI run downloads it. Consider re-encoding or moving videos to a release/CDN. Low priority.

### 5.5 SEO and discoverability

#### SEO-01 Deep links return 404 — High / High / Defect
- **Evidence (measured):** `GET /project/katavader`, `/other-works`, `/mobile-works` return **HTTP 404** with the SPA shell. The workflow deliberately copies `index.html` to `404.html` (a known GitHub Pages trick). Browsers render the app; crawlers generally treat 404 responses as non-indexable even with content, and some tools/CDNs show error states.
- **Where:** [.github/workflows/deploy.yml](.github/workflows/deploy.yml) ("Create 404.html"), [index.html](index.html).
- **Recommendation:** after `vite build`, copy the shell (or better, a prerendered HTML) into `dist/project/<id>/index.html`, `dist/other-works/index.html`, etc., so each route is a real file and returns 200 while the SPA still hydrates; keep `404.html` as the catch-all. Prerendering the per-route `<title>`/description is a later step. *This touches the deployment workflow or build script and therefore needs your explicit approval.*
- **Effort:** M. **Risk:** medium (deployment). **Verify:** `curl -I` on each route returns 200; the app still routes correctly; unknown routes return 404.

#### SEO-02 Metadata and shell — High / High / Defect
- **Evidence (measured):** `<head>` has charset, viewport, a static title and a favicon only. No `description`, canonical, Open Graph/Twitter tags, `theme-color`. The served body is `<div id="root"></div>` with no `<noscript>` message, so link previews (LinkedIn, X, Discord, Slack) and non-JS crawlers see nothing.
- **Recommendation:** add a site-level description, canonical, OG/Twitter tags with a 1200×630 image drawn from existing artwork (e.g. the Katavader hero), `theme-color`, and a `<noscript>` line. For per-project previews, prerender (SEO-01). Purpose: shareable previews and a stable search snippet for a portfolio whose main traffic is shared links.
- **Effort:** S (site-level) / M (per-route). **Risk:** low. **Verify:** link-preview debuggers show title, description and image.

#### SEO-03 robots.txt and sitemap — Medium / High / Improvement
Both return 404. A two-line `robots.txt` pointing to a sitemap listing the 3 featured pages, Archive and Mobile Releases is small and useful once SEO-01 is solved. Without 200-status routes it adds little.

#### SEO-04 Structured data — Low / Medium / Improvement
A `Person` JSON-LD block (name, role, `sameAs` social profiles) is optional and low-value; do it with SEO-02 if desired. `llms.txt` is not recommended (no documented consumers; see vendored `seo` skill).

### 5.6 Engineering, reliability, security

#### ENG-01 No web fonts load — High / High / Defect (identity decision needed)
- **Evidence (measured and from the build):** `document.fonts.size = 0` on the live site; platform fonts for headings and body are Segoe UI (system). Vite warns "`@import` rules must precede all rules"; the built CSS (live and local) contains no `googleapis` reference. The `@import url(fonts.googleapis…)` sits after `@import "tailwindcss"` and `@theme`, where it is invalid and discarded.
- **Where:** [index.css:2](src/index.css#L2); `--font-sans: "Roboto"`, `--font-display: "Inter"` at lines 5-6.
- **Impact:** all visitors without Inter/Roboto installed see system fonts. Weights 500/600 used by code (`font-medium` ×8, `font-semibold` ×4, eyebrow 600) were also never in the requested families (Inter 400/700, Roboto 300/400), so they would have synthesised even if the import worked. Montserrat and Source Sans 3 in the import are unused.
- **Options (decision for you, Q1):** (a) self-host Inter + Roboto subsets as `woff2` with `font-display: swap` and `preload` (best for performance and privacy; changes the look to what the CSS intended); (b) put the Google `<link>` in `index.html` (simplest, adds a third-party request); (c) decide the system font stack is the real design and set it explicitly, removing the dead references.
- **Effort:** S–M. **Risk:** visible change for everyone; do not ship without screenshot comparison and sign-off. **Preserves philosophy:** depends on Q1.

#### ENG-02 Dynamic Tailwind classes never exist — Medium / High / Defect
- **Evidence (observed in build output):** `duration-[${CONFIG.TRANSITION_DESKTOP}ms]` and similar strings are assembled at runtime in `ProjectCard.tsx` (≈ 339-358, 393-398) and the collection cards. Tailwind scans source text and cannot see them; the built CSS contains no `duration-[200ms]`. The intended 200 ms colour transitions fall back to the default or to none (the title colour has no `transition-*` class at all, so it changes instantly).
- **Recommendation:** use literal class names (`duration-200`) or an inline `style={{ transitionDuration }}` as the accent line already does. Effort S; risk: this makes intended transitions appear, so check the feel.

#### ENG-03 `NavGroup` remounts on every render — Medium / High / Defect
- **Evidence (observed in code and measured):** `NavGroup` is declared inside `Sidebar()` ([Sidebar.tsx:386](src/components/Sidebar.tsx#L386)), so each Sidebar render creates a new component type and React unmounts/remounts the list. Measured: tab to "Self Apart", scroll to the next Home section (which updates `activeProjectId`) and focus drops to `body`.
- **Impact:** keyboard users lose their place whenever the active project changes; needless DOM churn. WCAG 2.4.3.
- **Recommendation:** hoist `NavGroup` outside `Sidebar` (or inline its JSX). Effort S, risk low. **Verify:** focus remains on the link after a section change.

#### ENG-04 No error boundary; unguarded parse — Medium / High / Defect
`imagegrid` Markdown renderers run `JSON.parse(props.images)` during render ([ProjectOverview.tsx:73-83](src/pages/ProjectOverview.tsx#L73), [DocModal.tsx:68-78](src/components/DocModal.tsx#L68)). A typo in content throws, and with no error boundary anywhere the whole app unmounts to a blank page. Add a top-level `ErrorBoundary` with a minimal in-style fallback, and `try/catch` in the renderers. `rehypeRaw` renders raw HTML from bundled, self-authored content (safe today; would need `rehype-sanitize` if content ever becomes external). Effort S.

#### ENG-05 Dead collection-card code — Medium / High / Improvement
No project sets `isCollection` or `collectionItems`, yet `DesktopCollectionCard.tsx` (350 lines), `MobileCollectionCard.tsx` (317 lines) and branches in `Home.tsx`, `MobileHome.tsx`, `ProjectOverview.tsx`, `MobileWorks.tsx` and `projects.ts` types exist. 667 of 6,307 `src` lines (≈ 11%). Confirm with you, then remove (or keep deliberately for a future feature and lazy-load it).

#### ENG-06 Duplicated viewport and pointer logic — Medium / High / Improvement
7 `resize` listeners in 6 files, 18 `(pointer: coarse)` checks in 7 files, `DESKTOP_BREAKPOINT = 1024` redefined 5 times, plus parallel `Mobile*`/`Desktop*` components. Two small hooks (`useMediaQuery`, `useIsCoarsePointer`) removing duplication need no dependency. `Home` also remounts its entire tree when the width crosses 1024 px, losing scroll position. Effort M, risk medium (touch behaviour is tuned; test on iPad/iPhone).

#### ENG-07 Type-safety and tests — Medium / High / Improvement
`tsconfig.json` has no `strict`; 48 `any` (markdown component props, event handlers). `npm run lint` is `tsc --noEmit`, which passes and so gives false assurance. No unit or e2e tests, ESLint or Prettier. Enable `strict` incrementally (start with `noImplicitAny`), add `eslint-plugin-react-hooks` and `jsx-a11y` (would have flagged A11Y-03/04/ENG-03), then a small smoke/e2e suite for the four critical journeys. These need dependency changes, so they need your approval.

#### ENG-08 Dependencies, advisories, README — Medium / High / Defect
`@google/genai`, `dotenv` and `autoprefixer` are unused (0 imports; Tailwind 4 doesn't need autoprefixer). `vite` is declared twice (dependencies and devDependencies). `npm audit`: 12 findings; the **critical** (`protobufjs`) and a high (`ws`) come only through the unused `@google/genai`. Direct highs are `vite` (dev-server/path traversal issues, dev only) and `react-router-dom` (the advisory concerns server-side data-routing features this client-only app does not use; exposure low, not individually verified). README is AI Studio boilerplate that tells readers to set a Gemini API key the app never reads. Removing the unused packages clears the critical and most highs; the rest are patch/minor updates. *Changes `package.json`/lockfile: needs approval.* Effort S–M.

#### ENG-09 20 px sidebar overlap — Low / High / Defect
Sidebar is 300 px wide ([Sidebar.tsx:491](src/components/Sidebar.tsx#L491)) while the content wrapper uses `lg:ml-[280px]` ([Layout.tsx](src/components/Layout.tsx) ≈ line 47), a measured 20 px overlap. `Sidebar.tsx` and `Layout.tsx` each carry a (partly unused) width constant. The bloom overlay uses 300 px. Align both to one value; the content centre shifts 10 px, so verify visually.

#### ENG-10 Theme flash and duplicated toggles — Medium / High (flash) / Medium (toggles) / Defect
- **Flash (measured):** theme is applied in a `useEffect` after React mounts. With a dark OS preference, first paint (56 ms) is a blank `#FAFAFA` page and the `dark` class lands at 1.66 s (2.47 s at 4× CPU), exactly when content first paints. Fix with a 5-line inline script in `index.html` that sets `html.dark` from `localStorage`/`prefers-color-scheme` before first paint, plus `<meta name="color-scheme">`.
- **Toggles (hypothesis, from code):** `ThemeToggle` is rendered in both the mobile header and the desktop sidebar, each with its own `isDark` state initialised at mount, so one can show a stale icon after the other is used or after a resize across 1024 px. Lift state to a shared hook/context.
- **Effort:** S. **Risk:** low.

#### ENG-11 CI and deployment — Low / High / Improvement
Workflow runs Node 20 (local 24), `npm ci`, `npm run build`; no type-check, lint or test step; the `404.html` copy is the only SPA fallback. Add `npm run lint` (and later ESLint/tests) to CI, match Node version, pin actions by SHA if desired. *Deployment config; needs approval.* Also note `main.tsx` comments reference a "ScrollToTop component" that does not exist; verify route-change scroll behaviour on Back navigation (not tested).

### 5.7 UI engineering and design-system consistency

| ID | Finding | Type |
|---|---|---|
| UI-01 | 24 declarations at 9/10/11 px (`text-[9px]` copyright, `[10px]` tags, headings, toggle label), frequently also opacity-reduced; the eyebrow is 10 px on mobile. This is part of the quiet voice, but combined with A11Y-06 it hurts legibility. Raise floor to 11–12 px for functional text and keep 9–10 px only where decorative. *Needs sign-off (Q2).* | Usability + polish |
| UI-02 | 29 `transition-all` (unbounded property transitions; also make accidental layout transitions possible). Replace with the specific property (`transition-colors`, `transition-opacity`, `transition-transform`). | Functional / polish |
| UI-03 | Hard-coded colours (`#0f0f0f`, `#0a0a0a`, `#ffffff`, `rgba(0,0,0,…)` shadows) alongside tokens; `.ken-burns` CSS and the `max-w-auto`/`pb--2`/`mb-13` utilities are unused or invalid. Remove dead CSS; define placeholder and shadow tokens. | Consistency |
| UI-04 | Archive card divider "accent crawl" animates a bar coloured `project.accentColor`, but all 10 Archive entries have `accentColor: ''` ([projects.ts:786-930](src/data/projects.ts#L786)), so the hover effect is invisible. Either supply accents (the Mobile Releases items have them) or remove the dead animation. *Intent unknown (Q4).* | Defect / unclear |
| UI-05 | Card titles are `h2` on desktop `ProjectCard` and `h3` on `MobileProjectCard`; pick one level per page context. | Consistency |
| UI-06 | Responsive logic is split between JS (`windowWidth < 1024`) and Tailwind `lg:` classes, so there can be one frame where they disagree on resize. Prefer CSS where possible. | Maintainability |

### 5.8 Security and reliability checks

- No secrets in the working tree or history patterns searched (README mentions a key name only).
- `rel="noopener noreferrer"` on external links; no `dangerouslySetInnerHTML`; `rehypeRaw` only on bundled content.
- No CSP possible via headers on GitHub Pages (a `<meta http-equiv>` CSP is possible but would need care with inline styles from Motion).
- `npm audit` summary in ENG-08.
- Runtime errors: 0 console errors on Home; the only logged errors on deep links are the browser's "Failed to load resource: 404" for the document itself.
- Unknown route: redirects to Home (good); but route status is 404 (SEO-01).
- No intrusive security testing was performed.

---

## 6. Interaction and motion review

Consulted as a reference rubric (not installed, not invoked): Emil Kowalski's published animation standards from `emilkowalski/skills` (MIT, commit `2d22863`, plain Markdown, no scripts). Applied to this site's existing motion language. The site's intent is not overridden: where the rubric would remove playfulness that is clearly part of the identity, it is noted and kept.

**Working well**
- Page fade 0.18 s ease-out (the "sub-300 ms UI" and "ease-out for entering" guidance).
- Hover bloom: long (1.25 s) but ambient, rare, and uses a strong ease-out curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Tooltips 200 ms; gallery fades 0.25–0.3 s; measured interactions ≤ 48 ms.
- Touch handling distinguishes taps from scrolls (10 px drift check), and iPad `pointer: coarse` handling shows care.

**Refinements (smallest effective changes)**
| # | Observation | Suggested refinement |
|---|---|---|
| M1 | No reduced-motion handling; the infinite shine and parallax ignore the preference (A11Y-07). | `MotionConfig reducedMotion="user"` + CSS media query; keep colour changes. |
| M2 | 29 `transition-all`; dynamic duration classes never emitted so some intended 200 ms transitions are default or absent (ENG-02, UI-02). | Name the properties; use literal classes. |
| M3 | The wheel handler's jump uses the browser's default `smooth` scroll duration, not a designed curve, and cannot be interrupted by a new wheel event within 500 ms. | Test feel on hardware; consider a short custom scroll with the existing expo-out curve. *Hypothesis; test before changing.* |
| M4 | Sidebar brand scramble triggers on every hover entry; the sidebar is on every page, so the scramble may be seen dozens of times a session. It is identity and charming, but "frequency-appropriate" guidance says high-frequency motion should be reduced. | Keep the click-triggered slot machine as the delight moment; consider a short per-session cooldown for the hover scramble. *Preference; your call (Q9).* |
| M5 | Card parallax and banner parallax use Motion's `x`/`y` shorthands, which run on the main thread. Under heavy load they can drop frames. | Hypothesis: only matters when the page is busy (e.g. videos decoding on Katavader). Re-test after PERF-01. |
| M6 | Route transitions use `AnimatePresence mode="wait"`, adding the exit fade before the enter fade (≈ 0.36 s total). | Keep, or overlap with a shorter exit; low priority. |
| M7 | Mobile tap on a card waits 575 ms for the bloom before navigating. | Intentional signature (Q8); if kept, keep it ≤ ~600 ms and make sure it is cancelable. |
| M8 | Focus state has no designed style (browser default ring). | A 2 px ring in `--ink` with a 2 px offset would fit the identity; test on bloom backgrounds. |
| M9 | Videos fade/pause by IntersectionObserver but start abruptly. | With posters (PERF-01), crossfade poster → video in ≈ 200 ms. |

---

## 7. Gamification and delight

Evaluated with the `game-design` skill's 5-component filter (Clarity, Motivation, Response, Satisfaction, Fit; conflict priority Response > Clarity > Satisfaction > Fit > Motivation) and its Numbers Policy: values below are **starting values with a test plan**, not sourced benchmarks.

**Existing delight (already on-brand):** slot-machine brand roll on click, hover scramble seeded with game-dev words, the accent bloom, the shine sweep. These pass the filter well (strong Satisfaction and Fit, rare/low-frequency Motivation). The best gamification here is **more of the same quality, not new mechanics.**

**Recommendation:** fix basics first; then consider at most the two small ideas below. "Do nothing" is a valid outcome.

| Idea | Visitor need | Fit and 5-component read | Complexity | Risks | Success measure |
|---|---|---|---|---|---|
| **G1. Quiet "seen" marker** in the sidebar: a small dot next to a project once its page has been opened, using that project's accent colour (stored in `localStorage`; also a visually-hidden "visited" text). | "What haven't I looked at yet?" for a recruiter scanning 3 featured works + archive. | Clarity ↑ (state is visible), Response unchanged, no points/streaks. Matches the accent-as-signal principle. | S | Colour must not be the only cue (use filled vs hollow); privacy: local only; reduced-motion: no animation. | Needs analytics, which the site lacks. Qualitative: ask 3–5 reviewers whether they could tell which projects they had opened (starting target: 4 of 5). |
| **G2. Keyboard shortcuts overlay** (`?`), listing J/K or arrows for next/previous project, `T` for theme. | Game-developer visitors who like keyboard navigation; also fixes A11Y-08 for everyone. | Response ↑ (keyboard-initiated actions should not animate, per motion guidance), discoverable only through a tiny hint in the footer. | M | Must not trap focus; document with `aria-keyshortcuts`. | Hint click-through is not measurable without analytics; success = no a11y regressions + shortcuts work in test. |
| **G3 (not recommended now). Playful easter egg expansion** (e.g. Konami → debug HUD overlay using the existing `HIDDEN_WORDS` as loot). | Delight for fellow developers. | High Satisfaction/Fit but low Motivation for the main audience; discoverable only by few. | M | Adds code and motion on a site with open accessibility gaps. | Defer until after P1/P2. |

Explicitly **not** proposed: XP, streaks, badges, achievement toasts, progress bars, pop-ups, anything that blocks content or tracks visitors.

---

## 8. Design skill sources evaluated (provenance review; nothing installed)

Per the audit rules, none of these were installed. Each was cloned read-only into the scratchpad and inspected.

| Source | Identity and provenance | What it does | Fit for this project | Decision |
|---|---|---|---|---|
| **Emil Kowalski** (`github.com/emilkowalski/skills`, MIT, 29 files, last commit 2026-10-11 `2d22863`) | Author-owned repo by Emil Kowalski, linked from his site `emilkowal.ski`. Install via `npx skills@latest add emilkowalski/skills`. No scripts or hooks (only Markdown); `review-animations` is `disable-model-invocation`. | Animation craft rubric (`review-animations`, `animate`, `improve-animations`, `animation-performance`, `emil-design-eng` main skill, 674 lines). | **Best fit.** Evaluates and refines motion without prescribing a look. Its rules match this site's grammar (short ease-out, restrained). Only gap: some rules (e.g. "no `ease-in`", "no `transition: all`") flag existing code. | Used here as a reference text. **Recommended for later, pinned and project-local** (copy `review-animations` + `animation-performance` at `2d22863`), after your approval. |
| **Impeccable** (`github.com/pbakaus/impeccable`, Apache-2.0, v4.7.0, ~4,000 files, last commit 2026-10-20 `dad8dbb`; docs at `impeccable.style`) | Author Paul Bakaus. One skill with 24 `/impeccable …` commands (audit, critique, polish, typeset, layout…). Installed with `npx impeccable install` (user or project scope), or the Claude Code plugin marketplace. | Design vocabulary, a technical `audit`, a two-sub-agent `critique`, a deterministic detector with a native engine binary. | **Poor fit as shipped.** (1) It **installs automatic edit hooks** and a launcher that **downloads a binary on first run into `~/.impeccable/bin/`**, which conflicts with your no-hooks/no-global-install rules. (2) Its "craft floor" has a hard **ban on kickers and eyebrows ("no brief earns it back")** and on system display faces, and its detector can flag Inter as an overused font. Those are core parts of your identity. (3) Heavy commands (`overdrive`, `bolder`, `colorize`…) are redesign engines. | **Do not install.** Revisit only `audit`/`critique` text as a read-only lens if you ask, with hooks disabled (`impeccable hooks off`) and the detector's "ignore" config set for eyebrows. |
| **Taste** (`github.com/Leonxlnx/taste-skill`, MIT, 69 files, last commit 2026-10-20 `6010f91`; site `tasteskill.dev`) | One prominent "Taste" repo; there is also an unrelated `hmbown/taste`. **Confirm which one you meant.** Install via `npx skills add` or `install.sh` which **symlinks into `~/.claude/skills` (user-wide)**. | "Anti-slop" art-direction pipeline: `draw.mjs` deals three of twenty researched visual directions, `lint.mjs`/`inspect.mjs` run a real browser, `assets.mjs` fetches images from museum/Wikimedia/Archive APIs (network access). | **Wrong tool for "refine, don't redesign".** It is built to choose and impose a new direction and says restraint alone reads as "thin". It strips labels and rules, which are your voice. Scripts need network and a browser. | **Do not install.** |

---

## 9. Limitations and untested areas

- **No Lighthouse/axe run**, so no category scores and no independent contrast verification. Contrast and DOM checks used custom scripts.
- **No screen reader, no real devices, no Safari/Firefox, no real trackpad.** Touch behaviour was emulated.
- **No field data** (CrUX/RUM). Lab timings varied up to 8× across runs on this network; treat them as indicative.
- **No user research.** UX findings are expert evaluation of observable behaviour, not usability-test results.
- **Back-navigation scroll restoration**, `localStorage`-disabled behaviour, offline/failed-asset states, print styles, and the Itch/Steam/store flows beyond link status were not tested.
- **Per-advisory exploitability** for `npm audit` items was not analysed beyond noting the site is static.
- The **Impeccable, Taste and Emil** repos were reviewed by reading, not by running.
- The seven custom `/…` skills in this repo could not be invoked by the assistant (manual-only). You can run them yourself to cross-check any section of this audit.
- Numbers estimated rather than measured are labelled "starting value", "≈", or "hypothesis" in the text.
