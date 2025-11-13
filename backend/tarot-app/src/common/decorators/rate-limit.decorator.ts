import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for storing rate limit options
 */
export const RATE_LIMIT_OPTIONS_KEY = 'rateLimit:options';

/**
 * Options for the @RateLimit decorator
 */
export interface RateLimitOptions {
  /**
   * Time to live in seconds
   */
  ttl: number;

  /**
   * Maximum number of requests within TTL
   */
  limit: number;

  /**
   * Duration in seconds to block IP after violations (optional, defaults to ttl)
   */
  blockDuration?: number;
}

/**
 * Decorator to store rate limit metadata for documentation and admin endpoints.
 *
 * **IMPORTANT**: This decorator stores metadata only. To actually enforce rate limits,
 * you MUST also add the @Throttle decorator from @nestjs/throttler with matching values.
 *
 * @param options Rate limit configuration
 * @example
 * ```typescript
 * import { Throttle } from '@nestjs/throttler';
 *
 * @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 })
 * @Throttle({ default: { limit: 3, ttl: 3600000 } }) // ttl in milliseconds
 * @Post('register')
 * async register(@Body() dto: RegisterDto) {
 *   // Rate limit: 3 requests per hour (3600 seconds)
 * }
 * ```
 */
export const RateLimit = (
  options: Partial<RateLimitOptions>,
): MethodDecorator => {
  const fullOptions: RateLimitOptions = {
    ttl: options.ttl || 60,
    limit: options.limit || 10,
    blockDuration: options.blockDuration || options.ttl || 60,
  };

  return SetMetadata(RATE_LIMIT_OPTIONS_KEY, fullOptions);
};
