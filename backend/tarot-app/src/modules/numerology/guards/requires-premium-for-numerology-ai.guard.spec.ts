import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequiresPremiumForNumerologyAIGuard } from './requires-premium-for-numerology-ai.guard';
import { UserPlan } from '../../users/entities/user.entity';

describe('RequiresPremiumForNumerologyAIGuard', () => {
  let guard: RequiresPremiumForNumerologyAIGuard;

  beforeEach(() => {
    guard = new RequiresPremiumForNumerologyAIGuard();
  });

  describe('canActivate', () => {
    it('debe permitir acceso a usuarios PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe bloquear acceso a usuarios FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las interpretaciones numerológicas con IA están disponibles solo para usuarios Premium. ' +
          'Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe bloquear acceso a usuarios ANONYMOUS', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.ANONYMOUS },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las interpretaciones numerológicas con IA están disponibles solo para usuarios Premium. ' +
          'Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe lanzar ForbiddenException cuando no hay usuario en el request', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({}),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Usuario no autenticado',
      );
    });

    it('debe lanzar ForbiddenException cuando el usuario es null', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: null,
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Usuario no autenticado',
      );
    });

    it('debe lanzar ForbiddenException cuando el usuario es undefined', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: undefined,
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Usuario no autenticado',
      );
    });
  });
});
