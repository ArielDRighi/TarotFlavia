import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { BirthChartController } from './birth-chart.controller';
import { Response } from 'express';
import { UserPlan } from '../../../users/entities/user.entity';
import { OptionalJwtAuthGuard } from '../../../auth/infrastructure/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { CheckUsageLimitGuard } from '../../../usage-limits/guards/check-usage-limit.guard';
import { IncrementUsageInterceptor } from '../../../usage-limits/interceptors/increment-usage.interceptor';

/**
 * Tests del BirthChartController
 *
 * Cubre:
 * - POST /birth-chart/generate (todos los planes: Anónimo, Free, Premium)
 * - POST /birth-chart/generate/anonymous (solo anónimos)
 * - POST /birth-chart/pdf (Free y Premium)
 * - GET /birth-chart/geocode (búsqueda de lugares)
 * - GET /birth-chart/usage (consultar límites)
 * - POST /birth-chart/synthesis (Premium only)
 *
 * Siguiendo TDD: Tests primero (RED), luego implementación (GREEN)
 */
describe('BirthChartController', () => {
  let controller: BirthChartController;
  let mockFacadeService: any;
  let mockGeocodeService: any;

  const mockGenerateChartDto = {
    name: 'María García',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'Buenos Aires, Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  const mockBasicChartResponse = {
    success: true,
    chartSvgData: { planets: [], houses: [], aspects: [] },
    planets: [],
    houses: [],
    aspects: [],
    bigThree: {
      sun: {
        sign: 'leo',
        signName: 'Leo',
        interpretation: 'El Sol en Leo representa...',
      },
      moon: {
        sign: 'scorpio',
        signName: 'Escorpio',
        interpretation: 'La Luna en Escorpio indica...',
      },
      ascendant: {
        sign: 'virgo',
        signName: 'Virgo',
        interpretation: 'Ascendente en Virgo muestra...',
      },
    },
    calculationTimeMs: 125,
  };

  const mockFullChartResponse = {
    ...mockBasicChartResponse,
    distribution: {
      elements: [
        { name: 'Fuego', count: 3, percentage: 27 },
        { name: 'Tierra', count: 4, percentage: 36 },
      ],
      modalities: [{ name: 'Cardinal', count: 4, percentage: 36 }],
    },
    interpretations: {
      planets: [
        {
          planet: 'sun',
          planetName: 'Sol',
          intro: 'El Sol representa...',
          inSign: 'En Leo, el Sol brilla...',
          inHouse: 'En Casa 5...',
          aspects: [],
        },
      ],
    },
    canDownloadPdf: true,
  };

  const mockPremiumChartResponse = {
    ...mockFullChartResponse,
    savedChartId: 1,
    aiSynthesis: {
      content: 'Síntesis personalizada generada por IA...',
      generatedAt: '2026-02-10T12:00:00Z',
      provider: 'groq-llama3.1-70b',
    },
    canAccessHistory: true,
  };

  const mockGeocodedPlace = {
    placeId: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs',
    displayName: 'Buenos Aires, Argentina',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  beforeEach(async () => {
    // Mock del BirthChartFacadeService
    mockFacadeService = {
      generateChart: jest.fn(),
      generatePdf: jest.fn(),
      getUsageStatus: jest.fn(),
      generateSynthesisOnly: jest.fn(),
    };

    // Mock del GeocodeService
    mockGeocodeService = {
      searchPlaces: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BirthChartController],
      providers: [
        {
          provide: 'BirthChartFacadeService',
          useValue: mockFacadeService,
        },
        {
          provide: 'GeocodeService',
          useValue: mockGeocodeService,
        },
      ],
    })
      .overrideGuard(OptionalJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CheckUsageLimitGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(IncrementUsageInterceptor)
      .useValue({ intercept: (context, next) => next.handle() })
      .compile();

    controller = module.get<BirthChartController>(BirthChartController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // POST /birth-chart/generate - Generar carta (todos los planes)
  // ============================================================================

  describe('POST /birth-chart/generate', () => {
    it('should generate basic chart for anonymous user', async () => {
      // Arrange
      mockFacadeService.generateChart.mockResolvedValue(mockBasicChartResponse);

      // Act
      const result = await controller.generateChart(
        mockGenerateChartDto,
        null, // Usuario anónimo
        'fingerprint-123',
      );

      // Assert
      expect(mockFacadeService.generateChart).toHaveBeenCalledWith(
        mockGenerateChartDto,
        UserPlan.ANONYMOUS,
        null,
      );
      expect(result).toEqual(mockBasicChartResponse);
    });

    it('should generate full chart for free user', async () => {
      // Arrange
      const freeUser = {
        userId: 1,
        email: 'free@example.com',
        plan: UserPlan.FREE,
      };
      mockFacadeService.generateChart.mockResolvedValue(mockFullChartResponse);

      // Act
      const result = await controller.generateChart(
        mockGenerateChartDto,
        freeUser,
        'fingerprint-123',
      );

      // Assert
      expect(mockFacadeService.generateChart).toHaveBeenCalledWith(
        mockGenerateChartDto,
        UserPlan.FREE,
        freeUser.userId,
      );
      expect(result).toEqual(mockFullChartResponse);
    });

    it('should generate premium chart for premium user', async () => {
      // Arrange
      const premiumUser = {
        userId: 1,
        email: 'premium@example.com',
        plan: UserPlan.PREMIUM,
      };
      mockFacadeService.generateChart.mockResolvedValue(
        mockPremiumChartResponse,
      );

      // Act
      const result = await controller.generateChart(
        mockGenerateChartDto,
        premiumUser,
        'fingerprint-123',
      );

      // Assert
      expect(mockFacadeService.generateChart).toHaveBeenCalledWith(
        mockGenerateChartDto,
        UserPlan.PREMIUM,
        premiumUser.userId,
      );
      expect(result).toEqual(mockPremiumChartResponse);
    });

    it('should log chart generation with user email', async () => {
      // Arrange
      const logSpy = jest.spyOn(controller['logger'], 'log');
      const user = {
        userId: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
      };
      mockFacadeService.generateChart.mockResolvedValue(mockFullChartResponse);

      // Act
      await controller.generateChart(
        mockGenerateChartDto,
        user,
        'fingerprint-123',
      );

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('test@example.com'),
      );
    });

    it('should log anonymous user when no user provided', async () => {
      // Arrange
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockFacadeService.generateChart.mockResolvedValue(mockBasicChartResponse);

      // Act
      await controller.generateChart(
        mockGenerateChartDto,
        null,
        'fingerprint-123',
      );

      // Assert
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('anonymous'));
    });
  });

  // ============================================================================
  // POST /birth-chart/generate/anonymous - Endpoint específico para anónimos
  // ============================================================================

  describe('POST /birth-chart/generate/anonymous', () => {
    it('should generate chart for anonymous user with fingerprint', async () => {
      // Arrange
      mockFacadeService.generateChart.mockResolvedValue(mockBasicChartResponse);

      // Act
      const result = await controller.generateChartAnonymous(
        mockGenerateChartDto,
        'fingerprint-456',
      );

      // Assert
      expect(mockFacadeService.generateChart).toHaveBeenCalledWith(
        mockGenerateChartDto,
        UserPlan.ANONYMOUS,
        null,
        'fingerprint-456',
      );
      expect(result).toEqual(mockBasicChartResponse);
    });

    it('should log anonymous generation with fingerprint', async () => {
      // Arrange
      const logSpy = jest.spyOn(controller['logger'], 'log');
      mockFacadeService.generateChart.mockResolvedValue(mockBasicChartResponse);

      // Act
      await controller.generateChartAnonymous(
        mockGenerateChartDto,
        'fingerprint-789',
      );

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('fingerprint-789'),
      );
    });
  });

  // ============================================================================
  // POST /birth-chart/pdf - Descargar PDF
  // ============================================================================

  describe('POST /birth-chart/pdf', () => {
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });

    it('should generate PDF for free user', async () => {
      // Arrange
      const freeUser = {
        userId: 1,
        email: 'free@example.com',
        plan: UserPlan.FREE,
      };
      const pdfBuffer = Buffer.from('PDF content');
      mockFacadeService.generatePdf.mockResolvedValue({
        buffer: pdfBuffer,
        filename: 'carta-astral-maria-garcia.pdf',
      });

      // Act
      await controller.downloadPdf(
        mockGenerateChartDto,
        freeUser,
        mockResponse as Response,
      );

      // Assert
      expect(mockFacadeService.generatePdf).toHaveBeenCalledWith(
        mockGenerateChartDto,
        freeUser,
        false, // isPremium = false
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename="carta-astral-maria-garcia.pdf"',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(pdfBuffer);
    });

    it('should generate PDF for premium user with AI synthesis', async () => {
      // Arrange
      const premiumUser = {
        userId: 1,
        email: 'premium@example.com',
        plan: UserPlan.PREMIUM,
      };
      const pdfBuffer = Buffer.from('Premium PDF content');
      mockFacadeService.generatePdf.mockResolvedValue({
        buffer: pdfBuffer,
        filename: 'carta-astral-maria-garcia-premium.pdf',
      });

      // Act
      await controller.downloadPdf(
        mockGenerateChartDto,
        premiumUser,
        mockResponse as Response,
      );

      // Assert
      expect(mockFacadeService.generatePdf).toHaveBeenCalledWith(
        mockGenerateChartDto,
        premiumUser,
        true, // isPremium = true
      );
      expect(mockResponse.send).toHaveBeenCalledWith(pdfBuffer);
    });

    it('should log PDF generation with user email', async () => {
      // Arrange
      const logSpy = jest.spyOn(controller['logger'], 'log');
      const user = {
        userId: 1,
        email: 'test@example.com',
        plan: UserPlan.FREE,
      };
      mockFacadeService.generatePdf.mockResolvedValue({
        buffer: Buffer.from('PDF'),
        filename: 'test.pdf',
      });

      // Act
      await controller.downloadPdf(
        mockGenerateChartDto,
        user,
        mockResponse as Response,
      );

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('test@example.com'),
      );
    });
  });

  // ============================================================================
  // GET /birth-chart/geocode - Búsqueda de lugares
  // ============================================================================

  describe('GET /birth-chart/geocode', () => {
    it('should search places by query', async () => {
      // Arrange
      const geocodeDto = { query: 'Buenos Aires' };
      const mockResults = {
        results: [mockGeocodedPlace],
        count: 1,
      };
      mockGeocodeService.searchPlaces.mockResolvedValue(mockResults);

      // Act
      const result = await controller.searchPlace(geocodeDto);

      // Assert
      expect(mockGeocodeService.searchPlaces).toHaveBeenCalledWith(
        'Buenos Aires',
      );
      expect(result).toEqual(mockResults);
    });

    it('should return empty results when no places found', async () => {
      // Arrange
      const geocodeDto = { query: 'NonexistentPlace123' };
      mockGeocodeService.searchPlaces.mockResolvedValue({
        results: [],
        count: 0,
      });

      // Act
      const result = await controller.searchPlace(geocodeDto);

      // Assert
      expect(result.count).toBe(0);
      expect(result.results).toEqual([]);
    });
  });

  // ============================================================================
  // GET /birth-chart/usage - Consultar límites de uso
  // ============================================================================

  describe('GET /birth-chart/usage', () => {
    it('should return usage status for authenticated user', async () => {
      // Arrange
      const user = {
        userId: 1,
        email: 'user@example.com',
        plan: UserPlan.FREE,
      };
      const mockUsage = {
        plan: 'free',
        used: 2,
        limit: 3,
        remaining: 1,
        resetsAt: '2026-03-01T00:00:00Z',
        canGenerate: true,
      };
      mockFacadeService.getUsageStatus.mockResolvedValue(mockUsage);

      // Act
      const result = await controller.getUsage(user, 'fingerprint-123');

      // Assert
      expect(mockFacadeService.getUsageStatus).toHaveBeenCalledWith(
        user,
        'fingerprint-123',
      );
      expect(result).toEqual(mockUsage);
    });

    it('should return usage status for anonymous user', async () => {
      // Arrange
      const mockUsage = {
        plan: 'anonymous',
        used: 1,
        limit: 1,
        remaining: 0,
        resetsAt: null,
        canGenerate: false,
      };
      mockFacadeService.getUsageStatus.mockResolvedValue(mockUsage);

      // Act
      const result = await controller.getUsage(null, 'fingerprint-456');

      // Assert
      expect(mockFacadeService.getUsageStatus).toHaveBeenCalledWith(
        null,
        'fingerprint-456',
      );
      expect((result as any).canGenerate).toBe(false);
    });
  });

  // ============================================================================
  // POST /birth-chart/synthesis - Generar síntesis IA (Premium only)
  // ============================================================================

  describe('POST /birth-chart/synthesis', () => {
    it('should generate AI synthesis for premium user', async () => {
      // Arrange
      const premiumUser = {
        userId: 1,
        email: 'premium@example.com',
        plan: UserPlan.PREMIUM,
      };
      const mockSynthesis = {
        synthesis: 'Tu carta revela una personalidad...',
        generatedAt: '2026-02-06T12:00:00Z',
        provider: 'groq',
      };
      mockFacadeService.generateSynthesisOnly.mockResolvedValue(mockSynthesis);

      // Act
      const result = await controller.generateSynthesis(
        mockGenerateChartDto,
        premiumUser,
      );

      // Assert
      expect(mockFacadeService.generateSynthesisOnly).toHaveBeenCalledWith(
        mockGenerateChartDto,
        premiumUser.userId,
      );
      expect(result).toEqual(mockSynthesis);
    });

    it('should log synthesis generation with user email', async () => {
      // Arrange
      const logSpy = jest.spyOn(controller['logger'], 'log');
      const premiumUser = {
        userId: 1,
        email: 'premium@example.com',
        plan: UserPlan.PREMIUM,
      };
      mockFacadeService.generateSynthesisOnly.mockResolvedValue({
        synthesis: 'Test synthesis',
        generatedAt: '2026-02-06T12:00:00Z',
        provider: 'groq',
      });

      // Act
      await controller.generateSynthesis(mockGenerateChartDto, premiumUser);

      // Assert
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('premium@example.com'),
      );
    });
  });

  // ============================================================================
  // Tests de validación de parámetros
  // ============================================================================
});
