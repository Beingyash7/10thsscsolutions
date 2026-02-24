import React from 'react';
import { Page } from '../types';

interface ClassHubPageProps {
  classNumber: 8 | 9;
  onNavigate: (page: Page) => void;
}

const CLASS_CONTENT: Record<8 | 9, {
  title: string;
  subtitle: string;
  gradient: string;
  focus: string[];
  resources: string[];
}> = {
  8: {
    title: 'Class 8 Foundation Hub',
    subtitle: 'Build fundamentals in Maths, Science, English, and Social Science with revision-first study routines.',
    gradient: 'from-sky-500 via-cyan-500 to-emerald-500',
    focus: [
      'Daily concept revision planner',
      'Chapter reading + notebook summary routine',
      'Weekly self-test checklist',
      'Exam preparation roadmap for unit tests',
    ],
    resources: [
      'Study timetable templates',
      'Concept revision checklist',
      'Subject-wise note making guide',
      'Practice test tracking sheet',
    ],
  },
  9: {
    title: 'Class 9 Progress Hub',
    subtitle: 'Strengthen core concepts before SSC by using chapter study plans and practice-led revision.',
    gradient: 'from-emerald-500 via-teal-500 to-blue-600',
    focus: [
      'Concept + practice balance for Maths and Science',
      'Long-answer writing strategy for Social Science',
      'Grammar and writing practice routine',
      'Monthly revision tracker before finals',
    ],
    resources: [
      'Subject revision roadmap',
      'Unit test preparation checklist',
      'Mistake log template',
      'Final exam readiness tracker',
    ],
  },
};

const ClassHubPage: React.FC<ClassHubPageProps> = ({ classNumber, onNavigate }) => {
  const content = CLASS_CONTENT[classNumber];

  return (
    <div className="bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden pt-16 pb-20">
        <div className="absolute inset-0 opacity-10 hero-pattern"></div>
        <div className={`absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl bg-gradient-to-br ${content.gradient} opacity-30`} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => onNavigate(Page.Home)}
            className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:gap-3 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-start">
            <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-[36px] p-8 md:p-10 shadow-xl">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white bg-gradient-to-r ${content.gradient} font-black text-xs uppercase tracking-widest mb-6`}>
                Class {classNumber}
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4 dark:text-white">
                {content.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
                {content.subtitle}
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {content.focus.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 flex gap-3">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">task_alt</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate(Page.Class10)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg"
                >
                  Open Full Q&A Library (Class 10)
                </button>
                <button
                  onClick={() => onNavigate(Page.Home)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-3 rounded-2xl font-bold"
                >
                  Explore Home
                </button>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-lg">
                <h2 className="text-2xl font-black mb-5 dark:text-white">Study Resources</h2>
                <ul className="space-y-4">
                  {content.resources.map((resource) => (
                    <li key={resource} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-emerald-500 mt-0.5">description</span>
                      <span className="font-medium">{resource}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[32px] p-7 bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-amber-300">tips_and_updates</span>
                  <h3 className="text-xl font-black">Exam Prep Tip</h3>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  Keep a mistake log after every practice test. Re-solving only your mistakes gives faster score improvement than repeating already-correct questions.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ClassHubPage;
