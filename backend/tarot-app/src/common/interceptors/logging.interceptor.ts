import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { CorrelationIdService } from '../logger/correlation-id.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LoggerService,
    private readonly correlationIdService: CorrelationIdService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, user } = request;
    const startTime = Date.now();
    const correlationId = this.correlationIdService.getCorrelationId();

    // Log request start
    this.logger.http('HTTP Request', 'HTTPLogger', {
      method,
      url,
      ...(correlationId && { correlationId }),
      ...(user && { userId: (user as { id: number }).id }),
    });

    return next.handle().pipe(
      tap(() => {
        // Log successful response
        const duration = `${Date.now() - startTime}ms`;
        const { statusCode } = response;

        this.logger.http('HTTP Response', 'HTTPLogger', {
          method,
          url,
          statusCode,
          duration,
          ...(correlationId && { correlationId }),
          ...(user && { userId: (user as { id: number }).id }),
        });
      }),
      catchError((error: Error) => {
        // Log error
        const duration = `${Date.now() - startTime}ms`;

        this.logger.error('HTTP Request Error', error.stack, 'HTTPLogger', {
          method,
          url,
          duration,
          error: error.message,
          ...(correlationId && { correlationId }),
          ...(user && { userId: (user as { id: number }).id }),
        });

        return throwError(() => error);
      }),
    );
  }
}
