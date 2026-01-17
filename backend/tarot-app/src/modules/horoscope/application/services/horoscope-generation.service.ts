import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { DailyHoroscope } from '../../entities/daily-horoscope.entity';
import { AIProviderService } from '../../../ai/application/services/ai-provider.service';
import { AIMessage } from '../../../ai/domain/interfaces/ai-provider.interface';
import {
  getZodiacSignInfo,
  ZodiacSign,
} from '../../../../common/utils/zodiac.utils';
import {
  HOROSCOPE_SYSTEM_PROMPT,
  HOROSCOPE_USER_PROMPT,
} from '../prompts/horoscope.prompts';
import { HoroscopeAIResponse } from '../dto/horoscope-ai-response.interface';

/**
 * Servicio de generación de horóscopos diarios usando IA
 *
 * Responsabilidades:
 * - Generar horóscopos para signos zodiacales usando AI providers
 * - Consultar horóscopos existentes por signo y fecha
 * - Incrementar contador de visualizaciones
 * - Limpiar horóscopos antiguos
 *
 * El servicio previene duplicados verificando existencia antes de generar.
 * Usa temperatura 0.8 para variedad en las generaciones.
 */
@Injectable()
export class HoroscopeGenerationService {
  private readonly logger = new Logger(HoroscopeGenerationService.name);

  constructor(
    @InjectRepository(DailyHoroscope)
    private readonly horoscopeRepository: Repository<DailyHoroscope>,
    private readonly aiProviderService: AIProviderService,
  ) {}

  /**
   * Obtiene la fecha de hoy normalizada a UTC (medianoche)
   * Este método asegura que "hoy" sea consistente entre todas las operaciones
   * @returns Fecha de hoy a las 00:00:00 UTC
   */
  getTodayUTC(): Date {
    return this.normalizeDateToUTC(new Date());
  }

  /**
   * Genera un horóscopo para un signo específico en una fecha
   *
   * Si ya existe un horóscopo para ese signo y fecha, lo retorna sin generar uno nuevo.
   * Usa el AIProviderService con fallback automático (Groq → Gemini → DeepSeek → OpenAI).
   *
   * @param sign - Signo zodiacal
   * @param date - Fecha del horóscopo (default: hoy)
   * @returns Horóscopo generado o existente
   * @throws InternalServerErrorException si no se puede parsear la respuesta de la IA
   */
  async generateForSign(
    sign: ZodiacSign,
    date: Date = new Date(),
  ): Promise<DailyHoroscope> {
    // 1. Verificar si ya existe
    const existing = await this.findBySignAndDate(sign, date);
    if (existing) {
      this.logger.log(
        `Horóscopo ya existe para ${sign} en ${this.formatDateForQuery(date)}`,
      );
      return existing;
    }

    // 2. Obtener info del signo
    const signInfo = getZodiacSignInfo(sign);
    const dateStr = this.formatDateForQuery(date);

    this.logger.log(
      `Generando horóscopo para ${signInfo.nameEs} (${sign}) - ${dateStr}`,
    );

    // 3. Construir mensajes para la IA
    const messages: AIMessage[] = [
      { role: 'system', content: HOROSCOPE_SYSTEM_PROMPT },
      { role: 'user', content: HOROSCOPE_USER_PROMPT(sign, dateStr, signInfo) },
    ];

    // 4. Generar con IA (con fallback automático)
    const startTime = Date.now();
    const aiResponse = await this.aiProviderService.generateCompletion(
      messages,
      null, // userId: no aplica para horóscopos generales
      null, // readingId: no aplica
      {
        temperature: 0.8, // Mayor variedad en las generaciones
        maxTokens: 1000, // Suficiente para los 3 areas + elementos lucky
      },
    );

    // 5. Parsear respuesta de la IA
    const horoscopeData = this.parseAIResponse(aiResponse.content);

    // 6. Crear y guardar el horóscopo
    // Normalizar la fecha a medianoche UTC para consistencia
    const normalizedDate = this.normalizeDateToUTC(date);

    const horoscope = this.horoscopeRepository.create({
      zodiacSign: sign,
      horoscopeDate: normalizedDate,
      generalContent: horoscopeData.generalContent,
      areas: horoscopeData.areas,
      luckyNumber: horoscopeData.luckyNumber,
      luckyColor: horoscopeData.luckyColor,
      luckyTime: horoscopeData.luckyTime,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed.total,
      generationTimeMs: Date.now() - startTime,
      viewCount: 0,
    });

    const saved = await this.horoscopeRepository.save(horoscope);

    this.logger.log(
      `Horóscopo generado: ${signInfo.nameEs} | Provider: ${aiResponse.provider} | ` +
        `Tokens: ${aiResponse.tokensUsed.total} | Tiempo: ${saved.generationTimeMs}ms`,
    );

    return saved;
  }

