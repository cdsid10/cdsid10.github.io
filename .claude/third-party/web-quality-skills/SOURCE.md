# Vendored: web-quality-skills

- Upstream: https://github.com/addyosmani/web-quality-skills
- Author: Addy Osmani
- License: MIT (see `LICENSE` in this folder)
- Revision: `afa8da942115f2961fdbfa80807ea0b232ff6c00` (v2.0.0, merged 2026-08-24)
- Vendored skills (copied unmodified): `web-quality-audit`, `accessibility`, `core-web-vitals`, `performance`, `seo`
- Not copied: `best-practices`, `.claude-plugin/`, `codex/`, `.gemini/`, and `skills/web-quality-audit/scripts/analyze.sh`
  (read-only, but requires `jq`, which is not installed, and is a weak fit for a React single-page app).
  `web-quality-audit/SKILL.md` still mentions that script; ignore it and inspect sources directly.

To verify the copies are unmodified, diff each folder in `.claude/skills/` against the same path in the upstream revision above.
Project rules in `CLAUDE.md` (audit-only, preserve the design philosophy) take precedence over the "optimize / fix" wording in these skills.
