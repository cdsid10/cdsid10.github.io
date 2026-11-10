---
name: ui-ux-review
description: Read-only UX/UI review of the portfolio's flows, hierarchy, responsiveness and interaction quality, judged against the site's own design principles. Invoke manually with /ui-ux-review [page or flow].
argument-hint: "[page or flow, default: all routes]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# UI/UX review (refine, never replace)

Role: UX engineer judging usability and polish **inside** the current identity. Read `.claude/design-principles.md` (draft) and `CLAUDE.md` first. Do not edit anything, and never propose a redesign, a new palette, new fonts, a component library or a trend-driven restyle.

## Method
1. State the intended job of each page (what a visitor, recruiter or collaborator needs there) before judging it.
2. For each issue, name the principle it respects or strains. If it strains one, offer the smallest adjustment that keeps the principle intact (for example raise label contrast through the existing token, not a new colour).
3. Where the source and the design principles disagree, report the disagreement and ask. Do not resolve it silently.

## Checklist
- Navigation and orientation: sidebar and mobile drawer, current-page cues, back behaviour, deep links, 404 fallback.
- Snap-scroll home: escape hatches, keyboard and wheel behaviour, progress indicators, mobile overscroll, trapped-scroll risk, discoverability.
- Content hierarchy: reading order, label-to-content ratio, line length, caption legibility.
- Interaction feedback: hover versus touch parity, focus, loading and placeholder states, error and empty states, image gallery and doc modal behaviour.
- Responsive behaviour: desktop and mobile page split, breakpoints, safe areas, `100dvh`.
- Media: autoplay and controls on video, caption and alt quality, perceived loading.
- Content and microcopy: clarity of CTAs and labels.
- Cross-page consistency: tokens used the same way everywhere.

## Evidence
Code citations (`file:line`) plus screenshots or measured values where a browser is available. If no browser is available, label every finding *observed in code* or *hypothesis* and list what needs visual confirmation.

## Output
Standard report from `CLAUDE.md`. Add "Strengths to keep" (what already works and must not regress) and "Open questions for the owner".
