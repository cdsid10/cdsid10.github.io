# DESIGN_PRINCIPLES.md

The existing visual identity of https://cdsid10.github.io/ and the constraints any future change must respect.

**Status: verified against the live site and source on 2026-10-21 (commit `fa79853`), but not yet confirmed by the owner.** Section 2 lists what is observed and demonstrably consistent. Section 3 lists what is assumed or uncertain and needs your decision. This file supersedes the earlier draft [.claude/design-principles.md](.claude/design-principles.md), which is left untouched. Corrections to that draft are listed in section 5.

The governing rule is unchanged: **preserve the existing design philosophy.** Refine, never replace.

## 1. Identity in one paragraph

A quiet, editorial, gallery-like portfolio for a game designer. Work is the hero: one large 16:9 image per screen, framed by a lot of empty paper-coloured space. The interface is neutral and recedes (near-white "paper", near-black "ink", a muted grey for secondary information). Colour appears only as a per-project accent that blooms behind the card when you engage with it. Small tracked-out uppercase labels give it an index-card, archival voice; the sidebar brand has a playful slot-machine/scramble moment that nods to games. Motion is brief and mostly invisible except for the hover bloom.

## 2. Verified principles (observed, consistent, and backed by evidence)

Evidence references are to files in this repo or to measured behaviour in [BASELINE.md](BASELINE.md).

### P1. Paper and ink, with a matte dark mode
- Tokens in [src/index.css](src/index.css): light `--paper #FAFAFA`, `--paper-elevated #FFFFFF`, `--ink #1A1A1A`, `--muted #888888`; dark `--paper #0F0F0F`, `--paper-elevated #181818`, `--ink #DDDDDD`, `--muted #868686`.
- Source comments state the intent for dark mode: a "very soft, matte text to kill sharpness", with elevated surfaces "barely elevated". Ink is deliberately not pure white on dark.
- Secondary text relies heavily on **ink at reduced opacity** (`text-ink/50`, `/70`, `/80`) rather than extra greys. Measured effect on legibility is in AUDIT.md A11Y-06.
- Both themes render consistently across pages. Theme persists in `localStorage` and follows `prefers-color-scheme` initially.

### P2. One project per screen on Home
- Full-viewport sections (`h-[100dvh]`, `snap-y snap-mandatory`, `scroll-snap-stop: always`), content width `80vw` capped at 1560 px, 16:9 card with a large, soft, layered shadow (`0 60px 100px -20px …`), dot indicators fixed at the right edge. Three featured works.
- Wheel and swipe input is deliberately mapped to "one section per gesture" (Home.tsx wheel handler with a 500 ms lock). The intent is clear. Its sensitivity is a separate finding (UX-02).

### P3. Colour only as per-project accent, revealed by engagement
- Accent colours live in [src/data/projects.ts](src/data/projects.ts): Katavader `#801927`, Self Apart `#4C7F33`, Mobile Releases `#599ad8`; the four mobile titles `#599ad8`, `#4C8F88`, `#5A3D5C`, `#7A84D9`.
- Hovering or tapping a card blooms the page background to `color-mix(accent 85%, black)` on desktop (98.5% on mobile) over 1,250 ms (600 ms on mobile) with `cubic-bezier(0.16, 1, 0.3, 1)`. Text inside flips to white. A short underline under each card also takes the accent and lengthens on engagement. The next-project banner on project pages repeats the same bloom.
- The bloom is the most distinctive thing on the site. Treat it as a signature.

### P4. Tracked uppercase micro-labels as a system
- `.eyebrow` and `.caption` are explicit tokens with a "single source of truth" comment (10 px mobile / 14 px desktop, 2 px tracking, 600 weight, uppercase, opacity 0.6; caption 14 px, 1 px tracking, 350 weight, opacity 0.5). A 3 px `eyebrow-dot` separates "Featured Work · 01" style pairs. 24 uses across five pages.
- The same voice appears in sidebar group headings, role/year lines and tags (`text-[10px]`–`[12px]`, 1–1.5 px tracking, uppercase). Keep the voice. Individual sizes/contrast are a separate finding.

### P5. Headings: bold, wide-tracked display type
- `h1–h6` base style is bold with 2 px letter-spacing (index.css base layer). Sidebar brand is uppercase with 1.25 px tracking. Page headings use 1 px tracking. Body copy is light weight with 1.6 line-height.

