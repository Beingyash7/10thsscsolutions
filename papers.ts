export interface PaperBundle {
  id: number;
  title: string;
  filename: string;
  subject: string;
  bundledFiles: number;
}

export const PAPER_BUNDLES: PaperBundle[] = [
  { id: 1, title: 'English', filename: '01_english.pdf', subject: 'English', bundledFiles: 13 },
  { id: 2, title: 'Geography', filename: '02_geography.pdf', subject: 'Geography', bundledFiles: 9 },
  { id: 3, title: 'History & Political Science', filename: '03_history_political_science.pdf', subject: 'History', bundledFiles: 9 },
  { id: 4, title: 'Hindi Composite', filename: '04_hindi_composite.pdf', subject: 'Hindi', bundledFiles: 4 },
  { id: 5, title: 'Hindi Lokbharati', filename: '05_hindi_lokbharati.pdf', subject: 'Hindi', bundledFiles: 5 },
  { id: 6, title: 'Hindi Lokvani', filename: '06_hindi_lokvani.pdf', subject: 'Hindi', bundledFiles: 4 },
  { id: 7, title: 'Hindi General', filename: '07_hindi_general.pdf', subject: 'Hindi', bundledFiles: 6 },
  { id: 8, title: 'Marathi', filename: '08_marathi.pdf', subject: 'Marathi', bundledFiles: 11 },
  { id: 9, title: 'Maths Paper 1', filename: '09_maths_paper_1.pdf', subject: 'Maths', bundledFiles: 11 },
  { id: 10, title: 'Maths Paper 2', filename: '10_maths_paper_2.pdf', subject: 'Maths', bundledFiles: 11 },
  { id: 11, title: 'Science Paper 1', filename: '11_science_paper_1.pdf', subject: 'Science', bundledFiles: 11 },
  { id: 12, title: 'Science Paper 2', filename: '12_science_paper_2.pdf', subject: 'Science', bundledFiles: 12 },
  { id: 13, title: 'Sanskrit Aamod', filename: '13_sanskrit_aamod.pdf', subject: 'Sanskrit', bundledFiles: 6 },
  { id: 14, title: 'Sanskrit Anand', filename: '14_sanskrit_anand.pdf', subject: 'Sanskrit', bundledFiles: 5 },
  { id: 15, title: 'Sanskrit Composite', filename: '15_sanskrit_composite.pdf', subject: 'Sanskrit', bundledFiles: 3 },
  { id: 16, title: 'Sanskrit General', filename: '16_sanskrit_general.pdf', subject: 'Sanskrit', bundledFiles: 2 },
];

export const PAPER_BUNDLE_SUMMARY = {
  inputPapers: 122,
  outputBundles: PAPER_BUNDLES.length,
  yearRange: '2019-2025',
};
