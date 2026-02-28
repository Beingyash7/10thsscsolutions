const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "sub",
  "sup",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "code",
  "pre",
  "blockquote",
  "h3",
  "h4",
  "div",
  "span",
]);

const ALLOWED_CLASSES = new Set([
  "answer-heading",
  "steps",
  "bullets",
  "final-answer",
  "math-line",
  "note",
  "observation",
  "conclusion",
  "diagram-callout",
  "table-wrap",
]);

const EMPTY_FALLBACK = "<p><em>[Answer not available]</em></p>";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const decodeEntities = (value) =>
  String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const stripTags = (value) =>
  decodeEntities(String(value || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const sanitizeHtml = (rawHtml) => {
  let html = String(rawHtml || "");

  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<\s*script\b[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  html = html.replace(/<\s*iframe\b[\s\S]*?<\s*\/\s*iframe\s*>/gi, "");
  html = html.replace(
    /<\s*(script|iframe|object|embed|style|link|meta)\b[^>]*\/?>/gi,
    "",
  );
  html = html.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/<\s*img\b[^>]*>/gi, "");

  html = html.replace(/<\/?([a-z0-9:-]+)([^>]*)>/gi, (full, rawTag, attrs = "") => {
    const tag = String(rawTag || "").toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    const closing = /^<\s*\//.test(full);
    if (closing) return `</${tag}>`;
    if (tag === "br") return "<br>";

    const classMatch = attrs.match(/\bclass\s*=\s*["']([^"']+)["']/i);
    const className = classMatch
      ? classMatch[1]
          .split(/\s+/)
          .filter((name) => ALLOWED_CLASSES.has(name))
          .join(" ")
      : "";

    if (tag === "td" || tag === "th") {
      const colspan = attrs.match(/\bcolspan\s*=\s*['"]?(\d+)['"]?/i)?.[1];
      const rowspan = attrs.match(/\browspan\s*=\s*['"]?(\d+)['"]?/i)?.[1];
      const safeAttrs = `${className ? ` class="${className}"` : ""}${
        colspan ? ` colspan="${colspan}"` : ""
      }${rowspan ? ` rowspan="${rowspan}"` : ""}`;
      return `<${tag}${safeAttrs}>`;
    }

    return `<${tag}${className ? ` class="${className}"` : ""}>`;
  });

  return html;
};

const extractTables = (html) => {
  const map = new Map();
  let index = 0;
  const withoutTables = String(html || "").replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    const token = `__TABLE_${index}__`;
    map.set(token, `<div class="table-wrap">${tableHtml}</div>`);
    index += 1;
    return `\n${token}\n`;
  });
  return { withoutTables, tables: map };
};

const toLines = (html) =>
  String(html || "")
    .replace(/<(\/p|\/div|\/h3|\/h4|\/blockquote|\/pre|\/ul|\/ol|\/li|\/tr)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split(/\n+/)
    .map((line) => decodeEntities(line).replace(/\s+/g, " ").trim())
    .filter(Boolean);

const splitSentences = (line) => {
  const parts = String(line || "")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 3) return [parts.join(" ").trim()].filter(Boolean);

  const chunks = [];
  for (let i = 0; i < parts.length; i += 3) {
    chunks.push(parts.slice(i, i + 3).join(" "));
  }
  return chunks;
};

const isStepLine = (line) =>
  /^(step\s*\d*[:.)-]|\d+[.)]|\([ivxlcdm]+\)|[ivxlcdm]+\)|[\u2022\-])\s+/i.test(line);

const isBulletLine = (line) => /^[\u2022\-]\s+/.test(line);

const stripStepPrefix = (line) =>
  String(line || "")
    .replace(/^(step\s*\d*[:.)-]|\d+[.)]|\([ivxlcdm]+\)|[ivxlcdm]+\)|[\u2022\-])\s+/i, "")
    .trim();

const isAnswerLine = (line) => /^(ans|answer)\s*[:\-]/i.test(line);

const stripAnswerPrefix = (line) => String(line || "").replace(/^(ans|answer)\s*[:\-]\s*/i, "").trim();

