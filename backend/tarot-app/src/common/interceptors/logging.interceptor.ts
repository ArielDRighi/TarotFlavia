import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';
import { CorrelationIdService } from '../logger/correlation-id.service';

interface RequestUser {
  id: number;
  email?: string;
  role?: string;
  [key: string]: string | number | boolean | undefined;
}

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
      ...(user && { userId: (user as RequestUser).id }),
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
          ...(user && { userId: (user as RequestUser).id }),
        });
      }),
      catchError((error: Error) => {
        const duration = `${Date.now() - startTime}ms`;
        const metadata = {
          method,
          url,
          duration,
          error: error instanceof Error ? error.message : String(error),
          ...(correlationId && { correlationId }),
          ...(user && { userId: (user as RequestUser).id }),
        };

        const isClientError =
          error instanceof HttpException && error.getStatus() < 500;

        if (isClientError) {
          this.logger.warn('HTTP Request Warning', 'HTTPLogger', metadata);
        } else {
          this.logger.error(
            'HTTP Request Error',
            error instanceof Error ? error.stack : undefined,
            'HTTPLogger',
            metadata,
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
