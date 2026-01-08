import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorador para obtener el usuario actual del request.
 * Funciona con JwtAuthGuard (requiere autenticación) y OptionalJwtAuthGuard (permite anónimos).
 *
 * @example
 * // Con JwtAuthGuard (usuario requerido)
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: User) {
 *   // user siempre existe
 * }
 *
 * @example
 * // Con OptionalJwtAuthGuard (usuario opcional)
 * @Get('capabilities')
 * @UseGuards(OptionalJwtAuthGuard)
 * async getCapabilities(@CurrentUser() user?: User) {
 *   // user puede ser undefined (anónimo)
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as Request & { user?: unknown }).user;
  },
);
