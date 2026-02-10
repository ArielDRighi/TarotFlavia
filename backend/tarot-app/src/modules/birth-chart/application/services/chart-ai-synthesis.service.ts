import { Injectable, Logger } from '@nestjs/common';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import { AIMessage } from '../../../ai/domain/interfaces/ai-provider.interface';
import { ChartData } from '../../entities/birth-chart.entity';
import {
  ZodiacSign,
  Planet,
  AspectType,
  ZodiacSignMetadata,
  PlanetMetadata,
  AspectTypeMetadata,
} from '../../domain/enums';
import { FullChartInterpretation } from './chart-interpretation.service';

export interface AISynthesisInput {
  chartData: ChartData;
  interpretation: FullChartInterpretation;
  userName?: string;
  birthDate?: Date;
}

export interface AISynthesisResult {
  synthesis: string;
  tokensUsed: number;
  provider: string;
  model: string;
  durationMs: number;
}

/**
 * Servicio de síntesis de carta astral con IA
 *
 * Genera una síntesis personalizada que conecta los diferentes elementos
 * de una carta astral usando inteligencia artificial. Solo disponible
 * para usuarios Premium.
 *
 * @example
 * const result = await service.generateSynthesis({
 *   chartData,
 *   interpretation,
 *   userName: 'María',
 *   birthDate: new Date('1990-05-15')
 * }, userId);
 *
 * console.log(result.synthesis); // Texto personalizado de 3-5 párrafos
 */
@Injectable()
export class ChartAISynthesisService {
  private readonly logger = new Logger(ChartAISynthesisService.name);

  // Configuración de la síntesis
  private readonly MAX_TOKENS = 1500;
  private readonly TEMPERATURE = 0.7;

  constructor(private readonly aiProvider: AIProviderService) {}

  /**
   * Genera síntesis personalizada con IA
   *
   * Incluye validación automática del resultado y fallback si la IA falla
   * o genera contenido inválido.
   */
  async generateSynthesis(
    input: AISynthesisInput,
    userId?: number,
  ): Promise<AISynthesisResult> {
    this.logger.log('Generating AI synthesis for birth chart');

    const startTime = Date.now();

    try {
      // 1. Construir el prompt
      const messages = this.buildPrompt(input);

      // 2. Llamar al servicio de IA
      const response = await this.aiProvider.generateCompletion(
        messages,
        userId,
        null, // No hay readingId para cartas astrales
        {
          maxTokens: this.MAX_TOKENS,
          temperature: this.TEMPERATURE,
        },
      );

      const durationMs = Date.now() - startTime;

      // 3. Validar la síntesis generada
      const validation = this.validateSynthesis(response.content);

      if (!validation.valid) {
        this.logger.warn(
          `AI synthesis validation failed: ${validation.issues.join(', ')}. Using fallback.`,
        );

        // Usar fallback si la validación falla
        const fallbackSynthesis = this.generateFallbackSynthesis(input);

        return {
          synthesis: fallbackSynthesis,
          tokensUsed: 0,
          provider: 'fallback',
          model: 'rule-based',
          durationMs,
        };
      }

      this.logger.log(
        `AI synthesis generated in ${durationMs}ms using ${response.provider} (${response.model}), tokens: ${response.tokensUsed.total}`,
      );

      return {
        synthesis: response.content,
        tokensUsed: response.tokensUsed.total,
        provider: response.provider,
        model: response.model,
        durationMs,
      };
    } catch (error) {
      this.logger.error('Error generating AI synthesis:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Intentar síntesis de fallback si la IA falla
      try {
        const fallbackSynthesis = this.generateFallbackSynthesis(input);
        const durationMs = Date.now() - startTime;

        this.logger.warn(
          `Using fallback synthesis due to AI error: ${errorMessage}`,
        );

        return {
          synthesis: fallbackSynthesis,
          tokensUsed: 0,
          provider: 'fallback',
          model: 'rule-based',
          durationMs,
        };
      } catch (fallbackError) {
        this.logger.error(
          'Fallback synthesis generation also failed:',
          fallbackError,
        );
        const fallbackErrorMessage =
          fallbackError instanceof Error
            ? fallbackError.message
            : 'Unknown fallback error';
        throw new Error(
          `AI synthesis generation failed: ${errorMessage}. Fallback synthesis also failed: ${fallbackErrorMessage}`,
        );
      }
    }
  }

  /**
   * Construye los mensajes del prompt para la IA
   */
  private buildPrompt(input: AISynthesisInput): AIMessage[] {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(input);

    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];
  }

