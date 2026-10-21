import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { projects } from './src/data/projects';

/**
 * [GLOBAL] SEO pages (build step)
 *
 * GitHub Pages is a static host: it only returns HTTP 200 for URLs that exist as files, and otherwise answers with
 * 404.html and a 404 status. A deep link such as /project/katavader would therefore load the app but report an error
 * status, which crawlers and link-preview bots treat as an error page.
 *
 * After the normal build this plugin writes, next to dist/index.html:
 *  - one directory per real route (dist/project/katavader/index.html, ...). GitHub Pages answers /project/katavader
 *    with a 301 to /project/katavader/ and then 200, a documented directory behaviour that does not depend on
 *    extensionless-file handling. Canonical, Open Graph URLs and the sitemap therefore use the trailing-slash form.
 *    Each file is the same SPA shell (same scripts and styles, so React boots and routes as before) with that page's
 *    own <title>, description, canonical and Open Graph / Twitter tags in the static <head>.
 *  - 404.html: the same shell with not-found metadata, `noindex`, and no canonical or social tags. The app still boots
 *    from it and the router's wildcard route renders the NotFound page (no redirect). The deploy workflow must NOT overwrite it.
 *  - sitemap.xml.
 *
 * Everything is derived from src/data/projects.ts and the routes in src/App.tsx; nothing is invented. Keep the page
 * list in buildPages() in step with App.tsx when a page is added.
 */

export const SITE_URL = 'https://cdsid10.github.io'; // User Pages site (see `base` in vite.config.ts)
const SITE_NAME = 'Siddhant Rathor';

interface PageMeta {
  path: string;        // Route path as the router sees it: '/' or '/x/y' (no trailing slash)
  title: string;       // Same as the client-side usePageTitle() result for that route
  description: string;
  image: string;       // Site-relative path of an existing image
}

/** First sentence of a project summary, so the description is the author's own wording. */
function firstSentence(text: string): string {
  // Not after common abbreviations ("Mr. Limbs" is not a sentence end).
  const match = text.match(/^.*?(?<!\b(?:Mr|Mrs|Ms|Dr|St|vs|etc))[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

function buildPages(): PageMeta[] {
  const featured = projects.filter((p) => p.category === 'featured-works');
  const homeImage = featured[0].thumbnail_16_9;
  const mobile = projects.find((p) => p.customInternalLink === '/mobile-works');

  const pages: PageMeta[] = [
    {
      path: '/',
      title: SITE_NAME,
      description: `Game design portfolio of ${SITE_NAME}. Featured work: ${featured.map((p) => p.title).join(', ')}.`,
      image: homeImage,
    },
    // Copy of the intro on src/pages/OtherWorks.tsx
    {
      path: '/other-works',
      title: `Archive | ${SITE_NAME}`,
      description: 'A curated collection of personal projects, competitive game jam prototypes, and professional commercial releases developed over the years.',
      image: homeImage,
    },
    // Copy of the intro on src/pages/MobileWorks.tsx
    {
      path: '/mobile-works',
      title: `Mobile Releases | ${SITE_NAME}`,
      description: 'A dedicated showcase of professional mobile titles and experimental works published across iOS and Android platforms.',
      image: mobile?.thumbnail_16_9 ?? homeImage,
    },
  ];

  // Projects that have their own deep-dive page (/project/:id). External-only entries and the Mobile Releases
  // hub (which links to /mobile-works) have none.
  for (const p of projects) {
    if (p.isExternalOnly || p.customInternalLink) continue;
    pages.push({
      path: `/project/${p.id}`,
      title: `${p.title} | ${SITE_NAME}`,
      description: firstSentence(p.summary),
      image: p.thumbnail_16_9,
    });
  }
  return pages;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const absolute = (p: string) => `${SITE_URL}${encodeURI(p)}`;
/** Canonical URL of a page: the trailing-slash directory form GitHub Pages serves with a 200. */
const pageUrl = (p: string) => (p === '/' ? `${SITE_URL}/` : `${absolute(p)}/`);

function headTags(page: PageMeta): string {
  const url = pageUrl(page.path);
  const image = absolute(page.image);
  return [
    '<!--seo:start-->',
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    '<!--seo:end-->',
  ].join('\n    ');
}

const NOSCRIPT_BOX = 'style="padding:2rem;max-width:40rem"';

/** Visible only when JavaScript is off: gives non-JS readers the name, summary and the real page links. */
function noscriptBlock(pages: PageMeta[]): string {
  const links = pages
    .filter((p) => p.path !== '/')
    .map((p) => `<li><a href="${esc(p.path)}/">${esc(p.title.replace(` | ${SITE_NAME}`, ''))}</a></li>`)
    .join('');
  return `<noscript><div ${NOSCRIPT_BOX}><h1>${esc(SITE_NAME)}</h1><p>${esc(pages[0].description)}</p><p>This site needs JavaScript to display its pages.</p><ul>${links}</ul></div></noscript>`;
}

/** 404.html: not-found copy, noindex, and deliberately no canonical or social tags. */
const NOT_FOUND_TITLE = `Page not found | ${SITE_NAME}`;
const NOT_FOUND_HEAD = [
  '<!--seo:start-->',
  '<meta name="robots" content="noindex" />',
  '<meta name="description" content="This page does not exist." />',
  '<!--seo:end-->',
].join('\n    ');
function notFoundNoscript(pages: PageMeta[]): string {
  const links = pages
    .map((p) => `<li><a href="${p.path === '/' ? '/' : esc(p.path) + '/'}">${esc(p.path === '/' ? 'Home' : p.title.replace(` | ${SITE_NAME}`, ''))}</a></li>`)
    .join('');
  return `<noscript><div ${NOSCRIPT_BOX}><p class="eyebrow">404 · Page not found</p><h1>${esc(SITE_NAME)}</h1><p>This page does not exist.</p><ul>${links}</ul></div></noscript>`;
}

export function seoPages(): Plugin {
  const pages = buildPages();
  let outDir = 'dist';
  let isBuild = false;

  return {
    name: 'seo-pages',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },
    // Dev server and the base index.html: the Home page's tags.
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(pages[0].title)}</title>\n    ${headTags(pages[0])}`)
          .replace('</body>', `  ${noscriptBlock(pages)}\n  </body>`);
      },
    },
    // Build only: one HTML file per real route, plus the sitemap.
    closeBundle() {
      if (!isBuild) return;
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const shell = fs.readFileSync(indexPath, 'utf8');
      if (!shell.includes('<!--seo:start-->')) throw new Error('seo-pages: home tags not found in dist/index.html');

      for (const page of pages) {
        if (page.path === '/') continue;
        const html = shell
          .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
          .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, headTags(page));
        const file = path.join(outDir, page.path.slice(1), 'index.html');
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, html);
      }

      // 404.html: the same shell, so the app still boots and the wildcard route renders the NotFound page (no redirect).
      fs.writeFileSync(
        path.join(outDir, '404.html'),
        shell
          .replace(/<title>[^<]*<\/title>/, `<title>${NOT_FOUND_TITLE}</title>`)
          .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, NOT_FOUND_HEAD)
          .replace(/<noscript>[\s\S]*?<\/noscript>/, notFoundNoscript(pages)),
      );

      const urls = pages.map((p) => `  <url><loc>${esc(pageUrl(p.path))}</loc></url>`).join('\n');
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      );
    },
  };
}
