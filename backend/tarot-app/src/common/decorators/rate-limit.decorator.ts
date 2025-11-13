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
 * Decorator to apply custom rate limiting to specific endpoints
 * @param options Rate limit configuration
 * @example
 * ```typescript
 * @RateLimit({ ttl: 3600, limit: 3, blockDuration: 3600 })
 * @Post('register')
 * async register(@Body() dto: RegisterDto) {
 *   // ...
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
