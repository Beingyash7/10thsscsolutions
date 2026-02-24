import React, { useState } from "react";

interface AssistantProps {
  context: string;
}

type ShaalaaOccurrence = {
  text?: string;
  url?: string;
};

type ShaalaaItem = {
  question?: string;
  solution_text?: string;
  appears_in?: ShaalaaOccurrence[];
};

type ShaalaaResponse = {
  items?: ShaalaaItem[];
};

const SHAAALA_FILES = [
  "algebra_maths_1.json",
  "geometry_maths_2.json",
  "science_tech_1.json",
  "science_tech_2.json",
  "history_political_science.json",
  "geography.json",
  "english.json",
  "hindi_lokbharati.json",
  "marathi_second_language.json",
];

const STOP_WORDS = new Set([
  "the",
  "is",
  "am",
  "are",
  "was",
  "were",
  "and",
  "or",
  "for",
  "of",
  "in",
  "on",
  "to",
  "a",
  "an",
  "by",
  "from",
  "what",
  "why",
  "how",
  "when",
  "find",
  "solve",
  "show",
  "with",
  "that",
  "this",
  "be",
  "if",
  "let",
  "then",
]);

const itemsCache = new Map<string, ShaalaaItem[]>();

const repairText = (text: string): string =>
  text
    .replace(/Â/g, "")
    .replace(/âˆ´/g, "∴")
    .replace(/â€“|â€”/g, "-")
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€œ|â€�/g, '"');

const normalizeText = (text: string): string =>
  repairText(text)
    .toLowerCase()
    .replace(/[`~!@#$%^&*()_|+=?;:'",.<>{}\[\]\\\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenize = (text: string): string[] =>
  normalizeText(text)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

const compactAnswer = (text: string): string =>
  repairText(text)
    .replace(/\s+/g, " ")
    .replace(/\s*∴\s*/g, "\n∴ ")
    .replace(/\s+(Answer|Solution)\s*:/gi, "\n$1:")
    .trim();

const getContextPreferredFiles = (context: string): string[] => {
  const c = normalizeText(context);
  if (c.includes("algebra") || c.includes("math 1"))
    return ["algebra_maths_1.json"];
  if (c.includes("geometry") || c.includes("math 2"))
    return ["geometry_maths_2.json"];
  if (
    c.includes("science & tech part 1") ||
    c.includes("science and technology 1")
  )
    return ["science_tech_1.json"];
  if (
    c.includes("science & tech part 2") ||
    c.includes("science and technology 2")
  )
    return ["science_tech_2.json"];
  if (c.includes("history") || c.includes("civics") || c.includes("political"))
    return ["history_political_science.json"];
  if (c.includes("geography")) return ["geography.json"];
  if (c.includes("english")) return ["english.json"];
  if (c.includes("hindi")) return ["hindi_lokbharati.json"];
  if (c.includes("marathi")) return ["marathi_second_language.json"];
  return SHAAALA_FILES;
};

const loadShaalaaItems = async (context: string): Promise<ShaalaaItem[]> => {
  const files = getContextPreferredFiles(context);
  const cacheKey = files.join("|");
  if (itemsCache.has(cacheKey)) {
    return itemsCache.get(cacheKey) || [];
  }

  const responses = await Promise.all(
    files.map((file) =>
      fetch(`/shaalaa/${file}`).then((res) => (res.ok ? res.json() : null)),
    ),
  );

  const items = responses.flatMap((raw) => {
    const data = raw as ShaalaaResponse | null;
    return data?.items || [];
  });
  itemsCache.set(cacheKey, items);
  return items;
};

const scoreItem = (
  item: ShaalaaItem,
  promptTokens: string[],
  contextTokens: string[],
  promptPhrase: string,
): number => {
  const q = normalizeText(item.question || "");
  const s = normalizeText(item.solution_text || "");
  const links = normalizeText(
    (item.appears_in || [])
      .map((a) => `${a.text || ""} ${a.url || ""}`)
      .join(" "),
  );
  let score = 0;
  for (const token of promptTokens) {
    if (q.includes(token)) score += 6;
    if (s.includes(token)) score += 2;
    if (links.includes(token)) score += 3;
  }
  for (const token of contextTokens) {
    if (q.includes(token) || links.includes(token)) score += 1;
  }
  if (promptPhrase.length > 8 && q.includes(promptPhrase)) score += 30;
  if (promptPhrase.length > 8 && s.includes(promptPhrase)) score += 12;

  return score;
};

const GeminiAssistant: React.FC<AssistantProps> = ({ context }) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const askAI = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || loading) return;
    setLoading(true);
    setResponse(null);

    try {
      const items = await loadShaalaaItems(context);
      if (items.length === 0) {
        setResponse(
          "I couldn't load local textbook data. Please refresh and try again.",
        );
        return;
      }

      let promptTokens = tokenize(trimmedPrompt);
      if (promptTokens.length === 0) {
        promptTokens = normalizeText(trimmedPrompt)
          .split(" ")
          .filter((token) => token.length > 1);
      }
      const contextTokens = tokenize(context);
      const promptPhrase = normalizeText(trimmedPrompt);

      const ranked = items
        .map((item) => ({
          item,
          score: scoreItem(item, promptTokens, contextTokens, promptPhrase),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (ranked.length === 0) {
        setResponse(
          "No close textbook match found. Try pasting the exact question text from the exercise.",
        );
        return;
      }

      const best = ranked[0].item;
      const source = (best.appears_in || [])
        .map((a) => repairText(a.text || ""))
        .filter(Boolean)
        .slice(0, 2)
        .join(", ");

      const alternatives = ranked
        .slice(1)
        .map((entry) => repairText(entry.item.question || ""))
        .filter(Boolean)
        .slice(0, 2);

      setResponse(
        `Best match from textbook data:\n\nQ: ${repairText(best.question || "N/A")}\n\nA: ${compactAnswer(best.solution_text || "No answer available.")}${source ? `\n\nSource: ${source}` : ""}${alternatives.length ? `\n\nTry also:\n- ${alternatives.join("\n- ")}` : ""}`,
      );
    } catch (e) {
      setResponse(
        "Search is temporarily unavailable. Please try again in a moment.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-[60] transition-all duration-500 ${isOpen ? "w-96" : "w-16 h-16"}`}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">smart_toy</span>
              <span className="font-bold">Vibrant Study Helper</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:rotate-90 transition-transform"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-4 text-sm">
            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-2xl">
              Hello! I'm your tutor for{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                "{repairText(context)}"
              </span>
              . Ask your textbook question and I will find the closest Shaalaa
              answer.
            </div>
            {response && (
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 text-slate-800 dark:text-slate-200 whitespace-pre-line">
                {response}
              </div>
            )}
            {loading && (
              <div className="flex gap-2 p-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAI()}
                placeholder="Ask me a question..."
                className="w-full bg-white dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 ring-indigo-500 py-3"
              />
              <button
                onClick={askAI}
                disabled={!prompt.trim() || loading}
                className="bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;
