import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = process.env.SITE_URL || 'https://vibrant-ms.pages.dev';
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

const BOOKS = [
  { subjectId: 'math', bookId: 'math-1', file: 'algebra_maths_1.json' },
  { subjectId: 'math', bookId: 'math-2', file: 'geometry_maths_2.json' },
  { subjectId: 'science', bookId: 'sci-1', file: 'science_tech_1.json' },
  { subjectId: 'science', bookId: 'sci-2', file: 'science_tech_2.json' },
  { subjectId: 'history', bookId: 'hist-1', file: 'history_political_science.json' },
  { subjectId: 'geography', bookId: 'geo-1', file: 'geography.json' },
  { subjectId: 'english', bookId: 'eng-1', file: 'english.json' },
  { subjectId: 'hindi', bookId: 'hin-1', file: 'hindi_lokbharati.json' },
  { subjectId: 'marathi', bookId: 'mar-1', file: 'marathi_second_language.json' },
];

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const chapterTitleFromSlug = (slug) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

const extractChapters = (items) => {
  const map = new Map();

  for (const item of items || []) {
    for (const occurrence of item.appears_in || []) {
      const url = String(occurrence.url || '').toLowerCase();
      if (!url.includes('/textbook-solutions/c/')) continue;
      const match = url.match(/-chapter-(\d+)-([^_#]+)/);
      if (!match) continue;

      const id = Number(match[1]);
      const slug = match[2];
      if (!Number.isFinite(id)) continue;
      if (!map.has(id)) {
        map.set(id, chapterTitleFromSlug(slug));
      }
    }
  }

  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, title]) => ({ id, title }));
};

const urls = new Map();
const today = new Date().toISOString().slice(0, 10);
const addUrl = (
  pathname,
  changefreq = 'weekly',
  priority = '0.7',
  lastmod = today,
) => {
  urls.set(pathname, { changefreq, priority, lastmod });
};

addUrl('/', 'daily', '1.0');
addUrl('/class-8', 'weekly', '0.6');
addUrl('/class-9', 'weekly', '0.6');
addUrl('/class-10', 'weekly', '0.7');
addUrl('/10th-ssc-solutions', 'daily', '0.9');
addUrl('/about.html', 'monthly', '0.4');
addUrl('/contact.html', 'monthly', '0.4');
addUrl('/privacy-policy.html', 'yearly', '0.3');
addUrl('/terms.html', 'yearly', '0.3');

for (const book of BOOKS) {
  const subjectPath = `/10th-ssc-solutions/${book.subjectId}`;
  const bookPath = `${subjectPath}/${book.bookId}`;
  addUrl(subjectPath, 'weekly', '0.8');
  addUrl(bookPath, 'daily', '0.9');

  const filePath = path.join(PUBLIC_DIR, 'shaalaa', book.file);
  if (!fs.existsSync(filePath)) continue;

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const chapters = extractChapters(raw.items || []);
    for (const chapter of chapters) {
      addUrl(
        `${bookPath}/chapter-${chapter.id}-${slugify(chapter.title)}`,
        'daily',
        '0.8',
      );
    }
  } catch (error) {
    console.error(`Failed to parse ${book.file}:`, error.message);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
  ...urls.entries(),
]
  .map(([pathname, meta]) => `  <url>\n    <loc>${SITE_URL}${pathname}</loc>\n    <lastmod>${meta.lastmod}</lastmod>\n    <changefreq>${meta.changefreq}</changefreq>\n    <priority>${meta.priority}</priority>\n  </url>`)
  .join('\n')}\n</urlset>\n`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
console.log(`Sitemap generated with ${urls.size} URLs -> public/sitemap.xml`);
