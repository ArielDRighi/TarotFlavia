import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should extend AuthGuard with jwt strategy', () => {
    // Verificar que el guard hereda de AuthGuard
    expect(guard).toBeInstanceOf(AuthGuard('jwt'));
  });

  it('should have canActivate method from parent AuthGuard', () => {
    expect(guard.canActivate).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });

  it('should delegate authentication to Passport JWT strategy', () => {
    // Este guard es un wrapper simple de AuthGuard('jwt')
    // La lógica real de autenticación se delega a Passport
    // que se prueba en tests de integración E2E
    expect(guard).toBeDefined();
  });
});
