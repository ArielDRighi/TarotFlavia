import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequiresPremiumForCustomQuestionGuard } from './requires-premium-for-custom-question.guard';
import { UserPlan } from '../../../users/entities/user.entity';

describe('RequiresPremiumForCustomQuestionGuard', () => {
  let guard: RequiresPremiumForCustomQuestionGuard;

  beforeEach(() => {
    guard = new RequiresPremiumForCustomQuestionGuard();
  });

  describe('cuando NO hay customQuestion en el body', () => {
    it('debe permitir acceso a usuario ANONYMOUS', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: UserPlan.ANONYMOUS },
        body: { predefinedQuestionId: 1 },
      });

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir acceso a usuario FREE', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: UserPlan.FREE },
        body: { predefinedQuestionId: 1 },
      });

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir acceso a usuario PREMIUM', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: UserPlan.PREMIUM },
        body: { predefinedQuestionId: 1 },
      });

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('cuando HAY customQuestion en el body', () => {
    it('debe bloquear usuario ANONYMOUS con 403', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: UserPlan.ANONYMOUS },
        body: { customQuestion: '¿Qué me depara el futuro?' },
      });

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las preguntas personalizadas requieren un plan premium. Por favor, elige una pregunta predefinida o actualiza tu plan.',
      );
    });

    it('debe bloquear usuario FREE con 403', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: UserPlan.FREE },
        body: { customQuestion: '¿Qué me depara el futuro?' },
      });

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las preguntas personalizadas requieren un plan premium. Por favor, elige una pregunta predefinida o actualiza tu plan.',
      );
    });

    it('debe permitir usuario PREMIUM', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: UserPlan.PREMIUM },
        body: { customQuestion: '¿Qué me depara el futuro?' },
      });

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});

// Helper para crear mock del ExecutionContext
function createMockContext(request: {
  user: { userId: number; plan: UserPlan };
  body: { customQuestion?: string; predefinedQuestionId?: number };
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
