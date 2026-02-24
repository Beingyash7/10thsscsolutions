import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST_DIR = path.join(ROOT, 'dist');
const DIST_INDEX = path.join(DIST_DIR, 'index.html');
const SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const DEFAULT_ORIGIN = process.env.SITE_URL || 'https://vibrant-ms.pages.dev';

if (!fs.existsSync(DIST_INDEX)) {
  console.error('dist/index.html not found. Run build first.');
  process.exit(1);
}

if (!fs.existsSync(SITEMAP_PATH)) {
  console.error('public/sitemap.xml not found. Run sitemap generation first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(DIST_INDEX, 'utf8');
const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');

const subjectNames = {
  math: 'Mathematics',
  science: 'Science & Tech',
  history: 'History & Civics',
  geography: 'Geography',
  english: 'English',
  hindi: 'Hindi',
  marathi: 'Marathi',
};

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

const titleCase = (slug) =>
  String(slug || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const parsePathContext = (pathname) => {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  if (!trimmed) return { type: 'home' };

  const parts = trimmed.split('/');
  if (trimmed === 'class-8') return { type: 'class8' };
  if (trimmed === 'class-9') return { type: 'class9' };
  if (trimmed === 'class-10' || trimmed === '10th-ssc-solutions') return { type: 'class10' };

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
    return {
      title: `${ctx.bookName} Chapter ${ctx.chapterNo} Solutions | ${siteName}`,
      description: `${ctx.bookName} chapter ${ctx.chapterNo} (${ctx.chapterTitle}) 10th SSC solutions, digest answers and textbook question-answer explanations.`,
    };
  }

  return {
    title: `${siteName} | Maharashtra Board Solutions`,
    description:
      'Maharashtra Board question answers and 10th SSC digest-style book solutions.',
  };
};

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

const getRelatedLinks = (pathname, limit = 8) => {
  const ctx = parsePathContext(pathname);

  if (ctx.type === 'subject') {
    return allPaths
      .filter((p) => p.startsWith(`/10th-ssc-solutions/${ctx.subjectId}/`) && p.split('/').length === 4)
      .slice(0, limit);
  }

  if (ctx.type === 'book') {
    return allPaths
      .filter((p) => p.startsWith(`/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}/chapter-`))
      .slice(0, limit);
  }

  if (ctx.type === 'chapter') {
    const siblings = allPaths.filter(
      (p) =>
        p.startsWith(`/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}/chapter-`) &&
        p !== pathname,
    );
    const parents = [
      `/10th-ssc-solutions/${ctx.subjectId}`,
      `/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}`,
    ];
    return [...parents, ...siblings.slice(0, Math.max(0, limit - parents.length))];
  }

  if (ctx.type === 'class10') {
    return allPaths
      .filter((p) => p.startsWith('/10th-ssc-solutions/') && p.split('/').length === 3)
      .slice(0, limit);
  }

  if (ctx.type === 'home') {
    return [
      '/10th-ssc-solutions',
      '/10th-ssc-solutions/math/math-1',
      '/10th-ssc-solutions/math/math-2',
      '/10th-ssc-solutions/science/sci-1',
      '/10th-ssc-solutions/science/sci-2',
      '/10th-ssc-solutions/english/eng-1',
      '/10th-ssc-solutions/hindi/hin-1',
      '/10th-ssc-solutions/marathi/mar-1',
    ].filter((p) => allPaths.includes(p));
  }

  return [];
};

const getAnchorText = (pathname) => {
  const ctx = parsePathContext(pathname);
  if (ctx.type === 'subject') return `${ctx.subjectName} 10th SSC Solutions`;
  if (ctx.type === 'book') return `${ctx.bookName} Book Solutions`;
  if (ctx.type === 'chapter') {
    return `${ctx.bookName} Chapter ${ctx.chapterNo} ${ctx.chapterTitle} Solutions`;
  }
  if (ctx.type === 'class10') return '10th SSC Subject Solutions';
  if (ctx.type === 'class8') return 'Class 8 Study Hub';
  if (ctx.type === 'class9') return 'Class 9 Study Hub';
  if (ctx.type === 'home') return 'Home';
  return pathname;
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
    crumbs.push({
      name: ctx.subjectName,
      path: `/10th-ssc-solutions/${ctx.subjectId}`,
    });
    crumbs.push({ name: ctx.bookName, path: pathname });
  } else if (ctx.type === 'chapter') {
    crumbs.push({ name: '10th SSC Solutions', path: '/10th-ssc-solutions' });
    crumbs.push({
      name: ctx.subjectName,
      path: `/10th-ssc-solutions/${ctx.subjectId}`,
    });
    crumbs.push({
      name: ctx.bookName,
      path: `/10th-ssc-solutions/${ctx.subjectId}/${ctx.bookId}`,
    });
    crumbs.push({
      name: `Chapter ${ctx.chapterNo}: ${ctx.chapterTitle}`,
      path: pathname,
    });
  }

  return crumbs;
};

const buildSeoContentBlock = (pathname) => {
  const ctx = parsePathContext(pathname);
  const related = getRelatedLinks(pathname, 10);
  const meta = getMetaForPath(pathname);
  const canonical = `${DEFAULT_ORIGIN}${pathname}`;
  const breadcrumbs = buildBreadcrumbs(pathname);

  let heading = '10th SSC Solutions';
  let intro =
    'Find Maharashtra Board textbook question answers, digest-style explanations, and chapter-wise 10th SSC book solutions.';

  if (ctx.type === 'subject') {
    heading = `${ctx.subjectName} 10th SSC Solutions`;
    intro = `${ctx.subjectName} Maharashtra Board Class 10 textbook solutions, digest answers, and chapter-wise question-answer support. Browse books and open chapter pages for full solutions.`;
  } else if (ctx.type === 'book') {
    heading = `${ctx.bookName} 10th SSC Book Solutions`;
    intro = `${ctx.bookName} chapter-wise 10th SSC solutions and digest answers for Maharashtra Board students. Open any chapter to read textbook question answers and explanations.`;
  } else if (ctx.type === 'chapter') {
    heading = `${ctx.bookName} Chapter ${ctx.chapterNo} Solutions`;
    intro = `Chapter ${ctx.chapterNo} (${ctx.chapterTitle}) 10th SSC digest and textbook solutions page for Maharashtra Board students. Use the page app below to browse solved questions and answers.`;
  } else if (ctx.type === 'class10') {
    heading = '10th SSC Subject-wise Book Solutions';
    intro = 'Browse subject-wise Maharashtra Board Class 10 textbook solutions, including Maths, Science, Geography, History, English, Hindi, and Marathi.';
  }

  const breadcrumbHtml = breadcrumbs
    .map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      if (isLast) return `<span>${escapeHtml(crumb.name)}</span>`;
      return `<a href="${crumb.path}">${escapeHtml(crumb.name)}</a>`;
    })
    .join(' <span aria-hidden="true">›</span> ');

  const linksHtml = related.length
    ? `<h2>Related 10th SSC Solution Pages</h2>
       <ul>${related
         .map(
           (linkPath) =>
             `<li><a href="${linkPath}">${escapeHtml(getAnchorText(linkPath))}</a></li>`,
         )
         .join('')}</ul>`
    : '';

  const faqHtml =
    ctx.type === 'book' || ctx.type === 'chapter'
      ? `<h2>Common Questions</h2>
         <dl>
           <dt>Are these 10th SSC digest and book solutions chapter-wise?</dt>
           <dd>Yes. This route is organized for chapter-wise Maharashtra Board textbook question answers and book solutions.</dd>
           <dt>Can I use these solutions for revision before exams?</dt>
           <dd>Yes. Use them for quick revision, concept checking, and practice. Always cross-check with your textbook and teacher guidance for final preparation.</dd>
         </dl>`
      : '';

  return `
<section id="prerender-seo-content" style="max-width:1000px;margin:24px auto;padding:20px 24px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;color:#0f172a;font-family:system-ui,sans-serif;line-height:1.55">
  <nav aria-label="Breadcrumb" style="font-size:14px;margin-bottom:10px;color:#475569">${breadcrumbHtml}</nav>
  <h1 style="font-size:28px;line-height:1.2;margin:0 0 10px 0">${escapeHtml(heading)}</h1>
  <p style="margin:0 0 14px 0;color:#334155">${escapeHtml(intro)}</p>
  <p style="margin:0 0 14px 0;color:#64748b;font-size:14px">SEO route URL: <a href="${pathname}">${escapeHtml(canonical)}</a></p>
  ${linksHtml}
  ${faqHtml}
</section>
<script>window.addEventListener('load',function(){var n=document.getElementById('prerender-seo-content');if(n){n.remove();}});</script>
`;
};

