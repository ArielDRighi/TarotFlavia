import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserPlan } from '../../../users/entities/user.entity';
import { PremiumGuard } from './premium.guard';

describe('PremiumGuard', () => {
  let guard: PremiumGuard;

  beforeEach(() => {
    guard = new PremiumGuard();
  });

  const createMockExecutionContext = (user: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  };

  it('should allow premium user', () => {
    const context = createMockExecutionContext({ plan: UserPlan.PREMIUM });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject free user', () => {
    const context = createMockExecutionContext({ plan: UserPlan.FREE });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Requiere plan Premium');
  });

  it('should reject anonymous user', () => {
    const context = createMockExecutionContext({ plan: UserPlan.ANONYMOUS });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should reject request without user', () => {
    const context = createMockExecutionContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow('Usuario no autenticado');
  });
});
