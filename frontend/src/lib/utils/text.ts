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
