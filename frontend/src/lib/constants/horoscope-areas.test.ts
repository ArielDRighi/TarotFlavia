import { describe, it, expect } from 'vitest';

import { BRAND_ICONS } from './brand-icons';
import { HOROSCOPE_AREA_ICON } from './horoscope-areas';

describe('HOROSCOPE_AREA_ICON', () => {
  it('cubre las áreas del horóscopo occidental y del chino', () => {
    expect(Object.keys(HOROSCOPE_AREA_ICON).sort()).toEqual([
      'career',
      'finance',
      'love',
      'money',
      'wellness',
    ]);
  });

  it('cada área apunta a un slug existente de la familia areas/', () => {
    for (const slug of Object.values(HOROSCOPE_AREA_ICON)) {
      expect(BRAND_ICONS.areas).toHaveProperty(slug);
    }
  });

  it('career y finance (chino) comparten asset con work y money', () => {
    expect(HOROSCOPE_AREA_ICON.career).toBe('work');
    expect(HOROSCOPE_AREA_ICON.finance).toBe('money');
    expect(HOROSCOPE_AREA_ICON.money).toBe('money');
  });
});
