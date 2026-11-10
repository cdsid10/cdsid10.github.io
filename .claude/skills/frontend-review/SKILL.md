---
name: frontend-review
description: Read-only senior code review of the React/TypeScript/Tailwind source for correctness, architecture and maintainability. Invoke manually with /frontend-review [path or area].
argument-hint: "[path or area, default: whole src/]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# Frontend review (architecture and code quality)

Role: senior engineer reviewing `src/` for maintainability and correctness. Follow the audit rules and report format in `CLAUDE.md`. Read `.claude/design-principles.md` first. **Improve the existing site. Do not restyle it.** Do not edit anything.

Scope: `src/**`, `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json` (read only). Out of scope: visual taste (use `/ui-ux-review`), WCAG (`/accessibility-audit`), speed (`/performance-audit`).

## Checklist
1. Structure: duplication between Desktop*/Mobile* components and pages, oversized components (`ProjectOverview.tsx`, `Sidebar.tsx`, `Home.tsx`), data and view separation (`data/projects.ts`).
2. React correctness: effect dependencies and cleanup (listeners, observers, timers), keys, stale closures, state that should be derived, unnecessary re-renders in scroll handlers.
3. Cross-component coupling: window `CustomEvent`s (`collectionItemHovered`, `mobileScrollToTop`) and DOM lookups by id (`scroll-container`). Check typing and lifecycle.
4. TypeScript: `any` (for example the markdown renderers), missing types, unsafe casts. Note that `npm run lint` is only `tsc --noEmit`.
5. Tailwind and CSS: token usage versus hard-coded values, arbitrary-value sprawl, `!important`, dead CSS, dead comments and commented-out code.
6. Dependencies: unused packages (check `@google/genai`, `dotenv`), duplicate declarations (`vite` appears twice), version drift, Node version mismatch (local vs CI).
7. Routing and build: the SPA fallback, base path, the `@` alias (it resolves to the project root, not `src`), stale README.
8. Testability: what can be tested cheaply, and what is missing (tests, ESLint, Prettier).

## Evidence
`file:line` for every finding. Run read-only commands only if the owner allows (`npx tsc --noEmit` output counts as measured evidence). Never install anything.

## Output
Standard report from `CLAUDE.md`, plus a table of components by size and responsibility, and a short "safe-first" ordering of fixes (low risk, high value).
