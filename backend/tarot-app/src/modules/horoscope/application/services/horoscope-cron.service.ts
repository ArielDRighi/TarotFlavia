import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HoroscopeGenerationService } from './horoscope-generation.service';
import {
  ZodiacSign,
  getZodiacSignInfo,
} from '../../../../common/utils/zodiac.utils';
import {
  DELAY_BETWEEN_SIGNS_MS,
  RETENTION_DAYS,
  GENERATION_SCHEDULE,
  CLEANUP_SCHEDULE,
} from './horoscope-cron.config';

/**
 * Resultado de la generación de un horóscopo
 * @interface GenerationResult
 */
interface GenerationResult {
  sign: ZodiacSign;
  success: boolean;
  duration?: number;
  provider?: string;
  error?: string;
}

/**
 * Servicio de cron jobs para generación automática de horóscopos
 *
 * Responsabilidades:
 * - Generar horóscopos diarios a las 06:00 UTC de forma SECUENCIAL
 * - Respetar límites de rate de la API de IA (15 RPM para Gemini)
 * - Limpiar horóscopos antiguos semanalmente
 * - Proveer método manual para testing
 *
 * IMPORTANTE:
 * - La generación es SECUENCIAL (un signo a la vez)
 * - Delay de 6 segundos entre signos para no superar 15 RPM
 * - Total: ~72 segundos para 12 signos
 * - Si un signo falla, continúa con el siguiente
 */
@Injectable()
export class HoroscopeCronService {
  private readonly logger = new Logger(HoroscopeCronService.name);

  /**
   * Delay en milisegundos entre generación de cada signo
   * Importado desde horoscope-cron.config.ts
   */
  private readonly DELAY_BETWEEN_SIGNS_MS = DELAY_BETWEEN_SIGNS_MS;

  /**
   * Orden de generación de los signos zodiacales
   * Siguiendo el orden tradicional del zodiaco
   */
  private readonly ZODIAC_ORDER: ZodiacSign[] = [
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

  constructor(private readonly horoscopeService: HoroscopeGenerationService) {}

  /**
   * Genera horóscopos diarios para todos los signos - 06:00 UTC
   *
   * LÓGICA SECUENCIAL:
   * - Un signo a la vez
   * - 6 segundos entre generaciones
   * - Total: ~72 segundos para 12 signos
   * - Si falla uno, continúa con el siguiente
   *
   * Cron expression: "0 0 6 * * *"
   * - 0 segundos
   * - 0 minutos
   * - 6 hora (06:00)
   * - * cualquier día del mes
   * - * cualquier mes
   * - * cualquier día de la semana
   */
  @Cron(GENERATION_SCHEDULE, {
    name: 'daily-horoscope-generation',
    timeZone: 'UTC',
  })
  async generateDailyHoroscopes(): Promise<void> {
    const startTime = Date.now();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    this.logger.log(`=== INICIO: Horóscopos para ${dateStr} ===`);

    const results: GenerationResult[] = [];

    // Generación SECUENCIAL (no paralela)
    for (let i = 0; i < this.ZODIAC_ORDER.length; i++) {
      const sign = this.ZODIAC_ORDER[i];

      // Delay ANTES de generar (excepto para el primer signo)
      if (i > 0) {
        this.logger.debug(`Esperando ${this.DELAY_BETWEEN_SIGNS_MS}ms...`);
        await this.delay(this.DELAY_BETWEEN_SIGNS_MS);
      }

      // Generar horóscopo para este signo
      const result = await this.generateSingleHoroscope(sign, today, i + 1);
      results.push(result);
    }

    // Resumen final
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalTime = Date.now() - startTime;

    this.logger.log(`=== FIN: ${successful}/12 exitosos ===`);
    this.logger.log(`Tiempo total: ${(totalTime / 1000).toFixed(1)}s`);

    // Loguear errores individuales
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        const signInfo = getZodiacSignInfo(r.sign);
        this.logger.error(`FALLO ${signInfo.nameEs}: ${r.error}`);
      });

    // Warning si hubo fallos
    if (failed > 0) {
      this.logger.warn(`⚠️ ${failed} horóscopos fallaron`);
    }
  }

  /**
   * Genera un horóscopo individual para un signo
   *
   * @param sign - Signo zodiacal
   * @param date - Fecha del horóscopo
   * @param index - Índice en el orden de generación (1-12)
   * @returns Resultado de la generación
   * @private
   */
  private async generateSingleHoroscope(
    sign: ZodiacSign,
    date: Date,
    index: number,
  ): Promise<GenerationResult> {
    const signInfo = getZodiacSignInfo(sign);

    try {
      this.logger.log(`[${index}/12] Generando ${signInfo.nameEs}...`);

      const startTime = Date.now();
      const horoscope = await this.horoscopeService.generateForSign(sign, date);
      const duration = Date.now() - startTime;

      this.logger.log(
        `[${index}/12] ✓ ${signInfo.nameEs} (${duration}ms, ${horoscope.aiProvider})`,
      );

      return {
        sign,
        success: true,
        duration,
        provider: horoscope.aiProvider || undefined,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[${index}/12] ✗ ${signInfo.nameEs}: ${errorMessage}`);

      return {
        sign,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Limpia horóscopos antiguos (>30 días) - Semanal
   *
   * Cron expression: "0 0 0 * * 0" (Domingos a medianoche UTC)
   * Equivalente a CronExpression.EVERY_WEEK
   */
  @Cron(CLEANUP_SCHEDULE, {
    name: 'horoscope-cleanup',
    timeZone: 'UTC',
  })
  async cleanupOldHoroscopes(): Promise<void> {
    this.logger.log('Limpiando horóscopos antiguos...');

    try {
      const deletedCount =
        await this.horoscopeService.cleanupOldHoroscopes(RETENTION_DAYS);
      this.logger.log(`Eliminados: ${deletedCount}`);
    } catch (error) {
      this.logger.error('Error en limpieza:', error);
    }
  }

  /**
   * Método manual para testing o ejecución bajo demanda
   *
   * Útil para:
   * - Testing manual en desarrollo
   * - Regeneración de horóscopos si el cron falló
   * - Debugging
   */
  async generateNow(): Promise<void> {
    this.logger.warn('Generación manual iniciada...');
    await this.generateDailyHoroscopes();
  }

  /**
   * Promesa de delay para control de rate limiting
   *
   * @param ms - Milisegundos a esperar
   * @returns Promesa que se resuelve después del delay
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
