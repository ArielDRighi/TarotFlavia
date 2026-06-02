import { describe, it, expect } from 'vitest';
import { getArticleReadingMeta, getInitials, stripLeadingMarkdownHeading } from './text';

describe('getInitials', () => {
  it('should return two-letter initials from two-word name', () => {
    expect(getInitials('Luna Mística')).toBe('LM');
    expect(getInitials('Juan Pérez')).toBe('JP');
  });

  it('should return first two letters for single-word name', () => {
    expect(getInitials('Luna')).toBe('LU');
    expect(getInitials('María')).toBe('MA');
  });

  it('should handle names with multiple spaces', () => {
    expect(getInitials('Luna  Mística')).toBe('LM');
    expect(getInitials('  Luna Mística  ')).toBe('LM');
  });

  it('should return uppercase initials', () => {
    expect(getInitials('luna mística')).toBe('LM');
    expect(getInitials('juan PÉREZ')).toBe('JP');
  });

  it('should handle names with more than two words (use first two)', () => {
    expect(getInitials('María del Carmen')).toBe('MD');
  });

  it('should handle single letter names', () => {
    expect(getInitials('L')).toBe('L');
  });

  it('should handle empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('stripLeadingMarkdownHeading', () => {
  it('should remove a leading top-level heading', () => {
    expect(stripLeadingMarkdownHeading('# Aries\n\n## Carácter\nTexto.')).toBe(
      '## Carácter\nTexto.'
    );
  });

  it('should remove a leading heading preceded by blank lines (guide format)', () => {
    const content = '\n# Guía del Tarot: El Espejo del Alma\n\n## 1. ¿Qué es el Tarot?';
    expect(stripLeadingMarkdownHeading(content)).toBe('## 1. ¿Qué es el Tarot?');
  });

  it('should preserve a leading second-level heading (##)', () => {
    const content = '## Sección\n\nTexto.';
    expect(stripLeadingMarkdownHeading(content)).toBe(content);
  });

  it('should not remove a top-level heading that is not the first content', () => {
    const content = 'Intro.\n\n# Título en el medio\n\nMás texto.';
    expect(stripLeadingMarkdownHeading(content)).toBe(content);
  });

  it('should only remove the first leading heading, keeping the rest intact', () => {
    const content = '# Primero\n\n# Segundo\n\nTexto.';
    expect(stripLeadingMarkdownHeading(content)).toBe('# Segundo\n\nTexto.');
  });

  it('should return content unchanged when there is no heading', () => {
    const content = 'Solo un párrafo sin encabezado.';
    expect(stripLeadingMarkdownHeading(content)).toBe(content);
  });

  it('should handle an empty string', () => {
    expect(stripLeadingMarkdownHeading('')).toBe('');
  });
});

describe('getArticleReadingMeta', () => {
  it('should count second-level headings as sections', () => {
    const content = '# Título\n\nIntro.\n\n## 1. Uno\n\nTexto.\n\n## 2. Dos\n\nTexto.';
    expect(getArticleReadingMeta(content).sectionCount).toBe(2);
  });

  it('should not count third-level headings (###) as sections', () => {
    const content = '## 1. Uno\n\n### Subsección\n\nTexto.\n\n## 2. Dos\n\nTexto.';
    expect(getArticleReadingMeta(content).sectionCount).toBe(2);
  });

  it('should not count the leading top-level heading (#) as a section', () => {
    const content = '# Guía del Tarot\n\nIntro sin secciones.';
    expect(getArticleReadingMeta(content).sectionCount).toBe(0);
  });

  it('should estimate reading time at ~200 words per minute (rounded up)', () => {
    // 250 palabras → 250 / 200 = 1.25 → 2 minutos
    const content = `# Título\n\n${Array.from({ length: 250 }, () => 'palabra').join(' ')}`;
    expect(getArticleReadingMeta(content).readingTimeMinutes).toBe(2);
  });

  it('should never return less than 1 minute for non-empty content', () => {
    expect(getArticleReadingMeta('## Sección\n\nTexto breve.').readingTimeMinutes).toBe(1);
  });

  it('should return zeroed meta for empty content', () => {
    expect(getArticleReadingMeta('')).toEqual({ readingTimeMinutes: 0, sectionCount: 0 });
  });
});
