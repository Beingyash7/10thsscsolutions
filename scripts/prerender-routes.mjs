import fs from 'node:fs';
import path from 'node:path';
import { formatSolution } from '../utils/formatSolution.js';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_INDEX = path.join(DIST_DIR, 'index.html');
const SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const DATA_DIR = path.join(ROOT, 'public', 'shaalaa');
const CHAPTER_META_PATH = path.join(DATA_DIR, 'chapter-meta.json');
const DEFAULT_ORIGIN = (process.env.SITE_URL || 'https://10thsscsolutions.pages.dev').replace(/\/+$/, '');

const BOOK_DATASET_MAP = {
  'math/math-1': 'algebra_maths_1.json',
  'math/math-2': 'geometry_maths_2.json',
  'science/sci-1': 'science_tech_1.json',
  'science/sci-2': 'science_tech_2.json',
  'history/hist-1': 'history_political_science.json',
  'geography/geo-1': 'geography.json',
  'english/eng-1': 'english.json',
  'hindi/hin-1': 'hindi_lokbharati.json',
  'marathi/mar-1': 'marathi_second_language.json',
};

const SUBJECTS = [
  { id: 'math', name: 'Mathematics' },
  { id: 'science', name: 'Science & Tech' },
  { id: 'history', name: 'History & Civics' },
  { id: 'geography', name: 'Geography' },
  { id: 'english', name: 'English' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'marathi', name: 'Marathi' },
];

const subjectNames = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.name]));

const bookNames = {
  'math-1': 'Algebra (Math 1)',
  'math-2': 'Geometry (Math 2)',
  'sci-1': 'Science & Tech Part 1',
  'sci-2': 'Science & Tech Part 2',
  'hist-1': 'History and Civics',
  'geo-1': 'Geography Class 10',
  'eng-1': 'English Kumarbharati',
  'hin-1': 'Hindi Lokbharati',
  'mar-1': 'Marathi (Second Language)',
};

const chapterMetaRows = fs.existsSync(CHAPTER_META_PATH)
  ? JSON.parse(fs.readFileSync(CHAPTER_META_PATH, 'utf8')).chapters || []
  : [];

const chapterMetaMap = new Map(
  chapterMetaRows.map((row) => [`${row.subjectId}/${row.bookId}/${row.chapterId}`, row]),
);

if (!fs.existsSync(DIST_INDEX)) {
  console.error('dist/index.html not found. Run build first.');
  process.exit(1);
}

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('public/sitemap.xml not found. Run sitemap generation first.');
  process.exit(1);
}

const titleCase = (slug) =>
  String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttr = (value) => escapeHtml(String(value ?? ''));

const plainText = (value) =>
  String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeDescription = (value) => {
  const text = plainText(value);
  if (text.length >= 150 && text.length <= 160) return text;
  if (text.length > 160) {
    const clipped = text.slice(0, 157).replace(/\s+\S*$/, '').trim();
    return `${clipped}.`;
  }
  return `${text} Updated chapter notes, solved textbook Q&A, and exam-focused revision help for Maharashtra Board learners.`.slice(0, 160);
};

const frontmatterMeta = (chapterName, subject, summary) => ({
  title: `${chapterName} - 10th SSC Solutions`,
  description: normalizeDescription(
    summary ||
      `${chapterName} in ${subject} with chapter-wise textbook question answers, concise explanations, and revision-ready points.`,
  ),
});

const parsePathContext = (pathname) => {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  if (!trimmed) return { type: 'home' };

  const parts = trimmed.split('/');
  if (trimmed === 'class-8') return { type: 'class8' };
  if (trimmed === 'class-9') return { type: 'class9' };
  if (trimmed === 'class-10' || trimmed === '10th-ssc-solutions') return { type: 'class10' };
  if (trimmed === 'papers') return { type: 'papers' };

  if (!trimmed.startsWith('10th-ssc-solutions/')) return { type: 'other' };

  const [, subjectId, bookId, chapterSeg] = parts;
  const subjectName = subjectNames[subjectId] || titleCase(subjectId);
  const bookName = bookNames[bookId] || titleCase(bookId);

  if (subjectId && !bookId) {
    return { type: 'subject', subjectId, subjectName };
  }

  if (subjectId && bookId && !chapterSeg) {
    return { type: 'book', subjectId, subjectName, bookId, bookName };
  }

  if (subjectId && bookId && chapterSeg?.startsWith('chapter-')) {
    const match = chapterSeg.match(/^chapter-(\d+)-(.+)$/);
    return {
      type: 'chapter',
      subjectId,
      subjectName,
      bookId,
      bookName,
      chapterNo: match?.[1] || '',
      chapterSlug: match?.[2] || '',
      chapterTitle: match?.[2] ? titleCase(match[2]) : 'Chapter',
    };
  }

  return { type: 'other' };
};

