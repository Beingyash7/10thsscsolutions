export interface Exercise {
  id: string;
  name: string;
  questions: number;
}

export interface Chapter {
  id: number;
  title: string;
  metadata?: string;
  questions?: number;
  exercises?: Exercise[];
}

export interface Book {
  id: string;
  title: string;
  subjectId: string;
  class: string;
  datasetFile?: string;
  imageUrl: string;
  solvedCount: string;
  tag: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  title: string;
  icon: string;
  gradient: string;
  description: string;
  books: Book[];
}

export enum Page {
  Home = 'home',
  Class10 = 'class-10',
  Class9 = 'class-9',
  Class8 = 'class-8',
}

export interface NavigationState {
  page: Page;
  subjectId?: string;
  bookId?: string;
  chapterId?: number;
  exerciseId?: string;
}
