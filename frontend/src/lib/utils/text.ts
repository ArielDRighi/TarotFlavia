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
