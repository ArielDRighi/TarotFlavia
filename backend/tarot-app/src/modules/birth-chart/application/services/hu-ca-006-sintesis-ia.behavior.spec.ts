/**
 * Tests de Comportamiento - HU-CA-006: Recibir Síntesis Personalizada con IA
 *
 * "Como usuario Premium
 *  Quiero recibir una síntesis que conecte todos los elementos de mi carta
 *  Para obtener una interpretación única y personalizada"
 */
import { Test } from '@nestjs/testing';
import {
  ChartAISynthesisService,
  AISynthesisInput,
} from './chart-ai-synthesis.service';
import { FullChartInterpretation } from './chart-interpretation.service';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import { Planet, ZodiacSign, AspectType } from '../../domain/enums';
import { AIProviderType } from '../../../ai/domain/interfaces/ai-provider.interface';
import { ChartData } from '../../entities/birth-chart.entity';

/**
 * Helper: crea datos de carta y interpretación realistas para el test
 */
function createTestInput(): AISynthesisInput {
  const chartData: ChartData = {
    planets: [
      {
        planet: Planet.SUN,
        longitude: 65,
        sign: ZodiacSign.GEMINI,
        signDegree: 5,
        house: 10,
        isRetrograde: false,
      },
      {
        planet: Planet.MOON,
        longitude: 220,
        sign: ZodiacSign.SCORPIO,
        signDegree: 10,
        house: 3,
        isRetrograde: false,
      },
      {
        planet: Planet.MERCURY,
        longitude: 75,
        sign: ZodiacSign.GEMINI,
        signDegree: 15,
        house: 10,
        isRetrograde: false,
      },
      {
        planet: Planet.VENUS,
        longitude: 40,
        sign: ZodiacSign.TAURUS,
        signDegree: 10,
        house: 9,
        isRetrograde: false,
      },
      {
        planet: Planet.MARS,
        longitude: 15,
        sign: ZodiacSign.ARIES,
        signDegree: 15,
        house: 8,
        isRetrograde: false,
      },
      {
        planet: Planet.JUPITER,
        longitude: 250,
        sign: ZodiacSign.SAGITTARIUS,
        signDegree: 10,
        house: 4,
        isRetrograde: false,
      },
      {
        planet: Planet.SATURN,
        longitude: 290,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 20,
        house: 5,
        isRetrograde: true,
      },
      {
        planet: Planet.URANUS,
        longitude: 278,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 8,
        house: 5,
        isRetrograde: false,
      },
      {
        planet: Planet.NEPTUNE,
        longitude: 284,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 14,
        house: 5,
        isRetrograde: false,
      },
      {
        planet: Planet.PLUTO,
        longitude: 226,
        sign: ZodiacSign.SCORPIO,
        signDegree: 16,
        house: 3,
        isRetrograde: false,
      },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      longitude: i * 30,
      sign: Object.values(ZodiacSign)[i],
      signDegree: 0,
    })),
    aspects: [
      {
        planet1: Planet.SUN,
        planet2: Planet.MERCURY,
        aspectType: AspectType.CONJUNCTION,
        angle: 10,
        orb: 10,
        isApplying: true,
      },
      {
        planet1: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.TRINE,
        angle: 120,
        orb: 3,
        isApplying: false,
      },
    ],
    ascendant: {
      planet: 'ascendant',
      longitude: 165,
      sign: ZodiacSign.VIRGO,
      signDegree: 15,
      house: 1,
      isRetrograde: false,
    },
    midheaven: {
      planet: 'midheaven',
      longitude: 75,
      sign: ZodiacSign.GEMINI,
      signDegree: 15,
      house: 10,
      isRetrograde: false,
    },
    distribution: {
      elements: { fire: 2, earth: 4, air: 2, water: 3 },
      modalities: { cardinal: 3, fixed: 4, mutable: 4 },
      polarity: { masculine: 4, feminine: 7 },
    },
  };

  const interpretation: FullChartInterpretation = {
    bigThree: {
      sun: {
        sign: ZodiacSign.GEMINI,
        signName: 'Géminis',
        interpretation: 'Tu Sol en Géminis te hace curioso y comunicativo...',
      },
      moon: {
        sign: ZodiacSign.SCORPIO,
        signName: 'Escorpio',
        interpretation:
          'Tu Luna en Escorpio revela emociones profundas e intensas...',
      },
      ascendant: {
        sign: ZodiacSign.VIRGO,
        signName: 'Virgo',
        interpretation:
          'Tu Ascendente en Virgo te presenta al mundo como analítico...',
      },
    },
    planets: [],
    distribution: {
      elements: [
        { name: 'Fuego', count: 2, percentage: 18 },
        { name: 'Tierra', count: 4, percentage: 36 },
        { name: 'Aire', count: 2, percentage: 18 },
        { name: 'Agua', count: 3, percentage: 27 },
      ],
      modalities: [
        { name: 'Cardinal', count: 3, percentage: 27 },
        { name: 'Fijo', count: 4, percentage: 36 },
        { name: 'Mutable', count: 4, percentage: 36 },
      ],
    },
    aspectSummary: {
      total: 2,
      harmonious: 1,
      challenging: 0,
    },
  };

  return {
    chartData,
    interpretation,
    userName: 'María García',
    birthDate: new Date('1990-05-15'),
  };
}

