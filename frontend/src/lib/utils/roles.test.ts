import { describe, it, expect } from 'vitest';
import { isAdminUser } from './roles';
import type { AuthUser } from '@/types';

const createUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  roles: ['consumer'],
  plan: 'free',
  profilePicture: null,
  ...overrides,
});

describe('isAdminUser', () => {
  it('debe devolver false si no hay usuario', () => {
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });

  it('debe devolver true si el array roles incluye admin', () => {
    expect(isAdminUser(createUser({ roles: ['consumer', 'admin'] }))).toBe(true);
  });

  it('debe devolver true con el booleano legacy isAdmin', () => {
    expect(isAdminUser(createUser({ roles: ['consumer'], isAdmin: true }))).toBe(true);
  });

  it('debe devolver false para un usuario sin rol admin', () => {
    expect(isAdminUser(createUser())).toBe(false);
    expect(isAdminUser(createUser({ isAdmin: false }))).toBe(false);
  });

  it('no debe romperse si el usuario llega sin array roles', () => {
    const userWithoutRoles = createUser();
    delete (userWithoutRoles as Partial<AuthUser>).roles;

    expect(isAdminUser(userWithoutRoles as AuthUser)).toBe(false);
  });
});
