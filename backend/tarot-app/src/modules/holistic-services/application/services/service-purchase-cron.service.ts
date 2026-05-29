import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpirePendingPurchasesUseCase } from '../use-cases/expire-pending-purchases.use-case';

/**
 * Daily cron service that expires pending service purchases whose appointment
 * date has already passed (with a 24-hour grace period).
 *
 * Runs every day at 03:00 UTC to minimise interference with peak usage hours.
 */
@Injectable()
export class ServicePurchaseCronService {
  private readonly logger = new Logger(ServicePurchaseCronService.name);

  constructor(
    private readonly expirePendingPurchasesUseCase: ExpirePendingPurchasesUseCase,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async expirePendingPurchases(): Promise<void> {
    this.logger.log(
      'Iniciando job de expiración de compras pendientes vencidas…',
      ServicePurchaseCronService.name,
    );

    try {
      const { expired, failed } =
        await this.expirePendingPurchasesUseCase.execute();

      this.logger.log(
        `Job de expiración finalizado: ${expired} compras marcadas como EXPIRADAS.`,
        ServicePurchaseCronService.name,
      );

      if (failed > 0) {
        this.logger.warn(
          `${failed} compras no pudieron ser actualizadas. Revisar logs de la base de datos.`,
          ServicePurchaseCronService.name,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error inesperado durante el job de expiración de compras.',
        error instanceof Error ? error.stack : String(error),
        ServicePurchaseCronService.name,
      );
    }
  }
}
