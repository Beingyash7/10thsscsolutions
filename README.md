# 10th SSC Solutions - Maharashtra Board Solutions

A React + Vite website for Maharashtra Board (SSC) textbook question-answer solutions with a chapter-wise Class 10 library powered by local `public/shaalaa/*.json` datasets.

## Features

- Class 10 subject -> book -> chapter -> question/answer navigation
- Local Q&A datasets (no backend required)
- Dynamic chapter extraction from local JSON datasets (including Hindi and Marathi books)
- In-page chapter search and load-more for large question sets
- Class 8 and Class 9 study hub pages
- Static-host deployable (Netlify / Vercel / Cloudflare Pages)

## Run Locally

1. Install dependencies:
   `npm install`
2. Start development server:
   `npm run dev`
3. Open:
   `http://localhost:3000`

## Build

`npm run build`

Production files are generated in `dist/`.

## Deploy (Static Hosting)

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- `netlify.toml` is included for SPA routing.

### Vercel

- Import the repo/project in Vercel
- Vercel will use `vercel.json` (included) for Vite build + SPA rewrites

### Cloudflare Pages

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- SPA fallback is handled via static rewrite files / standard Pages SPA configuration

## SEO / Google Search Console / AdSense Setup

The project now includes:

- `public/robots.txt`
- `public/sitemap.xml`
- `public/ads.txt` (placeholder publisher ID)
- `index.html` SEO meta tags + Open Graph + schema.org structured data
- `public/privacy-policy.html`, `public/terms.html`, `public/contact.html`, `public/about.html`

Before submitting to Google Search Console / AdSense:

1. Replace all `https://vibrant-ms.pages.dev/` placeholders with your real production domain in:
   - `index.html`
   - `public/robots.txt`
   - `public/sitemap.xml`
2. Replace the `google-site-verification` token in `index.html`.
3. Replace the AdSense publisher ID in `public/ads.txt`.
4. Replace the placeholder contact email in `public/contact.html`.
5. Submit the sitemap in Google Search Console (`/sitemap.xml`).
6. Connect Google Analytics/Search Console/AdSense in your own accounts (cannot be automated without your credentials).

## Data Source Notes

- The app reads local JSON files in `public/shaalaa/`.
- Chapter grouping is generated from textbook URL metadata inside each item.
- Exercise-level grouping is not always present in the source data; some exercise pages show full chapter question-answer lists.

