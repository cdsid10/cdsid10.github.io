# AUDIT_SETUP.md

Preparation for a read-only audit of https://cdsid10.github.io/. Nothing here modifies the application, dependencies or deployment. Nothing has been committed, pushed or deployed. **The audit has not started.**

Prepared 2026-10-21 against commit `fa79853` (`main`).

## 1. What was installed (all project-local, nothing global)

### Vendored: `web-quality-skills` by Addy Osmani (MIT)
- Source: https://github.com/addyosmani/web-quality-skills
- Revision: `afa8da942115f2961fdbfa80807ea0b232ff6c00` (v2.0.0, 2026-08-24)
- Method: file copy from a shallow clone, byte-compared against the clone (identical). Not installed as a plugin or marketplace, so there is no auto-update.
- Inspected before copying: all `SKILL.md` and `references/*.md` files. None declares hooks, `allowed-tools` or shell injection. The only shell, network and install strings are example code or `npx lighthouse` and `npm i -g @axe-core/cli` snippets in Markdown that we do not run.
- Deliberately not copied: `best-practices`, `scripts/analyze.sh` (read-only but needs `jq`, which is not installed), plugin manifests, codex and gemini folders.
- Licence and attribution: [.claude/third-party/web-quality-skills/LICENSE](.claude/third-party/web-quality-skills/LICENSE) and [SOURCE.md](.claude/third-party/web-quality-skills/SOURCE.md).
- Known quirk: `web-quality-audit/SKILL.md` refers to the omitted `analyze.sh`. Ignore that row.
- These skills are not marked manual-only, so Claude may load them when your wording matches their descriptions. Their text says "optimize" and "fix". `CLAUDE.md` rule 1 overrides that: recommend only.

### Custom skills (written for this project, read-only)
Each has `disable-model-invocation: true` (manual only), `allowed-tools: Read, Grep, Glob`, `disallowed-tools: Edit, Write, NotebookEdit`, and no hooks or scripts. The three wrappers delegate generic checklists to the vendored skills, and the other four have no vendored equivalent.

## 2. Files created

```
CLAUDE.md                                         draft project instructions and audit rules
AUDIT_SETUP.md                                    this file
.claude/design-principles.md                      draft, derived from source, needs owner review
.claude/third-party/web-quality-skills/LICENSE
.claude/third-party/web-quality-skills/SOURCE.md
.claude/skills/web-quality-audit/SKILL.md                      (vendored)
.claude/skills/accessibility/SKILL.md                          (vendored)
.claude/skills/accessibility/references/A11Y-PATTERNS.md       (vendored)
.claude/skills/accessibility/references/WCAG.md                (vendored)
.claude/skills/core-web-vitals/SKILL.md                        (vendored)
.claude/skills/core-web-vitals/references/{CLS,INP,LCP}.md     (vendored)
.claude/skills/performance/SKILL.md                            (vendored)
.claude/skills/performance/references/{MEASUREMENT,RUM}.md     (vendored)
.claude/skills/seo/SKILL.md                                    (vendored)
.claude/skills/seo/references/STRUCTURED-DATA.md               (vendored)
.claude/skills/frontend-review/SKILL.md           custom
.claude/skills/ui-ux-review/SKILL.md              custom
.claude/skills/accessibility-audit/SKILL.md       custom (wrapper)
.claude/skills/performance-audit/SKILL.md         custom (wrapper)
.claude/skills/technical-seo/SKILL.md             custom (wrapper)
.claude/skills/visual-qa/SKILL.md                 custom
.claude/skills/gamification-design/SKILL.md       custom
```

No existing file was modified.

## 3. How to invoke

Custom (type at the start of a message):

| Command | Purpose |
|---|---|
| `/frontend-review [path]` | architecture, React/TS quality, dependencies |
| `/ui-ux-review [page]` | flows, hierarchy, responsiveness, judged against the design principles |
| `/accessibility-audit [page]` | WCAG 2.2 AA with this app's scroll shell, modals and snap navigation |
| `/performance-audit [route]` | Core Web Vitals, media weight, bundle, fonts |
| `/technical-seo` | SPA crawlability, metadata, share previews |
| `/visual-qa [route]` | screenshot matrix (needs a browser) |
| `/gamification-design [goal]` | restrained micro-interaction proposals |

Vendored (also invocable by name, and Claude may load them from matching wording): `/web-quality-audit`, `/accessibility`, `/core-web-vitals`, `/performance`, `/seo`.

Skills are discovered from `.claude/skills/` at session start. Restart or reload Claude Code in this folder if they do not appear. The docs say project-level skill files are picked up from the working directory.

## 4. Tools: available and not installed

| Tool | Status |
|---|---|
| Node 24.14, npm 11.9, Python 3.14, git | available |
| Chrome and Edge | installed in default locations |
| `tsc` (via `npm run lint`) | available |
| `gh`, `jq` | not installed |
| Lighthouse, axe, Playwright, test runner, ESLint, Prettier | not installed (nothing added to `package.json`) |
| Chrome DevTools MCP | not installed, inspected below |
| Browser tools in this session | none connected (see section 5) |

