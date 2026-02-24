import { describe, it, expect } from 'vitest';
import { formatDegreeSexagesimal } from './degree.utils';

describe('formatDegreeSexagesimal', () => {
  it('should format whole degrees showing 0 minutes', () => {
    expect(formatDegreeSexagesimal(26.0)).toBe("26° 0'");
  });

  it('should convert decimal fraction to minutes', () => {
    // 14.166... = 14° 10' (0.166... * 60 = 9.99... → round → 10)
    expect(formatDegreeSexagesimal(14.1666)).toBe("14° 10'");
  });

  it('should handle 0 degrees', () => {
    expect(formatDegreeSexagesimal(0)).toBe("0° 0'");
  });

  it('should normalize 60 minutes to +1 degree and 0 minutes', () => {
    // Caso edge: Math.round(0.9999 * 60) = Math.round(59.994) = 60 → debe ser 30° 0'
    expect(formatDegreeSexagesimal(29.9999)).toBe("30° 0'");
  });

  it('should handle mid-sign values', () => {
    // 15.5 = 15° 30'
    expect(formatDegreeSexagesimal(15.5)).toBe("15° 30'");
  });
});
