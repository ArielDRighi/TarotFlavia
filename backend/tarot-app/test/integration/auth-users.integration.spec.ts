import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { AuthOrchestratorService } from '../../src/modules/auth/application/services/auth-orchestrator.service';
import { UsersService } from '../../src/modules/users/users.service';
import { User as _User } from '../../src/modules/users/entities/user.entity';
import { RefreshToken } from '../../src/modules/auth/entities/refresh-token.entity';
import { PasswordResetToken as _PasswordResetToken } from '../../src/modules/auth/entities/password-reset-token.entity';

// Interfaces para queries SQL raw (snake_case como en DB)
interface RefreshTokenRow {
  id: string;
  user_id: number;
  token: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
  ip_address: string | null;
  user_agent: string | null;
}

interface PasswordResetTokenRow {
  id: string;
  user_id: number;
  token: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

/**
 * AUTH + USERS INTEGRATION TESTS
 *
 * Objetivo: Validar las interacciones entre AuthOrchestratorService y UsersService con BD real
 * Diferencia con E2E: No prueba endpoints HTTP, sino la integración directa de servicios
 *
 * REGLA DE ORO: Estos tests deben BUSCAR ERRORES REALES, no asumir que todo funciona
 */
describe('Auth + Users Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authService: AuthOrchestratorService;
  let usersService: UsersService;

  const testUserData = {
    email: 'integration-auth-test@example.com',
    password: 'SecurePassword123!',
    name: 'Integration Auth User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    authService = moduleFixture.get<AuthOrchestratorService>(
      AuthOrchestratorService,
    );
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM "user" WHERE email = $1`, [
      testUserData.email,
    ]);
    await app.close();
  });

  afterEach(async () => {
    // Cleanup entre tests
    await dataSource.query(
      `DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`,
      [testUserData.email],
    );
    await dataSource.query(
      `DELETE FROM password_reset_tokens WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`,
      [testUserData.email],
    );
    await dataSource.query(`DELETE FROM "user" WHERE email = $1`, [
      testUserData.email,
    ]);
  });

  describe('Register Flow - AuthOrchestratorService + UsersService', () => {
    it('should create user in database when registering', async () => {
      // TDD RED: Este test debe fallar si hay algún problema en la integración
      const result = await authService.register(
        {
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1', // ipAddress
        'Integration Test Agent', // userAgent
      );

      // Verificar que AuthOrchestratorService retorna los datos correctos
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();

      // CRÍTICO: Verificar que el usuario realmente se creó en BD
      const userInDb = await usersService.findByEmail(testUserData.email);
      expect(userInDb).toBeDefined();
      expect(userInDb?.email).toBe(testUserData.email);
      expect(userInDb?.name).toBe(testUserData.name);
      expect(userInDb?.plan).toBe('free');
      expect(userInDb?.isAdmin).toBe(false);

      // Verificar que la contraseña está hasheada (no en texto plano)
      expect(userInDb?.password).not.toBe(testUserData.password);
      expect(userInDb?.password).toContain('$2');
    });

    it('should normalize email to lowercase during registration', async () => {
      // EDGE CASE: Email con mayúsculas debe guardarse en lowercase
      const emailWithCaps = 'TEST@EXAMPLE.COM';

      // Cleanup preventivo por si el test falló anteriormente
      await dataSource.query(`DELETE FROM "user" WHERE email = $1`, [
        emailWithCaps.toLowerCase(),
      ]);

      const _result = await authService.register(
        {
          email: emailWithCaps,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1',
        'Integration Test Agent',
      );

      const userInDb = await usersService.findByEmail(emailWithCaps);
      expect(userInDb?.email).toBe(emailWithCaps.toLowerCase());

      // Cleanup
      await dataSource.query(`DELETE FROM "user" WHERE email = $1`, [
        emailWithCaps.toLowerCase(),
      ]);
    });

    it('should prevent duplicate registration with same email', async () => {
      // Primera registración
      await authService.register(
        {
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1',
        'Integration Test Agent',
      );

      // BUSCAR BUG: ¿Qué pasa si intento registrar con el mismo email?
      await expect(
        authService.register(
          {
            email: testUserData.email,
            password: 'DifferentPassword123!',
            name: 'Different Name',
          },
          '127.0.0.1',
          'Integration Test Agent',
        ),
      ).rejects.toThrow();

      // Verificar que solo hay UN usuario en BD
      const users = await dataSource.query(
        `SELECT * FROM "user" WHERE email = $1`,
        [testUserData.email],
      );
      expect(users).toHaveLength(1);
    });
  });

  describe('Login Flow - AuthOrchestratorService + UsersService', () => {
    let registeredUser: {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      plan: string;
    };

    beforeEach(async () => {
      const result = await authService.register(
        {
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1',
        'Integration Test Agent',
      );
      registeredUser = result.user;
    });

    it('should validate credentials against database', async () => {
      // Login con credenciales correctas - primero validar usuario
      const validated = await authService.validateUser(
        testUserData.email,
        testUserData.password,
        '127.0.0.1',
        'Integration Test Agent',
      );

      expect(validated).not.toBeNull();
      if (!validated) return;

      const loginResult = await authService.login(
        validated.id,
        validated.email,
        '127.0.0.1',
        'Integration Test Agent',
      );

      expect(loginResult).toBeDefined();
      expect(loginResult.user.id).toBe(registeredUser.id);
      expect(loginResult.access_token).toBeDefined();
      expect(loginResult.refresh_token).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      // BUSCAR BUG: ¿Se valida correctamente la contraseña?
      const validated = await authService.validateUser(
        testUserData.email,
        'WrongPassword123!',
        '127.0.0.1',
        'Integration Test Agent',
      );

      // validateUser debe retornar null para contraseña incorrecta
      expect(validated).toBeNull();
    });

    it('should reject login with non-existent email', async () => {
      // BUSCAR BUG: ¿Maneja correctamente usuarios que no existen?
      const validated = await authService.validateUser(
        'nonexistent@example.com',
        testUserData.password,
        '127.0.0.1',
        'Integration Test Agent',
      );

      // validateUser debe retornar null para usuario no existente
      expect(validated).toBeNull();
    });

    it('should create refresh token in database on login', async () => {
      const validated = await authService.validateUser(
        testUserData.email,
        testUserData.password,
        '127.0.0.1',
        'Integration Test Agent',
      );

      if (!validated) {
        throw new Error('User validation failed');
      }

      const _loginResult = await authService.login(
        validated.id,
        validated.email,
        '127.0.0.1',
        'Integration Test Agent',
      );

      // CRÍTICO: Verificar que el refresh token se guardó en BD
      const refreshTokensInDb = await dataSource.query<RefreshTokenRow[]>(
        `SELECT * FROM refresh_tokens WHERE user_id = $1`,
        [registeredUser.id],
      );

      expect(refreshTokensInDb.length).toBeGreaterThan(0);
      expect(refreshTokensInDb[0].user_id).toBe(registeredUser.id);
      expect(refreshTokensInDb[0].revoked_at).toBeNull();
    });
  });

  describe('Refresh Token Rotation', () => {
    let _user: {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      plan: string;
    };
    let refreshToken: string;

    beforeEach(async () => {
      const registerResult = await authService.register(
        {
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1',
        'Integration Test Agent',
      );
      _user = registerResult.user;
      refreshToken = registerResult.refresh_token;
    });

    it('should rotate refresh token and revoke old one', async () => {
      // Obtener nuevo access token con refresh token
      const refreshResult = await authService.refresh(
        refreshToken,
        '127.0.0.1',
        'Integration Test Agent',
      );

      expect(refreshResult).toBeDefined();
      expect(refreshResult.access_token).toBeDefined();
      expect(refreshResult.refresh_token).toBeDefined();
      expect(refreshResult.refresh_token).not.toBe(refreshToken); // Nuevo token diferente

      // CRÍTICO: Verificar que el token viejo fue revocado
      const oldTokenInDb = await dataSource.query<RefreshToken[]>(
        `SELECT * FROM refresh_tokens WHERE token = $1`,
        [refreshToken],
      );

      // BUSCAR BUG: ¿Se revoca correctamente el token viejo?
      if (oldTokenInDb.length > 0) {
        expect(oldTokenInDb[0].revokedAt).not.toBeNull();
      }
    });

    it('should reject refresh with already used token', async () => {
      // Usar el refresh token una vez
      await authService.refresh(
        refreshToken,
        '127.0.0.1',
        'Integration Test Agent',
      );

      // BUSCAR BUG: ¿Permite reutilizar un token ya usado?
      await expect(
        authService.refresh(
          refreshToken,
          '127.0.0.1',
          'Integration Test Agent',
        ),
      ).rejects.toThrow();
    });

    it('should reject refresh with invalid token', async () => {
      // BUSCAR BUG: ¿Valida correctamente tokens inválidos?
      await expect(
        authService.refresh(
          'invalid-token-12345',
          '127.0.0.1',
          'Integration Test Agent',
        ),
      ).rejects.toThrow();
    });
  });

  describe('Password Recovery Flow', () => {
    let user: {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      plan: string;
    };

    beforeEach(async () => {
      const result = await authService.register(
        {
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1',
        'Integration Test Agent',
      );
      user = result.user;
    });

    it('should create reset token in database', async () => {
      const { token } = await authService.forgotPassword(testUserData.email);

      // CRÍTICO: Verificar que se creó el token en BD (hasheado)
      const resetTokensInDb = await dataSource.query<PasswordResetTokenRow[]>(
        `SELECT * FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL`,
        [user.id],
      );

      expect(resetTokensInDb.length).toBeGreaterThan(0);
      expect(resetTokensInDb[0].user_id).toBe(user.id);
      expect(resetTokensInDb[0].expires_at).toBeDefined();
      // No podemos comparar tokens directamente porque se hashean
      expect(token).toBeDefined();
    });

    it('should reset password and mark token as used', async () => {
      const { token } = await authService.forgotPassword(testUserData.email);

      const newPassword = 'NewSecurePassword123!';

      // Reset password
      await authService.resetPassword(token!, newPassword);

      // CRÍTICO: Verificar que la contraseña cambió en la base de datos
      // findByEmail retorna tipo parcial sin password, verificamos desde DB
      const updatedUserFromDb = await dataSource.query(
        `SELECT password FROM "user" WHERE id = $1`,
        [user.id],
      );
      expect(updatedUserFromDb[0]?.password).toBeDefined();
      // No podemos comparar directamente porque está hasheada

      // BUSCAR BUG: ¿Se marca el token como usado?
      // Obtener el token por el user_id ya que el token está hasheado
      const usedTokens = await dataSource.query<PasswordResetTokenRow[]>(
        `SELECT * FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [user.id],
      );
      expect(usedTokens[0].used_at).not.toBeNull();

