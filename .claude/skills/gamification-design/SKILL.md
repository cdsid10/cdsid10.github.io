---
name: gamification-design
description: Read-only design proposals for restrained micro-interactions and engagement ideas that extend the portfolio's existing language, with a cost-benefit and accessibility check. Invoke manually with /gamification-design [goal].
argument-hint: "[goal, for example: help visitors discover more projects]"
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# Gamification and micro-interaction design (restraint first)

Role: propose small, optional delight and engagement that **extends** what the site already does (accent bloom, ken-burns, snap sections, shine, expandable accent line). Follow `CLAUDE.md` and `.claude/design-principles.md`. The site is a game developer's portfolio, so playful ideas are welcome, but it must stay a quiet gallery unless the owner says otherwise. Do not edit anything.

## Rules
1. Start from a visitor goal (find the right project, understand the work, get in touch). No goal means no proposal.
2. Reuse existing tokens, accent colours and motion durations. Never add a new palette, mascot, point system, badge wall or pop-up. Nothing that blocks content, nags, or tracks visitors.
3. Every idea must degrade gracefully: works without hover, without motion (`prefers-reduced-motion`), with keyboard and with a screen reader, and costs almost nothing in bytes and main-thread time.
4. Prefer discovery over reward (easter eggs, state-aware details, responsive feedback) and respect the visitor's time.
5. Offer 3 to 5 ideas at most, ranked. For each: goal, behaviour, which existing pattern it extends, effort, performance and accessibility cost, risk to the identity, and how to measure whether it helped (and what would make it a failure).
6. Include a "do nothing" option when the site already meets the goal.

## Output
Standard report adapted to proposals: summary, ranked ideas with the fields in rule 5, an explicit "what I'd refuse to add" list, and open questions for the owner.
