import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { HoroscopeCronService } from './horoscope-cron.service';
import { HoroscopeGenerationService } from './horoscope-generation.service';
import { ZodiacSign } from '../../../../common/utils/zodiac.utils';
import { DailyHoroscope } from '../../entities/daily-horoscope.entity';

describe('HoroscopeCronService', () => {
  let service: HoroscopeCronService;

  // Mock completo de DailyHoroscope
  const createMockHoroscope = (sign: ZodiacSign): DailyHoroscope => ({
    id: 1,
    zodiacSign: sign,
    horoscopeDate: new Date('2026-01-17'),
    generalContent: 'Mock general content',
    areas: {
      love: { content: 'Mock love', score: 8 },
      wellness: { content: 'Mock wellness', score: 7 },
      money: { content: 'Mock money', score: 9 },
    },
    luckyNumber: 7,
    luckyColor: 'Azul',
    luckyTime: '14:00 - 16:00',
    aiProvider: 'groq',
    aiModel: 'llama-3.1-70b-versatile',
    tokensUsed: 500,
    generationTimeMs: 1500,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockHoroscopeGenerationService = {
    generateForSign: jest.fn(),
    cleanupOldHoroscopes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoroscopeCronService,
        {
          provide: HoroscopeGenerationService,
          useValue: mockHoroscopeGenerationService,
        },
      ],
    }).compile();

    service = module.get<HoroscopeCronService>(HoroscopeCronService);

    // Silenciar logs durante tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    // Mockear el método delay para que los tests sean rápidos
    jest
      .spyOn(service as unknown as Record<string, jest.Mock>, 'delay')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDailyHoroscopes', () => {
    it('should generate horoscopes for all 12 zodiac signs sequentially', async () => {
      // Arrange
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Act
      await service.generateDailyHoroscopes();

      // Assert
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledTimes(12);

      // Verificar que se llamó con cada signo en orden
      const expectedSigns = [
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.GEMINI,
        ZodiacSign.CANCER,
        ZodiacSign.LEO,
        ZodiacSign.VIRGO,
        ZodiacSign.LIBRA,
        ZodiacSign.SCORPIO,
        ZodiacSign.SAGITTARIUS,
        ZodiacSign.CAPRICORN,
        ZodiacSign.AQUARIUS,
        ZodiacSign.PISCES,
      ];

      expectedSigns.forEach((sign, index) => {
        expect(
          mockHoroscopeGenerationService.generateForSign,
        ).toHaveBeenNthCalledWith(index + 1, sign, expect.any(Date));
      });
    });

    it('should continue generating even if one sign fails', async () => {
      // Arrange
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          // Hacer que Cancer falle
          if (sign === ZodiacSign.CANCER) {
            return Promise.reject(new Error('Cancer generation failed'));
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Act
      await service.generateDailyHoroscopes();

      // Assert
      // Debe haber intentado generar los 12 signos a pesar del error
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledTimes(12);

      // Verificar que se logueo el error de Cancer
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Cáncer: Cancer generation failed'),
      );
    });

    it('should use delay between sign generations', async () => {
      // Arrange
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Espiar el método delay privado
      const delaySpy = jest.spyOn(
        service as unknown as Record<string, jest.Mock>,
        'delay',
      );

      // Act
      await service.generateDailyHoroscopes();

      // Assert
      // Debe haber llamado delay 11 veces (12 signos - 1, no hay delay antes del primero)
      expect(delaySpy).toHaveBeenCalledTimes(11);
      expect(delaySpy).toHaveBeenCalledWith(6000);
    });

    it('should log summary with success and failure counts', async () => {
      // Arrange
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          // Hacer que 2 signos fallen
          if (sign === ZodiacSign.CANCER || sign === ZodiacSign.SAGITTARIUS) {
            return Promise.reject(new Error('Generation failed'));
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Act
      await service.generateDailyHoroscopes();

      // Assert
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('10/12 exitosos'),
      );
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        expect.stringContaining('2 horóscopos fallaron'),
      );
    });
  });

  describe('cleanupOldHoroscopes', () => {
    it('should call cleanupOldHoroscopes with default retention days', async () => {
      // Arrange
      mockHoroscopeGenerationService.cleanupOldHoroscopes.mockResolvedValue(5);

      // Act
      await service.cleanupOldHoroscopes();

      // Assert
      expect(
        mockHoroscopeGenerationService.cleanupOldHoroscopes,
      ).toHaveBeenCalledWith(30);
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('Eliminados: 5'),
      );
    });

    it('should handle cleanup errors gracefully', async () => {
      // Arrange
      const error = new Error('Database error');
      mockHoroscopeGenerationService.cleanupOldHoroscopes.mockRejectedValue(
        error,
      );

      // Act
      await service.cleanupOldHoroscopes();

      // Assert
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        'Error en limpieza:',
        error,
      );
    });
  });

  describe('generateNow', () => {
    it('should call generateDailyHoroscopes', async () => {
      // Arrange
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      const generateDailyHoroscopesSpy = jest.spyOn(
        service,
        'generateDailyHoroscopes',
      );

      // Act
      await service.generateNow();

      // Assert
      expect(generateDailyHoroscopesSpy).toHaveBeenCalled();
      expect(Logger.prototype.warn).toHaveBeenCalledWith(
        'Generación manual iniciada...',
      );
    });
  });

  describe('constants', () => {
    it('should have DELAY_BETWEEN_SIGNS_MS configured', () => {
      expect(service['DELAY_BETWEEN_SIGNS_MS']).toBe(6000);
    });

    it('should have ZODIAC_ORDER with 12 signs', () => {
      expect(service['ZODIAC_ORDER']).toHaveLength(12);
      expect(service['ZODIAC_ORDER']).toContain(ZodiacSign.ARIES);
      expect(service['ZODIAC_ORDER']).toContain(ZodiacSign.PISCES);
    });
  });
});
