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
   * Returns yesterday's date as a YYYY-MM-DD string.
   * Purchases with selectedDate < cutoffDate have missed their appointment
   * by at least 24 hours (grace period).
   */
  private getCutoffDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