### P6. Sidebar as persistent index
- Fixed 300 px left sidebar on desktop: brand name, "GAME DESIGNER", featured works list with the current work highlighted (follows the Home scroll position), theme toggle, Archive, Résumé, social links, copyright. Mobile: 64 px header with a slide-in drawer.
- The brand has a "slot machine" word roll on click (LORE-WEAVER, RESONATOR, PRIMER, ARTIFICER, INQUISITOR, TECHNOMANCER → SIDDHANT RATHOR) and a character scramble on hover seeded with programming words (UNITY, C#, NULL, BOOL…). This is a deliberate piece of playful identity.

### P7. Restraint in ornament
- No cards-with-borders chrome: images are borderless rectangles with a shadow; text sits directly on paper. Corners are square except for `rounded-full` dots and pills (16 uses). Borders are hairlines (`border-ink/5`–`/20`). Glass blur is limited to overlay controls and drawer backdrop.
- Hard-coded near-black (`#0A0A0A`/`#0F0F0F`) is used behind images as a loading placeholder.

### P8. Motion language
- Page change: opacity fade, 0.18 s ease-out. Hover/state transitions 100–500 ms. The bloom is the only long motion. A faint "shine" sweep crosses the active card image for 2 s every 10 s at ~5% white. Cards use a subtle parallax of about 15 px and a 1.05 scale on engagement. Project page banner has mouse-follow parallax.
- Measured: interactions respond in ≤ 48 ms in lab, and CLS is 0 on every tested page.

### P9. Documentation reading mode
- Long-form design docs open in a full-height reading panel with generous measure, bold uppercase section headings and hairline rules ([src/components/DocModal.tsx](src/components/DocModal.tsx)). The reading experience itself is strong.

### P10. Code voice
- Dense `[GLOBAL]/[DESKTOP]/[MOBILE]/[IPAD]` comments and `CONFIG` blocks at the top of files. New code should follow it.

## 3. Not verified: needs your confirmation before anyone relies on it

| # | Question | Why it matters |
|---|---|---|
| Q1 | **Which typefaces do you intend visitors to see?** The CSS declares Inter (display) and Roboto (body) but the Google Fonts `@import` is dropped at build time, so the live site loads **no web fonts** and renders in each visitor's system UI font (Segoe UI on this Windows test machine). If you design on a machine with Inter/Roboto installed, you may never have seen the live rendering. | Every typography decision (weight, tracking, size) was tuned against some font. Fixing the loading will change how the site looks for everyone. Decide first whether to restore the intended fonts or deliberately adopt the system stack. |
| Q2 | Is uppercase tracked labelling a deliberate voice? (Evidence says yes: tokenised.) Should small sizes (9–12 px) stay as they are or is some legibility headroom acceptable? | Contrast and size fixes would touch this voice. |
| Q3 | Is the muted/opacity-reduced secondary text a deliberate "quiet UI" choice, and how much contrast headroom are you willing to trade for AA? | Several labels measure 2–3.5:1. |
| Q4 | Are the Archive cards' accent underline and the empty `accentColor: ''` entries intentional? The 10 Archive items have no accent, so the hover crawl line is invisible. | Possibly a missing feature, possibly intentional restraint. |
| Q5 | Are About / Contact / Résumé pages meant to exist? They are routed but unlinked and contain template placeholder content. | Decides remove vs. write. |
| Q6 | Is the desktop/mobile page split (`Home` vs `MobileHome`, separate cards at 1024 px) permanent? | Affects how consistency fixes are done. |
| Q7 | Is the fixed, non-scrolling `body` with an inner scroller intentional beyond the snap effect? | It causes keyboard-scroll and anchor side effects. |
| Q8 | Is the 575 ms "bloom then navigate" delay on mobile tap a feature you want to keep? | It trades speed for the signature moment. |
| Q9 | Which of the playful elements (slot-machine, scramble, hidden words) are core identity vs. experiments? | Determines the gamification baseline. |
| Q10 | The accent palette (muted, desaturated) is assumed intentional. Any colours you consider placeholders? | Accents drive contrast and focus decisions. |

## 4. Constraints for any future change

1. Do not introduce a new palette, typeface family (other than restoring the declared ones if you confirm Q1), gradient washes, glassmorphism, rounded card chrome or numbered-step decoration.
2. Keep the tokens as the single source of truth: add or adjust `--paper/--ink/--muted/eyebrow/caption` values rather than inline colours. If a contrast fix is needed, prefer raising an existing token's opacity or value by the smallest amount that passes.
3. Keep the layout grammar: sidebar + one-project-per-screen Home + `max-w-5xl` reading column on project pages + 2-column Archive grid.
4. Keep the bloom, the slot-machine/scramble brand and the quiet shine. New motion must match the 100–300 ms ease-out grammar and must respect `prefers-reduced-motion`.
5. Preserve the code-comment voice and the `CONFIG` pattern.
6. Any change that alters how the site looks to a visitor (fonts, contrast, sizes, spacing, motion) needs a before/after screenshot pair from the visual matrix in BASELINE.md section 7 and your sign-off.

## 5. Corrections to the earlier draft (`.claude/design-principles.md`)

| Draft statement | Finding |
|---|---|
| Typography is Inter for display and Roboto for body | **Declared but not delivered.** No web fonts load. The live site renders in system fonts. See Q1. |
| Signature details include "ken-burns image zoom (1.05 over 1.5 s)" | `.ken-burns` is defined in CSS but **used nowhere** (0 references in `src/`). The 1.05 zoom that does exist is Motion-driven on card engagement (0.4 s). |
| Google Fonts also loads Montserrat and Source Sans 3 which nothing uses | Moot: nothing from Google Fonts loads at all. |
| "No `focus-visible` styling" | Accurate that no custom style exists, but the browser's default focus ring is visible on every tested stop. |
| Muted grey is "about 3.5:1" | Measured: muted on paper is about 3.4:1 before opacity; with the `.eyebrow` opacity applied it falls to roughly 2:1. |
| Hard-coded `#0f0f0f` placeholder is a light-mode inconsistency | Reasonable as an image-loading backdrop. Kept as an open question only (Q10-style), not a defect. |
| Collection cards / "dot navigation" as active patterns | Collection cards (`DesktopCollectionCard`, `MobileCollectionCard`, 667 lines) are **dead code**: no project sets `isCollection`. |
