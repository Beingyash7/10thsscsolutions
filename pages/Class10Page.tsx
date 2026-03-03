import React, { useState, useEffect } from "react";
import {
  Page,
  NavigationState,
  Subject,
  Book,
  Chapter,
  Exercise,
  Author,
} from "../types";
import { CLASS_10_SUBJECTS } from "../constants";
import GeminiAssistant from "../components/GeminiAssistant";
import { slugify } from "../routing";
import { formatSolution, toPlainText } from "../src/utils/formatSolution";
import { inferImageAlt } from "../src/utils/seo";

type DatasetOccurrence = {
  text?: string;
  url?: string;
};

type DatasetItem = {
  question?: string;
  solution_text?: string;
  solution_html?: string;
  appears_in?: DatasetOccurrence[];
};

type DatasetResponse = {
  items?: DatasetItem[];
};

type ChapterMetaRow = {
  subjectId: string;
  bookId: string;
  chapterId: number;
  lastUpdated: string;
  author: Author;
};

type ChapterMetaResponse = {
  chapters?: ChapterMetaRow[];
};

type SolutionEntry = {
  question: string;
  formattedAnswerHtml: string;
  answerSearchText: string;
  source?: string;
};

const bookChapterCache = new Map<string, Chapter[]>();
const chapterMetaCache = new Map<string, ChapterMetaRow>();

const repairText = (text: string): string =>
  text
    .replace(/Â/g, "")
    .replace(/âˆ´/g, "∴")
    .replace(/â€“/g, "-")
    .replace(/â€”/g, "-")
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€�/g, '"');

const normalizeMathText = (text: string): string =>
  repairText(text)
    .replace(/\b(\d+)\s+(st|nd|rd|th)\b/gi, "$1$2")
    .replace(/\b([A-Za-z])\s+([0-9]+)\b/g, "$1$2")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s{2,}/g, " ")
    .trim();

const toTitleFromSlug = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const chapterUrlFromItem = (item: DatasetItem): string | undefined =>
  (item.appears_in || [])
    .map((entry) => entry.url || "")
    .find((url) => url.includes("/textbook-solutions/c/"));

