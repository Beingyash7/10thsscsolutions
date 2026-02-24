
import React from 'react';
import { Page } from '../types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
        <span className="material-symbols-outlined text-[300px]">edit_square</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-white p-2 rounded-xl">
                <span className="material-symbols-outlined text-indigo-600 text-2xl">auto_stories</span>
              </div>
              <span className="text-2xl font-black tracking-tight">Vibrant MS</span>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Revolutionizing how Maharashtra Board students learn, one solution at a time. Playful, accurate, and totally free.
            </p>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-all hover:-translate-y-1">
                <span className="material-symbols-outlined text-2xl">share</span>
              </button>
              <button className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center hover:bg-pink-600 transition-all hover:-translate-y-1">
                <span className="material-symbols-outlined text-2xl">alternate_email</span>
              </button>
            </div>
          </div>

          {/* Nav Categories */}
          <div>
            <h5 className="text-xl font-black mb-8 text-indigo-400">Class Solutions</h5>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><button onClick={() => onNavigate(Page.Class10)} className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Class 10 SSC</button></li>
              <li><button onClick={() => onNavigate(Page.Class9)} className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Class 9 Solutions</button></li>
              <li><button onClick={() => onNavigate(Page.Class8)} className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Class 8 Solutions</button></li>
              <li><button className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>Question Bank</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xl font-black mb-8 text-indigo-400">Resources</h5>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><button className="hover:text-white transition-colors">2024-25 Syllabus</button></li>
              <li><button className="hover:text-white transition-colors">Previous Year Papers</button></li>
              <li><button className="hover:text-white transition-colors">Model Answers</button></li>
              <li><button className="hover:text-white transition-colors">Exam Schedule</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xl font-black mb-8 text-indigo-400">Company</h5>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="/about.html" className="hover:text-white transition-colors">Our Story</a></li>
              <li><button className="hover:text-white transition-colors">Teacher Portal</button></li>
              <li><a href="/privacy-policy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms.html" className="hover:text-white transition-colors">Terms & Service</a></li>
              <li><a href="/contact.html" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 font-medium">© 2026 Vibrant Maharashtra Solutions. Educating with care.</p>
          <div className="flex gap-8 text-slate-500 font-bold uppercase tracking-widest text-xs">
            <button className="hover:text-white transition-colors">Marathi</button>
            <button className="hover:text-white transition-colors">English</button>
            <button className="hover:text-white transition-colors">Hindi</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
