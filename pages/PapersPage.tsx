import React from 'react';

const PapersPage: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-12 sm:px-10 sm:py-16 shadow-xl">
          <div className="absolute inset-0 opacity-[0.04] hero-pattern pointer-events-none"></div>
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 blur-3xl opacity-20"></div>
          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-[0.18em]">
              Previous Year Papers
            </span>
            <h1 className="text-3xl sm:text-5xl font-black mt-5 mb-4 dark:text-white">
              Papers Section Coming Soon
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Maharashtra SSC previous year papers, subject-wise bundles, and downloadable practice sets are being prepared. This section will go live after the paper archive is cleaned and verified.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                'English, Maths and Science bundles',
                'Board-style paper practice downloads',
                'Revision-ready paper archive with clear labels',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">
                      schedule
                    </span>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PapersPage;
