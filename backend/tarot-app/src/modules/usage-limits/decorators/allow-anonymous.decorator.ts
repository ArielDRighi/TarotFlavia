import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANONYMOUS_KEY = 'allow-anonymous';

/**
 * Decorator to mark an endpoint as allowing anonymous access
 * When used with CheckUsageLimit guard, the guard will use anonymous tracking
 * instead of requiring authentication
 * @example
 * ```typescript
 * @AllowAnonymous()
 * @CheckUsageLimit(UsageFeature.TAROT_READING)
 * @Get('public/daily-card')
 * async getPublicDailyCard() { ... }
 * ```
 */
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true);
