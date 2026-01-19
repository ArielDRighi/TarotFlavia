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
  ChineseElement,
  getChineseZodiacAnimal,
  getChineseZodiacInfo,
  getChineseYearInfo,
  getElementByBirthDate,
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
 * TASK-124: Actualizado para incluir elemento
 */
interface GenerationResult {
  animal: ChineseZodiacAnimal;
  element: ChineseElement;
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
   * TASK-124: Genera un horóscopo chino para un animal, elemento y año específicos
   *
   * Este método soporta la generación de 60 horóscopos por año (12 animales × 5 elementos).
   * Si ya existe un horóscopo para esa combinación, lo retorna sin generar uno nuevo.
   *
   * @param animal - Animal del zodiaco chino
   * @param element - Elemento Wu Xing (metal, water, wood, fire, earth)
   * @param year - Año gregoriano del horóscopo (ej: 2026)
   * @returns Horóscopo generado o existente
   * @throws InternalServerErrorException si no se puede parsear la respuesta de la IA
   */
  async generateForAnimalAndElement(
    animal: ChineseZodiacAnimal,
    element: ChineseElement,
    year: number,
  ): Promise<ChineseHoroscope> {
    // 1. Verificar si ya existe
    const existing = await this.findByAnimalElementAndYear(
      animal,
      element,
      year,
    );
    if (existing) {
      this.logger.log(
        `Horóscopo chino ya existe: ${animal} ${element} ${year}`,
      );
      return existing;
    }

    // 2. Obtener información del animal y del año
    const animalInfo = getChineseZodiacInfo(animal);
    const yearInfo = getChineseYearInfo(year);

    this.logger.log(
      `Generando horóscopo chino para ${animalInfo.nameEs} de ${element} (${animal}/${element}) - Año ${year}`,
    );

    // 3. Construir mensajes para la IA
    // TASK-125: Incluir elemento del usuario en el prompt
    const messages: AIMessage[] = [
      { role: 'system', content: CHINESE_HOROSCOPE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: CHINESE_HOROSCOPE_USER_PROMPT(
          animal,
          element, // TASK-125: Elemento del usuario
          year,
          animalInfo,
          {
            animal: yearInfo.animal,
            element: yearInfo.element,
          },
        ),
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

    // 7. Crear y guardar el horóscopo con elemento
    const horoscope = this.repository.create({
      animal,
      element,
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
      `Horóscopo chino generado: ${animalInfo.nameEs} de ${element} ${year} | ` +
        `Provider: ${aiResponse.provider} | Tokens: ${aiResponse.tokensUsed.total} | ` +
        `Tiempo: ${saved.generationTimeMs}ms`,
    );

    return saved;
  }

  /**
   * Genera un horóscopo chino para un animal y año específicos
   *
   * @deprecated Use generateForAnimalAndElement instead (TASK-124)
   * Este método se mantiene por compatibilidad pero generará con elemento 'earth' por defecto
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
    // Por defecto usamos 'earth' para mantener compatibilidad
    return this.generateForAnimalAndElement(animal, 'earth', year);
  }

  /**
   * TASK-125: Genera horóscopos chinos para todos los 60 combinaciones (12 animales × 5 elementos)
   *
   * Genera secuencialmente con un delay de 10 segundos entre cada llamada
   * para evitar rate limits de los proveedores de IA (6 RPM).
   *
   * Tiempo estimado: ~10 minutos para 60 horóscopos.
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
    const elements: ChineseElement[] = [
      'metal',
      'water',
      'wood',
      'fire',
      'earth',
    ];
    const results: GenerationResult[] = [];

    this.logger.log(
      `Iniciando generación de 60 horóscopos (12 animales × 5 elementos) para año ${year}`,
    );

    // Generar secuencialmente con delay para evitar rate limits
    let counter = 0;
    for (const animal of animals) {
      for (const element of elements) {
        counter++;
        // TASK-125: Delay de 10s entre cada generación (excepto la primera)
        // 10s = 6 RPM (requests per minute), seguro para proveedores gratuitos
        if (counter > 1) {
          await this.delay(10000);
        }

        try {
          this.logger.log(
            `[${counter}/60] Generando ${animal} de ${element}...`,
          );
          const horoscope = await this.generateForAnimalAndElement(
            animal,
            element,
            year,
          );
          results.push({
            animal,
            element,
            success: true,
            id: horoscope.id,
          });
          this.logger.log(
            `[${counter}/60] ✓ ${animal}/${element} completado (ID: ${horoscope.id})`,
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `[${counter}/60] ✗ Falló ${animal}/${element}: ${errorMessage}`,
          );
          results.push({
            animal,
            element,
            success: false,
            error: errorMessage,
          });
        }
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
   * TASK-124: Busca un horóscopo por animal, elemento y año
   *
   * @param animal - Animal del zodiaco chino
   * @param element - Elemento Wu Xing
   * @param year - Año gregoriano
   * @returns Horóscopo encontrado o null
   */
  async findByAnimalElementAndYear(
    animal: ChineseZodiacAnimal,
    element: ChineseElement,
    year: number,
  ): Promise<ChineseHoroscope | null> {
    return this.repository.findOne({
      where: { animal, element, year },
    });
  }

  /**
   * Busca un horóscopo por animal y año
   *
   * @deprecated Use findByAnimalElementAndYear instead (TASK-124)
   * Este método busca con elemento 'earth' por defecto para mantener compatibilidad
   *
   * @param animal - Animal del zodiaco chino
   * @param year - Año gregoriano
   * @returns Horóscopo encontrado o null
   */
  async findByAnimalAndYear(
    animal: ChineseZodiacAnimal,
    year: number,
  ): Promise<ChineseHoroscope | null> {
    // Por defecto busca con 'earth' para mantener compatibilidad
    return this.findByAnimalElementAndYear(animal, 'earth', year);
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
   * TASK-124: Obtiene el horóscopo para un usuario basado en su fecha de nacimiento
   *
   * Calcula el animal del zodiaco chino Y el elemento Wu Xing del usuario considerando el
   * Año Nuevo Chino y busca su horóscopo personalizado para el año especificado.
   *
   * @param birthDate - Fecha de nacimiento del usuario
   * @param year - Año gregoriano del horóscopo (default: año actual)
   * @returns Horóscopo del animal/elemento del usuario o null si no existe
   */
  async findForUser(
    birthDate: Date,
    year: number = new Date().getFullYear(),
  ): Promise<ChineseHoroscope | null> {
    const animal = getChineseZodiacAnimal(birthDate);
    const element = getElementByBirthDate(birthDate);
    return this.findByAnimalElementAndYear(animal, element, year);
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
