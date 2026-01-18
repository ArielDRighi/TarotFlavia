import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChineseHoroscope } from '../../entities/chinese-horoscope.entity';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import { AIMessage } from '../../../ai/domain/interfaces/ai-provider.interface';
import {
  ChineseZodiacAnimal,
  getChineseZodiacAnimal,
  getChineseZodiacInfo,
  getChineseYearInfo,
} from '../../../../common/utils/chinese-zodiac.utils';
import {
  CHINESE_HOROSCOPE_SYSTEM_PROMPT,
  CHINESE_HOROSCOPE_USER_PROMPT,
} from '../prompts/chinese-horoscope.prompts';

/**
 * Interface para la respuesta parseada de la IA
 * Estructura del JSON retornado por el modelo de IA
 */
interface ChineseHoroscopeAIResponse {
  generalOverview: string;
  areas: {
    love: { content: string; rating: number };
    career: { content: string; rating: number };
    wellness: { content: string; rating: number };
    finance: { content: string; rating: number };
  };
  luckyElements: {
    numbers: number[];
    colors: string[];
    directions: string[];
    months: number[];
  };
  monthlyHighlights: string;
}

/**
 * Resultado de generación de un animal específico
 */
interface GenerationResult {
  animal: ChineseZodiacAnimal;
  success: boolean;
  id?: number;
  error?: string;
}

/**
 * Servicio de generación de horóscopos chinos anuales usando IA
 *
 * Responsabilidades:
 * - Generar horóscopos chinos anuales para los 12 animales del zodiaco
 * - Consultar horóscopos existentes por animal y año
 * - Obtener horóscopo de un usuario basado en su fecha de nacimiento
 * - Incrementar contador de visualizaciones
 *
 * IMPORTANTE:
 * - Los horóscopos chinos son ANUALES (no diarios como los occidentales)
 * - Las áreas incluyen: love, career, wellness, finance
 * - La compatibilidad proviene de datos estáticos, no de la IA
 * - Se genera un horóscopo por animal por año
 */
@Injectable()
export class ChineseHoroscopeService {
  private readonly logger = new Logger(ChineseHoroscopeService.name);

  constructor(
    @InjectRepository(ChineseHoroscope)
    private readonly repository: Repository<ChineseHoroscope>,
    private readonly aiProviderService: AIProviderService,
  ) {}

  /**
   * Genera un horóscopo chino para un animal y año específicos
   *
   * Si ya existe un horóscopo para ese animal y año, lo retorna sin generar uno nuevo.
   * Usa el AIProviderService con fallback automático (Groq → Gemini → DeepSeek → OpenAI).
   *
   * @param animal - Animal del zodiaco chino
   * @param year - Año gregoriano del horóscopo (ej: 2026)
   * @returns Horóscopo generado o existente
   * @throws InternalServerErrorException si no se puede parsear la respuesta de la IA
   */
  async generateForAnimal(
    animal: ChineseZodiacAnimal,
    year: number,
  ): Promise<ChineseHoroscope> {
    // 1. Verificar si ya existe
    const existing = await this.findByAnimalAndYear(animal, year);
    if (existing) {
      this.logger.log(`Horóscopo chino ya existe: ${animal} ${year}`);
      return existing;
    }

    // 2. Obtener información del animal y del año
    const animalInfo = getChineseZodiacInfo(animal);
    const yearInfo = getChineseYearInfo(year);

    this.logger.log(
      `Generando horóscopo chino para ${animalInfo.nameEs} (${animal}) - Año ${year}`,
    );

    // 3. Construir mensajes para la IA
    const messages: AIMessage[] = [
      { role: 'system', content: CHINESE_HOROSCOPE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: CHINESE_HOROSCOPE_USER_PROMPT(animal, year, animalInfo, {
          animal: yearInfo.animal,
          element: yearInfo.element,
        }),
      },
    ];

    // 4. Generar con IA (con fallback automático)
    const startTime = Date.now();
    const aiResponse = await this.aiProviderService.generateCompletion(
      messages,
      null, // userId: no aplica para horóscopos generales
      null, // readingId: no aplica
      {
        temperature: 0.7, // Balance entre creatividad y consistencia
        maxTokens: 1500, // Suficiente para las 4 áreas + elementos lucky
      },
    );

    // 5. Parsear respuesta de la IA
    const data = this.parseAIResponse(aiResponse.content);

    // 6. Agregar compatibilidad desde información estática
    // La compatibilidad NO viene de la IA, es información tradicional fija
    const compatibility = {
      best: animalInfo.compatibleWith.slice(0, 2),
      good: animalInfo.compatibleWith.slice(2),
      challenging: animalInfo.incompatibleWith,
    };

    // 7. Crear y guardar el horóscopo
    const horoscope = this.repository.create({
      animal,
      year,
      generalOverview: data.generalOverview,
      areas: {
        love: {
          content: data.areas.love.content,
          score: data.areas.love.rating,
        },
        career: {
          content: data.areas.career.content,
          score: data.areas.career.rating,
        },
        wellness: {
          content: data.areas.wellness.content,
          score: data.areas.wellness.rating,
        },
        finance: {
          content: data.areas.finance.content,
          score: data.areas.finance.rating,
        },
      },
      luckyElements: data.luckyElements,
      compatibility,
      monthlyHighlights: data.monthlyHighlights,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed.total,
      generationTimeMs: Date.now() - startTime,
    });

    const saved = await this.repository.save(horoscope);

    this.logger.log(
      `Horóscopo chino generado: ${animalInfo.nameEs} ${year} | ` +
        `Provider: ${aiResponse.provider} | Tokens: ${aiResponse.tokensUsed.total} | ` +
        `Tiempo: ${saved.generationTimeMs}ms`,
    );

    return saved;
  }

