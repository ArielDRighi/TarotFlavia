import { SetMetadata } from '@nestjs/common';
import { UsageFeature } from '../entities/usage-limit.entity';

export const USAGE_LIMIT_FEATURE_KEY = 'usage-limit-feature';

/**
 * Decorator to mark an endpoint as requiring usage limit checking
 * @param feature - The feature to check usage limits for
 * @example
 * ```typescript
 * @CheckUsageLimit(UsageFeature.TAROT_READING)
 * @Post()
 * async createReading() { ... }
 * ```
 */
export const CheckUsageLimit = (feature: UsageFeature) =>
  SetMetadata(USAGE_LIMIT_FEATURE_KEY, feature);
