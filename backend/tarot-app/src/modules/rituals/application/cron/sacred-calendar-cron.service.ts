import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SacredCalendarService } from '../services/sacred-calendar.service';

/**
 * Servicio Cron para generación automática de eventos del Calendario Sagrado
 *
 * Responsabilidades:
 * - Generar eventos del próximo año automáticamente el 1 de diciembre
 * - Mantener el calendario actualizado sin intervención manual
 */
@Injectable()
export class SacredCalendarCronService {
  private readonly logger = new Logger(SacredCalendarCronService.name);

  constructor(private readonly calendarService: SacredCalendarService) {}

  /**
   * Genera eventos del próximo año automáticamente
   * Ejecuta el 1 de diciembre a las 00:00 UTC
   *
   * NOTA: El timing del 1 de diciembre es intencional:
   * - El seeder inicial genera eventos para año actual + próximo año
   * - Este cron solo mantiene el calendario adelantado cada diciembre
   * - Si se despliega tarde en el año, el seeder ya cubrió el año actual
   */
  @Cron('0 0 1 12 *', {
    name: 'generate-next-year-events',
    timeZone: 'UTC',
  })
  async generateNextYearEvents(): Promise<void> {
    try {
      const nextYear = new Date().getFullYear() + 1;
      this.logger.log(
        `Generando eventos del calendario sagrado para ${nextYear}`,
      );

      const eventsCreated =
        await this.calendarService.generateYearEvents(nextYear);

      this.logger.log(`Creados ${eventsCreated} eventos para ${nextYear}`);
    } catch (error) {
      this.logger.error(
        'Error generando eventos del calendario sagrado:',
        error,
      );
    }
  }

  /**
   * Método manual para generar eventos (útil para testing y administración)
   * @param year Año para el cual generar eventos
   */
  async generateEventsForYear(year: number): Promise<number> {
    this.logger.log(`Generando eventos manualmente para el año ${year}`);
    return this.calendarService.generateYearEvents(year);
  }
}
