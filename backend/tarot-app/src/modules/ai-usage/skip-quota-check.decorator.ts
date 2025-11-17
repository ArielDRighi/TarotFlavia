import { SetMetadata } from '@nestjs/common';

export const SKIP_QUOTA_CHECK_KEY = 'skipQuotaCheck';

/**
 * Decorator para omitir la verificación de cuota mensual de IA.
 * Usar solo en endpoints que no consuman cuota de IA.
 *
 * @example
 * ```typescript
 * @Get('/usage')
 * @SkipQuotaCheck()
 * async getMyUsage() {
 *   // Este endpoint no consume cuota
 * }
 * ```
 */
export const SkipQuotaCheck = () => SetMetadata(SKIP_QUOTA_CHECK_KEY, true);