const buildStructuredData = (pathname) => {
  const meta = getMetaForPath(pathname);
  const canonical = `${DEFAULT_ORIGIN}${pathname}`;
  const breadcrumbs = buildBreadcrumbs(pathname);
  const ctx = parsePathContext(pathname);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${DEFAULT_ORIGIN}${crumb.path}`,
    })),
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description,
    url: canonical,
    inLanguage: 'en-IN',
    isPartOf: {
      '@type': 'WebSite',
      name: '10th SSC Solutions',
      url: DEFAULT_ORIGIN,
    },
  };

  const schemas = [breadcrumbSchema, webPageSchema];

  if (ctx.type === 'book' || ctx.type === 'chapter') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Are these 10th SSC digest and book solutions chapter-wise?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. This page is part of a chapter-wise Maharashtra Board Class 10 textbook solutions and digest answer library.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I use these solutions for exam revision?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Use these textbook question answers for revision and concept review, and cross-check with your textbook and teacher guidance.',
          },
        },
      ],
    });
  }

  return schemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`,
    )
    .join('\n');
};

const updateHtmlMeta = (html, pathname) => {
  const meta = getMetaForPath(pathname);
  const canonical = `${DEFAULT_ORIGIN}${pathname}`;

  let next = html;
  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  next = next.replace(
    /<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*\/?>/i,
    `<meta name="description" content="${meta.description}" />`,
  );
  next = next.replace(
    /<meta[^>]*property="og:title"[^>]*content="[^"]*"[^>]*\/?>/i,
    `<meta property="og:title" content="${meta.title}" />`,
  );
  next = next.replace(
    /<meta[^>]*property="og:description"[^>]*content="[^"]*"[^>]*\/?>/i,
    `<meta property="og:description" content="${meta.description}" />`,
  );
  next = next.replace(
    /<meta[^>]*name="twitter:title"[^>]*content="[^"]*"[^>]*\/?>/i,
    `<meta name="twitter:title" content="${meta.title}" />`,
  );
  next = next.replace(
    /<meta[^>]*name="twitter:description"[^>]*content="[^"]*"[^>]*\/?>/i,
    `<meta name="twitter:description" content="${meta.description}" />`,
  );
  next = next.replace(
    /<meta[^>]*property="og:url"[^>]*content="[^"]*"[^>]*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`,
  );
  next = next.replace(
    /<link[^>]*rel="canonical"[^>]*href="[^"]*"[^>]*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`,
  );

  if (pathname !== '/' && !pathname.endsWith('.html')) {
    next = next.replace(
      /<\/head>/i,
      `${buildStructuredData(pathname)}\n</head>`,
    );
    next = next.replace(
      /<div id="root"><\/div>/i,
      `${buildSeoContentBlock(pathname)}\n    <div id="root"></div>`,
    );
  }

  return next;
};

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