const getMetaForPath = (pathname) => {
  const siteName = '10th SSC Solutions';
  const ctx = parsePathContext(pathname);

  if (ctx.type === 'home') {
    return {
      title: `${siteName} | 10th SSC Book Solutions, Digest & Question Answers`,
      description:
        '10th SSC solutions, digest-style textbook answers and Maharashtra Board book solutions for Maths, Science, English, Hindi, Marathi, History and Geography.',
    };
  }

  if (ctx.type === 'class8') {
    return {
      title: `Class 8 Study Hub | ${siteName}`,
      description:
        'Class 8 Maharashtra Board study hub with revision plans, practice checklists and preparation guidance.',
    };
  }

  if (ctx.type === 'class9') {
    return {
      title: `Class 9 Study Hub | ${siteName}`,
      description:
        'Class 9 Maharashtra Board study hub with revision plans, practice checklists and exam preparation support.',
    };
  }

  if (ctx.type === 'class10') {
    return {
      title: `10th SSC Subject Solutions | ${siteName}`,
      description:
        'Browse subject-wise 10th SSC Maharashtra Board solutions, digest answers and textbook question-answer pages.',
    };
  }

  if (ctx.type === 'papers') {
    return {
      title: `Previous Year SSC Papers Coming Soon | ${siteName}`,
      description:
        'Previous year Maharashtra Board SSC papers are coming soon. The paper archive is being organized and verified before release.',
    };
  }

  if (ctx.type === 'subject') {
    return {
      title: `${ctx.subjectName} 10th SSC Solutions | ${siteName}`,
      description: `${ctx.subjectName} 10th SSC book solutions, digest answers and chapter-wise textbook question answers for Maharashtra Board Class 10 SSC.`,
    };
  }

  if (ctx.type === 'book') {
    return {
      title: `${ctx.bookName} 10th SSC Book Solutions | ${siteName}`,
      description: `${ctx.bookName} chapter-wise Maharashtra Board 10th SSC book solutions and digest answers.`,
    };
  }

  if (ctx.type === 'chapter') {
    return frontmatterMeta(
      ctx.chapterTitle,
      `${ctx.subjectName} ${ctx.bookName}`,
      `${ctx.chapterTitle} chapter-wise 10th SSC solutions with digest-style textbook question answers, concise explanations, revision points, and exam-focused guidance for Maharashtra Board students.`,
    );
  }

  return {
    title: `${siteName} | Maharashtra Board Solutions`,
    description: 'Maharashtra Board question answers and 10th SSC digest-style book solutions.',
  };
};

const datasetItemsCache = new Map();
const chapterIndexCache = new Map();

