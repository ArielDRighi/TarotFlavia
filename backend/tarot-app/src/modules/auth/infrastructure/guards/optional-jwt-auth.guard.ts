import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

/**
 * Guard opcional que permite llamadas con o sin token JWT.
 * A diferencia de JwtAuthGuard, NO falla si no hay token.
 * Útil para endpoints que funcionan tanto para usuarios autenticados como anónimos.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Sobrescribe canActivate para no fallar cuando no hay token
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Si no hay header de autorización, permitir acceso sin autenticación
    if (!request.headers.authorization) {
      return true;
    }

    try {
      // Si hay token, intentar validarlo llamando al parent (AuthGuard)
      const result = await super.canActivate(context);
      return result as boolean;
    } catch {
      // Si el token es inválido, permitir acceso sin autenticación (no lanzar error)
      // Esto permite que el endpoint maneje usuarios anónimos
      return true;
    }
  }

  /**
   * Sobrescribe handleRequest para retornar null en lugar de lanzar error
   * cuando no hay usuario autenticado
   */
  handleRequest<TUser = unknown>(
    err: Error | null,
    user: TUser | false,
  ): TUser | null {
    // Si hay usuario (token válido), retornarlo
    if (user) {
      return user as TUser;
    }

    // Si no hay usuario (anónimo o token inválido), retornar null (NO lanzar error)
    // Los endpoints que usan este guard deben manejar user === null
    return null;
  }
}
