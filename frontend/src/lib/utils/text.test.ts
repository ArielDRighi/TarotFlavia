import { describe, it, expect } from 'vitest';
import { getInitials, stripLeadingMarkdownHeading } from './text';

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
