import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { UserRole } from '../../../../common/enums/user-role.enum';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  const createMockExecutionContext = (user: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    describe('with new roles system', () => {
      it('should allow access when user has ADMIN role', () => {
        const user = { roles: [UserRole.CONSUMER, UserRole.ADMIN] };
        const context = createMockExecutionContext(user);

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should deny access when user does not have ADMIN role', () => {
        const user = { roles: [UserRole.CONSUMER] };
        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'Se requieren permisos de administrador',
        );
      });
    });

    describe('with old isAdmin system (backward compatibility)', () => {
      it('should allow access when user has isAdmin true', () => {
        const user = { isAdmin: true };
        const context = createMockExecutionContext(user);

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should deny access when user has isAdmin false', () => {
        const user = { isAdmin: false };
        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });
    });

    describe('edge cases', () => {
      it('should throw when user is not present', () => {
        const context = createMockExecutionContext(undefined);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        expect(() => guard.canActivate(context)).toThrow(
          'Usuario no autenticado',
        );
      });

      it('should throw when user has no roles and no isAdmin', () => {
        const user = { email: 'test@test.com' };
        const context = createMockExecutionContext(user);

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      });

      it('should work when user has both roles and isAdmin (dual system)', () => {
        const user = {
          roles: [UserRole.CONSUMER, UserRole.ADMIN],
          isAdmin: true,
        };
        const context = createMockExecutionContext(user);

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should prioritize roles system over isAdmin', () => {
        // User has ADMIN role but isAdmin false (should use roles)
        const user = {
          roles: [UserRole.ADMIN],
          isAdmin: false,
        };
        const context = createMockExecutionContext(user);

        expect(guard.canActivate(context)).toBe(true);
      });

      it('should fallback to isAdmin if roles is undefined', () => {
        const user = { isAdmin: true };
        const context = createMockExecutionContext(user);

        expect(guard.canActivate(context)).toBe(true);
      });
    });
  });
});
