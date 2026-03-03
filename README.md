# 10th SSC Solutions - Maharashtra Board Solutions

React + Vite static site for Maharashtra Board chapter-wise textbook solutions, optimized for SEO, AI crawlers, and performance.

## Run

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Build and Prerender

`npm run build`

Build flow:

1. `scripts/fix-datasets.mjs`
2. `scripts/enrich-content.mjs`
3. `scripts/generate-sitemap.mjs`
4. Vite build (hashed/minified assets + chunk splitting)
5. `scripts/prerender-routes.mjs`

## SEO and Metadata

- Per-page title/description generation is in [seo.ts](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/src/utils/seo.ts).
- Chapter title format: `Chapter Name – 10th SSC Solutions`.
- Canonical and hreflang tags are updated in runtime and during prerender.
- `meta keywords` tags are removed.
- Google verification token is set in [index.html](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/index.html).

## Adding New Chapters with Correct Metadata

1. Add/refresh dataset JSON in `public/shaalaa/`.
2. Ensure chapter URLs in `appears_in[].url` include `-chapter-{n}-{slug}`.
3. Run `npm run enrich:content`.
4. Validate generated files:
   - `public/shaalaa/chapter-meta.json` (`lastUpdated`, `author`)
   - `public/authors/*.html` author profile pages
5. Run `npm run build` to regenerate sitemap/prerendered chapter pages and schema.

## Authorship and Updated Date

- Subject-author mapping is managed in:
  - [authors.ts](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/src/content/authors.ts)
  - [enrich-content.mjs](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/scripts/enrich-content.mjs)
- Chapter pages display:
  - `Updated on: <date>`
  - Author name linked to `/authors/[slug].html`

## Structured Data

- Chapter pages emit `FAQPage` JSON-LD with:
  - `author`
  - `datePublished`
  - `about`
  - Q&A entries from chapter dataset
- Breadcrumb schema is included in prerendered routes.

## AI Crawlers and Sitemap

- [robots.txt](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/public/robots.txt) allows `GPTBot`, `Google-Extended`, and `CCBot`.
- Sitemap includes `lastmod` values and author pages.
- Sitemap is regenerated on every build.

## Performance

- Vite manual chunking + hashed asset filenames configured in [vite.config.ts](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/vite.config.ts).
- Quick View cards are lazy-loaded via dynamic `import()`.
- Third-party analytics script loading is deferred until `DOMContentLoaded`.
- Images use lazy loading and responsive `srcset`.
- Caching headers for static assets are configured in [public/_headers](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/public/_headers).

## Tests

- Run unit tests: `npm run test`
- SEO tests are in [seo.test.ts](/c:/Users/HP/Downloads/vibrant-ms---maharashtra-board-solutions/src/utils/seo.test.ts)

