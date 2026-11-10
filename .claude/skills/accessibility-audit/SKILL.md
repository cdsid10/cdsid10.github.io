---
name: accessibility-audit
description: Read-only WCAG 2.2 AA audit of the portfolio, scoped to this app's custom scroll shell, modals, gallery and snap navigation. Invoke manually with /accessibility-audit [page or component].
argument-hint: "[page or component, default: all routes]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# Accessibility audit (WCAG 2.2 AA)

Role: project-specific wrapper. Use the vendored `accessibility` skill and its `references/` (WCAG.md, A11Y-PATTERNS.md) as the generic checklist, and `web-quality-audit` for Lighthouse routing. This skill adds scope, evidence rules and output. It does not restate the checklist. Follow `CLAUDE.md` rules. Do not edit anything.

## Project-specific focus (not covered generically)
1. Custom scroll root: `html`/`body` are fixed and the real scroller is `#scroll-container`. Check keyboard scrolling, focus-into-view, skip-link target, find-in-page, and zoom to 200% and 400% (reflow, 1.4.10).
2. Snap-scroll home: operability without a pointer (2.1.1), no traps (2.1.2), scroll indicators as controls (name, role, state), pause or stop for the shine animation (2.2.2).
3. Motion: no `prefers-reduced-motion` handling was found. Verify across ken-burns, shine, the accent bloom and `motion` transitions (2.3.3 is AAA, but vestibular safety is expected).
4. Focus: no `focus-visible` styling was found. Check visibility (2.4.7), focus not obscured (2.4.11, new in 2.2), and sticky header and drawer overlap.
5. Contrast: measure `--muted`, eyebrow and caption (opacity-reduced), accent colours, and text over imagery in both themes (1.4.3, 1.4.11). Compute ratios, do not guess.
6. Target size (2.5.8), dragging alternatives (2.5.7), consistent help.
7. Modals and drawer (`DocModal`, `ImageGallery`, `Sidebar`): dialog role, focus trap and return, Escape, `aria-modal`, inert background.
8. Media: video captions, controls, autoplay, `alt` quality (14 `alt=` exist), decorative handling. Heading outline per route (several pages have no `<h1>`). SPA route-change announcements and `document.title`. Theme toggle name and state.

## Evidence
Measured (axe or Lighthouse, contrast math, keyboard walkthrough) beats observed in code beats hypothesis. State tool, version and URL for measured results. Automated tools cover only a fraction of WCAG, so always list the manual checks you did not perform.

## Output
Standard report from `CLAUDE.md`, with each finding tagged by WCAG success criterion and level, and a pass/fail/not-tested table for the criteria in scope.
