import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

/**
 * Filtro global para excepciones de ThrottlerException.
 * Agrega headers X-RateLimit-* con información útil cuando se excede el límite.
 */
@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.TOO_MANY_REQUESTS;

    // Obtener headers actuales si ya fueron establecidos por el guard
    const rateLimitLimit = response.getHeader('X-RateLimit-Limit');
    const rateLimitRemaining = response.getHeader('X-RateLimit-Remaining');
    const rateLimitReset = response.getHeader('X-RateLimit-Reset');
    const retryAfter = response.getHeader('Retry-After');

    // Calcular tiempo de espera en segundos
    const resetTime = rateLimitReset
      ? Math.ceil((Number(rateLimitReset) - Date.now()) / 1000)
      : Number(retryAfter) || 60;

    // Mensaje personalizado con el tiempo de espera
    const message = `Has excedido el límite de solicitudes. Por favor, intenta de nuevo en ${resetTime} segundos.`;

    response.status(status).json({
      statusCode: status,
      message,
      error: 'Too Many Requests',
      retryAfter: resetTime,
      limit: rateLimitLimit ? Number(rateLimitLimit) : undefined,
      remaining: rateLimitRemaining ? Number(rateLimitRemaining) : 0,
    });
  }
}