  /**
   * Verifica si ya existe un horóscopo para un signo y fecha
   *
   * @param sign - Signo zodiacal
   * @param date - Fecha del horóscopo
   * @returns Horóscopo encontrado o null
   * @private
   */
  private async findExistingHoroscope(
    sign: ZodiacSign,
    date: Date,
  ): Promise<DailyHoroscope | null> {
    const dateStr = this.formatDateForQuery(date);
    return this.horoscopeRepository
      .createQueryBuilder('h')
      .where('h.zodiacSign = :sign', { sign })
      .andWhere(`h.horoscope_date::TEXT = :date`, { date: dateStr })
      .getOne();
  }

  /**
   * Busca un horóscopo por signo y fecha
   *
   * @param sign - Signo zodiacal
   * @param date - Fecha del horóscopo
   * @returns Horóscopo encontrado o null
   */
  async findBySignAndDate(
    sign: ZodiacSign,
    date: Date,
  ): Promise<DailyHoroscope | null> {
    const dateStr = this.formatDateForQuery(date);
    this.logger.debug(
      `Buscando horóscopo: ${sign}, fecha: ${dateStr}, date original: ${date.toISOString()}`,
    );

    const result = await this.horoscopeRepository
      .createQueryBuilder('h')
      .where('h.zodiacSign = :sign', { sign })
      .andWhere(`h.horoscope_date::TEXT = :date`, { date: dateStr })
      .getOne();

    this.logger.debug(`Resultado: ${result ? 'encontrado' : 'no encontrado'}`);
    return result;
  }

  /**
   * Busca todos los horóscopos de una fecha específica
   *
   * @param date - Fecha de los horóscopos
   * @returns Array de horóscopos ordenados por signo
   */
  async findAllByDate(date: Date): Promise<DailyHoroscope[]> {
    const dateStr = this.formatDateForQuery(date);
    this.logger.debug(
      `Buscando todos los horóscopos para fecha: ${dateStr}, date original: ${date.toISOString()}`,
    );

    const results = await this.horoscopeRepository
      .createQueryBuilder('h')
      .where(`h.horoscope_date::TEXT = :date`, { date: dateStr })
      .orderBy('h.zodiacSign', 'ASC')
      .getMany();

    this.logger.debug(`Encontrados: ${results.length} horóscopos`);
    return results;
  }

  /**
   * Incrementa el contador de visualizaciones de un horóscopo
   *
   * Operación atómica usando query builder para evitar race conditions.
   * Nota: Esta operación es awaited para asegurar su ejecución.
   *
   * @param id - ID del horóscopo
   */
  async incrementViewCount(id: number): Promise<void> {
    await this.horoscopeRepository
      .createQueryBuilder()
      .update()
      .set({ viewCount: () => 'view_count + 1' })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * Elimina horóscopos más antiguos que el período de retención
   *
   * Útil para mantenimiento periódico de la base de datos.
   *
   * @param retentionDays - Días de retención (default: 30)
   * @returns Cantidad de horóscopos eliminados
   */
  async cleanupOldHoroscopes(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.horoscopeRepository.delete({
      horoscopeDate: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  /**
   * Parsea la respuesta JSON de la IA
   *
   * Limpia markdown code blocks (```json) que la IA pueda incluir.
   *
   * @param content - Contenido de la respuesta de la IA
   * @returns Datos parseados del horóscopo
   * @throws InternalServerErrorException si el JSON es inválido
   * @private
   */
  private parseAIResponse(content: string): HoroscopeAIResponse {
    try {
      // Limpiar posibles code blocks de markdown
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed: unknown = JSON.parse(cleanContent);

      // Validación básica de la estructura con type guard
      if (!this.isValidHoroscopeResponse(parsed)) {
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
  private isValidHoroscopeResponse(obj: unknown): obj is HoroscopeAIResponse {
    if (typeof obj !== 'object' || obj === null) {
      return false;
    }

    const candidate = obj as Record<string, unknown>;

    return (
      typeof candidate.generalContent === 'string' &&
      typeof candidate.areas === 'object' &&
      candidate.areas !== null &&
      this.isValidArea((candidate.areas as Record<string, unknown>).love) &&
      this.isValidArea((candidate.areas as Record<string, unknown>).wellness) &&
      this.isValidArea((candidate.areas as Record<string, unknown>).money)
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
      typeof areaObj.score === 'number' &&
      areaObj.score >= 1 &&
      areaObj.score <= 10
    );
  }

  /**
   * Formatea una fecha para queries de base de datos
   * Usa componentes UTC para consistencia con cómo se almacenan las fechas
   * @param date - Fecha a formatear
   * @returns String en formato YYYY-MM-DD
   * @private
   */
  private formatDateForQuery(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Normaliza una fecha a medianoche UTC para almacenarla en la BD
   * Esto asegura que todas las fechas se guarden de forma consistente
   * @param date - Fecha a normalizar
   * @returns Nueva fecha a medianoche UTC
   * @private
   */
  private normalizeDateToUTC(date: Date): Date {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }
}