const getChapterMetaFromUrl = (url: string) => {
  const normalized = url.toLowerCase();
  const chapterMatch = normalized.match(/-chapter-(\d+)-([^_#]+)/);
  if (!chapterMatch) return null;

  const chapterId = Number(chapterMatch[1]);
  const slug = chapterMatch[2];
  const sectionMatch = slug.match(/section-(\d+)-(.+)$/);

  return {
    chapterId,
    chapterTitle: sectionMatch
      ? `Chapter ${chapterId}: ${toTitleFromSlug(sectionMatch[2])}`
      : toTitleFromSlug(slug),
    metadata: sectionMatch ? `Section ${sectionMatch[1]}` : undefined,
  };
};

const buildChaptersFromDatasetItems = (items: DatasetItem[]): Chapter[] => {
  const chapterMap = new Map<number, Chapter>();

  for (const item of items) {
    const chapterUrl = chapterUrlFromItem(item);
    if (!chapterUrl) continue;

    const chapterMeta = getChapterMetaFromUrl(chapterUrl);
    if (!chapterMeta) continue;

    const existing = chapterMap.get(chapterMeta.chapterId);
    if (existing) {
      existing.questions = (existing.questions || 0) + 1;
      if (!existing.metadata && chapterMeta.metadata) {
        existing.metadata = chapterMeta.metadata;
      }
      continue;
    }

    chapterMap.set(chapterMeta.chapterId, {
      id: chapterMeta.chapterId,
      title: chapterMeta.chapterTitle,
      metadata: chapterMeta.metadata,
      questions: 1,
    });
  }

  return [...chapterMap.values()].sort((a, b) => a.id - b.id);
};

const mergeChapters = (
  staticChapters: Chapter[],
  dynamicChapters: Chapter[],
): Chapter[] => {
  if (dynamicChapters.length === 0) return staticChapters;
  if (staticChapters.length === 0) return dynamicChapters;

  const dynamicById = new Map(
    dynamicChapters.map((chapter) => [chapter.id, chapter]),
  );
  const merged = staticChapters.map((chapter) => {
    const dynamic = dynamicById.get(chapter.id);
    if (!dynamic) return chapter;
    return {
      ...dynamic,
      ...chapter,
      questions: dynamic.questions ?? chapter.questions,
      metadata: chapter.metadata || dynamic.metadata,
    };
  });

  for (const dynamic of dynamicChapters) {
    if (!merged.some((chapter) => chapter.id === dynamic.id)) {
      merged.push(dynamic);
    }
  }

  return merged.sort((a, b) => a.id - b.id);
};

const formatQuestionText = (rawText: string): string =>
  normalizeMathText(rawText)
    .replace(/\s+([=+\-×÷])/g, " $1 ")
    .replace(/\s{2,}/g, " ")
    .trim();

const DATASET_BOOK_FILE_MAP: Record<string, string> = {
  "math-1": "algebra_maths_1.json",
  "math-2": "geometry_maths_2.json",
  "sci-1": "science_tech_1.json",
  "sci-2": "science_tech_2.json",
  "hist-1": "history_political_science.json",
  "geo-1": "geography.json",
  "eng-1": "english.json",
  "mar-1": "marathi_second_language.json",
  "hin-1": "hindi_lokbharati.json",
};

const SUBJECT_GRADIENT_CLASS: Record<string, string> = {
  math: "from-blue-500 to-indigo-600",
  science: "from-emerald-400 to-teal-600",
  history: "from-amber-400 to-orange-500",
  geography: "from-cyan-400 to-blue-500",
  english: "from-pink-500 to-rose-600",
  marathi: "from-orange-400 to-rose-500",
  hindi: "from-fuchsia-500 to-violet-600",
};

const getSubjectGradientClass = (subject: Subject): string =>
  SUBJECT_GRADIENT_CLASS[subject.id] || "from-indigo-500 to-purple-600";

const chapterMetaKey = (subjectId: string, bookId: string, chapterId: number): string =>
  `${subjectId}/${bookId}/${chapterId}`;

interface Class10PageProps {
  nav: NavigationState;
  onNavigate: (page: Page) => void;
  onUpdateNav: (update: Partial<NavigationState>) => void;
}

const Class10Page: React.FC<Class10PageProps> = ({
  nav,
  onNavigate,
  onUpdateNav,
}) => {
  const selectedSubject = CLASS_10_SUBJECTS.find((s) => s.id === nav.subjectId);
  const baseSelectedBook = selectedSubject?.books.find((b) => b.id === nav.bookId);
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(baseSelectedBook);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterMetaLoaded, setChapterMetaLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadChapterMeta = async () => {
      if (chapterMetaCache.size > 0) {
        if (isMounted) setChapterMetaLoaded(true);
        return;
      }
      try {
        const response = await fetch("/shaalaa/chapter-meta.json");
        if (!response.ok) return;
        const parsed: ChapterMetaResponse = await response.json();
        for (const row of parsed.chapters || []) {
          chapterMetaCache.set(
            chapterMetaKey(row.subjectId, row.bookId, row.chapterId),
            row,
          );
        }
      } finally {
        if (isMounted) setChapterMetaLoaded(true);
      }
    };
    loadChapterMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  const applyMeta = (book: Book): Book => ({
    ...book,
    chapters: book.chapters.map((chapter) => {
      const metadata = chapterMetaCache.get(
        chapterMetaKey(book.subjectId, book.id, chapter.id),
      );
      if (!metadata) return chapter;
      return {
        ...chapter,
        lastUpdated: metadata.lastUpdated,
        author: metadata.author,
      };
    }),
  });

  useEffect(() => {
    let isMounted = true;

    const hydrateBookChapters = async () => {
      setSelectedBook(baseSelectedBook);
      if (!baseSelectedBook) return;

      const fileName =
        baseSelectedBook.datasetFile || DATASET_BOOK_FILE_MAP[baseSelectedBook.id];
      if (!fileName) return;

      if (bookChapterCache.has(fileName)) {
        const cached = bookChapterCache.get(fileName) || [];
        if (!isMounted) return;
        setSelectedBook(applyMeta({
          ...baseSelectedBook,
          chapters: mergeChapters(baseSelectedBook.chapters, cached),
        }));
        return;
      }

      setChaptersLoading(true);
      try {
        const response = await fetch(`/shaalaa/${fileName}`);
        if (!response.ok) return;
        const raw: DatasetResponse = await response.json();
        const dynamicChapters = buildChaptersFromDatasetItems(raw.items || []);
        bookChapterCache.set(fileName, dynamicChapters);
        if (!isMounted) return;
        setSelectedBook(applyMeta({
          ...baseSelectedBook,
          chapters: mergeChapters(baseSelectedBook.chapters, dynamicChapters),
        }));
      } finally {
        if (isMounted) setChaptersLoading(false);
      }
    };

    hydrateBookChapters();
    return () => {
      isMounted = false;
    };
  }, [baseSelectedBook, chapterMetaLoaded]);

  const selectedChapter = selectedBook?.chapters.find(
    (c) => c.id === nav.chapterId,
  );
  const selectedExercise =
    selectedChapter?.exercises?.find((e) => e.id === nav.exerciseId) ??
    (selectedChapter && nav.exerciseId
      ? {
          id: nav.exerciseId,
          name:
            nav.exerciseId === "all" ? "All Questions" : "Selected Exercise",
          questions: selectedChapter.questions ?? 0,
        }
      : undefined);

  // Render Logic based on deep nav
  if (selectedExercise) {
    return (
      <SolutionsDetailView
        subject={selectedSubject!}
        book={selectedBook!}
        chapter={selectedChapter!}
        exercise={selectedExercise}
        onBack={() => onUpdateNav({ exerciseId: undefined })}
        onGoHome={() => onNavigate(Page.Home)}
        onGoChapter={() => onUpdateNav({ exerciseId: undefined })}
      />
    );
  }

  if (selectedChapter) {
    return (
      <ExerciseView
        subject={selectedSubject!}
        book={selectedBook!}
        chapter={selectedChapter}
        onBack={() => onUpdateNav({ chapterId: undefined })}
        onGoHome={() => onNavigate(Page.Home)}
        onGoBook={() => onUpdateNav({ chapterId: undefined })}
        onSelectExercise={(id) => onUpdateNav({ exerciseId: id })}
      />
    );
  }

  if (selectedBook) {
    return (
      <ChapterView
        subject={selectedSubject!}
        book={selectedBook}
        onBack={() => onUpdateNav({ bookId: undefined })}
        onGoHome={() => onNavigate(Page.Home)}
        onGoSubject={() => onUpdateNav({ bookId: undefined })}
        isLoadingChapters={chaptersLoading}
        onSelectChapter={(id) =>
          onUpdateNav({ chapterId: id, exerciseId: undefined })
        }
      />
    );
  }

  if (selectedSubject) {
    return (
      <BookSelectionView
        subject={selectedSubject}
        onBack={() => onUpdateNav({ subjectId: undefined })}
        onGoHome={() => onNavigate(Page.Home)}
        onSelectBook={(id) =>
          onUpdateNav({
            bookId: id,
            chapterId: undefined,
            exerciseId: undefined,
          })
        }
      />
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950">
      <header className="relative pt-12 pb-20 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none hero-pattern"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">
            <button
              onClick={() => onNavigate(Page.Home)}
              className="hover:text-primary transition-colors"
            >
              Home
            </button>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-slate-600 dark:text-slate-300">Class 10</span>
          </nav>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 dark:text-white">
            SSC Dashboards
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Choose a subject to see detailed Balbharati solutions.
          </p>
        </div>
      </header>

      <main className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SeoSupportBlock
          title="10th SSC Subject-wise Solutions and Digest Answers"
          description="Browse subject-wise Maharashtra Board Class 10 textbook solutions, digest-style answers and chapter-wise question-answer pages. Open a subject to find the exact book and chapter you need for revision."
          links={CLASS_10_SUBJECTS.map((subject) => ({
            label: `${subject.title} 10th SSC Solutions`,
            href: `/10th-ssc-solutions/${subject.id}`,
          }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CLASS_10_SUBJECTS.map((s) => (
            <SubjectCard
              key={s.id}
              subject={s}
              onSelect={() =>
                onUpdateNav({
                  subjectId: s.id,
                  bookId: undefined,
                  chapterId: undefined,
                  exerciseId: undefined,
                })
              }
            />
          ))}
        </div>
      </main>
      <GeminiAssistant context="Maharashtra Class 10 SSC Boards Subjects" />
    </div>
  );
};

// --- Sub-components for deep navigation ---

const formatUpdatedDate = (value?: string): string => {
  if (!value) return "Recently updated";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BreadcrumbTrail = ({ items }: { items: Array<{ label: string; onClick?: () => void }> }) => (
  <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
    {items.map((item, index) => (
      <React.Fragment key={`${item.label}-${index}`}>
        {item.onClick ? (
          <button className="hover:text-indigo-600 font-semibold" onClick={item.onClick}>
            {item.label}
          </button>
        ) : (
          <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
        )}
        {index < items.length - 1 ? (
          <span className="material-symbols-outlined text-xs">chevron_right</span>
        ) : null}
      </React.Fragment>
    ))}
  </nav>
);

const ChapterMetaLine = ({ chapter }: { chapter: Chapter }) => (
  <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
    <span className="font-semibold">Updated on:</span> {formatUpdatedDate(chapter.lastUpdated)}{" "}
    {chapter.author ? (
      <>
        <span className="mx-1">|</span>
        <span className="font-semibold">Author:</span>{" "}
        <a href={`/authors/${chapter.author.slug}.html`} className="text-indigo-600 hover:underline">
          {chapter.author.name}
        </a>
      </>
    ) : null}
  </div>
);

const SubjectCard = ({
  subject,
  onSelect,
}: {
  subject: Subject;
  onSelect: () => void;
}) => {
  const gradientClass = getSubjectGradientClass(subject);
  return (
  <div
    className={`group relative overflow-hidden bg-gradient-to-br ${gradientClass} rounded-4xl p-8 flex flex-col min-h-[400px] transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl`}
  >
    <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
      <span className="material-symbols-outlined text-white text-5xl">
        {subject.icon}
      </span>
    </div>
    <h3 className="text-3xl font-black text-white mb-4 leading-tight">
      {subject.title}
    </h3>
    <p className="text-white/90 font-medium mb-8 flex-grow">
      {subject.description}
    </p>
    <button
      onClick={onSelect}
      className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95"
    >
      Start Learning
    </button>
  </div>
  );
};

const SeoSupportBlock = ({
  title,
  description,
  links,
}: {
  title: string;
  description: string;
  links?: Array<{ label: string; href: string }>;
}) => (
  <section className="mb-10 rounded-[28px] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-6 md:p-8">
    <h2 className="text-2xl md:text-3xl font-black mb-3 dark:text-white">
      {title}
    </h2>
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
      {description}
    </p>
    {links && links.length > 0 ? (
      <div className="flex flex-wrap gap-3">
        {links.slice(0, 12).map((link) => (
          <a
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {link.label}
          </a>
        ))}
      </div>
    ) : null}
  </section>
);

const BookSelectionView = ({
  subject,
  onBack,
  onGoHome,
  onSelectBook,
}: {
  subject: Subject;
  onBack: () => void;
  onGoHome: () => void;
  onSelectBook: (id: string) => void;
}) => (
  <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <BreadcrumbTrail
      items={[
        { label: "Home", onClick: onGoHome },
        { label: "Class 10", onClick: onBack },
        { label: subject.title },
      ]}
    />
    <button
      onClick={onBack}
      className="flex items-center gap-2 font-bold text-indigo-600 mb-12 hover:gap-4 transition-all"
    >
      <span className="material-symbols-outlined">arrow_back</span> Back to
      Subjects
    </button>
    <h2 className="text-5xl font-black mb-4 dark:text-white">
      {subject.title} Books
    </h2>
    <p className="text-slate-500 mb-16 text-lg font-medium">
      Select a textbook to browse chapter solutions.
    </p>
    <SeoSupportBlock
      title={`${subject.title} 10th SSC Book Solutions`}
      description={`${subject.title} Maharashtra Board Class 10 book solutions and digest answers are organized textbook-wise. Open a book below to access chapter-wise question-answer pages.`}
      links={subject.books.map((book) => ({
        label: `${book.title} Book Solutions`,
        href: `/10th-ssc-solutions/${subject.id}/${book.id}`,
      }))}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {subject.books.length > 0 ? (
        subject.books.map((book) => (
          <div
            key={book.id}
            className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-xl hover:-translate-y-2 transition-transform border border-slate-100 dark:border-slate-700"
          >
            <div className="h-64 overflow-hidden">
              <img
                src={book.imageUrl}
                alt={inferImageAlt(book.imageUrl, book.title)}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
                srcSet={
                  book.imageUrl.endsWith(".webp")
                    ? `${book.imageUrl} 1x, ${book.imageUrl.replace(/\.webp$/i, ".png")} 2x`
                    : `${book.imageUrl} 1x`
                }
                width={960}
                height={1280}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
            </div>
            <div className="p-8">
              <h4 className="text-2xl font-black mb-4 dark:text-white">
                {book.title}
              </h4>
              <div className="flex items-center justify-between mb-8 text-slate-500">
                <span className="flex items-center gap-1 font-bold">
                  <span className="material-symbols-outlined text-green-500">
                    verified
                  </span>{" "}
                  {book.solvedCount}
                </span>
                <span className="bg-indigo-50 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                  {book.tag}
                </span>
              </div>
              <button
                onClick={() => onSelectBook(book.id)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
              >
                Browse Chapters
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center opacity-50">
          <span className="material-symbols-outlined text-6xl mb-4">
            hourglass_empty
          </span>
          <p className="text-xl font-bold">
            Solutions coming soon for {subject.title}!
          </p>
        </div>
      )}
    </div>
  </div>
);

const ChapterView = ({
  subject,
  book,
  onBack,
  onGoHome,
  onGoSubject,
  isLoadingChapters,
  onSelectChapter,
}: {
  subject: Subject;
  book: Book;
  onBack: () => void;
  onGoHome: () => void;
  onGoSubject: () => void;
  isLoadingChapters: boolean;
  onSelectChapter: (id: number) => void;
}) => {
  const gradientClass = getSubjectGradientClass(subject);
  return (
  <div className="py-12 max-w-4xl mx-auto px-4">
    <BreadcrumbTrail
      items={[
        { label: "Home", onClick: onGoHome },
        { label: "Class 10", onClick: onGoSubject },
        { label: subject.title, onClick: onGoSubject },
        { label: book.title },
      ]}
    />
    <button
      onClick={onBack}
      className="flex items-center gap-2 font-bold text-indigo-600 mb-12 hover:gap-4 transition-all"
    >
      <span className="material-symbols-outlined">arrow_back</span> Change Book
    </button>
    <div className="flex items-center gap-6 mb-16">
      <div
        className={`w-24 h-24 bg-gradient-to-br ${gradientClass} rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg`}
      >
        <span className="material-symbols-outlined text-5xl">
          {subject.icon}
        </span>
      </div>
      <div>
        <h2 className="text-4xl font-black dark:text-white">{book.title}</h2>
        <p className="text-slate-500 font-medium">
          Balbharati Solutions for Class 10
        </p>
      </div>
    </div>

    <SeoSupportBlock
      title={`${book.title} Chapter-wise 10th SSC Solutions`}
      description={`${book.title} digest-style Maharashtra Board Class 10 solutions are available chapter-wise below. Open a chapter to read textbook question answers and revision-ready explanations.`}
      links={book.chapters.map((chapter) => ({
        label: `Chapter ${chapter.id}: ${chapter.title}`,
        href: `/10th-ssc-solutions/${subject.id}/${book.id}/chapter-${chapter.id}-${slugify(chapter.title)}`,
      }))}
    />

    {isLoadingChapters && (
      <div className="mb-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-4 py-3 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
        Loading full chapter index from local dataset...
      </div>
    )}

    <div className="space-y-4">
      {book.chapters.length === 0 && !isLoadingChapters && (
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
          Chapter index could not be generated for this book yet.
        </div>
      )}
      {book.chapters.map((chapter, idx) => (
        <button
          key={chapter.id}
          onClick={() => onSelectChapter(chapter.id)}
          className="w-full text-left bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-xl"
        >
          <div className="flex items-center gap-6">
            <span className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              {idx + 1}
            </span>
            <div>
              <h4 className="text-xl font-bold dark:text-white mb-1">
                {chapter.title}
              </h4>
              <p className="text-sm text-slate-500 font-medium">
                {chapter.questions} Solved Questions
              </p>
              {chapter.metadata && (
                <p className="text-xs text-slate-400 mt-1">{chapter.metadata}</p>
              )}
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-300 group-hover:text-indigo-600 transition-colors">
            arrow_forward
          </span>
        </button>
      ))}
    </div>
    <GeminiAssistant context={`${book.title} Chapters List`} />
  </div>
  );
};

const ExerciseView = ({
  subject,
  book,
  chapter,
  onBack,
  onGoHome,
  onGoBook,
  onSelectExercise,
}: {
  subject: Subject;
  book: Book;
  chapter: Chapter;
  onBack: () => void;
  onGoHome: () => void;
  onGoBook: () => void;
  onSelectExercise: (id: string) => void;
}) => (
  <div className="py-12 max-w-5xl mx-auto px-4">
    <BreadcrumbTrail
      items={[
        { label: "Home", onClick: onGoHome },
        { label: "Class 10", onClick: onGoBook },
        { label: subject.title, onClick: onGoBook },
        { label: book.title, onClick: onGoBook },
        { label: `Chapter ${chapter.id}` },
      ]}
    />
    <ChapterMetaLine chapter={chapter} />
    <button
      onClick={onBack}
      className="flex items-center gap-2 font-bold text-indigo-600 mb-12 hover:gap-4 transition-all"
    >
      <span className="material-symbols-outlined">arrow_back</span> Back to
      Chapters
    </button>

    <div className="mb-16">
      <div className="flex items-center gap-3 text-indigo-600 font-black mb-4 text-sm uppercase tracking-widest">
        <span>Chapter {chapter.id}</span>
        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
        <span>{book.title}</span>
      </div>
      <h2 className="text-5xl font-black mb-6 dark:text-white leading-tight">
        {chapter.title}
      </h2>
      <div className="flex flex-wrap gap-4">
        <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm">
          Solved by Experts
        </span>
        <span className="px-4 py-2 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl font-bold text-sm">
          2024-25 Syllabus
        </span>
      </div>
    </div>

    <SeoSupportBlock
      title={`${book.title} ${chapter.title} Solutions`}
      description={`Chapter ${chapter.id} (${chapter.title}) 10th SSC textbook solutions and digest answers. Open a practice set or all questions to read step-by-step answers for Maharashtra Board revision.`}
      links={[
        {
          label: `${book.title} All Chapters`,
          href: `/10th-ssc-solutions/${subject.id}/${book.id}`,
        },
        {
          label: `${subject.title} Subject Solutions`,
          href: `/10th-ssc-solutions/${subject.id}`,
        },
      ]}
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {chapter.exercises && chapter.exercises.length > 0 ? (
        chapter.exercises.map((ex) => (
          <div
            key={ex.id}
            className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <h4 className="text-2xl font-black dark:text-white">{ex.name}</h4>
              <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">
                Solved
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
              Contains {ex.questions} comprehensive questions with step-by-step
              logic.
            </p>
            <button
              onClick={() => onSelectExercise(ex.id)}
              className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
            >
              View Solutions
            </button>
          </div>
        ))
      ) : (
        <div className="col-span-full bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-2xl font-black dark:text-white">
              All Questions
            </h4>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">
              From Textbook Data
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Open all textbook questions and answers for this chapter.
          </p>
          <button
            onClick={() => onSelectExercise("all")}
            className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-[1.02] transition-transform active:scale-95 shadow-lg"
          >
            View Solutions
          </button>
        </div>
      )}
    </div>
    <GeminiAssistant context={`${chapter.title} Practice Sets`} />
  </div>
);

const SolutionsDetailView = ({
  subject,
  book,
  chapter,
  exercise,
  onBack,
  onGoHome,
  onGoChapter,
}: {
  subject: Subject;
  book: Book;
  chapter: Chapter;
  exercise: Exercise;
  onBack: () => void;
  onGoHome: () => void;
  onGoChapter: () => void;
}) => {
  const [solutions, setSolutions] = useState<SolutionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [compactView, setCompactView] = useState(false);
  const [showOnlyAnswers, setShowOnlyAnswers] = useState(false);
  const fallbackSolutions: SolutionEntry[] = [
    {
      question: "Questions are being updated for this chapter.",
      formattedAnswerHtml:
        "<h3 class=\"answer-heading\">Answer</h3><p>No textbook question-answer pair was found in the current dataset for this chapter/exercise.</p>",
      answerSearchText:
        "No textbook question-answer pair was found in the current dataset for this chapter/exercise.",
    },
  ];

  useEffect(() => {
    const fetchSolutions = async () => {
      setLoading(true);
      setError(null);
      setVisibleCount(20);
      try {
        const fileName = book.datasetFile || DATASET_BOOK_FILE_MAP[book.id];
        if (!fileName) {
          setError(`No dataset is mapped for ${book.title}.`);
          setSolutions(fallbackSolutions);
          return;
        }

        const response = await fetch(`/shaalaa/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to load /shaalaa/${fileName}`);
        }

        const raw: DatasetResponse = await response.json();
        const chapterKey = `-chapter-${chapter.id}-`;

        const filtered = (raw.items || []).filter((item) =>
          (item.appears_in || []).some((link) =>
            (link.url || "").toLowerCase().includes(chapterKey),
          ),
        );

        const seen = new Set<string>();
        const normalized = filtered
          .map((item) => {
            const question = formatQuestionText((item.question || "").trim());
            const rawAnswer = String(item.solution_html || item.solution_text || "").trim();
            const { formattedAnswerHtml } = formatSolution(question, rawAnswer);
            return {
              question,
              formattedAnswerHtml,
              answerSearchText: toPlainText(formattedAnswerHtml).toLowerCase(),
              source: (item.appears_in || [])
                .map((entry) => repairText(entry.text || ""))
                .filter(Boolean)
                .find((text) => /^Q\s/i.test(text)),
            };
          })
          .filter(
            (item) => item.question.length > 0 && item.answerSearchText.length > 0,
          )
          .filter((item) => {
            const key = `${item.question}__${item.formattedAnswerHtml}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

        setSolutions(normalized.length > 0 ? normalized : fallbackSolutions);
      } catch (e) {
        setError("Unable to load textbook data right now.");
        setSolutions(fallbackSolutions);
      } finally {
        setLoading(false);
      }
    };
    fetchSolutions();
  }, [
    book.id,
    book.title,
    chapter.id,
    chapter.title,
    exercise.id,
    exercise.name,
  ]);

  const filteredSolutions = solutions.filter((solution) => {
    if (!searchTerm.trim()) return true;
    const q = solution.question.toLowerCase();
    const a = solution.answerSearchText;
    const s = (solution.source || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return q.includes(term) || a.includes(term) || s.includes(term);
  });

  const visibleSolutions = filteredSolutions.slice(0, visibleCount);
  const showingFallback =
    solutions.length === 1 &&
    solutions[0]?.question === fallbackSolutions[0].question;

  return (
    <div className="content py-12 max-w-4xl mx-auto px-4">
      <BreadcrumbTrail
        items={[
          { label: "Home", onClick: onGoHome },
          { label: "Class 10", onClick: onGoChapter },
          { label: subject.title, onClick: onGoChapter },
          { label: book.title, onClick: onGoChapter },
          { label: `Chapter ${chapter.id}`, onClick: onGoChapter },
          { label: exercise.name },
        ]}
      />
      <ChapterMetaLine chapter={chapter} />
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-bold text-indigo-600 mb-12 hover:gap-4 transition-all"
      >
        <span className="material-symbols-outlined">arrow_back</span> Back to
        Exercise List
      </button>

    <div className="mb-12">
        <h2 className="text-4xl font-black mb-4 dark:text-white">
          {exercise.name} Solutions
        </h2>
        <p className="text-slate-500 font-medium">
          {chapter.title} | {book.title}
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Source dataset is chapter-indexed, so exercise view may include all questions from this chapter.
        </p>
        {error ? (
          <p className="text-sm text-rose-600 mt-2 font-semibold">{error}</p>
        ) : null}
      </div>

      <SeoSupportBlock
        title={`${book.title} Chapter ${chapter.id} Question Answers`}
        description={`This page contains ${book.title} chapter ${chapter.id} (${chapter.title}) 10th SSC solutions and digest-style question answers. Use the search box below to filter textbook questions inside the chapter.`}
        links={[
          {
            label: `${book.title} Chapter List`,
            href: `/10th-ssc-solutions/${subject.id}/${book.id}`,
          },
          {
            label: `Chapter ${chapter.id} Page`,
            href: `/10th-ssc-solutions/${subject.id}/${book.id}/chapter-${chapter.id}-${slugify(chapter.title)}`,
          },
          {
            label: `${subject.title} Solutions`,
            href: `/10th-ssc-solutions/${subject.id}`,
          },
        ]}
      />

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-slate-100 dark:bg-slate-800 h-64 rounded-4xl"
            ></div>
          ))}
        </div>
      ) : (
        <div>
          {!showingFallback && (
            <div className="mb-8 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Showing {visibleSolutions.length} of {filteredSolutions.length} questions
                {searchTerm.trim() ? ` (filtered from ${solutions.length})` : ""}
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setVisibleCount(20);
                }}
                placeholder="Search within chapter Q&A..."
                className="w-full md:w-72 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
              />
            </div>
          )}

          {!showingFallback && (
            <div className="answer-controls" role="group" aria-label="Answer view controls">
              <label>
                <input
                  type="checkbox"
                  checked={compactView}
                  onChange={(e) => setCompactView(e.target.checked)}
                />
                Compact view
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showOnlyAnswers}
                  onChange={(e) => setShowOnlyAnswers(e.target.checked)}
                />
                Show only Answers
              </label>
            </div>
          )}

          <div
            className={`space-y-10 qa-list ${compactView ? "compact-view" : ""} ${
              showOnlyAnswers ? "answers-only-view" : ""
            }`}
          >
            {visibleSolutions.map((sol, idx) => (
              <article
                key={`${sol.question}-${idx}`}
                className="qa bg-white dark:bg-slate-800 rounded-[40px] p-8 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700"
              >
                <div className="space-y-2">
                  <h2 className="q-title text-2xl font-bold dark:text-white leading-relaxed">
                    <span className="q-num shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full inline-flex items-center justify-center font-bold">
                      Q{idx + 1}.
                    </span>
                    {sol.question}
                  </h2>
                  {sol.source && (
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                      {sol.source}
                    </p>
                  )}
                </div>
                <div
                  className="a-body space-y-6 md:ml-14 text-lg text-slate-700 dark:text-slate-300 font-medium"
                  dangerouslySetInnerHTML={{ __html: sol.formattedAnswerHtml }}
                />
              </article>
            ))}
          </div>

          {!showingFallback &&
            visibleCount < filteredSolutions.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount((count) => count + 20)}
                  className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-lg"
                >
                  Load More Questions
                </button>
              </div>
            )}

          {!showingFallback && filteredSolutions.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500 dark:text-slate-400">
              No results matched your search. Try a shorter keyword.
            </div>
          )}
        </div>
      )}
      <GeminiAssistant
        context={`Solving ${exercise.name} in ${chapter.title}`}
      />
    </div>
  );
};

export default Class10Page;