### Chrome DevTools MCP: inspection report (not installed)
- **Identity:** npm package `chrome-devtools-mcp`, repository `github.com/ChromeDevTools/chrome-devtools-mcp`, Apache-2.0. npm maintainers include a `google-wombot` account. Latest is **1.11.0** (modified 2026-10-15). Tarball integrity `sha512-CytJ/5tnzrS+J/74be2P5aCOsS/mmGRHys/Si+IYC4ucrbnWAmES/dYdxGJjeUCECRcoFUilZAysdjlwqUjXIA==`. I downloaded the tarball with `npm pack` into the scratchpad and unpacked it. I did not run it.
- **Requirements:** Node `^20.19.0 || ^22.12.0 || >=23`. Local Node 24.14 qualifies. CI's Node 20 would also qualify if its minor is at least 20.19. Chrome stable is present.
- **Dependencies and scripts:** it lists no runtime dependencies (the code is bundled, about 14 MB unpacked). It defines no `preinstall`, `install` or `postinstall` script.
- **Version pinning:** the README suggests `npx -y chrome-devtools-mcp@latest`. I'd pin the exact version (`chrome-devtools-mcp@1.11.0`) in a project `.mcp.json` instead. A Claude Code project-scope MCP config needs your approval on first use. Pinning the integrity hash is not supported by `npx`.
- **Side effects and permissions:**
  - It drives a real Chrome. Anything open in a profile it attaches to is visible to it, so the README warns not to share sensitive information.
  - Usage statistics are **on by default**. Disable them with `--no-usage-statistics`.
  - Performance traces may send trace URLs to the Google CrUX API. Disable that with `--no-performance-crux`. For a public site this leaks only the public URL, but it's still an outbound call.
  - It checks the npm registry for updates unless `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS` is set.
  - Flags found in the code: `--headless`, `--isolated` (temporary profile), `--user-data-dir`, `--channel`, `--browserUrl`, `--auto-connect`, `--slim`, `--proxy-server`, `--experimental*`. I have not read the official configuration guide for their exact semantics.
  - Proposed safe configuration if you approve: `npx -y chrome-devtools-mcp@1.11.0 --isolated --headless --no-usage-statistics --no-performance-crux`, with `CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1`. Do not use `--auto-connect` or your own profile.
- **Fit for this audit:** yes. The code registers `lighthouse_audit`, `performance_start_trace`, `performance_stop_trace`, `performance_analyze_insight`, `take_snapshot` (accessibility tree), `take_screenshot`, `emulate`, `resize_page`, `evaluate_script`, `list_network_requests` and `navigate_page`. That matches what the vendored `web-quality-audit` skill routes to. As Addy Osmani's skill notes, `lighthouse_audit` excludes performance, which is covered by the trace tools.
- **Not verified:** that these tools work against the site's fixed-body, inner-scroll layout. It would load production by URL, so no local server is needed.

## 5. Browser access in this session
- Unavailable. A search of this session's tools found no browser tools. The Claude Code browser skills (`chrome-browser`, `built-in-browser`) are listed, but their tools are not loaded, so I cannot say whether an extension or in-app browser is connected. No existing connection was used or attempted.
- Alternatives and limits:
  1. **Chrome DevTools MCP** as above: best fit, needs your approval.
  2. **Claude in Chrome or the built-in browser**, if you connect one: uses your real browser and sign-ins, which is more exposure than an isolated profile, but no install is needed. I'd work in a new tab only.
  3. **`npx lighthouse` (pinned) on demand:** gives lab Lighthouse scores, but not interactive checks (keyboard, hover bloom, modals). It downloads the package at run time, and I would ask first.
  4. **`@playwright/test` as a devDependency:** the only option here for repeatable visual regression. It modifies `package.json` and downloads browsers, so it needs your explicit approval.
  5. **You run Chrome DevTools or PageSpeed Insights and paste the results:** zero install, with manual effort.
  6. **Static audit only:** source and `dist/` inspection plus a raw fetch of the live HTML. It cannot measure rendering, contrast, motion, Web Vitals or screenshots. All such findings would be *observed in code* or *hypothesis*.

## 6. Outstanding risks and limitations
- `CLAUDE.md` and `.claude/design-principles.md` are **drafts**. Several points are marked unconfirmed, and they list six questions for you.
- A commit of `.claude/` or the new Markdown files to `main` will trigger the Pages deploy. They don't enter `dist/`, because only Vite's build output is published, so the live site should be unaffected, but nothing was pushed.
- Vendored skills can still be loaded automatically by Claude. Their "fix" wording is overridden only by `CLAUDE.md` guidance, not by a technical restriction. If you want a hard guarantee, add `disable-model-invocation: true` to their frontmatter (a local change that makes them differ from upstream).
- `disallowed-tools` and `disable-model-invocation` come from the official skills documentation as summarised by a sub-agent. I haven't tested them in a live session. After reloading, check that `/frontend-review` appears and that it refuses to edit.
- The design principles come from static code reading, not from the rendered site.
- The `--muted` contrast figure in the principles is an estimate.
- Skill descriptions are truncated at 1,536 characters by the docs, and all of ours are well below that.

## 7. Exact next steps for the comprehensive audit
1. Review and correct `CLAUDE.md` and `.claude/design-principles.md`, and answer the open questions.
2. Decide on browser tooling (section 5). Recommended: approve the pinned, isolated Chrome DevTools MCP.
3. Reload Claude Code in this folder and confirm that the skills are listed.
4. Capture baselines first: `/visual-qa` (before any change), then `/performance-audit` on `/` and one project page, mobile and desktop.
5. Run `/accessibility-audit`, `/technical-seo`, `/frontend-review` and `/ui-ux-review`.
6. Run `/gamification-design` last, with a specific visitor goal.
7. Consolidate into one prioritised report. Fixes would happen only after you choose what to do.