  /**
   * Construye el prompt de sistema
   */
  private buildSystemPrompt(): string {
    return `Eres un astrólogo profesional con profundo conocimiento de astrología occidental. Tu tarea es crear una síntesis personalizada de una carta natal.

INSTRUCCIONES:
1. Escribe en segunda persona, hablándole directamente a la persona.
2. Conecta los diferentes elementos de la carta entre sí, mostrando cómo interactúan.
3. Identifica patrones o temas recurrentes en la carta.
4. Usa un tono cálido, empoderador y perspicaz.
5. Evita predicciones concretas o deterministas.
6. No repitas la información que ya se le mostró en las interpretaciones individuales.
7. Enfócate en la integración y síntesis de los elementos.
8. La respuesta debe ser de 3-5 párrafos sustanciales.
9. Escribe en español.

ESTRUCTURA SUGERIDA:
- Párrafo 1: Tema central o hilo conductor de la carta
- Párrafo 2: Cómo interactúan tus luminarias (Sol y Luna) con tu Ascendente
- Párrafo 3: Patrones en los aspectos más significativos
- Párrafo 4: Tu distribución de elementos y cómo te afecta
- Párrafo 5: Mensaje integrador final

NO incluyas:
- Saludos o despedidas
- Menciones de que eres una IA
- Disclaimers legales
- Referencias a "esta síntesis" o "este análisis"`;
  }

  /**
   * Construye el prompt del usuario con los datos de la carta
   */
  private buildUserPrompt(input: AISynthesisInput): string {
    const { chartData, interpretation, userName, birthDate } = input;

    // Formatear el Big Three
    const bigThree = `
SOL EN ${interpretation.bigThree.sun.signName.toUpperCase()}:
${interpretation.bigThree.sun.interpretation}

LUNA EN ${interpretation.bigThree.moon.signName.toUpperCase()}:
${interpretation.bigThree.moon.interpretation}

ASCENDENTE EN ${interpretation.bigThree.ascendant.signName.toUpperCase()}:
${interpretation.bigThree.ascendant.interpretation}`;

    // Formatear posiciones planetarias
    const positions = chartData.planets
      .map((p) => {
        const planetName = PlanetMetadata[p.planet as Planet]?.name || p.planet;
        const signName =
          ZodiacSignMetadata[p.sign as ZodiacSign]?.name || p.sign;
        const retro = p.isRetrograde ? ' (R)' : '';
        return `${planetName}: ${signName} en Casa ${p.house}${retro}`;
      })
      .join('\n');

    // Formatear aspectos principales (solo los más fuertes)
    const strongAspects = chartData.aspects
      .filter((a) => a.orb <= 5) // Solo aspectos con orbe <= 5°
      .slice(0, 10) // Máximo 10 aspectos
      .map((a) => {
        const p1 = PlanetMetadata[a.planet1 as Planet]?.name || a.planet1;
        const p2 = PlanetMetadata[a.planet2 as Planet]?.name || a.planet2;
        const aspectName =
          AspectTypeMetadata[a.aspectType as AspectType]?.name || a.aspectType;
        return `${p1} ${aspectName} ${p2} (orbe: ${a.orb}°)`;
      })
      .join('\n');

    // Formatear distribución
    const distribution = `
ELEMENTOS:
- Fuego: ${chartData.distribution.elements.fire} planetas
- Tierra: ${chartData.distribution.elements.earth} planetas
- Aire: ${chartData.distribution.elements.air} planetas
- Agua: ${chartData.distribution.elements.water} planetas

MODALIDADES:
- Cardinal: ${chartData.distribution.modalities.cardinal} planetas
- Fijo: ${chartData.distribution.modalities.fixed} planetas
- Mutable: ${chartData.distribution.modalities.mutable} planetas`;

    // Formatear fecha de forma determinista (ISO format)
    const birthDateFormatted = birthDate
      ? birthDate.toISOString().split('T')[0]
      : undefined;

    // Construir prompt completo
    return `Genera una síntesis personalizada para la siguiente carta natal:

${userName ? `NOMBRE: ${userName}` : ''}
${birthDateFormatted ? `FECHA DE NACIMIENTO: ${birthDateFormatted}` : ''}

=== BIG THREE ===
${bigThree}

=== POSICIONES PLANETARIAS ===
${positions}

=== ASPECTOS PRINCIPALES ===
${strongAspects}

=== DISTRIBUCIÓN ===
${distribution}

=== BALANCE DE ASPECTOS ===
- Total de aspectos: ${interpretation.aspectSummary.total}
- Aspectos armónicos: ${interpretation.aspectSummary.harmonious}
- Aspectos desafiantes: ${interpretation.aspectSummary.challenging}

Genera la síntesis ahora:`;
  }

