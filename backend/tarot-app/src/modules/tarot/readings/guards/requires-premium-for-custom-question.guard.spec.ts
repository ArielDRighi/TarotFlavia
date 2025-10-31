import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequiresPremiumForCustomQuestionGuard } from './requires-premium-for-custom-question.guard';
import { UserPlan } from '../../../users/entities/user.entity';

describe('RequiresPremiumForCustomQuestionGuard', () => {
  let guard: RequiresPremiumForCustomQuestionGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequiresPremiumForCustomQuestionGuard],
    }).compile();

    guard = module.get<RequiresPremiumForCustomQuestionGuard>(
      RequiresPremiumForCustomQuestionGuard,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('debe permitir a usuario premium usar pregunta personalizada', () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: {
              customQuestion: '¿Cuál es mi propósito en la vida?',
              deckId: 1,
              spreadId: 1,
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('debe permitir a usuario free usar pregunta predefinida', () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 2, plan: UserPlan.FREE },
            body: {
              predefinedQuestionId: 5,
              deckId: 1,
              spreadId: 1,
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('debe permitir a usuario premium usar pregunta predefinida también', () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: {
              predefinedQuestionId: 3,
              deckId: 1,
              spreadId: 1,
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('debe rechazar a usuario free que intenta usar pregunta personalizada', () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 2, plan: UserPlan.FREE },
            body: {
              customQuestion: '¿Cuál es mi futuro?',
              deckId: 1,
              spreadId: 1,
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Las preguntas personalizadas requieren un plan premium. Por favor, elige una pregunta predefinida o actualiza tu plan.',
      );
    });

    it('debe permitir si no hay pregunta personalizada en el body', () => {
      const context: ExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 2, plan: UserPlan.FREE },
            body: {
              deckId: 1,
              spreadId: 1,
            },
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });
  });
});
