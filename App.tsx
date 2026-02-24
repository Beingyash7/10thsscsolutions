import React, { useState, useEffect } from 'react';
import { Page, NavigationState } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import Class10Page from './pages/Class10Page';
import ClassHubPage from './pages/ClassHubPage';

const App: React.FC = () => {
  const [nav, setNav] = useState<NavigationState>({ page: Page.Home });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
      />
      
      <main className="flex-grow">
        {nav.page === Page.Home && (
          <HomePage
            onNavigate={navigateTo}
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
      </main>

      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;
