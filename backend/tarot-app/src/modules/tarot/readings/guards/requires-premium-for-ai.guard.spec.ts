import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequiresPremiumForAIGuard } from './requires-premium-for-ai.guard';
import { UserPlan } from '../../../users/entities/user.entity';

describe('RequiresPremiumForAIGuard', () => {
  let guard: RequiresPremiumForAIGuard;

  beforeEach(() => {
    guard = new RequiresPremiumForAIGuard();
  });

  describe('canActivate', () => {
    it('debe permitir generateInterpretation: true para usuarios PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: { generateInterpretation: true },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe bloquear generateInterpretation: true para usuarios FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { generateInterpretation: true },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las interpretaciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe bloquear generateInterpretation: true para usuarios ANONYMOUS', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.ANONYMOUS },
            body: { generateInterpretation: true },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las interpretaciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe permitir generateInterpretation: false para usuarios FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { generateInterpretation: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir generateInterpretation: false para usuarios ANONYMOUS', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.ANONYMOUS },
            body: { generateInterpretation: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir cuando generateInterpretation es undefined para usuarios FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: {},
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir cuando generateInterpretation es undefined para usuarios ANONYMOUS', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.ANONYMOUS },
            body: {},
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir generateInterpretation: undefined para usuarios PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: {},
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });
});
