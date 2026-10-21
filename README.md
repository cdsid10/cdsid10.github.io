# cdsid10.github.io

Source of Siddhant Rathor's game design portfolio, published at https://cdsid10.github.io/.

It is a single-page app with client-side routes, built to static files and hosted on GitHub Pages (a User Pages site, so Vite's `base` is `/`).

## Stack

- React 19 and TypeScript 5.8
- Vite 6 with `@vitejs/plugin-react`
- Tailwind CSS 4 (`@tailwindcss/vite`)
- `react-router-dom` 7 for routing
- `motion` for animation
- `react-markdown` (with `remark-gfm` and `rehype-raw`) for the project documentation pages
- `lucide-react` icons, `clsx` and `tailwind-merge`

## Getting started

Prerequisite: Node.js. CI builds with Node 24, so use that version or newer. There is no `engines` field in `package.json`.

```bash
npm ci        # installs exactly what package-lock.json lists
npm run dev   # dev server at http://localhost:3000 (bound to all interfaces)
```

No environment variables or API keys are needed to run or build the site.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 3000 |
| `npm run lint` | Type-check only (`tsc --noEmit`). There is no ESLint, Prettier or test suite. |
| `npm run build` | Production build into `dist/` (gitignored) |
| `npm run preview` | Serves the built `dist/` locally |
| `node scripts/verify-routes.mjs [dir]` | Checks a build's generated route pages, 404, sitemap, robots and fonts. `dir` defaults to `dist`. |

Before opening a pull request, run lint, build, then the verifier:

```bash
npm run lint && npm run build && node scripts/verify-routes.mjs dist
```

## Project layout

- `src/pages/`: route components (Home, project overview, Archive, Mobile Releases, not found)
- `src/components/`: layout, sidebar, galleries, modals, video component and other shared UI
- `src/data/projects.ts`: the project list that drives the site and the generated page metadata
- `src/data/docs/*.md`: Markdown design documents shown on project pages
- `public/`: static assets copied as is: images, videos, fonts and `robots.txt`
- `seo-pages.ts`: the Vite plugin that generates the per-route HTML and the sitemap
- `scripts/verify-routes.mjs`: post-build check used by CI

## Routes, SEO and the not-found page

Routes are defined in `src/App.tsx`: `/`, `/project/:id`, `/other-works`, `/mobile-works`, and a wildcard that renders the not-found page.

GitHub Pages only returns HTTP 200 for URLs that exist as files, so `seo-pages.ts` runs during `vite build` and writes, from `src/data/projects.ts`:

- one `index.html` per real route (`dist/project/<id>/index.html`, `dist/other-works/index.html`, `dist/mobile-works/index.html`), each the same app shell with its own title, description, canonical URL and Open Graph / Twitter tags;
- `dist/404.html`: the same shell with `noindex` and not-found metadata. The app boots from it and the wildcard route shows the not-found page without redirecting;
- `dist/sitemap.xml`, listing the same pages.

`public/robots.txt` is a static file that points crawlers at the sitemap. It is copied into `dist/` as is, not generated.

The route list is written out in both `buildPages()` in `seo-pages.ts` and `EXPECTED` in `scripts/verify-routes.mjs`. When you add a page or project, update both, and keep `src/App.tsx` in step. The verifier fails until they agree.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main` and on manual `workflow_dispatch`. It installs with `npm ci`, builds, runs `scripts/verify-routes.mjs dist`, uploads `dist/` as the Pages artifact and deploys it with the GitHub Pages actions. Merging to `main` therefore updates the live site.

`.github/workflows/verify.yml` runs on pull requests to `main`. It has read-only permissions and runs lint, build and the route verifier. It never deploys.

## Maintenance notes

- Do not copy `index.html` over `404.html` in a build step; the generated 404 has its own metadata and the verifier checks it.
- `@google/genai` and `dotenv` are listed in `package.json` but are not imported anywhere in `src/` or `vite.config.ts`.
- Fonts (Inter and Roboto, Latin subset) are self-hosted in `public/fonts/` and declared in `src/index.css`.
- Katavader videos in `public/videos/` use posters from `public/images/Katavader/Video_Posters/`; the poster mapping lives in `src/components/ManagedVideo.tsx`.
