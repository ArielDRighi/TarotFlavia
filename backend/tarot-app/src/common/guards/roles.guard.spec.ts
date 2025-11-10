import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (
    user: unknown,
    roles: UserRole[] | undefined,
  ): ExecutionContext => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(roles as UserRole[]);

    return mockContext;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      const user = { roles: [UserRole.CONSUMER] };
      const context = createMockExecutionContext(user, undefined);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has the required role', () => {
      const user = { roles: [UserRole.ADMIN] };
      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      const user = { roles: [UserRole.TAROTIST] };
      const context = createMockExecutionContext(user, [
        UserRole.TAROTIST,
        UserRole.ADMIN,
      ]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny access when user lacks all required roles', () => {
      const user = { roles: [UserRole.CONSUMER] };
      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user is not present', () => {
      const context = createMockExecutionContext(undefined, [UserRole.ADMIN]);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user has no roles', () => {
      const user = { roles: [] };
      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should work with multiple user roles', () => {
      const user = {
        roles: [UserRole.CONSUMER, UserRole.TAROTIST, UserRole.ADMIN],
      };
      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      const user = { roles: [UserRole.CONSUMER] };
      const context = createMockExecutionContext(user, []);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should use correct metadata key', () => {
      const user = { roles: [UserRole.ADMIN] };
      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        {},
        {},
      ]);
    });

    it('should handle user with undefined roles property', () => {
      const user = { email: 'test@test.com' };
      const context = createMockExecutionContext(user, [UserRole.ADMIN]);

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
