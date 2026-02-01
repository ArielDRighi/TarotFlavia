import { Test, TestingModule } from '@nestjs/testing';
import { LunarPhaseService } from './lunar-phase.service';
import { LunarPhase } from '../../domain/enums';

describe('LunarPhaseService', () => {
  let service: LunarPhaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LunarPhaseService],
    }).compile();

    service = module.get<LunarPhaseService>(LunarPhaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentPhase', () => {
    it('should return current lunar phase info', () => {
      const lunarInfo = service.getCurrentPhase();

      expect(lunarInfo).toBeDefined();
      expect(lunarInfo).toHaveProperty('phase');
      expect(lunarInfo).toHaveProperty('phaseName');
      expect(lunarInfo).toHaveProperty('illumination');
      expect(lunarInfo).toHaveProperty('zodiacSign');
      expect(lunarInfo).toHaveProperty('isGoodFor');
    });

    it('should return valid lunar phase enum value', () => {
      const lunarInfo = service.getCurrentPhase();

      const validPhases = Object.values(LunarPhase);
      expect(validPhases).toContain(lunarInfo.phase);
    });

    it('should return illumination between 0 and 100', () => {
      const lunarInfo = service.getCurrentPhase();

      expect(lunarInfo.illumination).toBeGreaterThanOrEqual(0);
      expect(lunarInfo.illumination).toBeLessThanOrEqual(100);
    });

    it('should return zodiac sign as string', () => {
      const lunarInfo = service.getCurrentPhase();

      expect(typeof lunarInfo.zodiacSign).toBe('string');
      expect(lunarInfo.zodiacSign.length).toBeGreaterThan(0);
    });

    it('should return recommendations array', () => {
      const lunarInfo = service.getCurrentPhase();

      expect(Array.isArray(lunarInfo.isGoodFor)).toBe(true);
      expect(lunarInfo.isGoodFor.length).toBeGreaterThan(0);
    });
  });

  describe('calculatePhase', () => {
    it('should calculate new moon correctly', () => {
      // Luna nueva conocida: 6 de enero 2000
      const knownNewMoon = new Date(2000, 0, 6, 18, 14);
      const phase = service.calculatePhase(knownNewMoon);

      expect(phase).toBe(LunarPhase.NEW_MOON);
    });

    it('should calculate full moon phase for mid-cycle date', () => {
      // Ciclo lunar es ~29.5 días, luna llena está en la mitad (~14.7 días)
      const knownNewMoon = new Date(2000, 0, 6, 18, 14);
      const midCycle = new Date(
        knownNewMoon.getTime() + 14.7 * 24 * 60 * 60 * 1000,
      );
      const phase = service.calculatePhase(midCycle);

      // Debe estar en fase llena o cerca (gibosa creciente/luna llena/gibosa menguante)
      const fullPhases = [
        LunarPhase.WAXING_GIBBOUS,
        LunarPhase.FULL_MOON,
        LunarPhase.WANING_GIBBOUS,
      ];
      expect(fullPhases).toContain(phase);
    });

    it('should calculate consistent phase for same date', () => {
      const date = new Date(2024, 5, 15);
      const phase1 = service.calculatePhase(date);
      const phase2 = service.calculatePhase(date);

      expect(phase1).toBe(phase2);
    });

    it('should return valid phase for any date', () => {
      const testDates = [
        new Date(2024, 0, 1),
        new Date(2024, 6, 15),
        new Date(2025, 11, 31),
      ];

      const validPhases = Object.values(LunarPhase);

      testDates.forEach((date) => {
        const phase = service.calculatePhase(date);
        expect(validPhases).toContain(phase);
      });
    });
  });

  describe('getPhaseName', () => {
    it('should return correct Spanish name for new moon', () => {
      const name = service.getPhaseName(LunarPhase.NEW_MOON);
      expect(name).toBe('Luna Nueva');
    });

    it('should return correct Spanish name for full moon', () => {
      const name = service.getPhaseName(LunarPhase.FULL_MOON);
      expect(name).toBe('Luna Llena');
    });

    it('should return correct Spanish name for first quarter', () => {
      const name = service.getPhaseName(LunarPhase.FIRST_QUARTER);
      expect(name).toBe('Cuarto Creciente');
    });

    it('should return correct Spanish name for last quarter', () => {
      const name = service.getPhaseName(LunarPhase.LAST_QUARTER);
      expect(name).toBe('Cuarto Menguante');
    });

    it('should return names for all lunar phases', () => {
      const phases = Object.values(LunarPhase);

      phases.forEach((phase) => {
        const name = service.getPhaseName(phase);
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });
});
