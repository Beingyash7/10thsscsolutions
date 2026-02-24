import { Subject } from './types';

export const CLASS_10_SUBJECTS: Subject[] = [
  {
    id: 'math',
    title: 'Mathematics',
    icon: 'functions',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Algebra, Geometry, and practical solutions with step-by-step logic.',
    books: [
      {
        id: 'math-1',
        title: 'Algebra (Math 1)',
        subjectId: 'math',
        class: '10',
        datasetFile: 'algebra_maths_1.json',
        imageUrl: '/covers/math-1.webp',
        solvedCount: '417 Questions',
        tag: 'Essential',
        chapters: [
          { id: 1, title: 'Linear Equations in Two Variables', questions: 67, exercises: [
            { id: '1.1', name: 'Practice Set 1.1', questions: 9 },
            { id: '1.2', name: 'Practice Set 1.2', questions: 8 },
            { id: '1.3', name: 'Practice Set 1.3', questions: 10 },
            { id: 'ps1', name: 'Problem Set 1', questions: 30 },
          ]},
          { id: 2, title: 'Quadratic Equations', questions: 108, exercises: [
            { id: '2.1', name: 'Practice Set 2.1', questions: 17 },
            { id: 'ps2', name: 'Problem Set 2', questions: 35 },
          ]},
          { id: 3, title: 'Arithmetic Progression', questions: 69 },
          { id: 4, title: 'Financial Planning', questions: 59 },
          { id: 5, title: 'Probability', questions: 62 },
          { id: 6, title: 'Statistics', questions: 52 },
        ]
      },
      {
        id: 'math-2',
        title: 'Geometry (Math 2)',
        subjectId: 'math',
        class: '10',
        datasetFile: 'geometry_maths_2.json',
        imageUrl: '/covers/math-2.webp',
        solvedCount: '371 Questions',
        tag: 'Diagram Heavy',
        chapters: [
          { id: 1, title: 'Similarity', questions: 53 },
          { id: 2, title: 'Pythagoras Theorem', questions: 51 },
          { id: 3, title: 'Circle', questions: 60 },
          { id: 4, title: 'Geometric Constructions', questions: 21 },
          { id: 5, title: 'Co-ordinate Geometry', questions: 83 },
          { id: 6, title: 'Trigonometry', questions: 45 },
          { id: 7, title: 'Mensuration', questions: 58 },
        ]
      }
    ]
  },
  {
    id: 'science',
    title: 'Science & Tech',
    icon: 'biotech',
    gradient: 'from-emerald-400 to-teal-600',
    description: 'Interactive diagrams and clear explanations for all scientific concepts.',
    books: [
      {
        id: 'sci-1',
        title: 'Science & Tech Part 1',
        subjectId: 'science',
        class: '10',
        datasetFile: 'science_tech_1.json',
        imageUrl: '/covers/sci-1.webp',
        solvedCount: '250 Questions',
        tag: 'Conceptual',
        chapters: [
          { id: 1, title: 'Gravitation', questions: 19 },
          { id: 2, title: 'Periodic Classification', questions: 38 },
          { id: 3, title: 'Chemical Reactions', questions: 31 },
          { id: 4, title: 'Effects of Electric Current', questions: 25 },
          { id: 5, title: 'Heat', questions: 20 },
          { id: 6, title: 'Refraction of Light', questions: 9 },
          { id: 7, title: 'Lenses', questions: 14 },
          { id: 8, title: 'Metallurgy', questions: 33 },
          { id: 9, title: 'Carbon Compounds', questions: 46 },
          { id: 10, title: 'Space Missions', questions: 15 },
        ]
      },
      {
        id: 'sci-2',
        title: 'Science & Tech Part 2',
        subjectId: 'science',
        class: '10',
        datasetFile: 'science_tech_2.json',
        imageUrl: '/covers/sci-2.webp',
        solvedCount: '253 Questions',
        tag: 'Biology Focus',
        chapters: [
          { id: 1, title: 'Heredity and Evolution', questions: 28 },
          { id: 2, title: 'Life Processes Part 1', questions: 26 },
          { id: 3, title: 'Life Processes Part 2', questions: 28 },
          { id: 4, title: 'Environmental Management', questions: 17 },
          { id: 5, title: 'Towards Green Energy', questions: 26 },
          { id: 6, title: 'Animal Classification', questions: 36 },
          { id: 7, title: 'Introduction to Microbiology', questions: 24 },
          { id: 8, title: 'Cell Biology', questions: 21 },
          { id: 9, title: 'Social Health', questions: 20 },
          { id: 10, title: 'Disaster Management', questions: 27 },
        ]
      }
    ]
  },
  {
    id: 'history',
    title: 'History & Civics',
    icon: 'history_edu',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Simplified timelines and governance guides for every student.',
    books: [
      {
        id: 'hist-1',
        title: 'History and Civics',
        subjectId: 'history',
        class: '10',
        datasetFile: 'history_political_science.json',
        imageUrl: '/covers/hist-1.webp',
        solvedCount: '150 Questions',
        tag: 'High Scoring',
        chapters: [
          { id: 1, title: 'Historiography: Development in the West', questions: 15 },
          { id: 2, title: 'Historiography: Indian Tradition', questions: 12 },
          { id: 3, title: 'Applied History', questions: 18 },
          { id: 4, title: 'History of Indian Arts', questions: 20 },
          { id: 5, title: 'Mass Media and History', questions: 14 },
          { id: 6, title: 'Entertainment and History', questions: 16 },
        ]
      }
    ]
  },
  {
    id: 'geography',
    title: 'Geography',
    icon: 'public',
    gradient: 'from-cyan-400 to-blue-500',
    description: 'Detailed maps, terrain analysis and economic basics simplified.',
    books: [
      {
        id: 'geo-1',
        title: 'Geography Class 10',
        subjectId: 'geography',
        class: '10',
        datasetFile: 'geography.json',
        imageUrl: '/covers/geo-1.webp',
        solvedCount: '120 Questions',
        tag: 'Visual Guides',
        chapters: [
          { id: 1, title: 'Field Visit', questions: 8 },
          { id: 2, title: 'Location and Extent', questions: 12 },
          { id: 3, title: 'Physiography and Drainage', questions: 15 },
          { id: 4, title: 'Climate', questions: 14 },
          { id: 5, title: 'Natural Vegetation and Wildlife', questions: 13 },
          { id: 6, title: 'Population', questions: 11 },
          { id: 7, title: 'Human Settlements', questions: 10 },
          { id: 8, title: 'Economy and Occupations', questions: 18 },
          { id: 9, title: 'Tourism, Transport and Communication', questions: 20 },
        ]
      }
    ]
  },
  {
    id: 'english',
    title: 'English',
    icon: 'translate',
    gradient: 'from-pink-500 to-rose-600',
    description: 'Grammar guides, poetry analysis, and writing skill workshops.',
    books: [
      {
        id: 'eng-1',
        title: 'English Kumarbharati',
        subjectId: 'english',
        class: '10',
        datasetFile: 'english.json',
        imageUrl: '/covers/eng-1.webp',
        solvedCount: 'Full Course',
        tag: 'SSC Standard',
        chapters: [
          { id: 1, title: 'Unit 1: A Teenagers Prayer', questions: 10 },
          { id: 2, title: 'Unit 1: An Encounter of a Special Kind', questions: 15 },
          { id: 3, title: 'Unit 1: Basketful of Moonlight', questions: 8 },
          { id: 4, title: 'Unit 2: You Start Dying Slowly', questions: 12 },
        ]
      }
    ]
  },
  {
    id: 'marathi',
    title: 'Marathi',
    icon: 'menu_book',
    gradient: 'from-orange-400 to-rose-500',
    description: 'Marathi second language chapter-wise textbook questions and answers.',
    books: [
      {
        id: 'mar-1',
        title: 'Marathi (Second Language)',
        subjectId: 'marathi',
        class: '10',
        datasetFile: 'marathi_second_language.json',
        imageUrl: '/covers/mar-1.webp',
        solvedCount: 'Chapter-wise Q&A',
        tag: 'Balbharati',
        chapters: []
      }
    ]
  },
  {
    id: 'hindi',
    title: 'Hindi',
    icon: 'translate',
    gradient: 'from-fuchsia-500 to-violet-600',
    description: 'Hindi Lokbharati textbook solutions with chapter-wise answers.',
    books: [
      {
        id: 'hin-1',
        title: 'Hindi Lokbharati',
        subjectId: 'hindi',
        class: '10',
        datasetFile: 'hindi_lokbharati.json',
        imageUrl: '/covers/hin-1.webp',
        solvedCount: 'Chapter-wise Q&A',
        tag: 'Lokbharati',
        chapters: []
      }
    ]
  }
];

export const CLASS_10_BOOKS = CLASS_10_SUBJECTS.flatMap(s => s.books);
