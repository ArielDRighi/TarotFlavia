import { DataSource } from 'typeorm';
import { Ritual } from '../../modules/rituals/entities/ritual.entity';
import { RitualStep } from '../../modules/rituals/entities/ritual-step.entity';
import { RitualMaterial } from '../../modules/rituals/entities/ritual-material.entity';
import { seedRituals } from './rituals.seeder';
import { RITUALS_SEED_DATA } from './data/rituals-seed.data';
import { RitualCategory } from '../../modules/rituals/domain/enums';

describe('RitualsSeeder', () => {
  let dataSource: DataSource;
  let ritualRepository: any;
  let stepRepository: any;
  let materialRepository: any;

  beforeEach(() => {
    // Mock repositories
    ritualRepository = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    stepRepository = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    materialRepository = {
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    };

    // Mock DataSource
    dataSource = {
      getRepository: jest.fn((entity): any => {
        if (entity === Ritual) return ritualRepository;
        if (entity === RitualStep) return stepRepository;
        if (entity === RitualMaterial) return materialRepository;
        return {} as any;
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Idempotencia', () => {
    it('debe saltar el seed si ya existen rituales', async () => {
      // Arrange
      ritualRepository.count.mockResolvedValue(5);

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await seedRituals(dataSource);

      // Assert
      expect(ritualRepository.count).toHaveBeenCalledTimes(1);
      expect(ritualRepository.save).not.toHaveBeenCalled();
      expect(stepRepository.save).not.toHaveBeenCalled();
      expect(materialRepository.save).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rituales ya poblados'),
      );

      consoleSpy.mockRestore();
    });

    it('debe insertar rituales si la tabla está vacía', async () => {
      // Arrange
      ritualRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(4);
      materialRepository.count.mockResolvedValue(15);
      stepRepository.count.mockResolvedValue(30);

      ritualRepository.create.mockImplementation((data: any) => data as Ritual);
      ritualRepository.save.mockImplementation((ritual: any) =>
        Promise.resolve({
          ...ritual,
          id: Math.floor(Math.random() * 1000),
        } as Ritual),
      );

      stepRepository.create.mockImplementation(
        (data: any) => data as RitualStep,
      );
      stepRepository.save.mockResolvedValue({} as RitualStep);

      materialRepository.create.mockImplementation(
        (data: any) => data as RitualMaterial,
      );
      materialRepository.save.mockResolvedValue({});

      // Mock para el query builder (estadísticas)
      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { category: 'lunar', count: '2' },
          { category: 'cleansing', count: '1' },
          { category: 'tarot', count: '1' },
        ]),
      };
      ritualRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      expect(ritualRepository.count).toHaveBeenCalled();
      expect(ritualRepository.save).toHaveBeenCalledTimes(
        RITUALS_SEED_DATA.length,
      );
      expect(stepRepository.save).toHaveBeenCalled();
      expect(materialRepository.save).toHaveBeenCalled();
    });
  });

  describe('Validación de contenido', () => {
    it('debe crear rituales con todos los campos requeridos', async () => {
      // Arrange
      ritualRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(4);
      materialRepository.count.mockResolvedValue(15);
      stepRepository.count.mockResolvedValue(30);

      const savedRituals: any[] = [];
      ritualRepository.create.mockImplementation((data: any) => data as Ritual);
      ritualRepository.save.mockImplementation((ritual: any) => {
        const saved = { ...ritual, id: savedRituals.length + 1 };
        savedRituals.push(saved);
        return Promise.resolve(saved as Ritual);
      });

      stepRepository.create.mockImplementation(
        (data: any) => data as RitualStep,
      );
      stepRepository.save.mockResolvedValue({} as RitualStep);

      materialRepository.create.mockImplementation(
        (data: any) => data as RitualMaterial,
      );
      materialRepository.save.mockResolvedValue({});

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      ritualRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      expect(savedRituals.length).toBe(RITUALS_SEED_DATA.length);

      savedRituals.forEach((ritual: any) => {
        expect(ritual.slug).toBeDefined();
        expect(ritual.title).toBeDefined();
        expect(ritual.description).toBeDefined();
        expect(ritual.category).toBeDefined();
        expect(ritual.difficulty).toBeDefined();
        expect(ritual.durationMinutes).toBeDefined();
        expect(ritual.purpose).toBeDefined();
        expect(ritual.imageUrl).toBeDefined();
        expect(ritual.isActive).toBe(true);
        expect(ritual.completionCount).toBe(0);
        expect(ritual.viewCount).toBe(0);
      });
    });

    it('debe crear materiales para cada ritual', async () => {
      // Arrange
      ritualRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(4);
      materialRepository.count.mockResolvedValue(15);
      stepRepository.count.mockResolvedValue(30);

      ritualRepository.create.mockImplementation((data: any) => data as Ritual);
      ritualRepository.save.mockImplementation((ritual: any) =>
        Promise.resolve({
          ...ritual,
          id: 1,
        } as Ritual),
      );

      const savedMaterials: any[] = [];
      materialRepository.create.mockImplementation(
        (data: any) => data as RitualMaterial,
      );
      materialRepository.save.mockImplementation((material: any) => {
        savedMaterials.push(material);
        return Promise.resolve(material as RitualMaterial);
      });

      stepRepository.create.mockImplementation(
        (data: any) => data as RitualStep,
      );
      stepRepository.save.mockResolvedValue({} as RitualStep);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      ritualRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      const totalExpectedMaterials = RITUALS_SEED_DATA.reduce(
        (sum, ritual) => sum + ritual.materials.length,
        0,
      );
      expect(savedMaterials.length).toBe(totalExpectedMaterials);

      savedMaterials.forEach((material: any) => {
        expect(material.ritualId).toBeDefined();
        expect(material.name).toBeDefined();
        expect(material.type).toBeDefined();
        expect(material.quantity).toBeGreaterThanOrEqual(1);
      });
    });

    it('debe crear pasos para cada ritual en orden secuencial', async () => {
      // Arrange
      ritualRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(4);
      materialRepository.count.mockResolvedValue(15);
      stepRepository.count.mockResolvedValue(30);

      ritualRepository.create.mockImplementation((data: any) => data as Ritual);
      ritualRepository.save.mockImplementation((ritual: any) =>
        Promise.resolve({
          ...ritual,
          id: 1,
        } as Ritual),
      );

      const savedSteps: any[] = [];
      stepRepository.create.mockImplementation(
        (data: any) => data as RitualStep,
      );
      stepRepository.save.mockImplementation((step: any) => {
        savedSteps.push(step);
        return Promise.resolve(step as RitualStep);
      });

      materialRepository.create.mockImplementation(
        (data: any) => data as RitualMaterial,
      );
      materialRepository.save.mockResolvedValue({} as RitualMaterial);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      ritualRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      const totalExpectedSteps = RITUALS_SEED_DATA.reduce(
        (sum, ritual) => sum + ritual.steps.length,
        0,
      );
      expect(savedSteps.length).toBe(totalExpectedSteps);

      savedSteps.forEach((step: any) => {
        expect(step.ritualId).toBeDefined();
        expect(step.stepNumber).toBeGreaterThanOrEqual(1);
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
      });

      // Verificar que los pasos estén numerados secuencialmente por ritual
      RITUALS_SEED_DATA.forEach((ritualData) => {
        const stepNumbers = ritualData.steps.map((s) => s.stepNumber).sort();
        stepNumbers.forEach((num, idx) => {
          expect(num).toBe(idx + 1);
        });
      });
    });
  });

  describe('Validación de datos de seed', () => {
    it('todos los rituales en RITUALS_SEED_DATA deben tener contenido válido', () => {
      RITUALS_SEED_DATA.forEach((ritual) => {
        // Validar campos requeridos
        expect(ritual.slug).toBeDefined();
        expect(ritual.slug).toMatch(/^[a-z0-9-]+$/);
        expect(ritual.title.length).toBeGreaterThanOrEqual(5);
        expect(ritual.description.length).toBeGreaterThanOrEqual(50);
        expect(ritual.purpose.length).toBeGreaterThanOrEqual(30);

        // Validar categoría y dificultad
        expect(Object.values(RitualCategory)).toContain(ritual.category);

        // Validar materiales
        expect(ritual.materials.length).toBeGreaterThan(0);
        ritual.materials.forEach((material) => {
          expect(material.name).toBeDefined();
          expect(material.type).toBeDefined();
        });

        // Validar pasos
        expect(ritual.steps.length).toBeGreaterThan(0);
        ritual.steps.forEach((step, index) => {
          expect(step.stepNumber).toBe(index + 1);
          expect(step.title.length).toBeGreaterThanOrEqual(3);
          expect(step.description.length).toBeGreaterThanOrEqual(20);
        });
      });
    });

    it('debe incluir al menos un ritual de cada categoría principal', () => {
      const categories = RITUALS_SEED_DATA.map((r) => r.category);

      // Verificar que hay rituales lunares
      expect(categories).toContain(RitualCategory.LUNAR);

      // Verificar que hay rituales de limpieza
      expect(categories).toContain(RitualCategory.CLEANSING);

      // Verificar que hay rituales de tarot
      expect(categories).toContain(RitualCategory.TAROT);
    });

    it('debe tener al menos 4 rituales completos', () => {
      expect(RITUALS_SEED_DATA.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Manejo de errores', () => {
    it('debe lanzar error si un ritual tiene contenido incompleto', async () => {
      // Este test verifica que la validación funciona correctamente
      // Los datos reales ya están validados, pero probamos la función de validación

      const invalidRitual = {
        ...RITUALS_SEED_DATA[0],
        title: 'abc', // Muy corto
      };

      ritualRepository.count.mockResolvedValueOnce(0);
      ritualRepository.create.mockImplementation((data: any) => data as Ritual);

      // Reemplazar temporalmente los datos
      const originalData = [...RITUALS_SEED_DATA];
      RITUALS_SEED_DATA.length = 0;
      RITUALS_SEED_DATA.push(invalidRitual as any);

      // Act & Assert
      await expect(seedRituals(dataSource)).rejects.toThrow();

      // Restaurar datos originales
      RITUALS_SEED_DATA.length = 0;
      RITUALS_SEED_DATA.push(...originalData);
    });
  });
});
