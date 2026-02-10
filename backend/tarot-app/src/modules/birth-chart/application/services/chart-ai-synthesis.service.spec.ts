import { Test, TestingModule } from '@nestjs/testing';
import { ChartAISynthesisService } from './chart-ai-synthesis.service';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import { ChartData, PlanetPosition } from '../../entities/birth-chart.entity';
import { Planet, ZodiacSign } from '../../domain/enums';
import {
  FullChartInterpretation,
  BigThreeInterpretation,
} from './chart-interpretation.service';
import { AIProviderType } from '../../../ai/domain/interfaces/ai-provider.interface';

describe('ChartAISynthesisService', () => {
  let service: ChartAISynthesisService;
  let mockAIProvider: jest.Mocked<AIProviderService>;

  // Mock data
  const mockPlanetPosition: PlanetPosition = {
    planet: Planet.SUN,
    longitude: 150.5,
    sign: ZodiacSign.LEO,
    signDegree: 0.5,
    house: 1,
    isRetrograde: false,
  };

  const mockChartData: ChartData = {
    planets: [mockPlanetPosition],
    houses: [],
    aspects: [],
    ascendant: {
      planet: 'ascendant',
      longitude: 0,
      sign: ZodiacSign.ARIES,
      signDegree: 0,
      house: 1,
      isRetrograde: false,
    },
    midheaven: {
      planet: 'midheaven',
      longitude: 270,
      sign: ZodiacSign.CAPRICORN,
      signDegree: 0,
      house: 10,
      isRetrograde: false,
    },
    distribution: {
      elements: { fire: 3, earth: 2, air: 4, water: 2 },
      modalities: { cardinal: 3, fixed: 5, mutable: 3 },
      polarity: { masculine: 7, feminine: 4 },
    },
  };

  const mockBigThree: BigThreeInterpretation = {
    sun: {
      sign: ZodiacSign.LEO,
      signName: 'Leo',
      interpretation: 'Tu Sol en Leo representa liderazgo y creatividad.',
    },
    moon: {
      sign: ZodiacSign.SCORPIO,
      signName: 'Escorpio',
      interpretation: 'Tu Luna en Escorpio indica emociones profundas.',
    },
    ascendant: {
      sign: ZodiacSign.ARIES,
      signName: 'Aries',
      interpretation: 'Tu Ascendente en Aries muestra iniciativa.',
    },
  };

  const mockInterpretation: FullChartInterpretation = {
    bigThree: mockBigThree,
    planets: [],
    distribution: {
      elements: [
        { name: 'Fuego', count: 3, percentage: 27 },
        { name: 'Tierra', count: 2, percentage: 18 },
        { name: 'Aire', count: 4, percentage: 36 },
        { name: 'Agua', count: 2, percentage: 18 },
      ],
      modalities: [
        { name: 'Cardinal', count: 3, percentage: 27 },
        { name: 'Fijo', count: 5, percentage: 45 },
        { name: 'Mutable', count: 3, percentage: 27 },
      ],
    },
    aspectSummary: {
      total: 10,
      harmonious: 6,
      challenging: 4,
    },
  };

  beforeEach(async () => {
    // Mock AIProviderService
    mockAIProvider = {
      generateCompletion: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartAISynthesisService,
        {
          provide: AIProviderService,
          useValue: mockAIProvider,
        },
      ],
    }).compile();

    service = module.get<ChartAISynthesisService>(ChartAISynthesisService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateSynthesis', () => {
    it('should generate AI synthesis successfully', async () => {
      // Arrange
      const mockAIResponse = {
        content: 'Tu carta natal muestra una combinación única...',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 500, completion: 300, total: 800 },
        durationMs: 1200,
      };

      mockAIProvider.generateCompletion.mockResolvedValue(mockAIResponse);

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Juan',
        birthDate: new Date('1990-05-15'),
      };

      // Act
      const result = await service.generateSynthesis(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.synthesis).toBe(mockAIResponse.content);
      expect(result.provider).toBe(AIProviderType.GROQ);
      expect(result.tokensUsed).toBe(800);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(mockAIProvider.generateCompletion).toHaveBeenCalledTimes(1);
    });

    it('should generate synthesis with userId when provided', async () => {
      // Arrange
      const mockAIResponse = {
        content: 'Síntesis generada',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 500, completion: 300, total: 800 },
        durationMs: 1200,
      };

      mockAIProvider.generateCompletion.mockResolvedValue(mockAIResponse);

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
      };

      const userId = 123;

      // Act
      await service.generateSynthesis(input, userId);

      // Assert
      expect(mockAIProvider.generateCompletion).toHaveBeenCalledWith(
        expect.any(Array), // messages
        userId,
        null, // readingId
        expect.objectContaining({
          maxTokens: expect.any(Number),
          temperature: expect.any(Number),
        }),
      );
    });

    it('should include all data in prompt', async () => {
      // Arrange
      const mockAIResponse = {
        content: 'Síntesis',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 500, completion: 300, total: 800 },
        durationMs: 1200,
      };

      mockAIProvider.generateCompletion.mockResolvedValue(mockAIResponse);

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'María',
        birthDate: new Date('1985-03-20'),
      };

      // Act
      await service.generateSynthesis(input);

      // Assert
      const callArgs = mockAIProvider.generateCompletion.mock.calls[0];
      const messages = callArgs[0];

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');

      // Verificar que el prompt de usuario contiene datos clave
      const userPrompt = messages[1].content;
      expect(userPrompt).toContain('María');
      expect(userPrompt).toContain('Leo');
      expect(userPrompt).toContain('Escorpio');
      expect(userPrompt).toContain('Aries');
    });

    it('should throw error when AI service fails', async () => {
      // Arrange
      mockAIProvider.generateCompletion.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
      };

      // Act & Assert
      await expect(service.generateSynthesis(input)).rejects.toThrow(
        'AI synthesis generation failed',
      );
    });

    it('should use correct configuration for AI call', async () => {
      // Arrange
      const mockAIResponse = {
        content: 'Síntesis',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 500, completion: 300, total: 800 },
        durationMs: 1200,
      };

      mockAIProvider.generateCompletion.mockResolvedValue(mockAIResponse);

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
      };

      // Act
      await service.generateSynthesis(input);

      // Assert
      const callArgs = mockAIProvider.generateCompletion.mock.calls[0];
      const config = callArgs[3];

      expect(config).toBeDefined();
      expect(config!.maxTokens).toBe(1500);
      expect(config!.temperature).toBe(0.7);
    });
  });

  describe('validateSynthesis', () => {
    it('should validate valid synthesis', () => {
      // Arrange
      const synthesis =
        'Tu carta natal revela una personalidad con el Sol en Leo, lo que define tu esencia central y tu expresión más auténtica. La Luna en Escorpio añade profundidad emocional y una capacidad extraordinaria para transformar las experiencias de vida en sabiduría interior. El Ascendente en Aries te da una energía iniciadora y un impulso natural hacia la acción inmediata. Esta combinación crea un perfil único que integra liderazgo carismático, intensidad emocional profunda y valentía inquebrantable frente a los desafíos de la vida cotidiana y espiritual que enfrentas día a día.';

      // Act
      const result = service.validateSynthesis(synthesis);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject synthesis that is too short', () => {
      // Arrange
      const synthesis = 'Texto muy corto';

      // Act
      const result = service.validateSynthesis(synthesis);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Synthesis too short (< 500 characters)');
    });

    it('should reject synthesis with placeholders', () => {
      // Arrange
      const synthesis =
        'Tu carta natal revela [PLACEHOLDER]. Tu Sol en [SIGNO] indica liderazgo. Esta síntesis es suficientemente larga para pasar la validación de longitud mínima de 500 caracteres. Necesitamos más texto aquí para asegurarnos de que pasa la validación de longitud. Agregamos más contenido para superar el límite de 500 caracteres requeridos. Texto adicional para cumplir con el requisito. Más texto aquí. Y más texto. Continuamos escribiendo para llegar a los 500 caracteres necesarios para la validación.';

      // Act
      const result = service.validateSynthesis(synthesis);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.issues).toContain(
        'Synthesis contains potential placeholders',
      );
    });

    it('should detect synthesis not in Spanish', () => {
      // Arrange
      const synthesis =
        'Your birth chart reveals a unique combination of planetary energies. The Sun in Leo defines your core essence and leadership qualities. The Moon in Scorpio adds emotional depth and intensity. The Ascendant in Aries gives you an initiating energy that propels you forward. This combination creates a dynamic personality profile that integrates creativity, emotional complexity, and courage in facing new challenges.';

      // Act
      const result = service.validateSynthesis(synthesis);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Synthesis might not be in Spanish');
    });

    it('should validate synthesis with valid Spanish text', () => {
      // Arrange
      const synthesis =
        'Tu carta natal revela una personalidad con el Sol en Leo, que define tu esencia central y cualidades naturales de liderazgo carismático. La Luna en Escorpio añade profundidad emocional e intensidad transformadora que caracteriza tus respuestas ante las situaciones de la vida. El Ascendente en Aries te da una energía iniciadora poderosa que te impulsa constantemente hacia adelante en tus objetivos. Esta combinación crea un perfil de personalidad dinámico y multifacético que integra creatividad artística, complejidad emocional profunda y valentía notable al enfrentar nuevos desafíos y oportunidades. Tu distribución elemental muestra un equilibrio interesante entre los diferentes componentes de tu ser.';

      // Act
      const result = service.validateSynthesis(synthesis);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('generateFallbackSynthesis', () => {
    it('should generate fallback synthesis', () => {
      // Act
      const result = service.generateFallbackSynthesis(mockInterpretation);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(500);
      expect(result).toContain('Leo');
      expect(result).toContain('Escorpio');
      expect(result).toContain('Aries');
    });

    it('should include distribution information', () => {
      // Act
      const result = service.generateFallbackSynthesis(mockInterpretation);

      // Assert
      expect(result).toContain('Aire'); // Elemento dominante
    });

    it('should include aspect balance', () => {
      // Act
      const result = service.generateFallbackSynthesis(mockInterpretation);

      // Assert
      expect(result).toContain('6'); // Aspectos armónicos
      expect(result).toContain('4'); // Aspectos desafiantes
    });

    it('should be in Spanish', () => {
      // Act
      const result = service.generateFallbackSynthesis(mockInterpretation);

      // Assert
      expect(result).toMatch(/\bel\b/);
      expect(result).toMatch(/\bla\b/);
      expect(result).toMatch(/\btu\b/);
    });
  });

  describe('edge cases', () => {
    it('should handle synthesis without userName', async () => {
      // Arrange
      const mockAIResponse = {
        content: 'Síntesis sin nombre',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 500, completion: 300, total: 800 },
        durationMs: 1200,
      };

      mockAIProvider.generateCompletion.mockResolvedValue(mockAIResponse);

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
      };

      // Act
      const result = await service.generateSynthesis(input);

      // Assert
      expect(result.synthesis).toBe(mockAIResponse.content);
    });

    it('should handle synthesis without birthDate', async () => {
      // Arrange
      const mockAIResponse = {
        content: 'Síntesis sin fecha',
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 500, completion: 300, total: 800 },
        durationMs: 1200,
      };

      mockAIProvider.generateCompletion.mockResolvedValue(mockAIResponse);

      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Pedro',
      };

      // Act
      const result = await service.generateSynthesis(input);

      // Assert
      expect(result.synthesis).toBe(mockAIResponse.content);
    });

    it('should handle chart with no aspects', () => {
      // Arrange
      const interpretationNoAspects: FullChartInterpretation = {
        ...mockInterpretation,
        aspectSummary: {
          total: 0,
          harmonious: 0,
          challenging: 0,
        },
      };

      // Act
      const result = service.generateFallbackSynthesis(interpretationNoAspects);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
