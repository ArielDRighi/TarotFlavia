import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from './notifications.service';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';
import { NotificationType } from '../../entities/user-notification.entity';
import { Hemisphere } from '../../../users/enums/hemisphere.enum';

/**
 * Interfaz para eventos del calendario sagrado
 * TODO: Importar desde CalendarService cuando TASK-400c esté completada
 */
interface SacredEvent {
  name: string;
  date: string;
  description: string;
  hemisphere: Hemisphere;
  importance?: 'high' | 'medium' | 'low';
}

/**
 * Servicio de cron jobs para notificaciones de eventos del calendario sagrado
 *
 * Responsabilidades:
 * - Ejecutarse diariamente a las 9:00 AM UTC
 * - Obtener usuarios premium activos
 * - Generar notificaciones para eventos de HOY
 * - Generar recordatorios para eventos importantes de MAÑANA
 *
 * IMPORTANTE:
 * - Solo notifica a usuarios con plan premium activo
 * - Respeta el hemisferio del usuario para eventos estacionales
 * - Los errores no detienen el proceso de otros usuarios
 *
 * DEPENDENCIAS:
 * - CalendarService (TASK-400c) - Actualmente en desarrollo
 * - NotificationsService - Para crear notificaciones
 * - UsersRepository - Para obtener usuarios premium
 */
@Injectable()
export class SacredEventNotificationCronService {
  private readonly logger = new Logger(SacredEventNotificationCronService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // TODO: Inyectar CalendarService cuando TASK-400c esté completada
    // private readonly calendarService: CalendarService,
  ) {}

  /**
   * Cron job que se ejecuta diariamente a las 9:00 AM UTC
   * Genera notificaciones de eventos sagrados para usuarios premium
   *
   * Cron expression: "0 0 9 * * *"
   * - 0 segundos
   * - 0 minutos
   * - 9 hora (09:00)
   * - * cualquier día del mes
   * - * cualquier mes
   * - * cualquier día de la semana
   */
  @Cron('0 0 9 * * *', {
    name: 'daily-sacred-event-notifications',
    timeZone: 'UTC',
  })
  async handleDailySacredEventNotifications(): Promise<void> {
    const startTime = Date.now();
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    this.logger.log(
      `=== Iniciando cron job de notificaciones de eventos sagrados para ${dateStr} ===`,
    );

    try {
      // Obtener usuarios premium activos
      const premiumUsers = await this.getPremiumUsers();

      this.logger.log(
        `Encontrados ${premiumUsers.length} usuarios premium activos`,
      );

      if (premiumUsers.length === 0) {
        this.logger.log('No hay usuarios premium para notificar');
        return;
      }

      // Procesar cada usuario secuencialmente
      let successCount = 0;
      let errorCount = 0;

      for (const user of premiumUsers) {
        try {
          this.processUserNotifications(user);
          successCount++;
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Error procesando notificaciones para usuario ${user.id}`,
            error instanceof Error ? error.stack : String(error),
          );
          // Continuar con el siguiente usuario
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `=== Finalizado: ${successCount} usuarios procesados correctamente, ${errorCount} errores en ${duration}ms ===`,
      );
    } catch (error) {
      this.logger.error(
        'Error durante el cron job de notificaciones de eventos sagrados',
        error instanceof Error ? error.stack : String(error),
      );
      // No lanzar - no queremos detener la app si el cron falla
    }
  }

  /**
   * Obtiene usuarios premium con suscripción activa
   * @private
   */
  private async getPremiumUsers(): Promise<User[]> {
    return this.userRepository.find({
      where: {
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
      select: ['id', 'email', 'hemisphere'],
    });
  }

  /**
   * Procesa notificaciones para un usuario específico
   * Obtiene eventos del calendario basado en su hemisferio
   * @private
   */
  private processUserNotifications(user: User): void {
    const hemisphere = user.hemisphere || Hemisphere.NORTH;

    this.logger.debug(
      `Procesando notificaciones para usuario ${user.id} (hemisferio: ${hemisphere})`,
    );

    // TODO: Integrar con CalendarService cuando TASK-400c esté completada
    // Por ahora, el servicio está preparado pero no genera notificaciones
    // hasta que CalendarService esté disponible

    /*
    // CÓDIGO A ACTIVAR CUANDO CalendarService ESTÉ DISPONIBLE:
    
    // Obtener eventos de HOY
    const todayEvents = await this.calendarService.getTodayEvents(hemisphere);
    
    for (const event of todayEvents) {
      await this.createNotificationForEvent(user.id, event, false);
    }
    
    // Obtener eventos de MAÑANA (solo los importantes)
    const tomorrowEvents = await this.calendarService.getTomorrowEvents(hemisphere);
    const importantEvents = tomorrowEvents.filter(
      (event) => event.importance === 'high',
    );
    
    for (const event of importantEvents) {
      await this.createNotificationForEvent(user.id, event, true);
    }
    
    this.logger.debug(
      `Usuario ${user.id}: ${todayEvents.length} eventos hoy, ${importantEvents.length} recordatorios mañana`,
    );
    */

    this.logger.debug(
      `Usuario ${user.id}: CalendarService no disponible aún (TASK-400c pendiente)`,
    );
  }

  /**
   * Crea una notificación para un evento del calendario
   * @private
   */
  private async createNotificationForEvent(
    userId: number,
    event: SacredEvent,
    isReminder: boolean,
  ): Promise<void> {
    const type = isReminder
      ? NotificationType.SACRED_EVENT_REMINDER
      : NotificationType.SACRED_EVENT;

    const title = isReminder
      ? `Recordatorio: ${event.name} mañana`
      : `Evento Sagrado Hoy: ${event.name}`;

    await this.notificationsService.createNotification(
      userId,
      type,
      title,
      event.description,
      {
        eventName: event.name,
        eventDate: event.date,
        hemisphere: event.hemisphere,
      },
      '/calendar',
    );
  }

  /**
   * Método manual para testing y debugging
   * Permite ejecutar el cron job manualmente
   */
  async runManually(): Promise<void> {
    this.logger.log('Ejecutando manualmente el cron job de notificaciones');
    await this.handleDailySacredEventNotifications();
  }
}
