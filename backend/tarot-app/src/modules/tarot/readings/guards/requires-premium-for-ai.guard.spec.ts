import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RequiresPremiumForAIGuard } from './requires-premium-for-ai.guard';
import { UserPlan } from '../../../users/entities/user.entity';

describe('RequiresPremiumForAIGuard', () => {
  let guard: RequiresPremiumForAIGuard;

  beforeEach(() => {
    guard = new RequiresPremiumForAIGuard();
  });

  describe('canActivate - campo useAI', () => {
    it('debe permitir useAI: true para usuarios PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: { useAI: true },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe bloquear useAI: true para usuarios FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { useAI: true },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las funciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe bloquear useAI: true para usuarios ANONYMOUS', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.ANONYMOUS },
            body: { useAI: true },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las funciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe permitir useAI: false para usuarios FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { useAI: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir useAI: false para usuarios ANONYMOUS', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.ANONYMOUS },
            body: { useAI: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir cuando useAI es undefined para usuarios FREE', () => {
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

    it('debe permitir cuando useAI es undefined para usuarios ANONYMOUS', () => {
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

    it('debe permitir useAI: false para usuarios PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: { useAI: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir useAI: undefined para usuarios PREMIUM', () => {
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

  describe('canActivate - casos edge con ambos campos', () => {
    it('debe priorizar useAI: true sobre generateInterpretation para usuario PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: { useAI: true, generateInterpretation: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe bloquear useAI: true incluso si generateInterpretation: false para usuario FREE', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { useAI: true, generateInterpretation: false },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las funciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe permitir useAI: false con generateInterpretation: true para usuario FREE (legacy sin validación)', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { useAI: false, generateInterpretation: true },
          }),
        }),
      } as ExecutionContext;

      // useAI: false toma prioridad, permite acceso
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe bloquear ambos true para usuario FREE (useAI tiene prioridad)', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { useAI: true, generateInterpretation: true },
          }),
        }),
      } as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Las funciones con IA están disponibles solo para usuarios Premium. Actualiza tu plan para desbloquear esta funcionalidad.',
      );
    });

    it('debe permitir ambos true para usuario PREMIUM', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.PREMIUM },
            body: { useAI: true, generateInterpretation: true },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('debe permitir ambos false para todos los usuarios', () => {
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { userId: 1, plan: UserPlan.FREE },
            body: { useAI: false, generateInterpretation: false },
          }),
        }),
      } as ExecutionContext;

      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('canActivate - campo generateInterpretation (legacy)', () => {
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
