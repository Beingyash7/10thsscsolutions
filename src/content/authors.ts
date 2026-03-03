import type { Author } from '../../types';

export const AUTHORS: Record<string, Author> = {
  editorial_team: {
    slug: 'editorial-team',
    name: 'SSC Solutions Editorial Team',
    bio: 'The SSC Solutions editorial team prepares chapter-wise textbook answers, verifies updates against syllabus revisions, and maintains structured learning notes for Maharashtra Board students.',
    photo: '/covers/eng-1.png',
    social: {
      website: '/about.html',
    },
  },
  math_reviewer: {
    slug: 'aarti-kulkarni',
    name: 'Aarti Kulkarni',
    bio: 'Aarti is a mathematics educator focused on Algebra and Geometry problem-solving strategies for SSC board examinations.',
    photo: '/covers/math-1.png',
    social: {
      linkedin: 'https://www.linkedin.com',
    },
  },
  science_reviewer: {
    slug: 'rahul-patil',
    name: 'Rahul Patil',
    bio: 'Rahul specializes in Science and Technology exam preparation with concept-first explanations and revision checklists.',
    photo: '/covers/sci-1.png',
    social: {
      twitter: 'https://x.com',
    },
  },
};

export const SUBJECT_AUTHOR_KEY: Record<string, keyof typeof AUTHORS> = {
  math: 'math_reviewer',
  science: 'science_reviewer',
  history: 'editorial_team',
  geography: 'editorial_team',
  english: 'editorial_team',
  hindi: 'editorial_team',
  marathi: 'editorial_team',
};
