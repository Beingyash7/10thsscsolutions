import type { Author } from '../../types';

export type MetaInput = {
  chapterName?: string;
  subject?: string;
  summary?: string;
};

const stripExtraWhitespace = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const clampDescription = (value: string): string => {
  const normalized = stripExtraWhitespace(value);
  if (normalized.length >= 150 && normalized.length <= 160) {
    return normalized;
  }

  if (normalized.length > 160) {
    const cutoff = normalized.slice(0, 157).replace(/\s+\S*$/, '').trim();
    return `${cutoff}.`;
  }

  return `${normalized} Updated chapter notes, solved textbook Q&A, and exam-focused revision help for Maharashtra Board learners.`.slice(
    0,
    160,
  );
};

export const generatePageMeta = (input: MetaInput): { title: string; description: string } => {
  const chapterName = stripExtraWhitespace(input.chapterName || '10th SSC Solutions');
  const subject = stripExtraWhitespace(input.subject || 'Maharashtra Board');
  const summary = stripExtraWhitespace(
    input.summary ||
      `${chapterName} in ${subject} with chapter-wise textbook question answers, concise explanations, and revision-ready points.`,
  );

  return {
    title: `${chapterName} – 10th SSC Solutions`,
    description: clampDescription(summary),
  };
};

export const buildCanonicalUrl = (origin: string, pathname: string): string => {
  const normalizedOrigin = origin.replace(/\/+$/, '');
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${normalizedOrigin}${normalizedPath}`;
};

export const buildHreflangAlternates = (origin: string, pathname: string) => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const make = (localePath: string) => buildCanonicalUrl(origin, localePath);
  const suffix = normalizedPath === '/' ? '' : normalizedPath;

  return [
    { hreflang: 'en', href: make(`/en${suffix}` || '/en') },
    { hreflang: 'mr', href: make(`/mr${suffix}` || '/mr') },
    { hreflang: 'hi', href: make(`/hi${suffix}` || '/hi') },
    { hreflang: 'x-default', href: make(normalizedPath) },
  ];
};

export const inferImageAlt = (src: string, explicitAlt?: string): string => {
  if (explicitAlt && explicitAlt.trim()) return explicitAlt.trim();
  const file = src.split('/').pop() || 'study-image';
  const base = file.replace(/\.[a-z0-9]+$/i, '');
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

type FaqSchemaInput = {
  canonicalUrl: string;
  about: string;
  datePublished: string;
  author: Author;
  qaPairs: Array<{ question: string; answer: string }>;
};

export const buildFaqPageSchema = (input: FaqSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  about: input.about,
  datePublished: input.datePublished,
  author: {
    '@type': 'Person',
    name: input.author.name,
    url: `${new URL(input.canonicalUrl).origin}/authors/${input.author.slug}.html`,
  },
  mainEntity: input.qaPairs.map((pair) => ({
    '@type': 'Question',
    name: pair.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: pair.answer,
    },
  })),
});
