import { Test, TestingModule } from '@nestjs/testing';
import { ChineseHoroscopeCronService } from './chinese-horoscope-cron.service';
import { ChineseHoroscopeService } from './chinese-horoscope.service';

describe('ChineseHoroscopeCronService', () => {
  let service: ChineseHoroscopeCronService;
  let chineseService: ChineseHoroscopeService;

  const mockChineseService = {
    findAllByYear: jest.fn(),
    generateAllForYear: jest.fn(),
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
    it('should generate horoscopes for next year if none exist', async () => {
      // Arrange
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockResolvedValue({
        successful: 12,
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

    it('should not generate if horoscopes already exist', async () => {
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

    it('should handle generation errors gracefully', async () => {
      // Arrange
      mockChineseService.findAllByYear.mockResolvedValue([]);
      mockChineseService.generateAllForYear.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      // Act & Assert
      await expect(service.generateNextYearHoroscopes()).resolves.not.toThrow();
      expect(chineseService.generateAllForYear).toHaveBeenCalled();
    });

    it('should log success message when generation completes', async () => {
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

    it('should log warning when horoscopes already exist', async () => {
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

    it('should log error when generation fails', async () => {
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

    it('should handle errors from findAllByYear gracefully', async () => {
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

    it('should handle non-Error objects in catch block', async () => {
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

  describe('generateManually', () => {
    it('should generate horoscopes for specified year', async () => {
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

    it('should default to next year if no year specified', async () => {
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

    it('should log warning when manual generation starts', async () => {
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

    it('should log completion message with success and failure counts', async () => {
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

    it('should handle errors in manual generation', async () => {
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
