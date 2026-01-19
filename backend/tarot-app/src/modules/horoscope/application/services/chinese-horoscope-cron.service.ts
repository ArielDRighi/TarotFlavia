import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChineseHoroscopeService } from './chinese-horoscope.service';

/**
 * Servicio de cron job para generación automática de horóscopos chinos anuales
 *
 * Responsabilidades:
 * - Generar horóscopos chinos del próximo año el 15 de diciembre a las 00:00 UTC
 * - Verificar que no existan horóscopos antes de generar (evitar duplicados)
 * - Notificar al admin sobre el resultado de la generación
 * - Proveer método manual para testing y mantenimiento
 *
 * IMPORTANTE:
 * - El cron se ejecuta UNA VEZ AL AÑO (15 de diciembre)
 * - Genera los 12 horóscopos chinos para el año siguiente
 * - Reutiliza generateAllForYear() que maneja delays entre animales
 */
@Injectable()
export class ChineseHoroscopeCronService {
  private readonly logger = new Logger(ChineseHoroscopeCronService.name);

  constructor(
    private readonly chineseHoroscopeService: ChineseHoroscopeService,
  ) {}

  /**
   * Genera horóscopos chinos para el próximo año
   * Ejecuta el 15 de diciembre a las 00:00 UTC
   *
   * Cron expression: "0 0 0 15 12 *"
   * - 0 segundos
   * - 0 minutos
   * - 0 hora (00:00)
   * - 15 día del mes
   * - 12 mes (diciembre)
   * - * cualquier día de la semana
   *
   * PROCESO:
   * 1. Calcula el año siguiente
   * 2. Verifica si ya existen horóscopos para ese año
   * 3. Si no existen, genera los 12 horóscopos
   * 4. Registra el resultado en logs
   * 5. TODO: Notificar al admin (cuando exista sistema de notificaciones)
   */
  @Cron('0 0 0 15 12 *', {
    name: 'annual-chinese-horoscope-generation',
    timeZone: 'UTC',
  })
  async generateNextYearHoroscopes(): Promise<void> {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    this.logger.log(
      `=== INICIO: Generación automática de horóscopos chinos ${nextYear} ===`,
    );

    try {
      // Verificar si ya existen horóscopos para el próximo año
      const existing =
        await this.chineseHoroscopeService.findAllByYear(nextYear);

      if (existing.length > 0) {
        this.logger.warn(
          `Los horóscopos de ${nextYear} ya existen (${existing.length}/12). No se generan duplicados.`,
        );
        return;
      }

      // Generar los 12 horóscopos del año siguiente
      const result =
        await this.chineseHoroscopeService.generateAllForYear(nextYear);

      this.logger.log(
        `=== FIN: ${result.successful}/12 horóscopos generados exitosamente ===`,
      );

      // TODO: Enviar notificación al admin (implementar cuando exista sistema de notificaciones)
      // await this.notificationService.notifyAdmin({
      //   subject: `Horóscopos Chinos ${nextYear} Generados`,
      //   message: `Se generaron ${result.successful} de 12 horóscopos exitosamente.`,
      //   details: result.results,
      // });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';

      this.logger.error(
        `Error en generación automática: ${errorMessage}`,
        errorStack,
      );

      // TODO: Notificar al admin del error
      // await this.notificationService.notifyAdmin({
      //   subject: `ERROR: Generación de Horóscopos Chinos ${nextYear}`,
      //   message: `Falló la generación automática: ${errorMessage}`,
      //   severity: 'error',
      // });
    }
  }

  /**
   * Método manual para generar horóscopos de un año específico
   * Útil para testing y mantenimiento
   *
   * @param year - Año objetivo (opcional, por defecto próximo año)
   * @returns Promise<void>
   *
   * CASOS DE USO:
   * - Testing del cron job sin esperar al 15 de diciembre
   * - Regenerar horóscopos de un año si hubo problemas
   * - Generar horóscopos de años futuros por adelantado
   *
   * EJEMPLO:
   * await cronService.generateManually(2028); // Generar para 2028
   * await cronService.generateManually();     // Generar para próximo año
   */
  async generateManually(year?: number): Promise<void> {
    const targetYear = year || new Date().getFullYear() + 1;
    this.logger.warn(`Generación manual iniciada para ${targetYear}...`);

    const result =
      await this.chineseHoroscopeService.generateAllForYear(targetYear);

    this.logger.log(
      `Generación manual completada: ${result.successful}/12 exitosos, ${result.failed}/12 fallidos`,
    );
  }
}
