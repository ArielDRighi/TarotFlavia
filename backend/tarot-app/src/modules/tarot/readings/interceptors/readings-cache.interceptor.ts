import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ReadingsCacheInterceptor implements NestInterceptor {
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
        void this.cacheManager.set(cacheKey, data, this.TTL);
      }),
    );
  }
}