const chapterMatchFromUrl = (value) => String(value || '').toLowerCase().match(/-chapter-(\d+)-([^_#]+)/);

const readDatasetItems = (subjectId, bookId) => {
  const bookKey = `${subjectId}/${bookId}`;
  const fileName = BOOK_DATASET_MAP[bookKey];
  if (!fileName) return [];
  if (datasetItemsCache.has(fileName)) return datasetItemsCache.get(fileName);

  const fullPath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(fullPath)) {
    datasetItemsCache.set(fileName, []);
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    datasetItemsCache.set(fileName, items);
    return items;
  } catch (error) {
    console.error(`Failed reading ${fileName}:`, error.message);
    datasetItemsCache.set(fileName, []);
    return [];
  }
};

const getBookChapters = (subjectId, bookId) => {
  const cacheKey = `${subjectId}/${bookId}`;
  if (chapterIndexCache.has(cacheKey)) return chapterIndexCache.get(cacheKey);

  const map = new Map();
  const items = readDatasetItems(subjectId, bookId);

  for (const item of items) {
    for (const occurrence of item?.appears_in || []) {
      const match = chapterMatchFromUrl(occurrence?.url);
      if (!match) continue;
      const chapterNo = Number(match[1]);
      const chapterSlug = match[2];
      if (!Number.isFinite(chapterNo)) continue;
      if (!map.has(chapterNo)) {
        map.set(chapterNo, {
          number: chapterNo,
          slug: slugify(chapterSlug),
          title: titleCase(chapterSlug),
        });
      }
    }
  }

  const chapters = [...map.values()].sort((a, b) => a.number - b.number);
  chapterIndexCache.set(cacheKey, chapters);
  return chapters;
};

const getChapterItems = (ctx) => {
  const chapterNo = Number(ctx.chapterNo);
  if (!Number.isFinite(chapterNo)) return [];

  const items = readDatasetItems(ctx.subjectId, ctx.bookId);
  const seen = new Set();

  return items
    .filter((item) =>
      Array.isArray(item?.appears_in) &&
      item.appears_in.some((entry) => {
        const match = chapterMatchFromUrl(entry?.url);
        return match && Number(match[1]) === chapterNo;
      }),
    )
    .map((item) => ({
      question: String(item?.question || '').trim() || String(item?.title || '').trim() || 'Question unavailable',
      answerHtml: String(item?.solution_html || item?.solution_text || '').trim(),
    }))
    .filter((row) => {
      const key = `${row.question}__${row.answerHtml}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const buildBookClusterSection = (ctx) => {
  const chapters = getBookChapters(ctx.subjectId, ctx.bookId);
  const chapterLinks = chapters
    .map((chapter) => {
      const href = `/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}/chapter-${chapter.number}-${chapter.slug}`;
      const anchor = `Chapter ${chapter.number} ${chapter.title} - 10th SSC ${ctx.subjectName} Solutions`;
      return `<li><a href="${href}">${escapeHtml(anchor)}</a></li>`;
    })
    .join('');

  return `
<section class="book-content" style="max-width:1000px;margin:24px auto;padding:20px 24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;color:#0f172a;line-height:1.6">
  <h1>${escapeHtml(`${ctx.bookName} Chapter-wise Solutions`)}</h1>
  <p>${escapeHtml(`Browse all chapters for ${ctx.bookName}.`)}</p>
  <ul>${chapterLinks || '<li>Chapter links are being updated.</li>'}</ul>
</section>`;
};

const buildChapterClusterSection = (ctx, chapterItems) => {
  const chapters = getBookChapters(ctx.subjectId, ctx.bookId);
  const currentNo = Number(ctx.chapterNo);
  const currentIndex = chapters.findIndex((chapter) => chapter.number === currentNo);
  const previous = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const prevLink = previous
    ? `<a href="/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}/chapter-${previous.number}-${previous.slug}">Previous Chapter: ${escapeHtml(`Chapter ${previous.number} ${previous.title}`)}</a>`
    : '<span>Previous Chapter: Not available</span>';

  const nextLink = next
    ? `<a href="/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}/chapter-${next.number}-${next.slug}">Next Chapter: ${escapeHtml(`Chapter ${next.number} ${next.title}`)}</a>`
    : '<span>Next Chapter: Not available</span>';

  const otherSubjectsLinks = SUBJECTS
    .filter((subject) => subject.id !== ctx.subjectId)
    .map((subject) => `<li><a href="/10th-ssc-solutions/${subject.id}">${escapeHtml(`${subject.name} 10th SSC Solutions`)}</a></li>`)
    .join('');

  const articles = chapterItems.length
    ? chapterItems
        .map(
          (item, index) => `
  <article class="qa">
    <h2 class="q-title"><span class="q-num">Q${index + 1}.</span> ${escapeHtml(item.question)}</h2>
    <div class="a-body">${formatSolution(item.question, item.answerHtml).formattedAnswerHtml}</div>
  </article>`,
        )
        .join('')
    : '\n  <p><em>Chapter questions are being updated.</em></p>';

  const metaRow = chapterMetaMap.get(`${ctx.subjectId}/${ctx.bookId}/${Number(ctx.chapterNo)}`);
  const updatedOn = metaRow?.lastUpdated || new Date().toISOString().slice(0, 10);
  const author = metaRow?.author || { slug: 'editorial-team', name: 'SSC Solutions Editorial Team' };

  return `
<section class="chapter-content" style="max-width:1000px;margin:24px auto;padding:20px 24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;color:#0f172a;line-height:1.6">
  <p style="font-size:14px;color:#475569;margin-bottom:8px;"><strong>Updated on:</strong> ${escapeHtml(updatedOn)} | <strong>Author:</strong> <a href="/authors/${escapeAttr(author.slug)}.html">${escapeHtml(author.name)}</a></p>
  <h1>${escapeHtml(`${ctx.bookName} Chapter ${ctx.chapterNo} ${ctx.chapterTitle} Solutions`)}</h1>${articles}
  <nav class="chapter-links" style="display:flex;flex-wrap:wrap;gap:12px;margin-top:20px">${prevLink}<a href="/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}">All Chapters: ${escapeHtml(ctx.bookName)}</a>${nextLink}</nav>
  <section class="other-subjects" style="margin-top:20px">
    <h2>Other Subjects</h2>
    <ul>${otherSubjectsLinks}</ul>
  </section>
</section>`;
};

const buildBreadcrumbs = (pathname) => {
  const ctx = parsePathContext(pathname);
  const crumbs = [{ name: 'Home', path: '/' }];

  if (ctx.type === 'class10') {
    crumbs.push({ name: '10th SSC Solutions', path: '/10th-ssc-solutions' });
  } else if (ctx.type === 'subject') {
    crumbs.push({ name: '10th SSC Solutions', path: '/10th-ssc-solutions' });
    crumbs.push({ name: ctx.subjectName, path: pathname });
  } else if (ctx.type === 'book') {
    crumbs.push({ name: '10th SSC Solutions', path: '/10th-ssc-solutions' });
    crumbs.push({ name: ctx.subjectName, path: `/10th-ssc-solutions/${ctx.subjectId}` });
    crumbs.push({ name: ctx.bookName, path: pathname });
  } else if (ctx.type === 'chapter') {
    crumbs.push({ name: '10th SSC Solutions', path: '/10th-ssc-solutions' });
    crumbs.push({ name: ctx.subjectName, path: `/10th-ssc-solutions/${ctx.subjectId}` });
    crumbs.push({ name: ctx.bookName, path: `/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}` });
    crumbs.push({ name: `Chapter ${ctx.chapterNo}: ${ctx.chapterTitle}`, path: pathname });
  }

  return crumbs;
};

const buildStructuredData = (pathname, chapterItems = []) => {
  const meta = getMetaForPath(pathname);
  const canonical = `${DEFAULT_ORIGIN}${pathname}`;
  const breadcrumbs = buildBreadcrumbs(pathname);
  const ctx = parsePathContext(pathname);

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${DEFAULT_ORIGIN}${crumb.path}`,
      })),
    },
  ];

  if (ctx.type === 'chapter') {
    const metaRow = chapterMetaMap.get(`${ctx.subjectId}/${ctx.bookId}/${Number(ctx.chapterNo)}`);
    const authorName = metaRow?.author?.name || 'SSC Solutions Editorial Team';
    const datePublished = metaRow?.lastUpdated || new Date().toISOString().slice(0, 10);
    const authorUrl = `${DEFAULT_ORIGIN}/authors/${metaRow?.author?.slug || 'editorial-team'}.html`;
    const qaPairs = chapterItems.slice(0, 40).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: plainText(formatSolution(item.question, item.answerHtml).formattedAnswerHtml),
      },
    }));

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      headline: meta.title,
      description: meta.description,
      url: canonical,
      mainEntityOfPage: canonical,
      about: ctx.bookName,
      datePublished,
      author: { '@type': 'Person', name: authorName, url: authorUrl },
      mainEntity: qaPairs,
    });
  }

  return schemas
    .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');
};

