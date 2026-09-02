import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { fireAndForget } from '../../../../common/utils';

@Injectable()
export class ReadingsCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ReadingsCacheInterceptor.name);
  private readonly TTL = 300000; // 5 minutes in milliseconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId: number };
      query: Record<string, string>;
    }>();
    const userId = request.user?.userId;

    // Only cache for authenticated requests
    if (userId === undefined || userId === null) {
      return next.handle();
    }

    // Build cache key from userId and query params
    const queryParams = new URLSearchParams(request.query).toString();
    const cacheKey = `readings:${userId}:${queryParams || 'default'}`;

    // Try to get from cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // If not in cache, proceed with request and cache the result
    return next.handle().pipe(
      tap((data) => {
        // El `void` pelado que había acá no tenía catch. Hoy es inofensivo
        // porque el store es en memoria y no rechaza, pero el día que entre
        // Redis un fallo sería una unhandled rejection —o sea, el proceso—,
        // que es la moraleja entera de este backlog (T-DEPLOY-004).
        fireAndForget(
          this.cacheManager.set(cacheKey, data, this.TTL),
          this.logger,
          `No se pudo cachear la respuesta de ${cacheKey}`,
        );
      }),
    );
  }
}
