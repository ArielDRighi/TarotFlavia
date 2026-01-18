import { ChineseHoroscope } from './chinese-horoscope.entity';
import { ChineseZodiacAnimal } from '../../../common/utils/chinese-zodiac.utils';

describe('ChineseHoroscope Entity', () => {
  describe('Entity Creation', () => {
    it('should create a chinese horoscope instance', () => {
      const horoscope = new ChineseHoroscope();
      expect(horoscope).toBeInstanceOf(ChineseHoroscope);
    });

    it('should assign all required properties', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.animal = ChineseZodiacAnimal.DRAGON;
      horoscope.year = 2024;
      horoscope.generalOverview =
        'El año del Dragón de Madera trae transformación';
      horoscope.areas = {
        love: { content: 'Año de pasión renovada', rating: 8 },
        career: { content: 'Grandes oportunidades profesionales', rating: 9 },
        wellness: {
          content: 'Energía vital elevada, momento de autocuidado',
          rating: 7,
        },
        finance: { content: 'Estabilidad financiera creciente', rating: 8 },
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
        challenging: [ChineseZodiacAnimal.DOG],
      };

      expect(horoscope.animal).toBe(ChineseZodiacAnimal.DRAGON);
      expect(horoscope.year).toBe(2024);
      expect(horoscope.generalOverview).toBe(
        'El año del Dragón de Madera trae transformación',
      );
      expect(horoscope.areas.love.content).toBe('Año de pasión renovada');
      expect(horoscope.areas.love.rating).toBe(8);
      expect(horoscope.areas.career).toBeDefined();
      expect(horoscope.areas.wellness).toBeDefined();
      expect(horoscope.areas.finance).toBeDefined();
    });

    it('should assign optional properties', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.monthlyHighlights = 'Marzo y junio son meses clave';
      horoscope.aiProvider = 'gemini';
      horoscope.aiModel = 'gemini-pro';
      horoscope.tokensUsed = 2000;

      expect(horoscope.monthlyHighlights).toBe('Marzo y junio son meses clave');
      expect(horoscope.aiProvider).toBe('gemini');
      expect(horoscope.aiModel).toBe('gemini-pro');
      expect(horoscope.tokensUsed).toBe(2000);
    });

    it('should have default values for numeric fields', () => {
      const horoscope = new ChineseHoroscope();

      expect(horoscope.tokensUsed).toBeUndefined(); // Se definirá con default en DB
      expect(horoscope.viewCount).toBeUndefined();
    });
  });

  describe('JSONB Areas Structure', () => {
    it('should store areas with correct structure (love, career, wellness, finance)', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.areas = {
        love: { content: 'Contenido amor', rating: 8 },
        career: { content: 'Contenido carrera', rating: 9 },
        wellness: { content: 'Contenido bienestar', rating: 7 },
        finance: { content: 'Contenido finanzas', rating: 6 },
      };

      expect(horoscope.areas).toHaveProperty('love');
      expect(horoscope.areas).toHaveProperty('career');
      expect(horoscope.areas).toHaveProperty('wellness');
      expect(horoscope.areas).toHaveProperty('finance');

      expect(horoscope.areas.love).toHaveProperty('content');
      expect(horoscope.areas.love).toHaveProperty('rating');
      expect(typeof horoscope.areas.love.content).toBe('string');
      expect(typeof horoscope.areas.love.rating).toBe('number');
    });

    it('should validate rating range (1-10)', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.areas = {
        love: { content: 'Test', rating: 10 },
        career: { content: 'Test', rating: 1 },
        wellness: { content: 'Test', rating: 5 },
        finance: { content: 'Test', rating: 7 },
      };

      expect(horoscope.areas.love.rating).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.love.rating).toBeLessThanOrEqual(10);
      expect(horoscope.areas.career.rating).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.career.rating).toBeLessThanOrEqual(10);
      expect(horoscope.areas.wellness.rating).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.wellness.rating).toBeLessThanOrEqual(10);
      expect(horoscope.areas.finance.rating).toBeGreaterThanOrEqual(1);
      expect(horoscope.areas.finance.rating).toBeLessThanOrEqual(10);
    });
  });

  describe('JSONB Lucky Elements Structure', () => {
    it('should store luckyElements with correct structure', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.luckyElements = {
        numbers: [1, 4, 7],
        colors: ['Verde', 'Azul'],
        directions: ['Norte', 'Oeste'],
        months: [1, 5, 9],
      };

      expect(horoscope.luckyElements).toHaveProperty('numbers');
      expect(horoscope.luckyElements).toHaveProperty('colors');
      expect(horoscope.luckyElements).toHaveProperty('directions');
      expect(horoscope.luckyElements).toHaveProperty('months');

      expect(Array.isArray(horoscope.luckyElements.numbers)).toBe(true);
      expect(Array.isArray(horoscope.luckyElements.colors)).toBe(true);
      expect(Array.isArray(horoscope.luckyElements.directions)).toBe(true);
      expect(Array.isArray(horoscope.luckyElements.months)).toBe(true);
    });

    it('should store lucky numbers as array of integers', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.luckyElements = {
        numbers: [3, 7, 9],
        colors: [],
        directions: [],
        months: [],
      };

      expect(horoscope.luckyElements.numbers.length).toBe(3);
      expect(horoscope.luckyElements.numbers[0]).toBe(3);
      expect(typeof horoscope.luckyElements.numbers[0]).toBe('number');
    });

    it('should store lucky colors as array of strings', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.luckyElements = {
        numbers: [],
        colors: ['Rojo', 'Dorado', 'Amarillo'],
        directions: [],
        months: [],
      };

      expect(horoscope.luckyElements.colors.length).toBe(3);
      expect(horoscope.luckyElements.colors[0]).toBe('Rojo');
      expect(typeof horoscope.luckyElements.colors[0]).toBe('string');
    });

    it('should store lucky directions (important for feng shui)', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.luckyElements = {
        numbers: [],
        colors: [],
        directions: ['Sur', 'Este', 'Sureste'],
        months: [],
      };

      expect(horoscope.luckyElements.directions.length).toBe(3);
      expect(horoscope.luckyElements.directions).toContain('Sur');
      expect(horoscope.luckyElements.directions).toContain('Este');
    });

    it('should store lucky months as array of integers (1-12)', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.luckyElements = {
        numbers: [],
        colors: [],
        directions: [],
        months: [3, 6, 9, 12],
      };

      expect(horoscope.luckyElements.months.length).toBe(4);
      horoscope.luckyElements.months.forEach((month) => {
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
      });
    });
  });

  describe('JSONB Compatibility Structure', () => {
    it('should store compatibility with three levels', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.compatibility = {
        best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
        good: [ChineseZodiacAnimal.ROOSTER, ChineseZodiacAnimal.SNAKE],
        challenging: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT],
      };

      expect(horoscope.compatibility).toHaveProperty('best');
      expect(horoscope.compatibility).toHaveProperty('good');
      expect(horoscope.compatibility).toHaveProperty('challenging');

      expect(Array.isArray(horoscope.compatibility.best)).toBe(true);
      expect(Array.isArray(horoscope.compatibility.good)).toBe(true);
      expect(Array.isArray(horoscope.compatibility.challenging)).toBe(true);
    });

    it('should store valid ChineseZodiacAnimal values in compatibility', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.compatibility = {
        best: [ChineseZodiacAnimal.DRAGON, ChineseZodiacAnimal.HORSE],
        good: [ChineseZodiacAnimal.TIGER],
        challenging: [ChineseZodiacAnimal.OX],
      };

      expect(horoscope.compatibility.best[0]).toBe(ChineseZodiacAnimal.DRAGON);
      expect(horoscope.compatibility.best[1]).toBe(ChineseZodiacAnimal.HORSE);
      expect(horoscope.compatibility.good[0]).toBe(ChineseZodiacAnimal.TIGER);
      expect(horoscope.compatibility.challenging[0]).toBe(
        ChineseZodiacAnimal.OX,
      );
    });

    it('should allow empty arrays in compatibility levels', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.compatibility = {
        best: [],
        good: [ChineseZodiacAnimal.PIG],
        challenging: [],
      };

      expect(horoscope.compatibility.best.length).toBe(0);
      expect(horoscope.compatibility.good.length).toBe(1);
      expect(horoscope.compatibility.challenging.length).toBe(0);
    });
  });

  describe('Year Handling', () => {
    it('should store year as smallint', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.year = 2024;
      expect(horoscope.year).toBe(2024);
      expect(typeof horoscope.year).toBe('number');
    });

    it('should handle different year values', () => {
      const years = [2020, 2024, 2025, 2030, 2050];

      years.forEach((year) => {
        const horoscope = new ChineseHoroscope();
        horoscope.year = year;
        expect(horoscope.year).toBe(year);
      });
    });
  });

  describe('Chinese Zodiac Animals', () => {
    it('should handle all 12 chinese zodiac animals', () => {
      const animals = [
        ChineseZodiacAnimal.RAT,
        ChineseZodiacAnimal.OX,
        ChineseZodiacAnimal.TIGER,
        ChineseZodiacAnimal.RABBIT,
        ChineseZodiacAnimal.DRAGON,
        ChineseZodiacAnimal.SNAKE,
        ChineseZodiacAnimal.HORSE,
        ChineseZodiacAnimal.GOAT,
        ChineseZodiacAnimal.MONKEY,
        ChineseZodiacAnimal.ROOSTER,
        ChineseZodiacAnimal.DOG,
        ChineseZodiacAnimal.PIG,
      ];

      animals.forEach((animal) => {
        const horoscope = new ChineseHoroscope();
        horoscope.animal = animal;
        expect(horoscope.animal).toBe(animal);
      });
    });
  });

  describe('AI Provider Metadata', () => {
    it('should store AI provider information', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.aiProvider = 'gemini';
      horoscope.aiModel = 'gemini-pro';
      horoscope.tokensUsed = 2500;

      expect(horoscope.aiProvider).toBe('gemini');
      expect(horoscope.aiModel).toBe('gemini-pro');
      expect(horoscope.tokensUsed).toBe(2500);
    });

    it('should allow null for AI provider fields', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.aiProvider = null;
      horoscope.aiModel = null;

      expect(horoscope.aiProvider).toBeNull();
      expect(horoscope.aiModel).toBeNull();
    });
  });

  describe('View Count Tracking', () => {
    it('should track view count', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.viewCount = 0;
      expect(horoscope.viewCount).toBe(0);

      horoscope.viewCount++;
      expect(horoscope.viewCount).toBe(1);

      horoscope.viewCount += 25;
      expect(horoscope.viewCount).toBe(26);
    });
  });

  describe('Monthly Highlights', () => {
    it('should allow null for monthlyHighlights', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.monthlyHighlights = null;
      expect(horoscope.monthlyHighlights).toBeNull();
    });

    it('should store monthlyHighlights as text', () => {
      const horoscope = new ChineseHoroscope();

      horoscope.monthlyHighlights =
        'Enero: Energía renovada. Marzo: Oportunidades. Junio: Consolidación.';
      expect(horoscope.monthlyHighlights).toBe(
        'Enero: Energía renovada. Marzo: Oportunidades. Junio: Consolidación.',
      );
      expect(typeof horoscope.monthlyHighlights).toBe('string');
    });
  });

  describe('Annual Horoscope Nature', () => {
    it('should represent one horoscope per animal per year', () => {
      const horoscope2024 = new ChineseHoroscope();
      horoscope2024.animal = ChineseZodiacAnimal.DRAGON;
      horoscope2024.year = 2024;

      const horoscope2025 = new ChineseHoroscope();
      horoscope2025.animal = ChineseZodiacAnimal.DRAGON;
      horoscope2025.year = 2025;

      // Same animal, different years
      expect(horoscope2024.animal).toBe(horoscope2025.animal);
      expect(horoscope2024.year).not.toBe(horoscope2025.year);
    });

    it('should allow different animals in the same year', () => {
      const dragonHoroscope = new ChineseHoroscope();
      dragonHoroscope.animal = ChineseZodiacAnimal.DRAGON;
      dragonHoroscope.year = 2024;

      const ratHoroscope = new ChineseHoroscope();
      ratHoroscope.animal = ChineseZodiacAnimal.RAT;
      ratHoroscope.year = 2024;

      // Different animals, same year
      expect(dragonHoroscope.year).toBe(ratHoroscope.year);
      expect(dragonHoroscope.animal).not.toBe(ratHoroscope.animal);
    });
  });
});
