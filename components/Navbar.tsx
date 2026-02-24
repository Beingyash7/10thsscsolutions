
import React from 'react';
import { Page } from '../types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, isDarkMode, toggleDarkMode }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => onNavigate(Page.Home)}
          >
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Vibrant MS</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            {[
              { label: 'Home', page: Page.Home },
              { label: 'Class 8', page: Page.Class8 },
              { label: 'Class 9', page: Page.Class9 },
              { label: 'Class 10', page: Page.Class10 },
              { label: 'Papers', page: Page.Home },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`relative font-semibold transition-colors hover:text-primary ${
                  currentPage === item.page 
                    ? 'text-primary' 
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.label}
                {currentPage === item.page && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={toggleDarkMode}
            >
              <span className="material-symbols-outlined block dark:hidden">dark_mode</span>
              <span className="material-symbols-outlined hidden dark:block text-yellow-400">light_mode</span>
            </button>
            <button className="bg-primary hover:scale-105 active:scale-95 text-white px-6 md:px-7 py-2.5 md:py-3 rounded-2xl font-bold transition-all shadow-xl shadow-primary/30 text-sm md:text-base">
              Join Now
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
