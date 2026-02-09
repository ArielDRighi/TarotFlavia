import { DataSource, Repository } from 'typeorm';
import { seedBirthChartInterpretations } from './birth-chart-interpretations.seeder';
import { BirthChartInterpretation } from '../../modules/birth-chart/entities/birth-chart-interpretation.entity';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
} from '../../modules/birth-chart/domain/enums';

describe('Birth Chart Interpretations Seeder', () => {
  let dataSource: DataSource;
  let interpretationRepository: Repository<BirthChartInterpretation>;

  beforeEach(() => {
    interpretationRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<BirthChartInterpretation>;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(interpretationRepository),
    } as unknown as DataSource;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Seeding', () => {
    it('should seed interpretations when database is empty', async () => {
      // Mock empty database
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      // Mock create to return the entity
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) =>
          data as BirthChartInterpretation,
      );

      // Mock save to return the entities
      (interpretationRepository.save as jest.Mock).mockImplementation(
        (entities: BirthChartInterpretation[]) => Promise.resolve(entities),
      );

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Execute seeder
      await seedBirthChartInterpretations(dataSource);

      // Verify repository methods were called
      expect(dataSource.getRepository).toHaveBeenCalledWith(
        BirthChartInterpretation,
      );
      expect(interpretationRepository.count).toHaveBeenCalledTimes(1);
      expect(interpretationRepository.save).toHaveBeenCalled();

      // Verify console output
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Birth Chart Interpretations'),
      );

      consoleLogSpy.mockRestore();
    });

    it('should skip seeding when interpretations already exist (idempotency)', async () => {
      // Mock existing interpretations
      (interpretationRepository.count as jest.Mock).mockResolvedValue(100);

      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      // Execute seeder
      await seedBirthChartInterpretations(dataSource);

      // Verify only count was called, no create or save
      expect(interpretationRepository.count).toHaveBeenCalledTimes(1);
      expect(interpretationRepository.create).not.toHaveBeenCalled();
      expect(interpretationRepository.save).not.toHaveBeenCalled();

      // Verify skip message
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('already seeded'),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('Planet Intros Seeding', () => {
    it('should seed exactly 10 planet intro interpretations', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockImplementation(
        (entities: BirthChartInterpretation[]) => Promise.resolve(entities),
      );

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      // Filter planet intros
      const planetIntros = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.PLANET_INTRO,
      );

      expect(planetIntros).toHaveLength(10);

      // Verify each planet has exactly one intro
      const planets = Object.values(Planet);
      planets.forEach((planet) => {
        const planetIntro = planetIntros.filter((i) => i.planet === planet);
        expect(planetIntro).toHaveLength(1);
      });
    });

    it('should create planet intros with valid structure', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const planetIntros = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.PLANET_INTRO,
      );

      planetIntros.forEach((intro) => {
        expect(intro.category).toBe(InterpretationCategory.PLANET_INTRO);
        expect(intro.planet).toBeTruthy();
        expect(intro.sign).toBeNull();
        expect(intro.house).toBeNull();
        expect(intro.aspectType).toBeNull();
        expect(intro.planet2).toBeNull();
        expect(intro.content).toBeTruthy();
        expect(intro.content.length).toBeGreaterThan(50);
        expect(intro.isActive).toBe(true);
      });
    });
  });

  describe('Ascendant Seeding', () => {
    it('should seed exactly 12 ascendant interpretations', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const ascendants = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.ASCENDANT,
      );

      expect(ascendants).toHaveLength(12);

      // Verify each zodiac sign has exactly one ascendant
      const signs = Object.values(ZodiacSign);
      signs.forEach((sign) => {
        const ascendantSign = ascendants.filter((i) => i.sign === sign);
        expect(ascendantSign).toHaveLength(1);
      });
    });

    it('should create ascendant interpretations with valid structure', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const ascendants = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.ASCENDANT,
      );

      ascendants.forEach((ascendant) => {
        expect(ascendant.category).toBe(InterpretationCategory.ASCENDANT);
        expect(ascendant.planet).toBeNull();
        expect(ascendant.sign).toBeTruthy();
        expect(ascendant.house).toBeNull();
        expect(ascendant.aspectType).toBeNull();
        expect(ascendant.planet2).toBeNull();
        expect(ascendant.content).toBeTruthy();
        expect(ascendant.content.length).toBeGreaterThan(50);
        expect(ascendant.isActive).toBe(true);
      });
    });
  });

  describe('Planets in Signs Seeding', () => {
    it('should seed exactly 120 planet-in-sign interpretations', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const planetsInSigns = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.PLANET_IN_SIGN,
      );

      expect(planetsInSigns).toHaveLength(120);

      // Verify coverage: 10 planets × 12 signs
      const planets = Object.values(Planet);
      const signs = Object.values(ZodiacSign);

      planets.forEach((planet) => {
        signs.forEach((sign) => {
          const combo = planetsInSigns.filter(
            (i) => i.planet === planet && i.sign === sign,
          );
          expect(combo).toHaveLength(1);
        });
      });
    });

    it('should create planet-in-sign interpretations with valid structure', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const planetsInSigns = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.PLANET_IN_SIGN,
      );

      planetsInSigns.forEach((interpretation) => {
        expect(interpretation.category).toBe(
          InterpretationCategory.PLANET_IN_SIGN,
        );
        expect(interpretation.planet).toBeTruthy();
        expect(interpretation.sign).toBeTruthy();
        expect(interpretation.house).toBeNull();
        expect(interpretation.aspectType).toBeNull();
        expect(interpretation.planet2).toBeNull();
        expect(interpretation.content).toBeTruthy();
        expect(interpretation.content.length).toBeGreaterThan(50);
        expect(interpretation.isActive).toBe(true);
      });
    });
  });

  describe('Planets in Houses Seeding', () => {
    it('should seed exactly 120 planet-in-house interpretations', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const planetsInHouses = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.PLANET_IN_HOUSE,
      );

      expect(planetsInHouses).toHaveLength(120);

      // Verify coverage: 10 planets × 12 houses
      const planets = Object.values(Planet);
      const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      planets.forEach((planet) => {
        houses.forEach((house) => {
          const combo = planetsInHouses.filter(
            (i) => i.planet === planet && i.house === house,
          );
          expect(combo).toHaveLength(1);
        });
      });
    });

    it('should create planet-in-house interpretations with valid structure', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const planetsInHouses = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.PLANET_IN_HOUSE,
      );

      planetsInHouses.forEach((interpretation) => {
        expect(interpretation.category).toBe(
          InterpretationCategory.PLANET_IN_HOUSE,
        );
        expect(interpretation.planet).toBeTruthy();
        expect(interpretation.sign).toBeNull();
        expect(interpretation.house).toBeGreaterThanOrEqual(1);
        expect(interpretation.house).toBeLessThanOrEqual(12);
        expect(interpretation.aspectType).toBeNull();
        expect(interpretation.planet2).toBeNull();
        expect(interpretation.content).toBeTruthy();
        expect(interpretation.content.length).toBeGreaterThan(50);
        expect(interpretation.isActive).toBe(true);
      });
    });
  });

  describe('Aspects Seeding', () => {
    it('should seed aspect interpretations', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const aspects = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.ASPECT,
      );

      // Should have aspects (at least some placeholder ones)
      expect(aspects.length).toBeGreaterThan(0);
    });

    it('should create aspect interpretations with valid structure', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const aspects = createdInterpretations.filter(
        (i) => i.category === InterpretationCategory.ASPECT,
      );

      aspects.forEach((aspect) => {
        expect(aspect.category).toBe(InterpretationCategory.ASPECT);
        expect(aspect.planet).toBeTruthy();
        expect(aspect.planet2).toBeTruthy();
        expect(aspect.aspectType).toBeTruthy();
        expect(aspect.sign).toBeNull();
        expect(aspect.house).toBeNull();
        expect(aspect.content).toBeTruthy();
        expect(aspect.content.length).toBeGreaterThan(50);
        expect(aspect.isActive).toBe(true);

        // Planet1 should be different from planet2
        expect(aspect.planet).not.toBe(aspect.planet2);
      });
    });
  });

  describe('Data Quality', () => {
    it('should create all interpretations with isActive: true', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      expect(createdInterpretations.every((i) => i.isActive === true)).toBe(
        true,
      );
    });

    it('should create interpretations with non-empty content', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      expect(
        createdInterpretations.every((i) => i.content && i.content.length > 0),
      ).toBe(true);
    });

    it('should create interpretations with valid categories', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      const validCategories = Object.values(InterpretationCategory);

      expect(
        createdInterpretations.every((i) =>
          validCategories.includes(i.category),
        ),
      ).toBe(true);
    });
  });

  describe('Total Count', () => {
    it('should seed minimum expected number of interpretations', async () => {
      (interpretationRepository.count as jest.Mock).mockResolvedValue(0);

      const createdInterpretations: BirthChartInterpretation[] = [];
      (interpretationRepository.create as jest.Mock).mockImplementation(
        (data: Partial<BirthChartInterpretation>) => {
          const interpretation = data as BirthChartInterpretation;
          createdInterpretations.push(interpretation);
          return interpretation;
        },
      );

      (interpretationRepository.save as jest.Mock).mockResolvedValue([]);

      jest.spyOn(console, 'log').mockImplementation();

      await seedBirthChartInterpretations(dataSource);

      // Minimum: 10 planet intros + 12 ascendants + 120 planets in signs + 120 planets in houses
      // = 262 (sin contar aspectos completos aún)
      expect(createdInterpretations.length).toBeGreaterThanOrEqual(262);
    });
  });
});