  /**
   * Genera horóscopos chinos para todos los 12 animales de un año específico
   *
   * Genera secuencialmente con un delay de 5 segundos entre cada llamada
   * para evitar rate limits de los proveedores de IA.
   *
   * @param year - Año gregoriano para generar horóscopos
   * @returns Resumen de generación (exitosos, fallidos, detalles)
   */
  async generateAllForYear(year: number): Promise<{
    successful: number;
    failed: number;
    results: GenerationResult[];
  }> {
    const animals = Object.values(ChineseZodiacAnimal);
    const results: GenerationResult[] = [];

    this.logger.log(`Iniciando generación de 12 horóscopos para año ${year}`);

    // Generar secuencialmente con delay para evitar rate limits
    for (let i = 0; i < animals.length; i++) {
      const animal = animals[i];

      // Delay de 5s entre cada generación (excepto la primera)
      if (i > 0) {
        await this.delay(5000);
      }

      try {
        this.logger.log(`[${i + 1}/12] Generando ${animal}...`);
        const horoscope = await this.generateForAnimal(animal, year);
        results.push({ animal, success: true, id: horoscope.id });
        this.logger.log(
          `[${i + 1}/12] ✓ ${animal} completado (ID: ${horoscope.id})`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`[${i + 1}/12] ✗ Falló ${animal}: ${errorMessage}`);
        results.push({ animal, success: false, error: errorMessage });
      }
    }

    const summary = {
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };

    this.logger.log(
      `Generación completada: ${summary.successful} exitosos, ${summary.failed} fallidos`,
    );

    return summary;
  }

  /**
   * Busca un horóscopo por animal y año
   *
   * @param animal - Animal del zodiaco chino
   * @param year - Año gregoriano
   * @returns Horóscopo encontrado o null
   */
  async findByAnimalAndYear(
    animal: ChineseZodiacAnimal,
    year: number,
  ): Promise<ChineseHoroscope | null> {
    return this.repository.findOne({
      where: { animal, year },
    });
  }

  /**
   * Obtiene todos los horóscopos de un año específico
   *
   * @param year - Año gregoriano
   * @returns Array de horóscopos ordenados alfabéticamente por animal
   */
  async findAllByYear(year: number): Promise<ChineseHoroscope[]> {
    return this.repository.find({
      where: { year },
      order: { animal: 'ASC' },
    });
  }

  /**
   * Obtiene el horóscopo para un usuario basado en su fecha de nacimiento
   *
   * Calcula el animal del zodiaco chino del usuario considerando el
   * Año Nuevo Chino y busca su horóscopo para el año especificado.
   *
   * @param birthDate - Fecha de nacimiento del usuario
   * @param year - Año gregoriano del horóscopo (default: año actual)
   * @returns Horóscopo del animal del usuario o null si no existe
   */
  async findForUser(
    birthDate: Date,
    year: number = new Date().getFullYear(),
  ): Promise<ChineseHoroscope | null> {
    const animal = getChineseZodiacAnimal(birthDate);
    return this.findByAnimalAndYear(animal, year);
  }

  /**
   * Incrementa el contador de visualizaciones de un horóscopo
   *
   * Operación atómica usando query builder para evitar race conditions.
   *
   * @param id - ID del horóscopo
   */
  async incrementViewCount(id: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update()
      .set({ viewCount: () => 'view_count + 1' })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * Parsea la respuesta JSON de la IA
   *
   * Limpia markdown code blocks (```json) que la IA pueda incluir
   * y valida la estructura básica del JSON.
   *
   * @param content - Contenido de la respuesta de la IA
   * @returns Datos parseados del horóscopo chino
   * @throws InternalServerErrorException si el JSON es inválido
   * @private
   */
  private parseAIResponse(content: string): ChineseHoroscopeAIResponse {
    try {
      // Limpiar posibles code blocks de markdown
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed: unknown = JSON.parse(cleanContent);

      // Validación básica de la estructura
      if (!this.isValidChineseHoroscopeResponse(parsed)) {
        throw new Error('Estructura JSON incompleta o inválida');
      }

      return parsed;
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
      this.logger.error('Content received:', content);
      throw new InternalServerErrorException(
        'Error al procesar la respuesta de la IA',
      );
    }
  }

  /**
   * Type guard para validar la estructura de la respuesta de la IA
   * @private
   */
  private isValidChineseHoroscopeResponse(
    obj: unknown,
  ): obj is ChineseHoroscopeAIResponse {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const candidate = obj as Record<string, unknown>;

    return (
      typeof candidate.generalOverview === 'string' &&
      typeof candidate.areas === 'object' &&
      candidate.areas !== null &&
      this.isValidArea((candidate.areas as Record<string, unknown>).love) &&
      this.isValidArea((candidate.areas as Record<string, unknown>).career) &&
      this.isValidArea((candidate.areas as Record<string, unknown>).wellness) &&
      this.isValidArea((candidate.areas as Record<string, unknown>).finance) &&
      typeof candidate.luckyElements === 'object' &&
      candidate.luckyElements !== null &&
      typeof candidate.monthlyHighlights === 'string'
    );
  }

  /**
   * Valida que un área tenga la estructura correcta
   * @private
   */
  private isValidArea(area: unknown): boolean {
    if (typeof area !== 'object' || area === null) {
      return false;
    }

    const areaObj = area as Record<string, unknown>;
    return (
      typeof areaObj.content === 'string' &&
      typeof areaObj.rating === 'number' &&
      areaObj.rating >= 1 &&
      areaObj.rating <= 10
    );
  }

  /**
   * Función helper para delay (usado en generación masiva)
   * @param ms - Milisegundos a esperar
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
