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
  VERIFICATION_SCHEDULE,
  MAX_RETRIES_PER_SIGN,
  RETRY_DELAYS_MS,
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
   * T-BUG-016-B: Reintenta hasta MAX_RETRIES_PER_SIGN veces con backoff
   * exponencial ante fallos transitorios (5xx / rate limit / timeout) antes
   * de marcar el signo como definitivamente fallido. Esto evita que un error
   * puntual deje un hueco permanente en la generación diaria.
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
    let lastError = '';

    for (let attempt = 1; attempt <= MAX_RETRIES_PER_SIGN + 1; attempt++) {
      try {
        this.logger.log(`[${index}/12] Generando ${signInfo.nameEs}...`);

        const startTime = Date.now();
        const horoscope = await this.horoscopeService.generateForSign(
          sign,
          date,
        );
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
        lastError = error instanceof Error ? error.message : String(error);

        if (attempt <= MAX_RETRIES_PER_SIGN) {
          const retryDelay = RETRY_DELAYS_MS[attempt - 1];
          this.logger.warn(
            `[${index}/12] Reintento ${attempt}/${MAX_RETRIES_PER_SIGN} para ${signInfo.nameEs} en ${retryDelay / 1000}s: ${lastError}`,
          );
          await this.delay(retryDelay);
        }
      }
    }

    this.logger.error(
      `[${index}/12] ✗ ${signInfo.nameEs}: ${lastError} (sin más reintentos)`,
    );

    return {
      sign,
      success: false,
      error: lastError,
    };
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
   * T-BUG-016-B: Verifica la completitud de la generación diaria - 09:00 UTC
   *
   * Se ejecuta unas horas después de la generación de las 06:00 para detectar
   * signos que hayan quedado sin horóscopo (por fallos transitorios persistentes)
   * y regenerar únicamente los faltantes, sin tocar los ya generados.
   *
   * Cron expression: "0 0 9 * * *" (todos los días a las 09:00 UTC)
   */
  @Cron(VERIFICATION_SCHEDULE, {
    name: 'verify-daily-horoscope-completeness',
    timeZone: 'UTC',
  })
  async verifyAndCompleteDailyHoroscopes(): Promise<void> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    this.logger.log(
      `=== VERIFICACIÓN: Comprobando completitud de horóscopos para ${dateStr} ===`,
    );

    try {
      await this.generateMissingHoroscopes(today);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? (error.stack ?? '') : '';
      this.logger.error(
        `Error en verificación de horóscopos para ${dateStr}: ${errorMessage}`,
        errorStack,
      );
    }
  }

  /**
   * T-BUG-016-B: Genera únicamente los horóscopos faltantes de una fecha.
   *
   * Identifica los signos sin horóscopo para la fecha dada y genera solo esos,
   * con reintentos por signo. No regenera los que ya existen.
   *
   * @param date - Fecha objetivo (default: hoy)
   * @returns Resumen de generación (faltantes detectados, exitosos, fallidos)
   */
  async generateMissingHoroscopes(date: Date = new Date()): Promise<{
    missing: number;
    successful: number;
    failed: number;
  }> {
    const missingSigns =
      await this.horoscopeService.findMissingSignsForDate(date);

    if (missingSigns.length === 0) {
      this.logger.log('Verificación OK: los 12 horóscopos del día existen.');
      return { missing: 0, successful: 0, failed: 0 };
    }

    this.logger.warn(
      `Se encontraron ${missingSigns.length} horóscopos faltantes. Iniciando regeneración...`,
    );

    const results: GenerationResult[] = [];
    for (let i = 0; i < missingSigns.length; i++) {
      const sign = missingSigns[i];

      // Delay ANTES de generar (excepto para el primer faltante)
      if (i > 0) {
        await this.delay(this.DELAY_BETWEEN_SIGNS_MS);
      }

      const result = await this.generateSingleHoroscope(sign, date, i + 1);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger.log(
      `Regeneración de faltantes completada: ${successful} exitosos, ${failed} fallidos`,
    );

    return { missing: missingSigns.length, successful, failed };
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
