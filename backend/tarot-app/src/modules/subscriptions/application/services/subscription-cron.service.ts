import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';

/**
 * Resultado del procesamiento de un usuario en el batch de degradación
 */
interface DegradationResult {
  userId: number;
  success: boolean;
  error?: string;
}

/**
 * Servicio de cron para degradación automática de planes premium expirados
 *
 * Responsabilidades:
 * - Ejecutarse cada 6 horas para detectar suscripciones expiradas
 * - Degradar plan de 'premium' a 'free' cuando planExpiresAt < NOW()
 * - Solo afecta usuarios con subscriptionStatus 'cancelled' o 'expired'
 * - Protege usuarios con suscripción activa (no los degrada aunque planExpiresAt haya pasado)
 * - Maneja errores por usuario sin detener el batch completo
 */
@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  /**
   * Degrada automáticamente planes premium expirados
   *
   * Condición de degradación:
   * - plan = 'premium'
   * - subscriptionStatus IN ('cancelled', 'expired')
   * - planExpiresAt < NOW()
   *
   * Cron expression: "0 * /6 * * *" (cada 6 horas)
   * - 0 minutos
   * - cada 6 horas (0, 6, 12, 18)
   * - cualquier día/mes
   */
  @Cron('0 */6 * * *', {
    name: 'subscription-plan-degradation',
    timeZone: 'UTC',
  })
  async degradeExpiredPlans(): Promise<void> {
    this.logger.log('=== INICIO: Degradación de planes premium expirados ===');

    let expiredUsers: User[];

    try {
      expiredUsers = await this.userRepo.findExpiredPremiumUsers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al obtener usuarios con planes expirados: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return;
    }

    if (expiredUsers.length === 0) {
      this.logger.log('Sin planes expirados para degradar.');
      return;
    }

    this.logger.log(
      `Encontrados ${expiredUsers.length} usuarios con planes expirados.`,
    );

    const results = await this.processUsersInBatch(expiredUsers);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    this.logger.log(
      `=== FIN: ${successful} usuarios degradados, ${failed} errores ===`,
    );

    if (failed > 0) {
      this.logger.warn(
        `${failed} usuario(s) no pudieron ser degradados. Revisar logs de error.`,
      );
    }
  }

  /**
   * Procesa un batch de usuarios, degradando cada uno de forma individual
   * Si uno falla, continúa con el resto
   *
   * @param users - Lista de usuarios a degradar
   * @returns Resultados del procesamiento por usuario
   */
  private async processUsersInBatch(
    users: User[],
  ): Promise<DegradationResult[]> {
    const results: DegradationResult[] = [];

    for (const user of users) {
      const result = await this.degradeSingleUser(user);
      results.push(result);
    }

    return results;
  }

  /**
   * Degrada un usuario individual de premium a free
   *
   * @param user - Usuario a degradar
   * @returns Resultado de la operación
   */
  private async degradeSingleUser(user: User): Promise<DegradationResult> {
    try {
      user.plan = UserPlan.FREE;
      user.subscriptionStatus = SubscriptionStatus.EXPIRED;
      await this.userRepo.save(user);

      this.logger.log(
        `Usuario ${user.id} degradado a free (planExpiresAt: ${user.planExpiresAt?.toISOString() ?? 'N/A'})`,
      );

      return { userId: user.id, success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al degradar usuario ${user.id}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return { userId: user.id, success: false, error: errorMessage };
    }
  }
}
