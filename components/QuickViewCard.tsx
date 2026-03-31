import React from 'react';
import type { Book } from '../types';
import { inferImageAlt } from '../src/utils/seo';

interface QuickViewCardProps {
  book: Book;
  onQuickView?: (book: Book) => void;
}

const toSrcSet = (src: string): string => {
  if (!src.endsWith('.webp')) return `${src} 1x`;
  return `${src} 1x, ${src.replace(/\.webp$/i, '.png')} 2x`;
};

const QuickViewCard: React.FC<QuickViewCardProps> = ({ book, onQuickView }) => (
  <div className="group lift-card bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-500">
    <div className="aspect-[3/4] relative overflow-hidden bg-slate-200">
      <img
        alt={inferImageAlt(book.imageUrl, book.title)}
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        src={book.imageUrl}
        srcSet={toSrcSet(book.imageUrl)}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
        width={960}
        height={1280}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 gap-4">
        <button
          onClick={() => onQuickView?.(book)}
          className="pressable bg-white text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors w-full justify-center"
        >
          <span className="material-symbols-outlined">visibility</span> Quick View
        </button>
      </div>
      <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">Class {book.class}</div>
    </div>
    <div className="p-6">
      <h4 className="font-black text-xl text-slate-800 dark:text-slate-200 mb-2 truncate">{book.title}</h4>
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1 text-sm font-bold"><span className="material-symbols-outlined text-sm text-green-500">check_circle</span> {book.solvedCount}</span>
        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{book.tag}</span>
      </div>
    </div>
  </div>
);

export default QuickViewCard;
