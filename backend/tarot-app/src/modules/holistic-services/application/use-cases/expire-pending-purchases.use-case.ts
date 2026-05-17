import { Injectable, Inject } from '@nestjs/common';
import {
  SERVICE_PURCHASE_REPOSITORY,
  IServicePurchaseRepository,
} from '../../domain/interfaces';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';

export interface ExpirePendingPurchasesResult {
  /** Number of purchases successfully transitioned to EXPIRED. */
  expired: number;
  /** Number of purchases that could not be updated due to an error or a
   *  concurrent state change. */
  failed: number;
}

/**
 * Finds all PENDING service purchases whose appointment date is more than
 * 24 hours in the past and transitions them to EXPIRED.
 *
 * The operation is idempotent: re-running it will find no pending-before-cutoff
 * rows (they are already EXPIRED) and report zero changes.
 */
@Injectable()
export class ExpirePendingPurchasesUseCase {
  constructor(
    @Inject(SERVICE_PURCHASE_REPOSITORY)
    private readonly servicePurchaseRepository: IServicePurchaseRepository,
  ) {}

  async execute(): Promise<ExpirePendingPurchasesResult> {
    const cutoffDate = this.getCutoffDateString();

    const pendingPurchases =
      await this.servicePurchaseRepository.findPendingBeforeDate(cutoffDate);

    let expired = 0;
    let failed = 0;

    for (const purchase of pendingPurchases) {
      try {
        const updated = await this.servicePurchaseRepository.updateStatus(
          purchase.id,
          PurchaseStatus.EXPIRED,
        );
        if (updated) {
          expired++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }

    return { expired, failed };
  }

  /**
   * Returns yesterday's date as a YYYY-MM-DD string using UTC calendar day.
   *
   * UTC getters are used deliberately so the cutoff is consistent with:
   * - The cron schedule (03:00 UTC), which runs before any UTC day changes
   * - The selectedDate column, stored and compared as a plain YYYY-MM-DD string
   *
   * Using local-time getters would produce an off-by-one in UTC-negative
   * timezones (e.g. America/Argentina_Buenos_Aires, UTC-3): at 03:00 UTC the
   * local clock still reads the previous calendar day, so "yesterday local"
   * would be two days ago in UTC, potentially expiring purchases too early.
   */
  private getCutoffDateString(): string {
    const now = new Date();
    // Subtract one day in UTC milliseconds to get "yesterday UTC"
    const yesterdayUtc = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return yesterdayUtc.toISOString().slice(0, 10);
  }
}
