import React from 'react';
import { Page, Book } from '../types';
import { CLASS_10_BOOKS, CLASS_10_SUBJECTS } from '../constants';

const QuickViewCard = React.lazy(() => import('../components/QuickViewCard'));

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onQuickViewBook?: (book: Book) => void;
  searchQuery?: string;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onQuickViewBook, searchQuery }) => {
  const [query, setQuery] = React.useState(searchQuery || '');

  React.useEffect(() => {
    setQuery(searchQuery || '');
  }, [searchQuery]);

  const openLibrary = () => {
    onNavigate(Page.Class10);
  };

  return (
    <div>
      {/* Hero Header */}
      <header className="relative pt-16 pb-20 sm:pt-20 sm:pb-28 md:pt-32 md:pb-48 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none hero-pattern"></div>
        
        {/* Animated Icons */}
        <div className="absolute top-20 left-[5%] opacity-20 md:opacity-100 floating hidden lg:block">
          <span className="material-symbols-outlined text-7xl text-indigo-400">school</span>
        </div>
        <div className="absolute bottom-40 right-[8%] opacity-20 md:opacity-100 floating hidden lg:block" style={{ animationDelay: '-1.5s' }}>
          <span className="material-symbols-outlined text-8xl text-pink-400">backpack</span>
        </div>
        <div className="absolute top-40 right-[15%] opacity-20 md:opacity-100 floating hidden lg:block" style={{ animationDelay: '-0.8s' }}>
          <span className="material-symbols-outlined text-6xl text-amber-400">edit</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 sm:px-4 py-2 rounded-full mb-6 sm:mb-8 font-bold text-[11px] sm:text-sm tracking-wide animate-bounce">
            <span className="material-symbols-outlined text-lg">celebration</span>
            UPDATED FOR 2024-25 SYLLABUS
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 sm:mb-8 leading-[1.1] dark:text-white">
            Learn Better, <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500">Achieve Higher</span>
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-12 font-medium px-1">
            The most vibrant community for Maharashtra Board students. Get playful, accurate, and easy-to-understand solutions today.
          </p>

          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[24px] sm:rounded-[32px] blur-xl opacity-25 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl border border-slate-100 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center flex-1 min-w-0">
                  <span className="material-symbols-outlined ml-3 sm:ml-6 text-slate-400 text-2xl sm:text-3xl">search</span>
                  <input 
                    className="w-full min-w-0 bg-transparent border-none focus:ring-0 px-3 sm:px-6 py-3 sm:py-4 text-base sm:text-xl dark:text-white placeholder:text-slate-400" 
                    placeholder="What are you studying today?" 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && openLibrary()}
                  />
                </div>
                <button
                  onClick={openLibrary}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/40"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {query.trim()
              ? `Quick search will open the Class 10 Q&A library for "${query.trim()}".`
              : 'Search currently opens the complete Class 10 question-answer library.'}
          </p>
        </div>
      </header>

      {/* Class Focus Section */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20 relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Primary Focus: Your Class</h2>
            <div className="h-2 w-32 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto rounded-full"></div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-10">
              <span className="material-symbols-outlined text-[88px] sm:text-[120px] dark:text-slate-700">workspace_premium</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {/* Class Cards */}
            <ClassCard 
              title="Class 8"
              desc="Build your foundation with interactive solutions and fun guides."
              icon="auto_stories"
              color="blue"
              onClick={() => onNavigate(Page.Class8)}
            />
            <ClassCard 
              title="Class 9"
              desc="Advance your skills with detailed step-by-step masteries."
              icon="biotech"
              color="emerald"
              onClick={() => onNavigate(Page.Class9)}
            />
            <ClassCard 
              title="Class 10"
              desc="Conquer the SSC boards with expert tips and full papers."
              icon="potted_plant"
              color="pink"
              primaryBtn="SSC Special"
              onClick={() => onNavigate(Page.Class10)}
            />
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-slate-50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-16 gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 font-black uppercase tracking-[0.2em] text-xs px-4 py-2 rounded-lg">High Performance</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-600 dark:from-white dark:to-indigo-400">Trending Solutions</h2>
            </div>
            <button className="group w-full sm:w-auto justify-center bg-white dark:bg-slate-800 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-md flex items-center gap-3 font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all">
              Explore Library <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <React.Suspense fallback={<div className="col-span-full text-center text-slate-500">Loading quick view cards...</div>}>
              {CLASS_10_BOOKS.map((book) => (
                <QuickViewCard key={book.id} book={book} onQuickView={onQuickViewBook} />
              ))}
            </React.Suspense>
          </div>
        </div>
      </section>

      {/* Success Journey Section */}
      <section className="py-16 sm:py-20 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 dark:bg-slate-950">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-20 relative overflow-hidden text-white flex flex-col md:flex-row items-center gap-10 sm:gap-16 shadow-[0_40px_100px_-15px_rgba(79,70,229,0.5)]">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-pink-400/20 rounded-full blur-2xl"></div>
          <div className="md:w-3/5 relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 sm:mb-8 leading-tight">Built for Your <br/><span className="text-amber-300">Success Journey</span></h2>
            <div className="grid grid-cols-1 gap-5 sm:gap-8">
              <FeatureItem icon="verified_user" title="Verified Accuracy" desc="Every step and solution is double-checked by top-tier educators from Maharashtra." color="indigo" />
              <FeatureItem icon="update" title="Always Up to Date" desc="We sync with the latest MSBSHSE curriculum changes the moment they happen." color="pink" />
              <FeatureItem icon="volunteer_activism" title="Forever Free" desc="Knowledge is power, and we believe it should be free for every student in Maharashtra." color="amber" />
            </div>
          </div>
          <div className="md:w-2/5 relative z-10 hidden md:block">
            <div className="relative">
              <div className="absolute -inset-4 bg-white/20 blur-xl rounded-[40px]"></div>
              <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-4 h-4 rounded-full bg-red-400"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <div className="h-5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full ml-4"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-5 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <div className="h-48 w-full bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-[32px] flex flex-col items-center justify-center gap-4">
                    <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-7xl animate-pulse">leaderboard</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">Top Performer</span>
                  </div>
                  <div className="h-5 w-4/6 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 md:p-10 border border-slate-100 dark:border-slate-800">
              <h2 className="text-3xl md:text-4xl font-black mb-5 dark:text-white">
                10th SSC Solutions, Digest & Book Solutions
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                10th SSC Solutions is a Maharashtra Board study website for chapter-wise textbook question answers, digest-style revision support, and subject-wise book solutions. Students can open Maths, Science, English, Hindi, Marathi, Geography, and History books and browse solved questions chapter by chapter.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                If you are searching for <strong>10th SSC solutions</strong>, <strong>10th SSC digest solutions</strong>, or <strong>10th SSC book solutions</strong>, use the Class 10 library to open the exact textbook and chapter page. The site is organized for faster revision before unit tests, prelims, and SSC board exams.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
                <button
                  onClick={() => onNavigate(Page.Class10)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-indigo-600 text-white font-bold"
                >
                  Open 10th SSC Library
                </button>
                <a
                  href="/10th-ssc-solutions"
                  className="w-full sm:w-auto text-center px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200"
                >
                  Subject-wise Solutions
                </a>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black mb-4 dark:text-white">Top 10th SSC Solution Pages</h3>
                <ul className="space-y-3 text-sm">
                  {CLASS_10_BOOKS.slice(0, 8).map((book) => (
                    <li key={book.id}>
                      <a
                        href={`/10th-ssc-solutions/${book.subjectId}/${book.id}`}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        {book.title} 10th SSC Book Solutions
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-xl font-black mb-4 dark:text-white">Subject-wise Internal Links</h3>
                <ul className="space-y-3 text-sm">
                  {CLASS_10_SUBJECTS.map((subject) => (
                    <li key={subject.id}>
                      <a
                        href={`/10th-ssc-solutions/${subject.id}`}
                        className="text-slate-700 dark:text-slate-300 font-semibold hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {subject.title} 10th SSC Solutions
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

interface ClassCardProps {
  title: string;
  desc: string;
  icon: string;
  color: 'blue' | 'emerald' | 'pink';
  primaryBtn?: string;
  onClick: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({ title, desc, icon, color, primaryBtn, onClick }) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-400 to-blue-600 hover:shadow-blue-500/30 bg-blue-500',
    emerald: 'from-emerald-400 to-emerald-600 hover:shadow-emerald-500/30 bg-emerald-500',
    pink: 'from-pink-400 to-pink-600 hover:shadow-pink-500/30 bg-pink-500',
  };

  return (
    <div className="group relative bg-white dark:bg-slate-800 p-6 sm:p-8 md:p-10 rounded-[28px] sm:rounded-[40px] shadow-xl transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-4 border border-slate-50 dark:border-slate-700 overflow-hidden flex flex-col items-center text-center">
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-110 ${colorClasses[color]}`}></div>
      <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${colorClasses[color]} rounded-3xl flex items-center justify-center mb-6 sm:mb-10 shadow-lg transform group-hover:rotate-12 transition-transform`}>
        <span className="material-symbols-outlined text-white text-4xl sm:text-5xl">{icon}</span>
      </div>
      <h3 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 text-slate-800 dark:text-white">{title}</h3>
      <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 font-medium">{desc}</p>
      <div className="mt-auto w-full">
        <button 
          onClick={onClick}
          className={`block w-full py-3.5 sm:py-5 rounded-2xl text-white font-bold text-base sm:text-xl transition-colors shadow-lg ${colorClasses[color].split(' ').pop()} hover:brightness-110`}
        >
          {primaryBtn || 'Get Started'}
        </button>
      </div>
    </div>
  );
};

interface FeatureItemProps {
  icon: string;
  title: string;
  desc: string;
  color: 'indigo' | 'pink' | 'amber';
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, desc, color }) => {
  const colors: Record<string, string> = {
    indigo: 'group-hover:text-indigo-600',
    pink: 'group-hover:text-pink-600',
    amber: 'group-hover:text-amber-500',
  };
  return (
    <div className="flex gap-4 sm:gap-6 group">
      <div className={`bg-white/20 p-3 sm:p-4 rounded-2xl shrink-0 group-hover:bg-white transition-all ${colors[color]}`}>
        <span className="material-symbols-outlined text-2xl sm:text-3xl">{icon}</span>
      </div>
      <div>
        <h4 className="font-black text-lg sm:text-2xl mb-1 sm:mb-2">{title}</h4>
        <p className="text-indigo-100 text-sm sm:text-lg opacity-90">{desc}</p>
      </div>
    </div>
  );
};

export default HomePage;