const isMathLine = (line) =>
  /(?:\bformula\b|\u2234|\bhence\b|\btherefore\b)/i.test(line) ||
  /[A-Za-z0-9)\]]\s*=\s*[-+A-Za-z0-9(]/.test(line);

const isDiagramLine = (line) =>
  /\[(diagram|image)[^\]]*\]/i.test(line) ||
  /diagram.*(refer|textbook)/i.test(line);

const typeFromLine = (line) => {
  if (/^(important|note|remember)\s*[:\-]/i.test(line)) return "note";
  if (/^observation\s*[:\-]/i.test(line)) return "observation";
  if (/^(conclusion|therefore)\s*[:\-]/i.test(line)) return "conclusion";
  return "";
};

const stripLabelPrefix = (line) =>
  String(line || "").replace(/^(important|note|remember|observation|conclusion|therefore)\s*[:\-]\s*/i, "").trim();

const shouldAddAnswerHeading = (questionText) =>
  /\b(explain|reason|write|give|define)\b/i.test(String(questionText || ""));

const buildParagraphs = (line) =>
  splitSentences(line).map((segment) => `<p>${escapeHtml(segment)}</p>`);

export const formatSolution = (questionText, rawAnswerHtml) => {
  const metadata = {
    hasSteps: false,
    hasFormula: false,
    hasDiagramPlaceholder: false,
  };

  const safeHtml = sanitizeHtml(rawAnswerHtml);
  const { withoutTables, tables } = extractTables(safeHtml);
  const lines = toLines(withoutTables);

  if (!lines.length && !tables.size) {
    return { formattedAnswerHtml: EMPTY_FALLBACK, metadata };
  }

  const blocks = [];
  if (shouldAddAnswerHeading(questionText)) {
    blocks.push('<h3 class="answer-heading">Answer</h3>');
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (tables.has(line)) {
      blocks.push(tables.get(line));
      i += 1;
      continue;
    }

    if (isDiagramLine(line)) {
      metadata.hasDiagramPlaceholder = true;
      blocks.push('<div class="diagram-callout">Diagram: Refer textbook</div>');
      i += 1;
      continue;
    }

    if (isAnswerLine(line)) {
      const finalText = stripAnswerPrefix(line);
      blocks.push(`<div class="final-answer">${escapeHtml(finalText || "Final answer provided above.")}</div>`);
      i += 1;
      continue;
    }

    const semanticType = typeFromLine(line);
    if (semanticType) {
      blocks.push(`<div class="${semanticType}"><strong>${semanticType[0].toUpperCase() + semanticType.slice(1)}:</strong> ${escapeHtml(stripLabelPrefix(line))}</div>`);
      i += 1;
      continue;
    }

    if (isStepLine(line)) {
      const listItems = [];
      while (i < lines.length && isStepLine(lines[i])) {
        const entry = stripStepPrefix(lines[i]);
        listItems.push(`<li>${escapeHtml(entry)}</li>`);
        if (isMathLine(entry)) metadata.hasFormula = true;
        i += 1;
      }
      metadata.hasSteps = true;
      const listClass = isBulletLine(line) ? "bullets" : "steps";
      const tag = listClass === "bullets" ? "ul" : "ol";
      blocks.push(`<${tag} class="${listClass}">${listItems.join("")}</${tag}>`);
      continue;
    }

    if (isMathLine(line)) {
      metadata.hasFormula = true;
      blocks.push(`<div class="math-line">${escapeHtml(line)}</div>`);
      i += 1;
      continue;
    }

    const paragraphs = buildParagraphs(line);
    blocks.push(...paragraphs);
    i += 1;
  }

  if (tables.size) {
    for (const [token, tableHtml] of tables.entries()) {
      if (!blocks.some((block) => block.includes(token))) continue;
      blocks.push(tableHtml);
    }
  }

  const formattedAnswerHtml = sanitizeHtml(
    blocks.join("").replace(/__TABLE_\d+__/g, ""),
  );

  const plainText = stripTags(formattedAnswerHtml);
  if (!plainText) {
    return { formattedAnswerHtml: EMPTY_FALLBACK, metadata };
  }

  return { formattedAnswerHtml, metadata };
};

export const toPlainText = (rawHtml) => stripTags(sanitizeHtml(rawHtml));

