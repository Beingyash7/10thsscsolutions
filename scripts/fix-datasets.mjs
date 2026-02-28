import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public', 'shaalaa');

if (!fs.existsSync(DATA_DIR)) {
  console.error('Dataset directory not found at public/shaalaa');
  process.exit(1);
}

const files = fs
  .readdirSync(DATA_DIR)
  .filter((name) => name.endsWith('.json'))
  .filter((name) => name !== 'summary.json');

const IMAGE_PLACEHOLDER = '<p><em>[Diagram answer removed — refer textbook]</em></p>';
const LEGACY_PLACEHOLDER_PATTERN = /\[Diagram\/image-based answer not available yet\.[^\]]*\]/i;

const cleanTitleToQuestion = (value) =>
  String(value || '')
    .replace(/\s*[-|:]\s*(Hindi|Marathi|English|Second\/Third Language|\[[^\]]+\])[\s\S]*$/i, '')
    .split(' - ')[0]
    .replace(/\s{2,}/g, ' ')
    .trim();

let totalQuestionFixes = 0;
let totalImageFixes = 0;
let totalIdFixes = 0;
let totalStyleFixes = 0;
let totalFilesChanged = 0;

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = Array.isArray(raw?.items) ? raw.items : [];

  let fileChanged = false;

  for (const item of items) {
    const question = String(item?.question || '').trim();
    if (!question) {
      const fallback = cleanTitleToQuestion(item?.title);
      if (fallback) {
        item.question = fallback;
        totalQuestionFixes += 1;
        fileChanged = true;
      }
    }

    const solutionHtml = String(item?.solution_html || '');
    if (!solutionHtml) continue;

    if (/<img\b/i.test(solutionHtml) || LEGACY_PLACEHOLDER_PATTERN.test(solutionHtml)) {
      if (item.solution_html !== IMAGE_PLACEHOLDER) {
        item.solution_html = IMAGE_PLACEHOLDER;
        item.solution_text = '[Diagram answer removed - refer textbook]';
        totalImageFixes += 1;
        fileChanged = true;
      }
      continue;
    }

    let updated = solutionHtml;
    const withoutIds = updated.replace(/\s+id=("|')answer\d+\1/gi, '');
    if (withoutIds !== updated) {
      totalIdFixes += 1;
      updated = withoutIds;
    }

    const withoutStyles = updated.replace(/\s+style=("|')[\s\S]*?\1/gi, '');
    if (withoutStyles !== updated) {
      totalStyleFixes += 1;
      updated = withoutStyles;
    }

    if (updated !== solutionHtml) {
      item.solution_html = updated;
      fileChanged = true;
    }
  }

  if (fileChanged) {
    fs.writeFileSync(filePath, JSON.stringify(raw, null, 2), 'utf8');
    totalFilesChanged += 1;
  }
}

console.log(
  `Dataset fixes complete: files_changed=${totalFilesChanged}, question_fixes=${totalQuestionFixes}, image_fixes=${totalImageFixes}, id_fixes=${totalIdFixes}, style_fixes=${totalStyleFixes}`,
);


