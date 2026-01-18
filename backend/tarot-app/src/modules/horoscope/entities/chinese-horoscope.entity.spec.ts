import { ChineseHoroscope } from './chinese-horoscope.entity';
import { ChineseZodiacAnimal } from '../../../common/utils/chinese-zodiac.utils';

/**
 * Tests para ChineseHoroscope Entity
 *
 * Valida la estructura y definición de la entidad sin necesidad de base de datos
 */
describe('ChineseHoroscope Entity', () => {
  describe('Estructura de la entidad', () => {
    it('debe tener todas las propiedades requeridas', () => {
      const horoscope = new ChineseHoroscope();

      expect(horoscope).toHaveProperty('id');
      expect(horoscope).toHaveProperty('animal');
      expect(horoscope).toHaveProperty('year');
      expect(horoscope).toHaveProperty('generalOverview');
      expect(horoscope).toHaveProperty('areas');
      expect(horoscope).toHaveProperty('luckyElements');
      expect(horoscope).toHaveProperty('compatibility');
      expect(horoscope).toHaveProperty('monthlyHighlights');
      expect(horoscope).toHaveProperty('aiProvider');
      expect(horoscope).toHaveProperty('aiModel');
      expect(horoscope).toHaveProperty('tokensUsed');
      expect(horoscope).toHaveProperty('generationTimeMs');
      expect(horoscope).toHaveProperty('viewCount');
      expect(horoscope).toHaveProperty('createdAt');
      expect(horoscope).toHaveProperty('updatedAt');
    });

    it('debe poder asignar valores a las propiedades', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.animal = ChineseZodiacAnimal.DRAGON;
      horoscope.year = 2026;
      horoscope.generalOverview =
        'El año 2026 será de grandes oportunidades para el Dragón...';
      horoscope.areas = {
        love: {
          content: 'El amor florecerá en primavera...',
          score: 8,
        },
        career: {
          content: 'Oportunidades profesionales abundantes...',
          score: 9,
        },
        wellness: {
          content: 'Energía vital alta durante todo el año...',
          score: 7,
        },
        finance: {
          content: 'Inversiones prometedoras en el segundo semestre...',
          score: 8,
        },
      };
      horoscope.luckyElements = {
        numbers: [3, 7, 9],
        colors: ['Rojo', 'Dorado'],
        directions: ['Sur', 'Este'],
        months: [3, 6, 9],
      };
      horoscope.compatibility = {
        best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
        good: [ChineseZodiacAnimal.ROOSTER],
        challenging: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT],
      };
      horoscope.monthlyHighlights =
        'Marzo y junio serán meses clave para avances profesionales...';
      horoscope.aiProvider = 'groq';
      horoscope.aiModel = 'llama-3.1-70b-versatile';
      horoscope.tokensUsed = 1200;
      horoscope.viewCount = 0;

      expect(horoscope.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(horoscope.year).toBe(2026);
      expect(horoscope.generalOverview).toContain('grandes oportunidades');
      expect(horoscope.areas.love.score).toBe(8);
      expect(horoscope.areas.career.score).toBe(9);
      expect(horoscope.areas.wellness.score).toBe(7);
      expect(horoscope.areas.finance.score).toBe(8);
      expect(horoscope.luckyElements.numbers).toEqual([3, 7, 9]);
      expect(horoscope.luckyElements.colors).toEqual(['Rojo', 'Dorado']);
      expect(horoscope.luckyElements.directions).toEqual(['Sur', 'Este']);
      expect(horoscope.luckyElements.months).toEqual([3, 6, 9]);
      expect(horoscope.compatibility.best).toContain(ChineseZodiacAnimal.RAT);
      expect(horoscope.compatibility.best).toContain(
        ChineseZodiacAnimal.MONKEY,
      );
      expect(horoscope.monthlyHighlights).toContain('Marzo y junio');
      expect(horoscope.aiProvider).toBe('groq');
      expect(horoscope.aiModel).toBe('llama-3.1-70b-versatile');
      expect(horoscope.tokensUsed).toBe(1200);
      expect(horoscope.viewCount).toBe(0);
    });

    it('debe aceptar todos los animales del zodiaco chino', () => {
      const animals = Object.values(ChineseZodiacAnimal);

      expect(animals).toHaveLength(12);
      expect(animals).toContain(ChineseZodiacAnimal.RAT);
      expect(animals).toContain(ChineseZodiacAnimal.OX);
      expect(animals).toContain(ChineseZodiacAnimal.TIGER);
      expect(animals).toContain(ChineseZodiacAnimal.RABBIT);
      expect(animals).toContain(ChineseZodiacAnimal.DRAGON);
      expect(animals).toContain(ChineseZodiacAnimal.SNAKE);
      expect(animals).toContain(ChineseZodiacAnimal.HORSE);
      expect(animals).toContain(ChineseZodiacAnimal.GOAT);
      expect(animals).toContain(ChineseZodiacAnimal.MONKEY);
      expect(animals).toContain(ChineseZodiacAnimal.ROOSTER);
      expect(animals).toContain(ChineseZodiacAnimal.DOG);
      expect(animals).toContain(ChineseZodiacAnimal.PIG);
    });
  });

  describe('Estructura de datos JSONB', () => {
    it('debe tener la estructura correcta para areas', () => {
      const horoscope = new ChineseHoroscope();

      const validAreas = {
        love: { content: 'Contenido de amor', score: 8 },
        career: { content: 'Contenido de carrera', score: 9 },
        wellness: { content: 'Contenido de bienestar', score: 7 },
        finance: { content: 'Contenido de finanzas', score: 8 },
      };

      horoscope.areas = validAreas;

      expect(horoscope.areas).toHaveProperty('love');
      expect(horoscope.areas).toHaveProperty('career');
      expect(horoscope.areas).toHaveProperty('wellness');
      expect(horoscope.areas).toHaveProperty('finance');

      expect(horoscope.areas.love).toHaveProperty('content');
      expect(horoscope.areas.love).toHaveProperty('score');
      expect(typeof horoscope.areas.love.content).toBe('string');
      expect(typeof horoscope.areas.love.score).toBe('number');
    });

    it('debe tener la estructura correcta para luckyElements', () => {
      const horoscope = new ChineseHoroscope();

      const validLuckyElements = {
        numbers: [1, 7, 8],
        colors: ['Rojo', 'Dorado'],
        directions: ['Norte', 'Este'],
        months: [3, 6, 9],
      };

      horoscope.luckyElements = validLuckyElements;

      expect(horoscope.luckyElements).toHaveProperty('numbers');
      expect(horoscope.luckyElements).toHaveProperty('colors');
      expect(horoscope.luckyElements).toHaveProperty('directions');
      expect(horoscope.luckyElements).toHaveProperty('months');

      expect(Array.isArray(horoscope.luckyElements.numbers)).toBe(true);
      expect(Array.isArray(horoscope.luckyElements.colors)).toBe(true);
      expect(Array.isArray(horoscope.luckyElements.directions)).toBe(true);
      expect(Array.isArray(horoscope.luckyElements.months)).toBe(true);
    });

    it('debe tener la estructura correcta para compatibility', () => {
      const horoscope = new ChineseHoroscope();

      const validCompatibility = {
        best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.DRAGON],
        good: [ChineseZodiacAnimal.MONKEY],
        challenging: [ChineseZodiacAnimal.DOG],
      };

      horoscope.compatibility = validCompatibility;

      expect(horoscope.compatibility).toHaveProperty('best');
      expect(horoscope.compatibility).toHaveProperty('good');
      expect(horoscope.compatibility).toHaveProperty('challenging');

      expect(Array.isArray(horoscope.compatibility.best)).toBe(true);
      expect(Array.isArray(horoscope.compatibility.good)).toBe(true);
      expect(Array.isArray(horoscope.compatibility.challenging)).toBe(true);

      expect(horoscope.compatibility.best[0]).toBe(ChineseZodiacAnimal.RAT);
      expect(horoscope.compatibility.best[1]).toBe(ChineseZodiacAnimal.DRAGON);
    });
  });

  describe('Valores opcionales', () => {
    it('debe permitir monthlyHighlights como null', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.monthlyHighlights = null;

      expect(horoscope.monthlyHighlights).toBeNull();
    });

    it('debe permitir aiProvider como null', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.aiProvider = null;

      expect(horoscope.aiProvider).toBeNull();
    });

    it('debe permitir aiModel como null', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.aiModel = null;

      expect(horoscope.aiModel).toBeNull();
    });
  });

  describe('Tipos numéricos', () => {
    it('debe aceptar year como número', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.year = 2026;

      expect(typeof horoscope.year).toBe('number');
      expect(horoscope.year).toBeGreaterThan(2000);
      expect(horoscope.year).toBeLessThan(3000);
    });

    it('debe aceptar tokensUsed como número', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.tokensUsed = 1500;

      expect(typeof horoscope.tokensUsed).toBe('number');
      expect(horoscope.tokensUsed).toBeGreaterThanOrEqual(0);
    });

    it('debe aceptar generationTimeMs como número', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.generationTimeMs = 3500;

      expect(typeof horoscope.generationTimeMs).toBe('number');
      expect(horoscope.generationTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('debe aceptar viewCount como número', () => {
      const horoscope = new ChineseHoroscope();
      horoscope.viewCount = 100;

      expect(typeof horoscope.viewCount).toBe('number');
      expect(horoscope.viewCount).toBeGreaterThanOrEqual(0);
    });
  });
});
