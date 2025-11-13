import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<{
    correlationId: string;
  }>();

  /**
   * Set correlationId in the current async context
   * Note: This only works within a runWithCorrelationId context
   * @param correlationId The correlation ID to set
   */
  setCorrelationId(correlationId: string): void {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store.correlationId = correlationId;
    }
  }

  /**
   * Get correlationId from the current async context
   * @returns The correlation ID if set, undefined otherwise
   */
  getCorrelationId(): string | undefined {
    const store = this.asyncLocalStorage.getStore();
    return store?.correlationId;
  }

  /**
   * Run a callback with a specific correlationId in the async context
   * @param correlationId The correlation ID to use
   * @param callback The callback to execute
   * @returns The result of the callback
   */
  runWithCorrelationId<T>(
    correlationId: string,
    callback: () => T | Promise<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      void this.asyncLocalStorage.run({ correlationId }, async () => {
        try {
          const result = await callback();
          resolve(result);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    });
  }

  /**
   * Generate a new UUID v4 correlation ID
   * @returns A new UUID v4 string
   */
  generateCorrelationId(): string {
    return randomUUID();
  }
}
