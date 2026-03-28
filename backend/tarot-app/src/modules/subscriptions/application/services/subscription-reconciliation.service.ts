import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { PreApprovalResponse } from 'mercadopago/dist/clients/preApproval/commonTypes';
import { IUserRepository } from '../../../users/domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../../users/domain/interfaces/repository.tokens';
import { MercadoPagoService } from '../../../payments/infrastructure/services/mercadopago.service';
import { User, SubscriptionStatus } from '../../../users/entities/user.entity';

/** Número máximo de consultas a la API de MP por ejecución (rate limit) */
const MAX_RECONCILIATION_QUERIES = 50;

/**
 * Resultado de la reconciliación de un usuario individual
 */
interface ReconciliationResult {
  userId: number;
  corrected: boolean;
  skipped: boolean;
  error?: string;
}

/**
 * Servicio CRON de reconciliación diaria con la API de Mercado Pago.
 *
 * Responsabilidades:
 * - Ejecutarse diariamente a las 3 AM UTC
 * - Consultar el estado real de todas las suscripciones premium activas en MP
 * - Detectar y corregir discrepancias entre la DB y MP
 * - Respetar el rate limit de máx 50 consultas por ejecución
 * - Manejar errores por usuario sin detener el batch completo
 *
 * Discrepancias que corrige:
 * - subscriptionStatus=active en DB pero status=cancelled en MP → corrige a cancelled
 *
 * Discrepancias que NO corrige (requieren intervención manual o son manejadas por otros CRON):
 * - Planes expirados → manejado por SubscriptionCronService
 * - status=paused → MP reintenta automáticamente, sin cambio en DB
 */
@Injectable()
export class SubscriptionReconciliationService {
  private readonly logger = new Logger(SubscriptionReconciliationService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    private readonly mercadoPagoService: MercadoPagoService,
  ) {}

  /**
   * Reconcilia el estado de las suscripciones premium activas con la API de MP.
   *
   * Expresión cron: '0 3 * * *' — 3 AM diario UTC.
   * Formato (5 campos): minuto hora dia-mes mes dia-semana
   */
  @Cron('0 3 * * *', {
    name: 'subscription-reconciliation',
    timeZone: 'UTC',
  })
  async reconcileSubscriptions(): Promise<void> {
    this.logger.log(
      '=== INICIO: Reconciliación de suscripciones con Mercado Pago ===',
    );

    let usersToReconcile: User[];

    try {
      usersToReconcile =
        await this.userRepo.findActivePremiumUsersWithPreapproval();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al obtener usuarios para reconciliación: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return;
    }

    if (usersToReconcile.length === 0) {
      this.logger.log('Sin suscripciones activas para reconciliar.');
      return;
    }

    // Aplicar rate limit: procesar máximo MAX_RECONCILIATION_QUERIES usuarios
    const usersToProcess = usersToReconcile.slice(
      0,
      MAX_RECONCILIATION_QUERIES,
    );

    this.logger.log(
      `Encontrados ${usersToReconcile.length} usuarios con suscripción. ` +
        `Procesando ${usersToProcess.length} (rate limit: ${MAX_RECONCILIATION_QUERIES}).`,
    );

    const results = await this.processUsersInBatch(usersToProcess);

    const corrected = results.filter((r) => r.corrected).length;
    const skipped = results.filter((r) => r.skipped).length;
    const errors = results.filter((r) => r.error !== undefined).length;

    this.logger.log(
      `=== FIN: ${corrected} corregidos, ${skipped} sin discrepancias, ${errors} errores ===`,
    );

    if (errors > 0) {
      this.logger.warn(
        `${errors} usuario(s) no pudieron ser verificados. Revisar logs de error.`,
      );
    }

    if (corrected > 0) {
      this.logger.log(
        `Discrepancias corregidas: ${corrected} suscripción(es) actualizada(s) en DB.`,
      );
    }
  }

  /**
   * Procesa un batch de usuarios verificando cada uno contra la API de MP.
   * Si uno falla, continúa con el resto.
   */
  private async processUsersInBatch(
    users: User[],
  ): Promise<ReconciliationResult[]> {
    const results: ReconciliationResult[] = [];

    for (const user of users) {
      const result = await this.reconcileUser(user);
      results.push(result);
    }

    return results;
  }

  /**
   * Verifica el estado de la suscripción de un usuario contra la API de MP.
   * Corrige discrepancias detectadas actualizando la DB.
   */
  private async reconcileUser(user: User): Promise<ReconciliationResult> {
    const mpPreapprovalId = user.mpPreapprovalId;

    if (!mpPreapprovalId) {
      this.logger.warn(
        `Usuario ${user.id} sin mpPreapprovalId — saltando reconciliación`,
      );
      return { userId: user.id, corrected: false, skipped: true };
    }

    let preapproval: PreApprovalResponse;

    try {
      preapproval =
        await this.mercadoPagoService.getPreapproval(mpPreapprovalId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al consultar preapproval ${mpPreapprovalId} para usuario ${user.id}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        userId: user.id,
        corrected: false,
        skipped: false,
        error: errorMessage,
      };
    }

    const mpStatus = preapproval.status;

    // Detectar y corregir discrepancia: cancelado en MP pero activo en DB
    if (
      mpStatus === 'cancelled' &&
      user.subscriptionStatus === SubscriptionStatus.ACTIVE
    ) {
      return this.correctCancelledStatus(user, mpPreapprovalId, mpStatus);
    }

    // Sin discrepancia — log y continuar
    this.logger.log(
      `Usuario ${user.id}: estado DB=${user.subscriptionStatus}, MP=${mpStatus} — sin discrepancia`,
    );
    return { userId: user.id, corrected: false, skipped: true };
  }

  /**
   * Corrige el estado de un usuario cuya suscripción fue cancelada en MP
   * pero todavía aparece activa en la DB.
   */
  private async correctCancelledStatus(
    user: User,
    mpPreapprovalId: string,
    mpStatus: string,
  ): Promise<ReconciliationResult> {
    this.logger.warn(
      `Discrepancia detectada para usuario ${user.id}: ` +
        `DB=${user.subscriptionStatus}, MP=${mpStatus} (preapproval: ${mpPreapprovalId}). ` +
        `Corrigiendo a cancelled.`,
    );

    try {
      user.subscriptionStatus = SubscriptionStatus.CANCELLED;
      await this.userRepo.save(user);

      this.logger.log(
        `Usuario ${user.id} corregido: subscriptionStatus=cancelled (preapproval: ${mpPreapprovalId})`,
      );

      return { userId: user.id, corrected: true, skipped: false };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error al corregir usuario ${user.id}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return {
        userId: user.id,
        corrected: false,
        skipped: false,
        error: errorMessage,
      };
    }
  }
}
