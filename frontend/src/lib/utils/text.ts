/**
 * Text utility functions for string manipulation
 */

/**
 * Generate initials from a full name
 * @param name - Full name (e.g., "Luna Mística")
 * @returns Two-letter initials in uppercase (e.g., "LM")
 * @example
 * getInitials("Luna Mística") // "LM"
 * getInitials("Juan") // "JU"
 */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean); // Split by whitespace and filter empty strings
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Removes a leading top-level Markdown heading (`# Título`) from content.
 *
 * Encyclopedia articles embed their own title as the first `#` heading, but the
 * page chrome already renders that title as the page <h1>. Stripping it avoids a
 * duplicated, oversized title and keeps a single <h1> per page (correct outline).
 *
 * Only a single-hash (`#`) heading at the very start of the content is removed,
 * along with the blank lines that follow it. Second/third-level headings
 * (`##`, `###`) and headings further down in the document are preserved.
 *
 * @param content - Raw Markdown content
 * @returns Content without its leading top-level heading
 * @example
 * stripLeadingMarkdownHeading('# Aries\n\n## Carácter') // '## Carácter'
 * stripLeadingMarkdownHeading('## Sección\nTexto')      // '## Sección\nTexto'
 */
export function stripLeadingMarkdownHeading(content: string): string {
  return content.replace(/^\s*#[ \t]+[^\n]*[\r\n]*/, '');
}

/** Average adult reading speed (words per minute) used to estimate reading time. */
const WORDS_PER_MINUTE = 200;

/** Reading metadata derived from an article's raw Markdown content. */
export interface ArticleReadingMeta {
  /** Estimated reading time in minutes (rounded up, min 1 for non-empty content). */
  readingTimeMinutes: number;
  /** Number of second-level (`##`) sections in the article. */
  sectionCount: number;
}

/**
 * Derives reading metadata (estimated reading time + section count) from an
 * article's raw Markdown content.
 *
 * - `sectionCount` counts second-level headings (`## `) only — it ignores the
 *   leading title (`# `) and sub-sections (`### `), matching the editorial
 *   structure of the encyclopedia guides (`## 1. …`, `## 2. …`).
 * - `readingTimeMinutes` estimates time at {@link WORDS_PER_MINUTE} wpm, rounded
 *   up, with a floor of 1 minute for any non-empty content.
 *
 * @param content - Raw Markdown content
 * @example
 * getArticleReadingMeta('# Guía\n\n## 1. Uno\n\nTexto.') // { readingTimeMinutes: 1, sectionCount: 1 }
 */
export function getArticleReadingMeta(content: string): ArticleReadingMeta {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { readingTimeMinutes: 0, sectionCount: 0 };
  }

  const sectionCount = (content.match(/^##(?!#)/gm) ?? []).length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  return { readingTimeMinutes, sectionCount };
}

/** A navigable table-of-contents entry derived from an article's `## N.` heading. */
export interface ArticleHeading {
  /** Anchor id matching the rendered heading's `id` (e.g. `seccion-1`). */
  id: string;
  /** Section number from the `## N. …` heading. */
  number: number;
  /** Plain-text label (inline markdown stripped) for display in the TOC. */
  label: string;
}

/**
 * Builds the anchor id for a section number. Single source of truth shared by
 * the TOC ({@link extractArticleHeadings}) and the rendered heading
 * (`MarkdownArticle`), so links and targets always agree.
 *
 * @example getSectionAnchorId(2) // 'seccion-2'
 */
export function getSectionAnchorId(sectionNumber: number): string {
  return `seccion-${sectionNumber}`;
}

/** Matches numbered second-level headings (`## N. Título`), ignoring `#`/`###`. */
const SECTION_HEADING_RE = /^##(?!#)[ \t]+(\d+)\.[ \t]+(.+?)[ \t]*$/gm;

/**
 * Strips inline markdown (emphasis, code, links) from a heading so the TOC shows
 * clean plain text. Links collapse to their visible text (`[texto](url)` → `texto`).
 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → visible text
    .replace(/[*_`]/g, '') // bold / italic / inline-code markers
    .trim();
}

/**
 * Extracts the navigable table of contents from an article's raw Markdown.
 *
 * Only numbered second-level headings (`## N. …`) are included — matching the
 * editorial structure of the encyclopedia guides — so the leading title (`#`),
 * sub-sections (`###`) and unnumbered `##` headings are ignored. Each entry's
 * `id` is built with {@link getSectionAnchorId}, keeping it in sync with the
 * anchors rendered by `MarkdownArticle`.
 *
 * @param content - Raw Markdown content
 * @example
 * extractArticleHeadings('## 1. Intro\n\nTexto.')
 * // [{ id: 'seccion-1', number: 1, label: 'Intro' }]
 */
export function extractArticleHeadings(content: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  for (const match of content.matchAll(SECTION_HEADING_RE)) {
    const number = Number(match[1]);
    headings.push({
      id: getSectionAnchorId(number),
      number,
      label: stripInlineMarkdown(match[2]),
    });
  }
  return headings;
}
