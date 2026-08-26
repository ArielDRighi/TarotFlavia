import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
 * - Generar horóscopos diarios a las 01:00 UTC de forma SECUENCIAL
 * - Rellenar los faltantes de hoy al arrancar la app (backfill de bootstrap)
 * - Respetar el límite de 8.000 tokens/minuto del tier gratuito de Groq
 * - Limpiar horóscopos antiguos semanalmente
 * - Proveer método manual para testing
 *
 * IMPORTANTE:
 * - La generación es SECUENCIAL (un signo a la vez)
 * - Delay de 15 segundos entre signos (ver DELAY_BETWEEN_SIGNS_MS)
 * - Total: ~3 minutos para 12 signos
 * - Si un signo falla, continúa con el siguiente
 * - Al arrancar la app (OnApplicationBootstrap) rellena los horóscopos faltantes
 *   de hoy, para recuperarse de corridas de cron perdidas por deploys/reinicios
 *   (los @Cron de NestJS no ejecutan tareas perdidas).
 */
@Injectable()
export class HoroscopeCronService implements OnApplicationBootstrap {
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

  constructor(
    private readonly horoscopeService: HoroscopeGenerationService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Hook de arranque: al levantar la app, rellena los horóscopos faltantes de hoy.
   *
   * Motivo: los @Cron de NestJS NO ejecutan tareas perdidas. Si el proceso estaba
   * caído o redesplegando durante la ventana de generación (01:00 UTC) y de
   * verificación (02:00 UTC), el día quedaría sin generar hasta el día siguiente.
   * Este hook hace que cada deploy/reinicio se auto-cure el día en curso.
   *
   * - Solo corre en producción: en dev (watch mode) y test evita disparar la IA
   *   en cada reinicio.
   * - Fire-and-forget: no bloquea el arranque de la app (la generación puede
   *   tardar ~72s). Los errores se loguean, no se propagan.
   * - Idempotente: `generateMissingHoroscopes` solo genera los signos que faltan.
   */
  onApplicationBootstrap(): void {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv !== 'production') {
      this.logger.log(
        `Bootstrap backfill de horóscopos omitido (NODE_ENV=${nodeEnv ?? 'undefined'})`,
      );
      return;
    }

    // Fire-and-forget: no await para no bloquear el arranque.
    void this.runBootstrapBackfill();
  }

  /**
   * Ejecuta el relleno de faltantes del día en curso, capturando cualquier error
   * para que un fallo del backfill nunca tumbe el arranque de la app.
   */
  private async runBootstrapBackfill(): Promise<void> {
    try {
      this.logger.log(
        '=== BOOTSTRAP: verificando completitud de horóscopos de hoy ===',
      );
      const result = await this.generateMissingHoroscopes(new Date());
      this.logger.log(
        `Bootstrap backfill: ${result.missing} faltantes, ` +
          `${result.successful} generados, ${result.failed} fallidos`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? (error.stack ?? '') : '';
      this.logger.error(
        `Error en bootstrap backfill de horóscopos: ${errorMessage}`,
        errorStack,
      );
    }
  }

  /**
   * Genera horóscopos diarios para todos los signos - 01:00 UTC (22:00 ART)
   *
   * Se corre antes de la medianoche argentina para que el día ya esté generado
   * cuando el front cambia al nuevo día local (00:00 hora local). Ver la razón
   * completa en GENERATION_SCHEDULE (horoscope-cron.config.ts).
   *
   * LÓGICA SECUENCIAL:
   * - Un signo a la vez
   * - 6 segundos entre generaciones
   * - Total: ~72 segundos para 12 signos
   * - Si falla uno, continúa con el siguiente
   *
   * Cron expression: "0 0 1 * * *"
   * - 0 segundos
   * - 0 minutos
   * - 1 hora (01:00 UTC)
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
   * T-BUG-016-B: Verifica la completitud de la generación diaria - 02:00 UTC
   *
   * Se ejecuta 1 hora después de la generación de las 01:00 para detectar signos
   * que hayan quedado sin horóscopo (por fallos transitorios persistentes) y
   * regenerar únicamente los faltantes, sin tocar los ya generados. Corre a las
   * 02:00 UTC (23:00 ART) para rellenar los huecos antes de la medianoche argentina.
   *
   * Cron expression: "0 0 2 * * *" (todos los días a las 02:00 UTC)
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
