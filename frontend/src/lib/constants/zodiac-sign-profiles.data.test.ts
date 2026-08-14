/**
 * Tests de los perfiles estáticos de los 12 signos (T-SEO-004).
 *
 * Son el guardarraíl de contenido de `/horoscopo/[sign]`: si alguien recorta un
 * perfil por debajo del mínimo indexable, o repite texto entre signos, falla acá
 * y no en el próximo rechazo de AdSense.
 */

import { describe, it, expect } from 'vitest';

import {
  MIN_SIGN_PROFILE_WORDS,
  ZODIAC_SIGN_PROFILES,
  getSignProfileWordCount,
  getZodiacSignProfile,
} from '@/lib/constants/zodiac-sign-profiles.data';
import { ZodiacSign } from '@/types/horoscope.types';

const SIGNS = Object.values(ZodiacSign);

describe('ZODIAC_SIGN_PROFILES', () => {
  it('tiene un perfil por cada uno de los 12 signos', () => {
    expect(Object.keys(ZODIAC_SIGN_PROFILES)).toHaveLength(12);
    SIGNS.forEach((sign) => {
      expect(ZODIAC_SIGN_PROFILES[sign]).toBeDefined();
    });
  });

  it.each(SIGNS)('el perfil de %s tiene todas las secciones pobladas', (sign) => {
    const profile = ZODIAC_SIGN_PROFILES[sign];

    expect(profile.tagline.length).toBeGreaterThan(10);
    expect(profile.rulingPlanet).toBeTruthy();
    expect(profile.intro).toHaveLength(2);
    profile.intro.forEach((paragraph) => expect(paragraph.length).toBeGreaterThan(80));
    expect(profile.dailyAreas.love.length).toBeGreaterThan(60);
    expect(profile.dailyAreas.wellness.length).toBeGreaterThan(60);
    expect(profile.dailyAreas.money.length).toBeGreaterThan(60);
    expect(profile.bestMoment.length).toBeGreaterThan(40);
    expect(profile.watchOut.length).toBeGreaterThan(40);
    expect(profile.harmonyNote.length).toBeGreaterThan(40);
    expect(profile.oppositeNote.length).toBeGreaterThan(40);
    expect(profile.dailyKeywords.length).toBeGreaterThanOrEqual(3);
  });

  it.each(SIGNS)(
    `el perfil de %s aporta al menos ${MIN_SIGN_PROFILE_WORDS} palabras propias`,
    (sign) => {
      expect(getSignProfileWordCount(sign)).toBeGreaterThanOrEqual(MIN_SIGN_PROFILE_WORDS);
    }
  );

  it('no repite ningún párrafo entre signos (contenido único por URL)', () => {
    const seen = new Map<string, ZodiacSign>();

    SIGNS.forEach((sign) => {
      const profile = ZODIAC_SIGN_PROFILES[sign];
      const paragraphs = [
        profile.tagline,
        ...profile.intro,
        profile.dailyAreas.love,
        profile.dailyAreas.wellness,
        profile.dailyAreas.money,
        profile.bestMoment,
        profile.watchOut,
        profile.harmonyNote,
        profile.oppositeNote,
      ];

      paragraphs.forEach((paragraph) => {
        const normalized = paragraph.trim().toLowerCase();
        expect(seen.get(normalized)).toBeUndefined();
        seen.set(normalized, sign);
      });
    });
  });

  it('no repite la misma lista de palabras clave entre signos', () => {
    const keywordSets = SIGNS.map((sign) =>
      ZODIAC_SIGN_PROFILES[sign].dailyKeywords.join('|').toLowerCase()
    );

    expect(new Set(keywordSets).size).toBe(SIGNS.length);
  });
});

describe('getZodiacSignProfile', () => {
  it('devuelve el perfil del signo pedido', () => {
    expect(getZodiacSignProfile(ZodiacSign.LEO)).toBe(ZODIAC_SIGN_PROFILES[ZodiacSign.LEO]);
  });
});

describe('getSignProfileWordCount', () => {
  it('cuenta las palabras de todas las secciones de texto', () => {
    const profile = ZODIAC_SIGN_PROFILES[ZodiacSign.ARIES];
    const introWords = profile.intro.join(' ').trim().split(/\s+/).length;

    expect(getSignProfileWordCount(ZodiacSign.ARIES)).toBeGreaterThan(introWords);
  });
});
