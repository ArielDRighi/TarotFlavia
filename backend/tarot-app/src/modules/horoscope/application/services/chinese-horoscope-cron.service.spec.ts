import { Test, TestingModule } from '@nestjs/testing';
import { ChineseHoroscopeCronService } from './chinese-horoscope-cron.service';
import { ChineseHoroscopeService } from './chinese-horoscope.service';

describe('ChineseHoroscopeCronService', () => {
  let service: ChineseHoroscopeCronService;
  let chineseService: ChineseHoroscopeService;

  const mockChineseService = {
    findAllByYear: jest.fn(),
    generateAllForYear: jest.fn(),
    findMissingCombinationsForYear: jest.fn(),
    generateMissingForYear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChineseHoroscopeCronService,
        {
          provide: ChineseHoroscopeService,
          useValue: mockChineseService,
        },
      ],
    }).compile();

    service = module.get<ChineseHoroscopeCronService>(
      ChineseHoroscopeCronService,
    );
    chineseService = module.get<ChineseHoroscopeService>(
      ChineseHoroscopeService,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateNextYearHoroscopes', () => {
    it('debe generar horóscopos para el año siguiente si no existen', async () => {
      // Arrange
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 60,
        failed: 0,
        results: [],
      });

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      const nextYear = new Date().getFullYear() + 1;
      expect(chineseService.findAllByYear).toHaveBeenCalledWith(nextYear);
      expect(chineseService.generateAllForYear).toHaveBeenCalledWith(nextYear);
    });

    it('debe no generar si ya existen horóscopos', async () => {
      // Arrange
      mockChineseService.findAllByYear.mockResolvedValue([
        { id: 1, animal: 'rat', year: 2027 },
      ]);

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      const nextYear = new Date().getFullYear() + 1;
      expect(chineseService.findAllByYear).toHaveBeenCalledWith(nextYear);
      expect(chineseService.generateAllForYear).not.toHaveBeenCalled();
    });

    it('debe manejar errores de generación sin lanzar excepción', async () => {
      // Arrange
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      // Act & Assert
      await expect(service.generateNextYearHoroscopes()).resolves.not.toThrow();
      expect(chineseService.generateAllForYear).toHaveBeenCalled();
    });

    it('debe loguear mensaje de éxito al completar la generación', async () => {
      // Arrange
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 12,
        failed: 0,
        results: [],
      });

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('INICIO: Generación automática'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('FIN: 12/12 horóscopos generados'),
      );
    });

    it('debe loguear warning cuando los horóscopos ya existen', async () => {
      // Arrange
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      mockChineseService.findAllByYear.mockResolvedValue([
        { id: 1, animal: 'rat', year: 2027 },
        { id: 2, animal: 'ox', year: 2027 },
      ]);

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('ya existen'),
      );
    });

    it('debe loguear error cuando la generación falla', async () => {
      // Arrange
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockRejectedValue(
        new Error('Network error'),
      );

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error en generación automática'),
        expect.any(String),
      );
    });

    it('debe manejar errores de findAllByYear sin lanzar excepción', async () => {
      // Arrange
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockChineseService.findAllByYear.mockRejectedValue(
        new Error('Database connection error'),
      );

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error en generación automática'),
        expect.stringContaining('Database connection error'),
      );
      expect(chineseService.generateAllForYear).not.toHaveBeenCalled();
    });

    it('debe manejar errores no-Error en el catch', async () => {
      // Arrange
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockRejectedValue(
        'String error without Error object',
      );

      // Act
      await service.generateNextYearHoroscopes();

      // Assert
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error en generación automática'),
        '', // Empty stack for non-Error objects
      );
    });
  });

  // ===== T-BUG-001-A: Segundo cron de verificación (16 de diciembre) =====
  describe('verifyAndCompleteNextYearHoroscopes', () => {
    it('debe llamar a generateMissingForYear si quedan combinaciones faltantes', async () => {
      // Arrange
      const nextYear = new Date().getFullYear() + 1;
      mockChineseService.findMissingCombinationsForYear.mockResolvedValue([
        { animal: 'rat', element: 'metal' },
        { animal: 'ox', element: 'water' },
      ]);
      mockChineseService.generateMissingForYear.mockResolvedValue({
        successful: 2,
        failed: 0,
        results: [],
      });

      // Act
      await service.verifyAndCompleteNextYearHoroscopes();

      // Assert
      expect(
        chineseService.findMissingCombinationsForYear,
      ).toHaveBeenCalledWith(nextYear);
      expect(chineseService.generateMissingForYear).toHaveBeenCalledWith(
        nextYear,
      );
    });

    it('debe NO llamar a generateMissingForYear si los 60 horóscopos ya existen', async () => {
      // Arrange
      mockChineseService.findMissingCombinationsForYear.mockResolvedValue([]);

      // Act
      await service.verifyAndCompleteNextYearHoroscopes();

      // Assert
      expect(chineseService.generateMissingForYear).not.toHaveBeenCalled();
    });

    it('debe loguear cantidad de faltantes y resultado del reintento', async () => {
      // Arrange
      const logSpy = jest.spyOn(service['logger'], 'log');
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      mockChineseService.findMissingCombinationsForYear.mockResolvedValue([
        { animal: 'rat', element: 'metal' },
      ]);
      mockChineseService.generateMissingForYear.mockResolvedValue({
        successful: 1,
        failed: 0,
        results: [],
      });

      // Act
      await service.verifyAndCompleteNextYearHoroscopes();

      // Assert
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('1 horóscopos faltantes'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('1 exitosos'),
      );
    });

    it('debe loguear que la generación está completa si no hay faltantes', async () => {
      // Arrange
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockChineseService.findMissingCombinationsForYear.mockResolvedValue([]);

      // Act
      await service.verifyAndCompleteNextYearHoroscopes();

      // Assert
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('60/60'));
    });

    it('debe manejar errores del proceso de verificación sin lanzar excepción', async () => {
      // Arrange
      const errorSpy = jest.spyOn(service['logger'], 'error');
      mockChineseService.findMissingCombinationsForYear.mockRejectedValue(
        new Error('DB unavailable'),
      );

      // Act & Assert
      await expect(
        service.verifyAndCompleteNextYearHoroscopes(),
      ).resolves.not.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error en verificación de faltantes'),
        expect.any(String),
      );
    });
  });

  describe('generateManually', () => {
    it('debe generar horóscopos para el año especificado', async () => {
      // Arrange
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 12,
        failed: 0,
        results: [],
      });

      // Act
      await service.generateManually(2028);

      // Assert
      expect(chineseService.generateAllForYear).toHaveBeenCalledWith(2028);
    });

    it('debe usar el año siguiente por defecto si no se especifica año', async () => {
      // Arrange
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 12,
        failed: 0,
        results: [],
      });

      // Act
      await service.generateManually();

      // Assert
      const nextYear = new Date().getFullYear() + 1;
      expect(chineseService.generateAllForYear).toHaveBeenCalledWith(nextYear);
    });

    it('debe loguear warning al iniciar generación manual', async () => {
      // Arrange
      const warnSpy = jest.spyOn(service['logger'], 'warn');
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 10,
        failed: 2,
        results: [],
      });

      // Act
      await service.generateManually(2028);

      // Assert
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generación manual iniciada'),
      );
    });

    it('debe loguear mensaje de completado con conteos', async () => {
      // Arrange
      const logSpy = jest.spyOn(service['logger'], 'log');
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 10,
        failed: 2,
        results: [],
      });

      // Act
      await service.generateManually(2028);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('10/12 exitosos, 2/12 fallidos'),
      );
    });

    it('debe lanzar excepción si la generación manual falla', async () => {
      // Arrange
      mockChineseService.generateAllForYear.mockRejectedValue(
        new Error('Manual generation failed'),
      );

      // Act & Assert
      await expect(service.generateManually(2028)).rejects.toThrow(
        'Manual generation failed',
      );
    });
  });
});
