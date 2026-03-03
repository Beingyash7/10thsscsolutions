import { describe, expect, it } from 'vitest';
import { AUTHORS } from '../content/authors';
import {
  buildCanonicalUrl,
  buildFaqPageSchema,
  buildHreflangAlternates,
  generatePageMeta,
  inferImageAlt,
} from './seo';

describe('SEO utils', () => {
  it('generates chapter-first title and bounded description', () => {
    const meta = generatePageMeta({
      chapterName: 'Gravitation',
      subject: 'Science',
      summary:
        'Gravitation chapter solutions with step-by-step textbook answers, solved examples, and key points designed for SSC board revision and quick exam preparation support.',
    });

    expect(meta.title).toBe('Gravitation – 10th SSC Solutions');
    expect(meta.description.length).toBeGreaterThanOrEqual(150);
    expect(meta.description.length).toBeLessThanOrEqual(160);
  });

  it('builds canonical URLs correctly', () => {
    const canonical = buildCanonicalUrl('https://10thsscsolutions.pages.dev/', '/10th-ssc-solutions/math');
    expect(canonical).toBe('https://10thsscsolutions.pages.dev/10th-ssc-solutions/math');
  });

  it('returns en/mr/hi hreflang links', () => {
    const links = buildHreflangAlternates(
      'https://10thsscsolutions.pages.dev',
      '/10th-ssc-solutions/math/math-1/chapter-1-linear-equations',
    );
    expect(links.map((link) => link.hreflang)).toEqual(['en', 'mr', 'hi', 'x-default']);
    expect(links[0].href).toContain('/en/10th-ssc-solutions/math/math-1/chapter-1-linear-equations');
  });

  it('builds FAQPage schema with author metadata', () => {
    const schema = buildFaqPageSchema({
      canonicalUrl: 'https://10thsscsolutions.pages.dev/10th-ssc-solutions/science/sci-1/chapter-1-gravitation',
      about: 'Science and Technology Part 1',
      datePublished: '2026-03-03',
      author: AUTHORS.science_reviewer,
      qaPairs: [{ question: 'What is gravitation?', answer: 'Gravitation is force of attraction between masses.' }],
    });

    expect(schema['@type']).toBe('FAQPage');
    expect(schema.author.name).toBe('Rahul Patil');
    expect(schema.mainEntity[0].acceptedAnswer.text).toContain('attraction');
  });

  it('infers alt from filename when missing', () => {
    expect(inferImageAlt('/covers/math-1.webp')).toBe('Math 1');
    expect(inferImageAlt('/covers/math-1.webp', 'Algebra cover')).toBe('Algebra cover');
  });
});

