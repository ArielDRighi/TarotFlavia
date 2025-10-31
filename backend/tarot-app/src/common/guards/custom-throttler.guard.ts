import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user?: {
    userId: number;
    email: string;
    isAdmin: boolean;
    plan: string;
  };
}

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    // Usar IP + user ID (si existe) como tracker para limitar por usuario
    const request = req as unknown as RequestWithUser;
    const userId = request.user?.userId;
    const ip =
      (request.headers?.['x-forwarded-for'] as string) ||
      request.ip ||
      'unknown';

    return Promise.resolve(userId ? `user-${userId}-${ip}` : `ip-${ip}`);
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const {
      context,
      limit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    } = requestProps;

    // Obtener el request y verificar si el usuario es premium
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const userPlan = request.user?.plan || 'free';

    // Los usuarios premium tienen el doble de límite
    const adjustedLimit = userPlan === 'premium' ? limit * 2 : limit;

    // Llamar a la implementación base con el límite ajustado
    return super.handleRequest({
      context,
      limit: adjustedLimit,
      ttl,
      throttler,
      blockDuration,
      getTracker,
      generateKey,
    });
  }
}
