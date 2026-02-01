/**
 * Tests for Ritual Types
 */

import { describe, it, expect } from 'vitest';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
  CATEGORY_INFO,
  DIFFICULTY_INFO,
  LUNAR_PHASE_INFO,
  type RitualMaterial,
  type RitualStep,
  type RitualSummary,
  type RitualDetail,
  type LunarInfo,
  type RitualHistoryEntry,
  type UserRitualStats,
  type RitualFilters,
  type CompleteRitualRequest,
} from './ritual.types';

describe('ritual types', () => {
  describe('RitualCategory enum', () => {
    it('should have all 8 ritual categories', () => {
      const categories = Object.values(RitualCategory);
      expect(categories).toHaveLength(8);
    });

    it('should have correct category values', () => {
      expect(RitualCategory.TAROT).toBe('tarot');
      expect(RitualCategory.LUNAR).toBe('lunar');
      expect(RitualCategory.CLEANSING).toBe('cleansing');
      expect(RitualCategory.MEDITATION).toBe('meditation');
      expect(RitualCategory.PROTECTION).toBe('protection');
      expect(RitualCategory.ABUNDANCE).toBe('abundance');
      expect(RitualCategory.LOVE).toBe('love');
      expect(RitualCategory.HEALING).toBe('healing');
    });
  });

  describe('RitualDifficulty enum', () => {
    it('should have all 3 difficulty levels', () => {
      const difficulties = Object.values(RitualDifficulty);
      expect(difficulties).toHaveLength(3);
    });

    it('should have correct difficulty values', () => {
      expect(RitualDifficulty.BEGINNER).toBe('beginner');
      expect(RitualDifficulty.INTERMEDIATE).toBe('intermediate');
      expect(RitualDifficulty.ADVANCED).toBe('advanced');
    });
  });

  describe('LunarPhase enum', () => {
    it('should have all 8 lunar phases', () => {
      const phases = Object.values(LunarPhase);
      expect(phases).toHaveLength(8);
    });

    it('should have correct phase values', () => {
      expect(LunarPhase.NEW_MOON).toBe('new_moon');
      expect(LunarPhase.WAXING_CRESCENT).toBe('waxing_crescent');
      expect(LunarPhase.FIRST_QUARTER).toBe('first_quarter');
      expect(LunarPhase.WAXING_GIBBOUS).toBe('waxing_gibbous');
      expect(LunarPhase.FULL_MOON).toBe('full_moon');
      expect(LunarPhase.WANING_GIBBOUS).toBe('waning_gibbous');
      expect(LunarPhase.LAST_QUARTER).toBe('last_quarter');
      expect(LunarPhase.WANING_CRESCENT).toBe('waning_crescent');
    });
  });

  describe('MaterialType enum', () => {
    it('should have all 3 material types', () => {
      const types = Object.values(MaterialType);
      expect(types).toHaveLength(3);
    });

    it('should have correct type values', () => {
      expect(MaterialType.REQUIRED).toBe('required');
      expect(MaterialType.OPTIONAL).toBe('optional');
      expect(MaterialType.ALTERNATIVE).toBe('alternative');
    });
  });

  describe('RitualMaterial interface', () => {
    it('should accept valid material object', () => {
      const material: RitualMaterial = {
        id: 1,
        name: 'Vela blanca',
        description: 'Vela de cera natural',
        type: MaterialType.REQUIRED,
        alternative: 'Vela plateada',
        quantity: 1,
        unit: 'unidad',
      };

      expect(material.id).toBe(1);
      expect(material.name).toBe('Vela blanca');
      expect(material.type).toBe(MaterialType.REQUIRED);
    });

    it('should accept null for optional fields', () => {
      const material: RitualMaterial = {
        id: 2,
        name: 'Incienso',
        description: null,
        type: MaterialType.OPTIONAL,
        alternative: null,
        quantity: 1,
        unit: null,
      };

      expect(material.description).toBeNull();
      expect(material.alternative).toBeNull();
      expect(material.unit).toBeNull();
    });
  });

  describe('RitualStep interface', () => {
    it('should accept valid step object', () => {
      const step: RitualStep = {
        id: 1,
        stepNumber: 1,
        title: 'Preparar el espacio',
        description: 'Limpia y ordena tu espacio sagrado',
        durationSeconds: 180,
        imageUrl: '/images/step1.jpg',
        mantra: 'Que la luz guíe mi camino',
        visualization: 'Imagina una luz dorada',
      };

      expect(step.stepNumber).toBe(1);
      expect(step.title).toBe('Preparar el espacio');
      expect(step.durationSeconds).toBe(180);
    });

    it('should accept null for optional fields', () => {
      const step: RitualStep = {
        id: 2,
        stepNumber: 2,
        title: 'Meditar',
        description: 'Cierra los ojos y respira',
        durationSeconds: null,
        imageUrl: null,
        mantra: null,
        visualization: null,
      };

      expect(step.durationSeconds).toBeNull();
      expect(step.imageUrl).toBeNull();
      expect(step.mantra).toBeNull();
      expect(step.visualization).toBeNull();
    });
  });

  describe('RitualSummary interface', () => {
    it('should accept valid ritual summary object', () => {
      const ritual: RitualSummary = {
        id: 1,
        slug: 'ritual-luna-nueva',
        title: 'Ritual de Luna Nueva',
        description: 'Ceremonia para establecer intenciones',
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
        durationMinutes: 30,
        bestLunarPhase: LunarPhase.NEW_MOON,
        imageUrl: '/images/ritual.jpg',
        materialsCount: 4,
        stepsCount: 7,
      };

      expect(ritual.id).toBe(1);
      expect(ritual.category).toBe(RitualCategory.LUNAR);
      expect(ritual.difficulty).toBe(RitualDifficulty.BEGINNER);
      expect(ritual.materialsCount).toBe(4);
    });

    it('should accept null for bestLunarPhase', () => {
      const ritual: RitualSummary = {
        id: 2,
        slug: 'meditacion-diaria',
        title: 'Meditación Diaria',
        description: 'Práctica diaria de meditación',
        category: RitualCategory.MEDITATION,
        difficulty: RitualDifficulty.BEGINNER,
        durationMinutes: 15,
        bestLunarPhase: null,
        imageUrl: '/images/meditation.jpg',
        materialsCount: 0,
        stepsCount: 5,
      };

      expect(ritual.bestLunarPhase).toBeNull();
    });
  });

  describe('RitualDetail interface', () => {
    it('should extend RitualSummary with additional fields', () => {
      const ritual: RitualDetail = {
        id: 1,
        slug: 'ritual-luna-nueva',
        title: 'Ritual de Luna Nueva',
        description: 'Ceremonia para establecer intenciones',
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
        durationMinutes: 30,
        bestLunarPhase: LunarPhase.NEW_MOON,
        imageUrl: '/images/ritual.jpg',
        materialsCount: 4,
        stepsCount: 7,
        bestTimeOfDay: 'Noche',
        purpose: 'Establecer intenciones para el nuevo ciclo',
        preparation: 'Busca un espacio tranquilo',
        closing: 'Agradece a la luna',
        tips: ['Sé específico', 'Escribe en presente'],
        audioUrl: '/audio/ritual.mp3',
        materials: [],
        steps: [],
        completionCount: 42,
      };

      expect(ritual.purpose).toBe('Establecer intenciones para el nuevo ciclo');
      expect(ritual.tips).toHaveLength(2);
      expect(ritual.completionCount).toBe(42);
    });
  });

  describe('LunarInfo interface', () => {
    it('should accept valid lunar info object', () => {
      const lunarInfo: LunarInfo = {
        phase: LunarPhase.FULL_MOON,
        phaseName: 'Luna Llena',
        illumination: 100,
        zodiacSign: 'Aries',
        isGoodFor: ['Culminación', 'Celebración', 'Liberación'],
      };

      expect(lunarInfo.phase).toBe(LunarPhase.FULL_MOON);
      expect(lunarInfo.illumination).toBe(100);
      expect(lunarInfo.isGoodFor).toHaveLength(3);
    });
  });

  describe('RitualHistoryEntry interface', () => {
    it('should accept valid history entry object', () => {
      const entry: RitualHistoryEntry = {
        id: 1,
        ritual: {
          id: 1,
          slug: 'ritual-luna-nueva',
          title: 'Ritual de Luna Nueva',
          category: RitualCategory.LUNAR,
        },
        completedAt: '2026-01-17T20:00:00Z',
        lunarPhase: LunarPhase.NEW_MOON,
        lunarSign: 'Capricornio',
        notes: 'Muy tranquilizador',
        rating: 5,
        durationMinutes: 35,
      };

      expect(entry.ritual.id).toBe(1);
      expect(entry.rating).toBe(5);
      expect(entry.durationMinutes).toBe(35);
    });

    it('should accept null for optional fields', () => {
      const entry: RitualHistoryEntry = {
        id: 2,
        ritual: {
          id: 2,
          slug: 'meditacion',
          title: 'Meditación',
          category: RitualCategory.MEDITATION,
        },
        completedAt: '2026-01-17T10:00:00Z',
        lunarPhase: null,
        lunarSign: null,
        notes: null,
        rating: null,
        durationMinutes: null,
      };

      expect(entry.lunarPhase).toBeNull();
      expect(entry.notes).toBeNull();
      expect(entry.rating).toBeNull();
    });
  });

  describe('UserRitualStats interface', () => {
    it('should accept valid stats object', () => {
      const stats: UserRitualStats = {
        totalCompleted: 15,
        favoriteCategory: RitualCategory.LUNAR,
        currentStreak: 3,
        thisMonthCount: 8,
      };

      expect(stats.totalCompleted).toBe(15);
      expect(stats.favoriteCategory).toBe(RitualCategory.LUNAR);
      expect(stats.currentStreak).toBe(3);
    });

    it('should accept null for favoriteCategory', () => {
      const stats: UserRitualStats = {
        totalCompleted: 0,
        favoriteCategory: null,
        currentStreak: 0,
        thisMonthCount: 0,
      };

      expect(stats.favoriteCategory).toBeNull();
    });
  });

  describe('RitualFilters interface', () => {
    it('should accept empty filters', () => {
      const filters: RitualFilters = {};
      expect(filters).toBeDefined();
    });

    it('should accept partial filters', () => {
      const filters: RitualFilters = {
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
      };

      expect(filters.category).toBe(RitualCategory.LUNAR);
      expect(filters.difficulty).toBe(RitualDifficulty.BEGINNER);
    });

    it('should accept all filters', () => {
      const filters: RitualFilters = {
        category: RitualCategory.TAROT,
        difficulty: RitualDifficulty.INTERMEDIATE,
        lunarPhase: LunarPhase.FULL_MOON,
        search: 'limpieza',
      };

      expect(filters.search).toBe('limpieza');
    });
  });

  describe('CompleteRitualRequest interface', () => {
    it('should accept empty request', () => {
      const request: CompleteRitualRequest = {};
      expect(request).toBeDefined();
    });

    it('should accept partial request', () => {
      const request: CompleteRitualRequest = {
        notes: 'Experiencia transformadora',
        rating: 5,
      };

      expect(request.notes).toBe('Experiencia transformadora');
      expect(request.rating).toBe(5);
    });

    it('should accept full request', () => {
      const request: CompleteRitualRequest = {
        notes: 'Muy relajante',
        rating: 4,
        durationMinutes: 40,
      };

      expect(request.durationMinutes).toBe(40);
    });
  });

  describe('CATEGORY_INFO constant', () => {
    it('should have info for all categories', () => {
      const categories = Object.values(RitualCategory);
      categories.forEach((category) => {
        expect(CATEGORY_INFO[category]).toBeDefined();
        expect(CATEGORY_INFO[category].name).toBeDefined();
        expect(CATEGORY_INFO[category].icon).toBeDefined();
        expect(CATEGORY_INFO[category].color).toBeDefined();
      });
    });

    it('should have Spanish names', () => {
      expect(CATEGORY_INFO[RitualCategory.LUNAR].name).toBe('Lunar');
      expect(CATEGORY_INFO[RitualCategory.CLEANSING].name).toBe('Limpieza');
      expect(CATEGORY_INFO[RitualCategory.MEDITATION].name).toBe('Meditación');
    });
  });

  describe('DIFFICULTY_INFO constant', () => {
    it('should have info for all difficulties', () => {
      const difficulties = Object.values(RitualDifficulty);
      difficulties.forEach((difficulty) => {
        expect(DIFFICULTY_INFO[difficulty]).toBeDefined();
        expect(DIFFICULTY_INFO[difficulty].name).toBeDefined();
        expect(DIFFICULTY_INFO[difficulty].color).toBeDefined();
      });
    });

    it('should have Spanish names', () => {
      expect(DIFFICULTY_INFO[RitualDifficulty.BEGINNER].name).toBe('Principiante');
      expect(DIFFICULTY_INFO[RitualDifficulty.INTERMEDIATE].name).toBe('Intermedio');
      expect(DIFFICULTY_INFO[RitualDifficulty.ADVANCED].name).toBe('Avanzado');
    });
  });

  describe('LUNAR_PHASE_INFO constant', () => {
    it('should have info for all lunar phases', () => {
      const phases = Object.values(LunarPhase);
      phases.forEach((phase) => {
        expect(LUNAR_PHASE_INFO[phase]).toBeDefined();
        expect(LUNAR_PHASE_INFO[phase].name).toBeDefined();
        expect(LUNAR_PHASE_INFO[phase].icon).toBeDefined();
        expect(LUNAR_PHASE_INFO[phase].emoji).toBeDefined();
      });
    });

    it('should have Spanish names', () => {
      expect(LUNAR_PHASE_INFO[LunarPhase.NEW_MOON].name).toBe('Luna Nueva');
      expect(LUNAR_PHASE_INFO[LunarPhase.FULL_MOON].name).toBe('Luna Llena');
      expect(LUNAR_PHASE_INFO[LunarPhase.FIRST_QUARTER].name).toBe('Cuarto Creciente');
    });
  });
});
