import fs from 'node:fs';
import path from 'node:path';

const SITE_URL = (process.env.SITE_URL || 'https://10thsscsolutions.pages.dev').replace(/\/+$/, '');
const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SHAALAA_DIR = path.join(PUBLIC_DIR, 'shaalaa');
const AUTHORS_DIR = path.join(PUBLIC_DIR, 'authors');

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

const titleFromSlug = (slug) =>
  String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const isoDate = (value) => new Date(value).toISOString().slice(0, 10);
const today = isoDate(Date.now());

const fileLastmod = (filePath) => {
  try {
    return isoDate(fs.statSync(filePath).mtimeMs);
  } catch {
    return today;
  }
};

const extractChapters = (items) => {
  const chapterMap = new Map();
  for (const item of items || []) {
    for (const occurrence of item?.appears_in || []) {
      const url = String(occurrence?.url || '').toLowerCase();
      const match = url.match(/-chapter-(\d+)-([^_#]+)/);
      if (!match) continue;
      const chapterNo = Number(match[1]);
      const chapterSlug = match[2];
      if (!Number.isFinite(chapterNo)) continue;
      if (!chapterMap.has(chapterNo)) {
        chapterMap.set(chapterNo, { id: chapterNo, title: titleFromSlug(chapterSlug) });
      }
    }
  }

  return [...chapterMap.values()].sort((a, b) => a.id - b.id);
};

const urls = new Map();
const addUrl = (pathname, changefreq, priority, lastmod) => {
  urls.set(pathname, {
    changefreq: changefreq || 'weekly',
    priority: priority || '0.7',
    lastmod: lastmod || today,
  });
};

const subjectLastmods = new Map();
let overallLastmod = today;

addUrl('/class-8', 'weekly', '0.6', today);
addUrl('/class-9', 'weekly', '0.6', today);
addUrl('/class-10', 'weekly', '0.7', today);
addUrl('/10th-ssc-solutions', 'daily', '0.9', today);
addUrl('/about.html', 'monthly', '0.4', today);
addUrl('/contact.html', 'monthly', '0.4', today);
addUrl('/privacy-policy.html', 'yearly', '0.3', today);
addUrl('/terms.html', 'yearly', '0.3', today);
addUrl('/authors/editorial-team.html', 'monthly', '0.5', today);
addUrl('/authors/aarti-kulkarni.html', 'monthly', '0.5', today);
addUrl('/authors/rahul-patil.html', 'monthly', '0.5', today);

if (fs.existsSync(AUTHORS_DIR)) {
  for (const file of fs.readdirSync(AUTHORS_DIR)) {
    if (!file.endsWith('.html')) continue;
    const authorPath = `/authors/${file}`;
    addUrl(authorPath, 'monthly', '0.5', fileLastmod(path.join(AUTHORS_DIR, file)));
  }
}

for (const book of BOOKS) {
  const filePath = path.join(SHAALAA_DIR, book.file);
  const lastmod = fileLastmod(filePath);
  if (lastmod > overallLastmod) overallLastmod = lastmod;

  const subjectPath = `/10th-ssc-solutions/${book.subjectId}`;
  const bookPath = `${subjectPath}/${book.bookId}`;

  const prevSubjectDate = subjectLastmods.get(book.subjectId);
  if (!prevSubjectDate || lastmod > prevSubjectDate) {
    subjectLastmods.set(book.subjectId, lastmod);
  }

  addUrl(bookPath, 'daily', '0.9', lastmod);

  if (!fs.existsSync(filePath)) continue;

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const chapters = extractChapters(parsed?.items || []);
    for (const chapter of chapters) {
      addUrl(`${bookPath}/chapter-${chapter.id}-${slugify(chapter.title)}`, 'daily', '0.8', lastmod);
    }
  } catch (error) {
    console.error(`Failed to parse ${book.file}:`, error.message);
  }
}

for (const [subjectId, lastmod] of subjectLastmods.entries()) {
  addUrl(`/10th-ssc-solutions/${subjectId}`, 'weekly', '0.8', lastmod);
}

addUrl('/', 'daily', '1.0', overallLastmod);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
  [...urls.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([pathname, meta]) =>
        `  <url>\n    <loc>${SITE_URL}${pathname}</loc>\n    <lastmod>${meta.lastmod}</lastmod>\n    <changefreq>${meta.changefreq}</changefreq>\n    <priority>${meta.priority}</priority>\n  </url>`,
    )
    .join('\n')
}\n</urlset>\n`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
fs.writeFileSync(
  path.join(PUBLIC_DIR, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: CCBot\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  'utf8',
);
console.log(`Sitemap generated with ${urls.size} URLs -> public/sitemap.xml`);

