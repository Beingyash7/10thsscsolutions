import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SHAALAA_DIR = path.join(ROOT, 'public', 'shaalaa');
const AUTHORS_DIR = path.join(ROOT, 'public', 'authors');
const CHAPTER_META_PATH = path.join(SHAALAA_DIR, 'chapter-meta.json');

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

const AUTHORS = {
  editorial_team: {
    slug: 'editorial-team',
    name: 'SSC Solutions Editorial Team',
    bio: 'The SSC Solutions editorial team prepares chapter-wise textbook answers, verifies updates against syllabus revisions, and maintains structured learning notes for Maharashtra Board students.',
    photo: '/covers/eng-1.png',
    social: { website: '/about.html' },
  },
  math_reviewer: {
    slug: 'aarti-kulkarni',
    name: 'Aarti Kulkarni',
    bio: 'Aarti is a mathematics educator focused on Algebra and Geometry problem-solving strategies for SSC board examinations.',
    photo: '/covers/math-1.png',
    social: { linkedin: 'https://www.linkedin.com' },
  },
  science_reviewer: {
    slug: 'rahul-patil',
    name: 'Rahul Patil',
    bio: 'Rahul specializes in Science and Technology exam preparation with concept-first explanations and revision checklists.',
    photo: '/covers/sci-1.png',
    social: { twitter: 'https://x.com' },
  },
};

const SUBJECT_AUTHOR = {
  math: AUTHORS.math_reviewer,
  science: AUTHORS.science_reviewer,
  history: AUTHORS.editorial_team,
  geography: AUTHORS.editorial_team,
  english: AUTHORS.editorial_team,
  hindi: AUTHORS.editorial_team,
  marathi: AUTHORS.editorial_team,
};

const isoDate = (value) => new Date(value).toISOString().slice(0, 10);
const chapterRegex = /-chapter-(\d+)-([^_#]+)/i;

const chapterMetaRows = [];

for (const book of BOOKS) {
  const fullPath = path.join(SHAALAA_DIR, book.file);
  if (!fs.existsSync(fullPath)) continue;

  const dataset = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const seen = new Set();
  const lastUpdated = isoDate(fs.statSync(fullPath).mtimeMs);
  const author = SUBJECT_AUTHOR[book.subjectId] || AUTHORS.editorial_team;

  for (const item of dataset.items || []) {
    for (const entry of item.appears_in || []) {
      const match = String(entry?.url || '').match(chapterRegex);
      if (!match) continue;
      const chapterId = Number(match[1]);
      if (!Number.isFinite(chapterId)) continue;
      const key = `${book.subjectId}/${book.bookId}/${chapterId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      chapterMetaRows.push({
        subjectId: book.subjectId,
        bookId: book.bookId,
        chapterId,
        lastUpdated,
        author,
      });
    }
  }
}

chapterMetaRows.sort((a, b) =>
  `${a.subjectId}-${a.bookId}-${a.chapterId}`.localeCompare(`${b.subjectId}-${b.bookId}-${b.chapterId}`),
);

fs.writeFileSync(
  CHAPTER_META_PATH,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      chapters: chapterMetaRows,
    },
    null,
    2,
  ),
  'utf8',
);

fs.mkdirSync(AUTHORS_DIR, { recursive: true });
for (const author of Object.values(AUTHORS)) {
  const socialLinks = Object.entries(author.social || {})
    .map(([network, url]) => `<li><strong>${network}:</strong> <a href="${url}">${url}</a></li>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${author.name} - 10th SSC Solutions</title>
  <meta name="description" content="${author.name} profile and editorial bio for 10th SSC Solutions." />
  <link rel="canonical" href="https://10thsscsolutions.pages.dev/authors/${author.slug}.html" />
</head>
<body style="font-family: Arial, sans-serif; max-width: 760px; margin: 40px auto; line-height: 1.6; padding: 0 16px;">
  <h1>${author.name}</h1>
  <img src="${author.photo}" alt="${author.name}" width="220" loading="lazy" />
  <p>${author.bio}</p>
  <h2>Social Links</h2>
  <ul>${socialLinks || '<li>No public social links.</li>'}</ul>
</body>
</html>`;

  fs.writeFileSync(path.join(AUTHORS_DIR, `${author.slug}.html`), html, 'utf8');
}

console.log(`Enriched chapter metadata for ${chapterMetaRows.length} chapters and generated ${Object.keys(AUTHORS).length} author pages.`);