const updateHtmlMeta = (html, pathname) => {
  const meta = getMetaForPath(pathname);
  const canonical = `${DEFAULT_ORIGIN}${pathname}`;
  const ctx = parsePathContext(pathname);
  const chapterItems = ctx.type === 'chapter' ? getChapterItems(ctx) : [];
  const socialImage = `${DEFAULT_ORIGIN}/brand/home-logo-light.png`;
  const ogType = ctx.type === 'chapter' ? 'article' : 'website';

  let next = html;
  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  next = next.replace(/<html[^>]*>/i, '<html lang="en" class="light">');
  next = next.replace(/<meta[^>]*name="keywords"[^>]*\/?>\s*/gi, '');
  next = next.replace(/<link[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*\/?>\s*/gi, '');
  next = next.replace(/<meta[^>]*name="robots"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`);
  next = next.replace(/<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="description" content="${escapeAttr(meta.description)}" />`);
  next = next.replace(/<meta[^>]*property="og:type"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:type" content="${escapeAttr(ogType)}" />`);
  next = next.replace(/<meta[^>]*property="og:site_name"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:site_name" content="10th SSC Solutions" />`);
  next = next.replace(/<meta[^>]*property="og:title"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:title" content="${escapeAttr(meta.title)}" />`);
  next = next.replace(/<meta[^>]*property="og:description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:description" content="${escapeAttr(meta.description)}" />`);
  next = next.replace(/<meta[^>]*property="og:image"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:image" content="${escapeAttr(socialImage)}" />`);
  next = next.replace(/<meta[^>]*property="og:image:alt"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:image:alt" content="10th SSC Solutions logo" />`);
  next = next.replace(/<meta[^>]*name="twitter:card"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="twitter:card" content="summary_large_image" />`);
  next = next.replace(/<meta[^>]*name="twitter:site"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="twitter:site" content="@10thsscsolutions" />`);
  next = next.replace(/<meta[^>]*name="twitter:title"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`);
  next = next.replace(/<meta[^>]*name="twitter:description"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`);
  next = next.replace(/<meta[^>]*name="twitter:image"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta name="twitter:image" content="${escapeAttr(socialImage)}" />`);
  next = next.replace(/<meta[^>]*property="og:url"[^>]*content="[^"]*"[^>]*\/?>/i, `<meta property="og:url" content="${escapeAttr(canonical)}" />`);
  next = next.replace(/<link[^>]*rel="canonical"[^>]*href="[^"]*"[^>]*\/?>/i, `<link rel="canonical" href="${escapeAttr(canonical)}" />`);
  next = next.replace(/<link[^>]*rel="alternate"[^>]*title="Sitemap"[^>]*\/?>/i, `<link rel="alternate" type="application/xml" title="Sitemap" href="/sitemap.xml" />`);

  if (pathname !== '/' && !pathname.endsWith('.html')) {
    next = next.replace(/<\/head>/i, `${buildStructuredData(pathname, chapterItems)}\n</head>`);

    if (ctx.type === 'chapter') {
      next = next.replace(/<div id="root"><\/div>/i, `${buildChapterClusterSection(ctx, chapterItems)}\n    <div id="root"></div>`);
    }

    if (ctx.type === 'book') {
      next = next.replace(/<div id="root"><\/div>/i, `${buildBookClusterSection(ctx)}\n    <div id="root"></div>`);
    }
  }

  return next;
};

const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
const allPaths = locMatches
  .map((match) => {
    try {
      return new URL(match[1]).pathname;
    } catch {
      return null;
    }
  })
  .filter(Boolean)
  .filter((pathname) => !/\.(xml|txt|json|webmanifest)$/i.test(pathname));

const baseHtml = fs.readFileSync(DIST_INDEX, 'utf8').replaceAll('__SITE_URL__', DEFAULT_ORIGIN);

let generated = 0;
for (const pathname of allPaths) {
  const html = updateHtmlMeta(baseHtml, pathname);
  if (pathname === '/') {
    fs.writeFileSync(DIST_INDEX, html, 'utf8');
    generated += 1;
    continue;
  }

  if (pathname.endsWith('.html')) continue;

  const outDir = path.join(DIST_DIR, pathname.replace(/^\/+/, ''));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  generated += 1;
}

console.log(`Pre-rendered ${generated} route shells in dist/`);

