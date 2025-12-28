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
        user: { userId: 1, plan: 'anonymous' }, // JWT devuelve strings
        body: { customQuestion: '¿Qué me depara el futuro?' },
      });

      try {
        guard.canActivate(mockContext);
        fail('Expected ForbiddenException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(
          'Las preguntas personalizadas requieren un plan premium. Por favor, elige una pregunta predefinida o actualiza tu plan.',
        );
      }
    });

    it('debe bloquear usuario FREE con 403', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: 'free' }, // JWT devuelve strings
        body: { customQuestion: '¿Qué me depara el futuro?' },
      });

      try {
        guard.canActivate(mockContext);
        fail('Expected ForbiddenException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(
          'Las preguntas personalizadas requieren un plan premium. Por favor, elige una pregunta predefinida o actualiza tu plan.',
        );
      }
    });

    it('debe permitir usuario PREMIUM', () => {
      const mockContext = createMockContext({
        user: { userId: 1, plan: 'premium' }, // JWT devuelve strings
        body: { customQuestion: '¿Qué me depara el futuro?' },
      });

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});

// Helper para crear mock del ExecutionContext
function createMockContext(request: {
  user: { userId: number; plan: string }; // JWT devuelve string
  body: { customQuestion?: string; predefinedQuestionId?: number };
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as ExecutionContext;
}
