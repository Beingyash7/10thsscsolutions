import { CLASS_10_SUBJECTS } from './constants';
import { NavigationState, Page } from './types';
import { generatePageMeta } from './src/utils/seo';

const BASE_CLASS10_PATH = '/10th-ssc-solutions';

export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const findSubject = (subjectId?: string) =>
  CLASS_10_SUBJECTS.find((subject) => subject.id === subjectId);

const findBook = (subjectId?: string, bookId?: string) =>
  findSubject(subjectId)?.books.find((book) => book.id === bookId);

const findChapter = (
  subjectId?: string,
  bookId?: string,
  chapterId?: number,
) => findBook(subjectId, bookId)?.chapters.find((chapter) => chapter.id === chapterId);

export const parseLocationToNav = (pathname: string): NavigationState => {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';

  if (cleanPath === '/') return { page: Page.Home };
  if (cleanPath === '/class-8') return { page: Page.Class8 };
  if (cleanPath === '/class-9') return { page: Page.Class9 };
  if (cleanPath === '/class-10') return { page: Page.Class10 };
  if (cleanPath === '/papers') return { page: Page.Papers };

  if (!cleanPath.startsWith(BASE_CLASS10_PATH)) {
    return { page: Page.Home };
  }

  const parts = cleanPath
    .slice(BASE_CLASS10_PATH.length)
    .split('/')
    .filter(Boolean);

  if (parts.length === 0) return { page: Page.Class10 };

  const [subjectId, bookId, chapterSegment, exerciseSegment] = parts;
  const nav: NavigationState = { page: Page.Class10 };

  if (subjectId && findSubject(subjectId)) nav.subjectId = subjectId;
  if (bookId && nav.subjectId && findBook(nav.subjectId, bookId)) nav.bookId = bookId;

  if (chapterSegment && chapterSegment.startsWith('chapter-')) {
    const chapterId = Number(chapterSegment.replace('chapter-', '').split('-')[0]);
    if (Number.isFinite(chapterId) && nav.subjectId && nav.bookId) {
      nav.chapterId = chapterId;
    }
  }

  if (exerciseSegment && exerciseSegment.startsWith('exercise-')) {
    nav.exerciseId = decodeURIComponent(exerciseSegment.replace('exercise-', ''));
  }

  return nav;
};

export const navToPath = (nav: NavigationState): string => {
  if (nav.page === Page.Home) return '/';
  if (nav.page === Page.Class8) return '/class-8';
  if (nav.page === Page.Class9) return '/class-9';
  if (nav.page === Page.Papers) return '/papers';
  if (nav.page !== Page.Class10) return '/class-10';

  const subject = findSubject(nav.subjectId);
  if (!subject) return BASE_CLASS10_PATH;

  let path = `${BASE_CLASS10_PATH}/${subject.id}`;
  const book = findBook(subject.id, nav.bookId);
  if (!book) return path;

  path += `/${book.id}`;

  if (typeof nav.chapterId !== 'number') return path;
  const chapter = findChapter(subject.id, book.id, nav.chapterId);
  const chapterSlug = chapter ? slugify(chapter.title) : `chapter-${nav.chapterId}`;
  path += `/chapter-${nav.chapterId}-${chapterSlug}`;

  if (nav.exerciseId) {
    path += `/exercise-${encodeURIComponent(nav.exerciseId)}`;
  }

  return path;
};

export const getSeoForNav = (nav: NavigationState) => {
  const siteName = '10th SSC Solutions';
  const defaults = {
    title: `${siteName} | Maharashtra Board Book Answers`,
    description:
      '10th SSC solutions, digest-style textbook answers and Maharashtra Board book solutions for Maths, Science, English, Hindi, Marathi, History and Geography.',
  };

  if (nav.page === Page.Home) {
    return {
      ...defaults,
      title: `${siteName} | Maharashtra Board Digest & Book Answers`,
    };
  }

  if (nav.page === Page.Class8) {
    return {
      title: `Class 8 Study Hub | ${siteName}`,
      description:
        'Class 8 Maharashtra Board study hub with revision plans, practice checklists and preparation guidance.',
    };
  }

  if (nav.page === Page.Class9) {
    return {
      title: `Class 9 Study Hub | ${siteName}`,
      description:
        'Class 9 Maharashtra Board study hub with revision plans, practice checklists and exam preparation support.',
    };
  }

  if (nav.page === Page.Papers) {
    return {
      title: `Previous Year SSC Papers Coming Soon | ${siteName}`,
      description:
        'Previous year Maharashtra Board SSC papers are coming soon. The paper archive is being organized and verified before release.',
    };
  }

  const subject = findSubject(nav.subjectId);
  const book = findBook(nav.subjectId, nav.bookId);
  const chapter = findChapter(nav.subjectId, nav.bookId, nav.chapterId);

  if (!subject) {
    return {
      title: `10th SSC Subject Solutions | ${siteName}`,
      description:
        'Browse subject-wise 10th SSC Maharashtra Board solutions and textbook digest answers.',
    };
  }

  if (!book) {
    return {
      title: `${subject.title} 10th SSC Solutions | ${siteName}`,
      description: `${subject.title} book solutions, digest answers and chapter-wise question answers for Maharashtra Board Class 10 SSC.`,
    };
  }

  if (!chapter) {
    return {
      title: `${book.title} 10th SSC Book Solutions | ${siteName}`,
      description: `${book.title} chapter-wise Maharashtra Board 10th SSC book solutions and digest answers.`,
    };
  }

  return generatePageMeta({
    chapterName: `${chapter.title}`,
    subject: `${subject.title} ${book.title}`,
    summary: `${chapter.title} chapter-wise 10th SSC solutions with digest-style textbook question answers, concise explanations, revision points, and exam-focused guidance for Maharashtra Board students.`,
  });
};

export const getCanonicalUrl = (nav: NavigationState): string => {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : (import.meta.env.SITE_URL || 'https://10thsscsolutions.pages.dev');
  return `${origin}${navToPath(nav)}`;
};

export const getClass10RouteBase = () => BASE_CLASS10_PATH;
