import { DataSource, Repository } from 'typeorm';
import { Ritual } from '../../modules/rituals/entities/ritual.entity';
import { RitualStep } from '../../modules/rituals/entities/ritual-step.entity';
import { RitualMaterial } from '../../modules/rituals/entities/ritual-material.entity';
import { seedRituals } from './rituals.seeder';
import { RITUALS_SEED_DATA } from '../seeds/data/rituals.data';
import { RitualCategory } from '../../modules/rituals/domain/enums';

describe('RitualsSeeder', () => {
  let dataSource: DataSource;
  let ritualRepository: Repository<Ritual>;
  let stepRepository: Repository<RitualStep>;
  let materialRepository: Repository<RitualMaterial>;
  let mockRitualCount: jest.Mock;
  let mockRitualCreate: jest.Mock;
  let mockRitualSave: jest.Mock;
  let mockRitualQueryBuilder: jest.Mock;
  let mockStepCreate: jest.Mock;
  let mockStepSave: jest.Mock;
  let mockStepCount: jest.Mock;
  let mockMaterialCreate: jest.Mock;
  let mockMaterialSave: jest.Mock;
  let mockMaterialCount: jest.Mock;
  let mockTransaction: jest.Mock;

  beforeEach(() => {
    // Initialize mocks
    mockRitualCount = jest.fn();
    mockRitualCreate = jest.fn();
    mockRitualSave = jest.fn();
    mockRitualQueryBuilder = jest.fn();
    mockStepCreate = jest.fn();
    mockStepSave = jest.fn();
    mockStepCount = jest.fn();
    mockMaterialCreate = jest.fn();
    mockMaterialSave = jest.fn();
    mockMaterialCount = jest.fn();
    mockTransaction = jest.fn();

    // Mock repositories
    ritualRepository = {
      count: mockRitualCount,
      create: mockRitualCreate,
      save: mockRitualSave,
      createQueryBuilder: mockRitualQueryBuilder,
    } as unknown as Repository<Ritual>;

    stepRepository = {
      create: mockStepCreate,
      save: mockStepSave,
      count: mockStepCount,
    } as unknown as Repository<RitualStep>;

    materialRepository = {
      create: mockMaterialCreate,
      save: mockMaterialSave,
      count: mockMaterialCount,
    } as unknown as Repository<RitualMaterial>;

    // Mock DataSource with transaction support
    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === Ritual) return ritualRepository;
        if (entity === RitualStep) return stepRepository;
        if (entity === RitualMaterial) return materialRepository;

        // Never should reach here in tests, return empty repository
        return {} as Repository<never>;
      }),
      transaction: mockTransaction,
    } as unknown as DataSource;

    // Mock transaction to execute callback immediately
    mockTransaction.mockImplementation(
      <T>(callback: (manager: unknown) => Promise<T>): Promise<T> => {
        const manager = {
          getRepository: jest.fn((entity) => {
            if (entity === Ritual) return ritualRepository;
            if (entity === RitualStep) return stepRepository;
            if (entity === RitualMaterial) return materialRepository;

            // Never should reach here in tests, return empty repository
            return {} as Repository<never>;
          }),
        };
        return callback(manager);
      },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Idempotencia', () => {
    it('debe saltar el seed si ya existen rituales', async () => {
      // Arrange
      mockRitualCount.mockResolvedValue(5);

      // Spy on console.log
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      await seedRituals(dataSource);

      // Assert
      expect(mockRitualCount).toHaveBeenCalledTimes(1);
      expect(mockRitualSave).not.toHaveBeenCalled();
      expect(mockStepSave).not.toHaveBeenCalled();
      expect(mockMaterialSave).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rituales ya poblados'),
      );

      consoleSpy.mockRestore();
    });

    it('debe insertar rituales si la tabla está vacía', async () => {
      // Arrange - Usar valores calculados desde RITUALS_SEED_DATA
      const expectedRitualCount = RITUALS_SEED_DATA.length;
      const expectedMaterialCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.materials?.length ?? 0),
        0,
      );
      const expectedStepCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.steps?.length ?? 0),
        0,
      );

      mockRitualCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(expectedRitualCount);
      mockMaterialCount.mockResolvedValue(expectedMaterialCount);
      mockStepCount.mockResolvedValue(expectedStepCount);

      mockRitualCreate.mockImplementation((data) => data as Ritual);
      mockRitualSave.mockImplementation((ritual) =>
        Promise.resolve({
          ...ritual,
          id: Math.floor(Math.random() * 1000),
        } as Ritual),
      );

      mockStepCreate.mockImplementation((data) => data as RitualStep);
      mockStepSave.mockResolvedValue({} as RitualStep);

      mockMaterialCreate.mockImplementation((data) => data as RitualMaterial);
      mockMaterialSave.mockResolvedValue({} as RitualMaterial);

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
      mockRitualQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      expect(mockRitualCount).toHaveBeenCalled();
      expect(mockRitualSave).toHaveBeenCalledTimes(RITUALS_SEED_DATA.length);
      expect(mockStepSave).toHaveBeenCalled();
      expect(mockMaterialSave).toHaveBeenCalled();
    });
  });

  describe('Validación de contenido', () => {
    it('debe crear rituales con todos los campos requeridos', async () => {
      // Arrange
      const expectedRitualCount = RITUALS_SEED_DATA.length;
      const expectedMaterialCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.materials?.length ?? 0),
        0,
      );
      const expectedStepCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.steps?.length ?? 0),
        0,
      );

      mockRitualCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(expectedRitualCount);
      mockMaterialCount.mockResolvedValue(expectedMaterialCount);
      mockStepCount.mockResolvedValue(expectedStepCount);

      const savedRituals: Partial<Ritual>[] = [];
      mockRitualCreate.mockImplementation((data) => data as Ritual);
      mockRitualSave.mockImplementation((ritual) => {
        const saved = { ...ritual, id: savedRituals.length + 1 };
        savedRituals.push(saved);
        return Promise.resolve(saved as Ritual);
      });

      mockStepCreate.mockImplementation((data) => data as RitualStep);
      mockStepSave.mockResolvedValue({} as RitualStep);

      mockMaterialCreate.mockImplementation((data) => data as RitualMaterial);
      mockMaterialSave.mockResolvedValue({} as RitualMaterial);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockRitualQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      expect(savedRituals.length).toBe(RITUALS_SEED_DATA.length);

      savedRituals.forEach((ritual) => {
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
      const expectedRitualCount = RITUALS_SEED_DATA.length;
      const expectedMaterialCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.materials?.length ?? 0),
        0,
      );
      const expectedStepCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.steps?.length ?? 0),
        0,
      );

      mockRitualCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(expectedRitualCount);
      mockMaterialCount.mockResolvedValue(expectedMaterialCount);
      mockStepCount.mockResolvedValue(expectedStepCount);

      mockRitualCreate.mockImplementation((data) => data as Ritual);
      mockRitualSave.mockImplementation((ritual) =>
        Promise.resolve({
          ...ritual,
          id: 1,
        } as Ritual),
      );

      const savedMaterials: Partial<RitualMaterial>[] = [];
      mockMaterialCreate.mockImplementation((data) => data as RitualMaterial);
      mockMaterialSave.mockImplementation((material) => {
        savedMaterials.push(material);
        return Promise.resolve(material as RitualMaterial);
      });

      mockStepCreate.mockImplementation((data) => data as RitualStep);
      mockStepSave.mockResolvedValue({} as RitualStep);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockRitualQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      const totalExpectedMaterials = RITUALS_SEED_DATA.reduce(
        (sum, ritual) => sum + ritual.materials.length,
        0,
      );
      expect(savedMaterials.length).toBe(totalExpectedMaterials);

      savedMaterials.forEach((material) => {
        expect(material.ritualId).toBeDefined();
        expect(material.name).toBeDefined();
        expect(material.type).toBeDefined();
        expect(material.quantity).toBeGreaterThanOrEqual(1);
      });
    });

    it('debe crear pasos para cada ritual en orden secuencial', async () => {
      // Arrange
      const expectedRitualCount = RITUALS_SEED_DATA.length;
      const expectedMaterialCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.materials?.length ?? 0),
        0,
      );
      const expectedStepCount = RITUALS_SEED_DATA.reduce(
        (acc, ritual) => acc + (ritual.steps?.length ?? 0),
        0,
      );

      mockRitualCount
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(expectedRitualCount);
      mockMaterialCount.mockResolvedValue(expectedMaterialCount);
      mockStepCount.mockResolvedValue(expectedStepCount);

      mockRitualCreate.mockImplementation((data) => data as Ritual);
      mockRitualSave.mockImplementation((ritual) =>
        Promise.resolve({
          ...ritual,
          id: 1,
        } as Ritual),
      );

      const savedSteps: Partial<RitualStep>[] = [];
      mockStepCreate.mockImplementation((data) => data as RitualStep);
      mockStepSave.mockImplementation((step) => {
        savedSteps.push(step);
        return Promise.resolve(step as RitualStep);
      });

      mockMaterialCreate.mockImplementation((data) => data as RitualMaterial);
      mockMaterialSave.mockResolvedValue({} as RitualMaterial);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      mockRitualQueryBuilder.mockReturnValue(queryBuilder);

      // Act
      await seedRituals(dataSource);

      // Assert
      const totalExpectedSteps = RITUALS_SEED_DATA.reduce(
        (sum, ritual) => sum + ritual.steps.length,
        0,
      );
      expect(savedSteps.length).toBe(totalExpectedSteps);

      savedSteps.forEach((step) => {
        expect(step.ritualId).toBeDefined();
        expect(step.stepNumber).toBeGreaterThanOrEqual(1);
        expect(step.title).toBeDefined();
        expect(step.description).toBeDefined();
      });

      // Verificar que los pasos estén numerados secuencialmente por ritual
      RITUALS_SEED_DATA.forEach((ritualData) => {
        const stepNumbers = ritualData.steps
          .map((s) => s.stepNumber)
          .sort((a, b) => a - b);
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

      mockRitualCount.mockResolvedValueOnce(0);
      mockRitualCreate.mockImplementation((data) => data as Ritual);

      // Reemplazar temporalmente los datos con try/finally para evitar contaminación
      const originalData = [...RITUALS_SEED_DATA];

      try {
        RITUALS_SEED_DATA.length = 0;
        RITUALS_SEED_DATA.push(invalidRitual);

        // Act & Assert
        await expect(seedRituals(dataSource)).rejects.toThrow();
      } finally {
        // Restaurar datos originales siempre, incluso si el test falla
        RITUALS_SEED_DATA.length = 0;
        RITUALS_SEED_DATA.push(...originalData);
      }
    });
  });
});