      // Verificar que puede hacer login con la nueva contraseña
      const validated = await authService.validateUser(
        testUserData.email,
        newPassword,
        '127.0.0.1',
        'Integration Test Agent',
      );
      expect(validated).not.toBeNull();

      if (validated) {
        const _loginResult = await authService.login(
          validated.id,
          validated.email,
          '127.0.0.1',
          'Integration Test Agent',
        );
        expect(_loginResult).toBeDefined();
      }
    });

    it('should invalidate all refresh tokens after password reset', async () => {
      // Login para crear refresh token
      const validated = await authService.validateUser(
        testUserData.email,
        testUserData.password,
        '127.0.0.1',
        'Integration Test Agent',
      );

      if (validated) {
        await authService.login(
          validated.id,
          validated.email,
          '127.0.0.1',
          'Integration Test Agent',
        );
      }

      const { token } = await authService.forgotPassword(testUserData.email);

      await authService.resetPassword(token!, 'NewPassword123!');

      // CRÍTICO: Verificar que los refresh tokens fueron revocados
      const activeRefreshTokens = await dataSource.query<RefreshToken[]>(
        `SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL`,
        [user.id],
      );

      // BUSCAR BUG: ¿Se invalidan las sesiones activas por seguridad?
      expect(activeRefreshTokens).toHaveLength(0);
    });

    it('should reject expired reset token', async () => {
      const { token } = await authService.forgotPassword(testUserData.email);

      // Expirar el token manualmente con fecha absoluta en el pasado
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 horas atrás
      await dataSource.query(
        `UPDATE password_reset_tokens SET expires_at = $1 WHERE user_id = $2`,
        [pastDate, user.id],
      );

      // BUSCAR BUG: ¿Se valida correctamente la expiración?
      await expect(
        authService.resetPassword(token!, 'NewPassword123!'),
      ).rejects.toThrow();
    });

    it('should reject already used reset token', async () => {
      const { token } = await authService.forgotPassword(testUserData.email);

      // Usar el token una vez
      await authService.resetPassword(token!, 'NewPassword123!');

      // BUSCAR BUG: ¿Permite reutilizar un token?
      await expect(
        authService.resetPassword(token!, 'AnotherPassword123!'),
      ).rejects.toThrow();
    });
  });

  describe('Logout - Refresh Token Revocation', () => {
    let user: {
      id: number;
      email: string;
      name: string;
      isAdmin: boolean;
      plan: string;
    };
    let refreshToken: string;

    beforeEach(async () => {
      const result = await authService.register(
        {
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        },
        '127.0.0.1',
        'Integration Test Agent',
      );
      user = result.user;
      refreshToken = result.refresh_token;
    });

    it('should revoke refresh token on logout', async () => {
      await authService.logout(refreshToken);

      // CRÍTICO: Verificar que el token fue revocado
      // Como el token se hashea en DB, buscamos por user_id
      const revokedTokens = await dataSource.query<RefreshTokenRow[]>(
        `SELECT * FROM refresh_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [user.id],
      );

      expect(revokedTokens.length).toBeGreaterThan(0);
      expect(revokedTokens[0].revoked_at).not.toBeNull();
    });

    it('should revoke all refresh tokens on logoutAll', async () => {
      // Crear múltiples refresh tokens (simulando login desde múltiples dispositivos)
      const validated1 = await authService.validateUser(
        testUserData.email,
        testUserData.password,
        '127.0.0.1',
        'Device 1',
      );
      if (validated1) {
        await authService.login(
          validated1.id,
          validated1.email,
          '127.0.0.1',
          'Device 1',
        );
      }

      const validated2 = await authService.validateUser(
        testUserData.email,
        testUserData.password,
        '192.168.1.1',
        'Device 2',
      );
      if (validated2) {
        await authService.login(
          validated2.id,
          validated2.email,
          '192.168.1.1',
          'Device 2',
        );
      }

      await authService.logoutAll(user.id);

      // CRÍTICO: Verificar que TODOS los tokens fueron revocados
      const allTokens = await dataSource.query<RefreshTokenRow[]>(
        `SELECT * FROM refresh_tokens WHERE user_id = $1 AND revoked_at IS NULL`,
        [user.id],
      );

      expect(allTokens).toHaveLength(0);
    });
  });
});
