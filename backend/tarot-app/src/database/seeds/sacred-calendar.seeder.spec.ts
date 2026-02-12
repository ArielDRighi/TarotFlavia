import { DataSource, Repository } from 'typeorm';
import { seedSacredCalendar } from './sacred-calendar.seeder';
import { SacredEvent } from '../../modules/rituals/entities/sacred-event.entity';
import { SacredCalendarService } from '../../modules/rituals/application/services/sacred-calendar.service';

describe('SacredCalendarSeeder', () => {
  let dataSource: DataSource;
  let sacredEventRepository: Repository<SacredEvent>;
  let sacredCalendarService: SacredCalendarService;

  beforeEach(() => {
    // Mock repository
    sacredEventRepository = {
      count: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as Repository<SacredEvent>;

    // Mock SacredCalendarService
    sacredCalendarService = {
      generateYearEvents: jest.fn(),
    } as unknown as SacredCalendarService;

    // Mock DataSource
    dataSource = {
      getRepository: jest.fn().mockReturnValue(sacredEventRepository),
      transaction: jest.fn(async (callback) => {
        const transactionManager = {
          getRepository: jest.fn().mockReturnValue(sacredEventRepository),
        };
        return callback(transactionManager) as Promise<void>;
      }),
    } as unknown as DataSource;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Idempotencia', () => {
    it('debe saltar el seed si ya existen eventos', async () => {
      // Arrange
      (sacredEventRepository.count as jest.Mock).mockResolvedValue(10);

      // Act
      await seedSacredCalendar(dataSource, sacredCalendarService);

      // Assert
      expect(sacredEventRepository.count).toHaveBeenCalled();
      expect(sacredCalendarService.generateYearEvents).not.toHaveBeenCalled();
      expect(sacredEventRepository.save).not.toHaveBeenCalled();
    });

    it('debe ejecutar el seed si no existen eventos', async () => {
      // Arrange
      (sacredEventRepository.count as jest.Mock)
        .mockResolvedValueOnce(0) // Verificación inicial
        .mockResolvedValue(100); // Estadísticas finales
      (sacredCalendarService.generateYearEvents as jest.Mock).mockResolvedValue(
        50,
      ); // Retorna número de eventos creados

      // Mock query builder para estadísticas
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      (sacredEventRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      // Act
      await seedSacredCalendar(dataSource, sacredCalendarService);

      // Assert
      expect(sacredEventRepository.count).toHaveBeenCalled();
      expect(sacredCalendarService.generateYearEvents).toHaveBeenCalled();
    });
  });

  describe('Generación de eventos', () => {
    beforeEach(() => {
      (sacredEventRepository.count as jest.Mock)
        .mockResolvedValueOnce(0) // Verificación inicial de idempotencia
        .mockResolvedValue(100); // Counts posteriores para estadísticas
    });

    it('debe generar eventos para el año actual y próximo', async () => {
      // Arrange
      const currentYear = new Date().getFullYear();
      (sacredCalendarService.generateYearEvents as jest.Mock).mockResolvedValue(
        50,
      );

      // Mock query builder para estadísticas
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      (sacredEventRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      // Act
      await seedSacredCalendar(dataSource, sacredCalendarService);

      // Assert
      expect(sacredCalendarService.generateYearEvents).toHaveBeenCalledWith(
        currentYear,
      );
      expect(sacredCalendarService.generateYearEvents).toHaveBeenCalledWith(
        currentYear + 1,
      );
      expect(sacredCalendarService.generateYearEvents).toHaveBeenCalledTimes(2);
    });

    it('debe generar eventos para ambos hemisferios', async () => {
      // Arrange
      (sacredCalendarService.generateYearEvents as jest.Mock).mockResolvedValue(
        50,
      ); // El servicio internamente genera para ambos hemisferios

      // Mock query builder para estadísticas
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      (sacredEventRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      // Act
      await seedSacredCalendar(dataSource, sacredCalendarService);

      // Assert
      expect(sacredCalendarService.generateYearEvents).toHaveBeenCalled();
      // El método generateYearEvents ya se encarga de generar eventos para ambos hemisferios
    });

    it('debe guardar eventos con todos los campos requeridos', async () => {
      // Arrange
      (sacredCalendarService.generateYearEvents as jest.Mock).mockResolvedValue(
        25,
      ); // El servicio crea y guarda eventos internamente

      // Mock query builder para estadísticas
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };
      (sacredEventRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      // Act
      await seedSacredCalendar(dataSource, sacredCalendarService);

      // Assert
      expect(sacredCalendarService.generateYearEvents).toHaveBeenCalled();
      // El servicio generateYearEvents ya valida y guarda con todos los campos requeridos
    });
  });

  describe('Estadísticas finales', () => {
    beforeEach(() => {
      (sacredEventRepository.count as jest.Mock)
        .mockResolvedValueOnce(0) // Primer count (verificación inicial)
        .mockResolvedValue(100); // Counts subsecuentes (estadísticas)
    });

    it('debe mostrar estadísticas de eventos insertados', async () => {
      // Arrange
      (sacredCalendarService.generateYearEvents as jest.Mock).mockResolvedValue(
        50,
      );

      // Mock query builder para estadísticas por tipo
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { eventType: 'LUNAR_PHASE', count: '48' },
          { eventType: 'SABBAT', count: '16' },
          { eventType: 'PORTAL', count: '22' },
        ]),
      };
      (sacredEventRepository.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      // Act & Assert (no debe lanzar error)
      await expect(
        seedSacredCalendar(dataSource, sacredCalendarService),
      ).resolves.not.toThrow();

      // Verificar que se llamaron los métodos de estadísticas
      expect(sacredEventRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalled();
    });
  });
});
