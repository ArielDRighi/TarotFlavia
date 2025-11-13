import { Injectable, Logger } from '@nestjs/common';

/**
 * Service for sanitizing AI-generated outputs to prevent XSS attacks
 *
 * This service implements defense-in-depth by sanitizing not only inputs (TASK-048)
 * but also outputs, especially AI-generated content which could potentially contain
 * malicious code if the AI is manipulated or compromised.
 *
 * Strategy:
 * 1. Remove all HTML tags and scripts
 * 2. Escape HTML entities
 * 3. Remove dangerous protocols (javascript:, data:)
 * 4. Log potential XSS attempts for security monitoring
 *
 * @see TASK-048-a: Output Sanitization and Content Security Policy
 */
@Injectable()
export class OutputSanitizerService {
  private readonly logger = new Logger(OutputSanitizerService.name);

  /**
   * Dangerous HTML tags that should be removed
   */
  private readonly dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'link',
    'style',
    'meta',
    'base',
    'form',
  ];

  /**
   * Dangerous event handlers that should be removed
   */
  private readonly dangerousEvents = [
    'onload',
    'onerror',
    'onclick',
    'onmouseover',
    'onmouseout',
    'onkeydown',
    'onkeyup',
    'onfocus',
    'onblur',
    'onchange',
    'onsubmit',
  ];

  /**
   * Sanitize AI-generated response to remove potential XSS vectors
   *
   * @param text - The AI-generated text to sanitize
   * @returns Sanitized text safe for client display
   */
  sanitizeAiResponse(text: string | null | undefined): string {
    // Handle edge cases
    if (!text) {
      return '';
    }

    // Store original for comparison
    const original = text;

    // Step 1: Remove dangerous HTML tags and scripts first (but not < and > in plain text)
    let sanitized = this.removeHtmlTags(text);

    // Step 2: Remove dangerous protocols
    sanitized = this.removeDangerousProtocols(sanitized);

    // Step 3: Escape ALL remaining < > & " ' characters for safety
    // This ensures any remaining HTML-like syntax is neutralized
    sanitized = this.escapeHtmlEntities(sanitized);

    // Log if content was modified (potential XSS attempt)
    if (sanitized !== original) {
      this.logger.warn(
        `Potential XSS attempt detected and sanitized in AI response. ` +
          `Original length: ${original.length}, Sanitized length: ${sanitized.length}`,
      );
    }

    return sanitized;
  }

  /**
   * Sanitize multiple responses in batch (useful for bulk operations)
   *
   * @param responses - Array of responses to sanitize
   * @returns Array of sanitized responses
   */
  sanitizeBatch(responses: string[]): string[] {
    return responses.map((response) => this.sanitizeAiResponse(response));
  }

  /**
   * Remove all HTML tags from text while preserving standalone < and > symbols
   *
   * @param text - Text to clean
   * @returns Text without HTML tags
   */
  private removeHtmlTags(text: string): string {
    // Remove dangerous tags and their content
    let cleaned = text;

    // First, remove script and style tags with their content
    cleaned = cleaned.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');

    // Remove dangerous self-closing and paired tags
    this.dangerousTags.forEach((tag) => {
      // Remove opening tags with attributes
      const openTagRegex = new RegExp(`<${tag}[^>]*>`, 'gi');
      cleaned = cleaned.replace(openTagRegex, '');

      // Remove closing tags
      const closeTagRegex = new RegExp(`</${tag}>`, 'gi');
      cleaned = cleaned.replace(closeTagRegex, '');
    });

    // Remove other HTML tags (but only complete tags, not standalone < or >)
    // This regex matches: < followed by word chars/slash, then anything until >
    cleaned = cleaned.replace(/<\/?[a-zA-Z][^>]*>/g, '');

    // Remove event handlers even if they're not in tags
    this.dangerousEvents.forEach((event) => {
      const regex = new RegExp(`${event}\\s*=\\s*["'][^"']*["']`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    return cleaned;
  }

  /**
   * Remove dangerous URL protocols that could execute scripts
   *
   * @param text - Text to clean
   * @returns Text without dangerous protocols
   */
  private removeDangerousProtocols(text: string): string {
    const dangerousProtocols = [
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /file:/gi,
    ];

    let cleaned = text;
    dangerousProtocols.forEach((protocol) => {
      cleaned = cleaned.replace(protocol, '');
    });

    return cleaned;
  }

  /**
   * Escape HTML entities to prevent XSS
   *
   * @param text - Text to escape
   * @returns Text with HTML entities escaped
   */
  private escapeHtmlEntities(text: string): string {
    // IMPORTANT: Escape & first to prevent double-escaping
    // Otherwise < becomes &lt; then &amp;lt;
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
