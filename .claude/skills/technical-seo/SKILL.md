---
name: technical-seo
description: Read-only technical SEO and shareability audit for a client-rendered single-page portfolio on GitHub Pages (metadata, crawlability, social previews, structured data). Invoke manually with /technical-seo.
disable-model-invocation: true
allowed-tools: Read, Grep, Glob
disallowed-tools: Edit, Write, NotebookEdit
---

# Technical SEO

Role: project-specific wrapper. Use the vendored `seo` skill and `references/STRUCTURED-DATA.md` for generic rules. This skill adds the constraints of this site. Follow `CLAUDE.md`. Do not edit anything.

## Known constraints to reason about
- Client-side rendering: `index.html` is a shell. Titles are set at runtime by `usePageTitle`. Crawlers and link-preview bots that don't run JS see only the shell.
- GitHub Pages SPA fallback: the workflow copies `index.html` to `404.html`. Deep links return HTTP 404 with the app. Assess the effect on indexing, and whether `<Navigate to="/">` for unknown routes creates soft-404s.
- Nothing in `public/` provides `robots.txt`, a sitemap, or social images. `index.html` has no meta description, canonical, or Open Graph or Twitter tags.
- Do not recommend SSR frameworks or a migration. Only propose options compatible with the current Vite and GitHub Pages setup (for example prerendering at build time, per-route static HTML) and state the cost and risk of each.

## Checklist
Title and description per route; canonical and URL strategy; `robots.txt` and sitemap; Open Graph and Twitter cards (image size, absolute URLs); structured data (`Person`, `CreativeWork`); heading outline per route; link text and internal linking; image `alt` and file naming; favicon and manifest; HTTPS and redirects; mobile-friendliness.

## Evidence
Fetch the live URL for the raw served HTML (what a non-JS crawler sees) and compare with the rendered DOM. Report tools used. Validate structured data and previews with the tools named in the vendored `seo` skill, and flag when a tool couldn't be run. Never submit the site to any search engine or external service without the owner's approval.

## Output
Standard report from `CLAUDE.md`, plus a per-route table of title, description, canonical, indexability and share preview, as served versus as rendered.
