---
name: visual-qa
description: Read-only visual quality check across a fixed screenshot matrix (routes x themes x viewports) to establish a baseline and detect regressions against the existing look. Invoke manually with /visual-qa [route].
argument-hint: "[route, default: full matrix]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# Visual QA

Role: establish a visual baseline of the **current** site and compare later states against it, so refinements never silently change the identity. Follow `CLAUDE.md`. Do not edit app files.

## Requirements
A usable browser is needed (Claude in Chrome, the built-in browser, or a pinned Playwright run approved by the owner). If none is connected, stop and report what is needed. Do not guess from code. See `AUDIT_SETUP.md` for the current state of browser access.

## Matrix
- Routes: `/`, one project page, `/other-works`, `/mobile-works`, `/about`, `/resume`, `/contact`, plus the doc modal and image gallery open states.
- Themes: light and dark (class `dark` on `<html>`; the toggle stores `localStorage.theme`).
- Viewports: 390x844, 768x1024, 1280x800, 1920x1080. Also 200% zoom on one desktop view.
- States: first paint, loaded, hover on one project card (accent bloom), sidebar or drawer open, keyboard focus on the first interactive element.
- Emulate `prefers-reduced-motion: reduce` once.

## Checks
Clipping and overflow, horizontal scroll, layout shift while images load, image aspect and crop, contrast over imagery, token consistency (eyebrow and caption), dark-mode parity, sticky and fixed overlap, safe areas, console errors, failed requests.

## Evidence
Save screenshots only to the scratchpad or an owner-approved folder outside `src/` and `public/`. Name them `route__theme__viewport__state`. Record the browser, version and URL. Compare before and after by eye plus a numeric diff if a tool is available, and state the threshold used.

## Output
Standard report from `CLAUDE.md`, plus the matrix as a table (checked, defect found, screenshot ID). For any regression, state which design principle is affected.
