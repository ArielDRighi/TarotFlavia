import { Transform } from 'class-transformer';

/**
 * Sanitizes HTML from string input to prevent XSS attacks
 * Removes all HTML tags and JavaScript event handlers
 * @param allowedTags - Optional array of allowed HTML tags (e.g., ['b', 'i', 'u'])
 */
export function SanitizeHtml(allowedTags: string[] = []) {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value as string;
    }

    let sanitized = value;

    // Remove all script tags and their content
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '',
    );

    // Remove all style tags and their content
    sanitized = sanitized.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      '',
    );

    // Remove all event handlers (onclick, onerror, onload, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: and data: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:text\/html/gi, '');

    // If no tags are allowed, remove all HTML tags
    if (allowedTags.length === 0) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } else {
      // Remove all tags except allowed ones
      const allowedTagsPattern = allowedTags.join('|');
      const regex = new RegExp(
        `<(?!/?(?:${allowedTagsPattern})\\b)[^>]*>`,
        'gi',
      );
      sanitized = sanitized.replace(regex, '');
    }

    // Remove any remaining HTML entities that could be dangerous
    sanitized = sanitized.replace(/&lt;script/gi, '');
    sanitized = sanitized.replace(/&lt;\/script/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  });
}

/**
 * Trims whitespace from both ends of a string
 */
export function Trim() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value as string;
  });
}

/**
 * Normalizes whitespace in a string (removes extra spaces, tabs, newlines)
 */
export function NormalizeWhitespace() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.replace(/\s+/g, ' ').trim();
    }
    return value as string;
  });
}

/**
 * Converts string to lowercase
 */
export function ToLowerCase() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.toLowerCase();
    }
    return value as string;
  });
}

/**
 * Sanitizes email to prevent injection
 */
export function SanitizeEmail() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      // Remove any characters that aren't valid in email addresses
      let sanitized = value.trim().toLowerCase();

      // Remove any HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '');

      // Remove spaces
      sanitized = sanitized.replace(/\s/g, '');

      return sanitized;
    }
    return value as string;
  });
}
