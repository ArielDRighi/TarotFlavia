import { describe, it, expect } from 'vitest';
import { getInitials } from './text';

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