describe('HU-CA-006: Recibir Síntesis Personalizada con IA (Comportamiento)', () => {
  let service: ChartAISynthesisService;
  let mockAiProvider: jest.Mocked<AIProviderService>;

  const validSpanishSynthesis = `Tu carta natal revela una personalidad compleja donde la curiosidad intelectual de tu Sol en Géminis se entrelaza con la profundidad emocional de tu Luna en Escorpio. Esta combinación te otorga una capacidad única para investigar y comunicar verdades profundas.

Tu Ascendente en Virgo añade una capa de análisis metódico a tu naturaleza. Mientras tu Sol busca información y conexiones, tu Ascendente te impulsa a procesarla de manera organizada y práctica. La gente te percibe como alguien competente y servicial.

Los aspectos en tu carta muestran una interesante dinámica entre tus luminarias. La energía mental de Géminis con la intensidad emocional de Escorpio genera una tensión creativa que te impulsa a transformar ideas en experiencias profundas.

Con una predominancia de Tierra en tu carta, buscas seguridad y resultados tangibles. Sin embargo, tu elemento Agua te conecta con la intuición y la profundidad emocional, creando un balance entre lo práctico y lo emocional.

En síntesis, tu carta natal habla de una persona que combina intelecto brillante con profundidad emocional, manifestándose al mundo de manera práctica y servicial.`;

  beforeEach(async () => {
    mockAiProvider = {
      generateCompletion: jest.fn().mockResolvedValue({
        content: validSpanishSynthesis,
        provider: AIProviderType.GROQ,
        model: 'llama-3.1-70b',
        tokensUsed: { prompt: 800, completion: 400, total: 1200 },
        durationMs: 500,
      }),
    } as unknown as jest.Mocked<AIProviderService>;

    const module = await Test.createTestingModule({
      providers: [
        ChartAISynthesisService,
        { provide: AIProviderService, useValue: mockAiProvider },
      ],
    }).compile();

    service = module.get(ChartAISynthesisService);
  });

  // =========================================================================
  // CA-1: "Cuando genero mi carta, veo sección Síntesis Personalizada"
  // =========================================================================
  describe('CA-1: Generación de síntesis para Premium', () => {
    it('dado que soy Premium, cuando genero la síntesis, entonces obtengo un resultado con texto', async () => {
      const input = createTestInput();
      const result = await service.generateSynthesis(input, 1);

      expect(result).toBeDefined();
      expect(result.synthesis).toBeTruthy();
      expect(result.synthesis.length).toBeGreaterThan(100);
    });

    it('dado que la síntesis fue generada, entonces incluye metadata del proveedor', async () => {
      const input = createTestInput();
      const result = await service.generateSynthesis(input, 1);

      expect(result.provider).toBeTruthy();
      expect(result.model).toBeTruthy();
      expect(result.tokensUsed).toBeGreaterThanOrEqual(0);
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // Contrato de acceso: la síntesis requiere userId (usuario autenticado)
  // =========================================================================
  describe('Contrato de acceso: requiere userId', () => {
    it('dado que el servicio recibe userId, entonces lo pasa al proveedor de IA', async () => {
      const input = createTestInput();
      await service.generateSynthesis(input, 42);

      const callArgs = mockAiProvider.generateCompletion.mock.calls[0];
      // El segundo argumento es userId
      expect(callArgs[1]).toBe(42);
    });

    it('dado que no se proporciona userId (null), entonces el servicio igualmente genera síntesis', async () => {
      const input = createTestInput();
      const result = await service.generateSynthesis(
        input,
        null as unknown as number,
      );

      // El servicio no rechaza, la validación de plan ocurre en capas superiores
      expect(result).toBeDefined();
      expect(result.synthesis).toBeTruthy();
    });
  });

  // =========================================================================
  // CA-2: "El texto conecta elementos de mi carta entre sí"
  // =========================================================================
  describe('CA-2: Conexión de elementos de la carta', () => {
    it('dado una síntesis generada, entonces el prompt enviado a la IA incluye Big Three', async () => {
      const input = createTestInput();
      await service.generateSynthesis(input, 1);

      const callArgs = mockAiProvider.generateCompletion.mock.calls[0];
      const messages = callArgs[0];

      // El prompt del usuario debe incluir los datos de la carta
      const userMessage = messages.find((m) => m.role === 'user');
      expect(userMessage).toBeDefined();
      expect(userMessage!.content).toContain('GÉMINIS');
      expect(userMessage!.content).toContain('ESCORPIO');
      expect(userMessage!.content).toContain('VIRGO');
    });

    it('dado una síntesis generada, entonces el prompt incluye posiciones planetarias', async () => {
      const input = createTestInput();
      await service.generateSynthesis(input, 1);

      const callArgs = mockAiProvider.generateCompletion.mock.calls[0];
      const userMessage = callArgs[0].find((m) => m.role === 'user');

      expect(userMessage!.content).toContain('POSICIONES PLANETARIAS');
      expect(userMessage!.content).toContain('Sol');
      expect(userMessage!.content).toContain('Luna');
    });

    it('dado una síntesis generada, entonces el prompt incluye distribución', async () => {
      const input = createTestInput();
      await service.generateSynthesis(input, 1);

      const callArgs = mockAiProvider.generateCompletion.mock.calls[0];
      const userMessage = callArgs[0].find((m) => m.role === 'user');

      expect(userMessage!.content).toContain('DISTRIBUCIÓN');
      expect(userMessage!.content).toContain('Fuego');
      expect(userMessage!.content).toContain('Tierra');
    });
  });

  // =========================================================================
  // CA-3: "Texto único de 3-5 párrafos que no podría aplicar a otra persona"
  // =========================================================================
  describe('CA-3: Texto personalizado de 3-5 párrafos', () => {
    it('dado la validación de síntesis, entonces rechaza textos demasiado cortos (<500 chars)', () => {
      const validation = service.validateSynthesis('Texto muy corto.');
      expect(validation.valid).toBe(false);
      expect(validation.issues).toContain(
        'Synthesis too short (< 500 characters)',
      );
    });

    it('dado la validación de síntesis, entonces acepta textos largos en español', () => {
      const validation = service.validateSynthesis(validSpanishSynthesis);
      expect(validation.valid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('dado la validación, entonces detecta si el texto no está en español', () => {
      const englishText =
        'Your chart shows a strong personality with Sun in Gemini. The Moon in Scorpio adds depth. Your Ascendant in Virgo makes you analytical. This combination creates a unique energy pattern that defines your life path. With multiple planets in earth signs you tend to be practical and grounded in your approach to life situations and challenges.';
      const validation = service.validateSynthesis(englishText);
      expect(validation.issues.some((i) => i.includes('Spanish'))).toBe(true);
    });
  });

  // =========================================================================
  // Manejo de errores: si la IA falla, usar fallback
  // =========================================================================
  describe('Manejo de errores y fallback', () => {
    it('dado que la IA falla, entonces genera síntesis de fallback determinística', async () => {
      mockAiProvider.generateCompletion.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      const input = createTestInput();
      const result = await service.generateSynthesis(input, 1);

      // Debe usar fallback, no lanzar error
      expect(result.synthesis).toBeTruthy();
      expect(result.provider).toBe('fallback');
      expect(result.model).toBe('rule-based');
      expect(result.tokensUsed).toBe(0);
    });

    it('dado que la IA genera texto inválido, entonces usa fallback', async () => {
      mockAiProvider.generateCompletion.mockResolvedValue({
        content: 'Too short',
        provider: AIProviderType.GROQ,
        model: 'test',
        tokensUsed: { prompt: 100, completion: 5, total: 105 },
        durationMs: 100,
      });

      const input = createTestInput();
      const result = await service.generateSynthesis(input, 1);

      expect(result.provider).toBe('fallback');
    });

    it('dado el fallback, entonces menciona los signos del Big Three de la persona', () => {
      const input = createTestInput();
      const fallback = service.generateFallbackSynthesis(input);

      expect(fallback).toContain('Géminis');
      expect(fallback).toContain('Escorpio');
      expect(fallback).toContain('Virgo');
    });

    it('dado el fallback, entonces menciona elementos dominantes', () => {
      const input = createTestInput();
      const fallback = service.generateFallbackSynthesis(input);

      // Tierra es el elemento dominante (4 planetas)
      expect(fallback).toContain('Tierra');
    });
  });

  // =========================================================================
  // El prompt del sistema pide escribir en español
  // =========================================================================
  describe('Prompt del sistema', () => {
    it('dado que se genera síntesis, entonces el system prompt pide español y 3-5 párrafos', async () => {
      const input = createTestInput();
      await service.generateSynthesis(input, 1);

      const callArgs = mockAiProvider.generateCompletion.mock.calls[0];
      const systemMessage = callArgs[0].find((m) => m.role === 'system');

      expect(systemMessage).toBeDefined();
      expect(systemMessage!.content).toContain('español');
      expect(systemMessage!.content).toContain('3-5 párrafos');
    });

    it('dado que se genera síntesis, entonces el system prompt instruye conexión de elementos', async () => {
      const input = createTestInput();
      await service.generateSynthesis(input, 1);

      const callArgs = mockAiProvider.generateCompletion.mock.calls[0];
      const systemMessage = callArgs[0].find((m) => m.role === 'system');

      expect(systemMessage!.content).toContain('Conecta');
      expect(systemMessage!.content).toContain('integración');
    });
  });

  // =========================================================================
  // CA-5: "La síntesis se guarda junto con la carta"
  // =========================================================================
  describe('CA-5: Resultado guardable', () => {
    it('dado un resultado exitoso, entonces la síntesis es un string que puede guardarse en chartData.aiSynthesis', async () => {
      const input = createTestInput();
      const result = await service.generateSynthesis(input, 1);

      expect(typeof result.synthesis).toBe('string');
      expect(result.synthesis.length).toBeGreaterThan(0);

      // Simular guardado
      input.chartData.aiSynthesis = result.synthesis;
      expect(input.chartData.aiSynthesis).toBe(result.synthesis);
    });
  });
});