  /**
   * Valida si el resultado de la IA es aceptable
   */
  validateSynthesis(synthesis: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Verificar longitud mínima
    if (synthesis.length < 500) {
      issues.push('Synthesis too short (< 500 characters)');
    }

    // Verificar que no contenga placeholders
    if (synthesis.includes('[') && synthesis.includes(']')) {
      issues.push('Synthesis contains potential placeholders');
    }

    // Verificar que esté en español
    const spanishIndicators = ['el', 'la', 'de', 'que', 'tu', 'en'];
    const lowerSynthesis = synthesis.toLowerCase();
    const hasSpanish = spanishIndicators.some(
      (word) =>
        lowerSynthesis.includes(` ${word} `) ||
        lowerSynthesis.startsWith(`${word} `) ||
        lowerSynthesis.includes(` ${word}.`) ||
        lowerSynthesis.includes(` ${word},`),
    );
    if (!hasSpanish) {
      issues.push('Synthesis might not be in Spanish');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Genera síntesis de fallback si la IA falla o valida mal
   *
   * Esta síntesis es determinística y no depende de proveedores externos.
   */
  generateFallbackSynthesis(input: AISynthesisInput): string {
    const { interpretation } = input;
    const { bigThree, distribution, aspectSummary } = interpretation;

    const dominantElement = this.findDominant(distribution.elements);
    const dominantModality = this.findDominant(distribution.modalities);

    return `Tu carta natal revela una personalidad con el Sol en ${bigThree.sun.signName}, lo que define tu esencia central, combinada con una Luna en ${bigThree.moon.signName} que colorea tu mundo emocional, y un Ascendente en ${bigThree.ascendant.signName} que moldea cómo te presentas al mundo.

Con una predominancia del elemento ${dominantElement.name} en tu carta, tiendes a procesar la vida principalmente a través de ${this.getElementDescription(dominantElement.name)}. La modalidad ${dominantModality.name} dominante sugiere que tu forma de actuar es principalmente ${this.getModalityDescription(dominantModality.name)}.

En cuanto a tus aspectos planetarios, tienes ${aspectSummary.harmonious} aspectos armónicos y ${aspectSummary.challenging} aspectos desafiantes, lo que indica ${aspectSummary.harmonious > aspectSummary.challenging ? 'un flujo relativamente fácil de energía en tu carta' : 'oportunidades de crecimiento a través de la tensión creativa'}.

Esta combinación única de energías te hace una persona singular, con talentos y desafíos específicos que forman parte de tu camino de desarrollo personal.`;
  }

  /**
   * Encuentra el elemento/modalidad dominante
   */
  private findDominant(items: { name: string; count: number }[]): {
    name: string;
    count: number;
  } {
    return items.reduce((max, item) => (item.count > max.count ? item : max));
  }

  /**
   * Descripción de elemento
   */
  private getElementDescription(element: string): string {
    const descriptions: Record<string, string> = {
      Fuego: 'la acción, la inspiración y el entusiasmo',
      Tierra: 'lo práctico, lo tangible y la estabilidad',
      Aire: 'las ideas, la comunicación y las conexiones',
      Agua: 'las emociones, la intuición y la profundidad',
    };
    return descriptions[element] || 'tu forma única de ser';
  }

  /**
   * Descripción de modalidad
   */
  private getModalityDescription(modality: string): string {
    const descriptions: Record<string, string> = {
      Cardinal: 'iniciadora y emprendedora',
      Fijo: 'persistente y determinada',
      Mutable: 'adaptable y flexible',
    };
    return descriptions[modality] || 'única';
  }
}
