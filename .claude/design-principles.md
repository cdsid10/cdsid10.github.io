# Design principles (DRAFT, derived from source, pending owner review)

Derived from the code as of commit `fa79853`. These are **observations of what exists**, not confirmed intent. Items tagged **[unconfirmed]** may be accidents, leftovers or constraints. Do not treat them as binding, and do not "fix" them without asking. The owner decides what is a principle.

Primary sources: [src/index.css](../src/index.css), [src/components/Layout.tsx](../src/components/Layout.tsx), [src/components/Sidebar.tsx](../src/components/Sidebar.tsx), [src/pages/Home.tsx](../src/pages/Home.tsx), [src/data/projects.ts](../src/data/projects.ts).

## 1. Identity in one line (proposed)

A quiet, editorial, gallery-like portfolio. Work is the hero. The interface is paper-and-ink neutral and recedes. Colour appears only as a per-project accent that responds to the visitor. **[unconfirmed wording]**

## 2. Palette

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#FAFAFA` | `#0F0F0F` | page background |
| `--paper-elevated` | `#FFFFFF` | `#181818` | sidebar, mobile header |
| `--ink` | `#1A1A1A` | `#DDDDDD` | text, selection background |
| `--muted` | `#888888` | `#868686` | secondary text |

- Dark mode is deliberately soft: a comment in the CSS says the ink is a "very soft, matte text to kill sharpness". Preserve that matte feel.
- Hierarchy mostly comes from **opacity of ink** (`text-ink/…`, `opacity-[0.x]`, about 70 uses) rather than extra greys.
- **Per-project accent colours** live in `projects.ts` (for example `#801927`, `#4C7F33`, `#599ad8`, `#4C8F88`, `#5A3D5C`, `#7A84D9`). They are muted and desaturated. They drive a hover "bloom" through the `collectionItemHovered` window event and the small accent lines on cards. This is the site's only colour. **[unconfirmed: is it a signature?]**
- Hard-coded `#0f0f0f` placeholder (`.img-placeholder`) ignores the theme in light mode. **[unconfirmed: intended?]**

## 3. Typography

- Display (`font-display`): **Inter**, bold, headings tracked at **2px** (`tracking-[2px]` in the base layer). Some components use 1px or 1.25px.
- Body (`font-sans`): **Roboto**, light weight, `leading-[1.6em]`.
- Small uppercase labels are tokenised and shared:
  - `.eyebrow`: 10px on mobile and 14px from `lg`, 2px tracking, 600 weight, uppercase, 0.6 opacity, with a 3px `.eyebrow-dot` separator.
  - `.caption`: 14px, 1px tracking, 350 weight, uppercase, 0.5 opacity.
- The comment on `.caption` says the weight was tuned to "fix heavy look", so weight and softness were tuned on purpose.
- Mono is used only for code in the documentation modal.
- **[unconfirmed]** The Google Fonts import also loads Montserrat 700 and Source Sans 3, which no source references. It loads only Inter 400/700 and Roboto 300/400 while the code uses `font-medium` (8 uses) and `font-semibold` (4), including the eyebrow's 600. Those weights may be synthesised or fall back.

## 4. Layout and spacing

- App shell: fixed **left sidebar** (280-300px) on desktop, a 64px fixed header with a slide-in drawer on mobile.
- The page does not scroll. `html`/`body` are fixed with `overflow: hidden`, and `#scroll-container` inside `<main>` scrolls.
- **Home is a full-viewport snap-scroller.** `snap-y snap-mandatory`, one project per `100dvh` section with `scroll-snap-stop: always`, content about `80vw` wide (max 1560px), padding `px-6 lg:px-20`, dot scroll indicators at the right edge, and a hidden scrollbar. Interior pages use a `max-w-4xl` centred column with generous top padding (`pt-32`) and large section gaps (`mt-32`, `gap-20`).
- Separate mobile pages (`MobileHome`, `MobileWorks`) exist alongside the desktop ones. **[unconfirmed: is the split intentional long-term?]**
- Rounding is almost absent: `rounded-full` (16 uses, dots and pills), `rounded-sm` twice. No card chrome. Shadows are rare (`shadow-sm` ×4, the sidebar's soft `4px 0 24px rgba(0,0,0,.05)`). Hairline borders are `border-ink/5`. Glass is used sparingly (`backdrop-blur-md` ×8).

## 5. Motion

- Page change: opacity fade only, **0.18s** `easeOut`, tuned for "snappier navigation".
- Hover and state transitions are short (100-500ms; 300ms most common), mostly `transition-colors`, `transition-opacity`, `transition-transform`.
- Larger orchestrated moments use `motion` with 0.4-0.8s durations (`AnimatePresence`, 5 `whileHover`, 2 `whileInView`).
- Signature details: **ken-burns** image zoom (1.05 over 1.5s), the very subtle **shine sweep** across image placeholders (2s sweep every 10s at about 5% white), the accent bloom, and the expandable accent line on cards.
- **[unconfirmed]** There is no `prefers-reduced-motion` handling. Treat this as an accessibility gap to report, not as a statement about intent.

## 6. Visual hierarchy

Large tracked Inter headings, then small uppercase eyebrow and caption labels at reduced opacity, then light-weight body text. Imagery and video lead each section and text is secondary. Navigation and chrome sit at low contrast so the work dominates.

## 7. Distinctive patterns worth protecting (proposed)

1. Paper/ink neutral shell with a matte dark mode.
2. Tokenised eyebrow and caption system ("single source of truth" per CSS comments).
3. One-project-per-screen snapping home.
4. Per-project accent colour as the only chromatic element, revealed by interaction.
5. Restrained, near-subliminal motion (shine, ken-burns).
6. Sparse corners, borders and shadows. No card-grid SaaS look.
7. Dense, explicit code comments that tag `[GLOBAL]`, `[DESKTOP]` and `[MOBILE]` behaviour. Match this when proposing code.

## 8. Questions for the owner

1. Is the accent bloom a signature, or an experiment?
2. Are all-caps tracked labels a deliberate voice? They match the eyebrow tokens, so assume yes.
3. Is the desktop and mobile page split permanent?
4. May touch-target size, focus styles and contrast be adjusted if they conflict with the current muted look? The `--muted` grey is about 3.5:1 on `#FAFAFA` (my estimate, not measured), and `.eyebrow` / `.caption` apply additional opacity.
5. Is the fixed, non-scrolling body intentional, or a means to the snap effect?
6. Which unused or mismatched fonts and weights may be pruned?
