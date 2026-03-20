import React, { useState, useEffect } from 'react';
import { Page, NavigationState } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Class10Page from './pages/Class10Page';
import ClassHubPage from './pages/ClassHubPage';
import PapersPage from './pages/PapersPage';
import { getCanonicalUrl, getSeoForNav, navToPath, parseLocationToNav } from './routing';

const App: React.FC = () => {
  const [nav, setNav] = useState<NavigationState>(() =>
    typeof window === 'undefined'
      ? { page: Page.Home }
      : parseLocationToNav(window.location.pathname),
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    // Sync on mount in case browser theme changed before hydration/mount.
    setIsDarkMode(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      setNav(parseLocationToNav(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nextPath = navToPath(nav);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    const seo = getSeoForNav(nav);
    document.title = seo.title;

    const setMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      }
    };

    setMeta('meta[name="description"]', seo.description);
    setMeta('meta[property="og:title"]', seo.title);
    setMeta('meta[property="og:description"]', seo.description);
    setMeta('meta[name="twitter:title"]', seo.title);
    setMeta('meta[name="twitter:description"]', seo.description);
    setMeta('meta[property="og:url"]', getCanonicalUrl(nav));

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', getCanonicalUrl(nav));
    }

    document.documentElement.setAttribute('lang', 'en');
  }, [nav]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const navigateTo = (page: Page) => {
    setNav({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setDeepNav = (update: Partial<NavigationState>) => {
    setNav(prev => ({ ...prev, ...update }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-600">
      <Navbar 
        currentPage={nav.page} 
        onNavigate={navigateTo} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onSearch={setSearchQuery}
      />
      
      <main className="flex-grow">
        {nav.page === Page.Home && (
          <HomePage
            onNavigate={navigateTo}
            searchQuery={searchQuery}
            onQuickViewBook={(book) =>
              setNav({
                page: Page.Class10,
                subjectId: book.subjectId,
                bookId: book.id,
                chapterId: undefined,
                exerciseId: undefined,
              })
            }
          />
        )}
        {nav.page === Page.Class10 && (
          <Class10Page 
            nav={nav} 
            onNavigate={navigateTo}
            onUpdateNav={setDeepNav}
          />
        )}
        {nav.page === Page.Class8 && (
          <ClassHubPage classNumber={8} onNavigate={navigateTo} />
        )}
        {nav.page === Page.Class9 && (
          <ClassHubPage classNumber={9} onNavigate={navigateTo} />
        )}
        {nav.page === Page.Papers && <PapersPage />}
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;
