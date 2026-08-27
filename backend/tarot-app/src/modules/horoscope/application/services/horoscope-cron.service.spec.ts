import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HoroscopeCronService } from './horoscope-cron.service';
import { HoroscopeGenerationService } from './horoscope-generation.service';
import { ZodiacSign } from '../../../../common/utils/zodiac.utils';
import { DailyHoroscope } from '../../entities/daily-horoscope.entity';
import {
  DELAY_BETWEEN_SIGNS_MS,
  MAX_RETRIES_PER_SIGN,
  RETRY_DELAYS_MS,
} from './horoscope-cron.config';
import { AllProvidersFailedException } from '../../../ai/infrastructure/errors/ai-error.types';

describe('HoroscopeCronService', () => {
  let service: HoroscopeCronService;
  let mockConfigGet: jest.Mock;

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
    findMissingSignsForDate: jest.fn(),
  };

  beforeEach(async () => {
    // Por defecto los tests corren fuera de producción, así el hook de bootstrap
    // no dispara generación salvo en los tests que lo fuerzan explícitamente.
    mockConfigGet = jest.fn().mockReturnValue('test');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HoroscopeCronService,
        {
          provide: HoroscopeGenerationService,
          useValue: mockHoroscopeGenerationService,
        },
        {
          provide: ConfigService,
          useValue: { get: mockConfigGet },
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

  describe('onApplicationBootstrap', () => {
    // Deja correr la tarea fire-and-forget disparada por el hook.
    const flushMicrotasks = () =>
      new Promise((resolve) => setImmediate(resolve));

    it('rellena los horóscopos faltantes de hoy al arrancar en producción', async () => {
      mockConfigGet.mockReturnValue('production');
      mockHoroscopeGenerationService.findMissingSignsForDate.mockResolvedValue(
        [],
      );

      service.onApplicationBootstrap();
      await flushMicrotasks();

      expect(mockConfigGet).toHaveBeenCalledWith('NODE_ENV');
      expect(
        mockHoroscopeGenerationService.findMissingSignsForDate,
      ).toHaveBeenCalledTimes(1);

      // Se rellena la fecha de HOY (blinda contra regresiones en el argumento).
      const dateArg =
        mockHoroscopeGenerationService.findMissingSignsForDate.mock.calls[0][0];
      expect(dateArg).toBeInstanceOf(Date);
      expect((dateArg as Date).toISOString().split('T')[0]).toBe(
        new Date().toISOString().split('T')[0],
      );
    });

    it('NO dispara generación fuera de producción (dev/test)', async () => {
      mockConfigGet.mockReturnValue('development');

      service.onApplicationBootstrap();
      await flushMicrotasks();

      expect(
        mockHoroscopeGenerationService.findMissingSignsForDate,
      ).not.toHaveBeenCalled();
    });

    it('no propaga errores del backfill (no tumba el arranque)', async () => {
      mockConfigGet.mockReturnValue('production');
      mockHoroscopeGenerationService.findMissingSignsForDate.mockRejectedValue(
        new Error('DB caída'),
      );

      expect(() => service.onApplicationBootstrap()).not.toThrow();
      await flushMicrotasks();

      expect(
        mockHoroscopeGenerationService.findMissingSignsForDate,
      ).toHaveBeenCalledTimes(1);
    });
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
      // T-BUG-016-B / T-IA-005: 11 signos exitosos (1 llamada cada uno) +
      // Cáncer reintentado 1 + MAX_RETRIES_PER_SIGN veces.
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledTimes(11 + (MAX_RETRIES_PER_SIGN + 1));

      // Verificar que se logueo el error de Cancer tras agotar reintentos
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
      expect(delaySpy).toHaveBeenCalledWith(DELAY_BETWEEN_SIGNS_MS);
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

  describe('retry behavior (T-BUG-016-B)', () => {
    const countCallsForSign = (sign: ZodiacSign): number =>
      mockHoroscopeGenerationService.generateForSign.mock.calls.filter(
        (call) => call[0] === sign,
      ).length;

    it('should retry a transient failure and succeed without leaving a gap', async () => {
      // Arrange: Leo falla una vez y luego tiene éxito
      let leoAttempts = 0;
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          if (sign === ZodiacSign.LEO) {
            leoAttempts++;
            if (leoAttempts === 1) {
              return Promise.reject(new Error('Transient 5xx'));
            }
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Act
      await service.generateDailyHoroscopes();

      // Assert: 11 signos OK (1 llamada) + Leo (2 llamadas) = 13 llamadas
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledTimes(13);

      // No debe haber error definitivo, los 12 fueron exitosos
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('12/12 exitosos'),
      );
    });

    it('should give up after exhausting retries for a sign', async () => {
      // Arrange: Virgo siempre falla
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          if (sign === ZodiacSign.VIRGO) {
            return Promise.reject(new Error('Persistent failure'));
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Act
      await service.generateDailyHoroscopes();

      // Assert: Virgo intentado 1 + MAX_RETRIES_PER_SIGN veces
      expect(countCallsForSign(ZodiacSign.VIRGO)).toBe(
        MAX_RETRIES_PER_SIGN + 1,
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('sin más reintentos'),
      );
    });

    /**
     * T-IA-005: durante el incidente del 26-ago-2026 el cron reintentó cuatro
     * veces por signo contra un modelo que devolvía 404. El modelo no reaparece
     * entre reintento y reintento: cada pasada solo gastaba cuota y empujaba la
     * tanda contra el techo de tokens.
     */
    it('NO reintenta cuando la IA falló por algo definitivo', async () => {
      const definitivo = new AllProvidersFailedException([
        {
          provider: 'groq',
          error: 'Groq model unavailable: 404 model_not_found',
          retryable: false,
        },
      ]);

      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          if (sign === ZodiacSign.VIRGO) {
            return Promise.reject(definitivo);
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      await service.generateDailyHoroscopes();

      expect(countCallsForSign(ZodiacSign.VIRGO)).toBe(1);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('sin reintentos'),
      );
    });

    it('SÍ reintenta cuando algún proveedor falló por algo transitorio', async () => {
      const transitorio = new AllProvidersFailedException([
        {
          provider: 'groq',
          error: 'Groq model unavailable: 404 model_not_found',
          retryable: false,
        },
        {
          provider: 'deepseek',
          error: 'DeepSeek server error: 503',
          retryable: true,
        },
      ]);

      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          if (sign === ZodiacSign.VIRGO) {
            return Promise.reject(transitorio);
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      await service.generateDailyHoroscopes();

      expect(countCallsForSign(ZodiacSign.VIRGO)).toBe(
        MAX_RETRIES_PER_SIGN + 1,
      );
    });

    it('espera el backoff configurado antes de cada reintento', async () => {
      // El delay está mockeado; se verifica que se pide la espera correcta.
      const delaySpy = jest.spyOn(
        service as unknown as Record<string, jest.Mock>,
        'delay',
      );

      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          if (sign === ZodiacSign.VIRGO) {
            return Promise.reject(new Error('Persistent failure'));
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      await service.generateDailyHoroscopes();

      RETRY_DELAYS_MS.forEach((retryDelay) => {
        expect(delaySpy).toHaveBeenCalledWith(retryDelay);
      });
    });
  });

  describe('verifyAndCompleteDailyHoroscopes (T-BUG-016-B)', () => {
    it('should not generate anything when all 12 signs exist', async () => {
      // Arrange
      mockHoroscopeGenerationService.findMissingSignsForDate.mockResolvedValue(
        [],
      );

      // Act
      await service.verifyAndCompleteDailyHoroscopes();

      // Assert
      expect(
        mockHoroscopeGenerationService.findMissingSignsForDate,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).not.toHaveBeenCalled();
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        expect.stringContaining('los 12 horóscopos del día existen'),
      );
    });

    it('should generate only the missing signs', async () => {
      // Arrange: faltan 2 signos
      mockHoroscopeGenerationService.findMissingSignsForDate.mockResolvedValue([
        ZodiacSign.ARIES,
        ZodiacSign.PISCES,
      ]);
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => Promise.resolve(createMockHoroscope(sign)),
      );

      // Act
      await service.verifyAndCompleteDailyHoroscopes();

      // Assert: solo se generan los 2 faltantes
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledWith(ZodiacSign.ARIES, expect.any(Date));
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).toHaveBeenCalledWith(ZodiacSign.PISCES, expect.any(Date));
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockHoroscopeGenerationService.findMissingSignsForDate.mockRejectedValue(
        new Error('DB down'),
      );

      // Act
      await service.verifyAndCompleteDailyHoroscopes();

      // Assert
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error en verificación de horóscopos'),
        expect.anything(),
      );
    });
  });

  describe('generateMissingHoroscopes (T-BUG-016-B)', () => {
    it('should return summary with missing, successful and failed counts', async () => {
      // Arrange: faltan 3, uno falla
      mockHoroscopeGenerationService.findMissingSignsForDate.mockResolvedValue([
        ZodiacSign.GEMINI,
        ZodiacSign.CANCER,
        ZodiacSign.LEO,
      ]);
      mockHoroscopeGenerationService.generateForSign.mockImplementation(
        (sign: ZodiacSign) => {
          if (sign === ZodiacSign.CANCER) {
            return Promise.reject(new Error('fail'));
          }
          return Promise.resolve(createMockHoroscope(sign));
        },
      );

      // Act
      const result = await service.generateMissingHoroscopes(new Date());

      // Assert
      expect(result.missing).toBe(3);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
    });

    it('should return zeros when nothing is missing', async () => {
      // Arrange
      mockHoroscopeGenerationService.findMissingSignsForDate.mockResolvedValue(
        [],
      );

      // Act
      const result = await service.generateMissingHoroscopes(new Date());

      // Assert
      expect(result).toEqual({ missing: 0, successful: 0, failed: 0 });
      expect(
        mockHoroscopeGenerationService.generateForSign,
      ).not.toHaveBeenCalled();
    });
  });

  describe('constants', () => {
    it('should have DELAY_BETWEEN_SIGNS_MS configured', () => {
      expect(service['DELAY_BETWEEN_SIGNS_MS']).toBe(DELAY_BETWEEN_SIGNS_MS);
    });

    it('should have ZODIAC_ORDER with 12 signs', () => {
      expect(service['ZODIAC_ORDER']).toHaveLength(12);
      expect(service['ZODIAC_ORDER']).toContain(ZodiacSign.ARIES);
      expect(service['ZODIAC_ORDER']).toContain(ZodiacSign.PISCES);
    });
  });
});
