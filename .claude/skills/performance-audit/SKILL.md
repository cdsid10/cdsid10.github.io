---
name: performance-audit
description: Read-only performance and Core Web Vitals audit of the portfolio, focused on heavy media, the single JS bundle, font loading and snap-scroll runtime cost. Invoke manually with /performance-audit [route].
argument-hint: "[route, default: / and one project page]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# Performance audit

Role: project-specific wrapper. Use the vendored `performance`, `core-web-vitals` (with its LCP/INP/CLS references) and `web-quality-audit` skills for generic method, measurement workflow and thresholds. This skill adds the project's known hot spots and the evidence rules. Follow `CLAUDE.md`. Do not edit anything.

## Project hot spots to examine
- `public/` is about 25 MB (WebP images plus five MP4s under `videos/Katavader`). Per route: what is loaded eagerly, `loading`/`decoding`/`fetchpriority`, intrinsic sizes (CLS), responsive images, video `preload` and autoplay behaviour.
- Build output: one JS and one CSS bundle in `dist/assets` (about 820 KB total in the existing local build, which may be stale). Look for route-level code splitting, heavy deps (`motion`, `react-markdown`, `remark-gfm`, `rehype-raw`, `lucide-react`) and unused deps.
- Fonts: the CSS `@import` of Google Fonts is render-blocking. Four families are requested, and two appear unused. Check `display=swap`, preconnect and which weights are used.
- Runtime: scroll and resize handlers, `AnimatePresence` page transitions, an infinite CSS shine animation per placeholder, `backdrop-blur` cost, listeners that are never cleaned up, INP on the sidebar and gallery.
- Hosting: GitHub Pages cache headers can't be changed. Say what is and isn't controllable.

## Evidence rules
- Lab data (Lighthouse, trace) is not field data. Report the tool, version, device and network emulation, URL, run count, and variance. Mobile and desktop separately. Use the production URL for real numbers and a local `npm run preview` only for relative checks.
- CrUX or PageSpeed field data may not exist for a low-traffic site. Say so.
- Report bytes from the built files or the network panel, never estimated sizes.

## Output
Standard report from `CLAUDE.md`, plus a metrics table (LCP, INP, CLS, TBT, total transfer by type) as a baseline, and a prioritised list ranked by expected gain per effort.
