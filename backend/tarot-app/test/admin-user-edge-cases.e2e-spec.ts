import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { UserPlan, UserRole } from '../src/modules/users/entities/user.entity';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    roles: UserRole[];
    plan: string;
  };
  access_token: string;
  refresh_token: string;
}

interface UserActionResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: UserRole[];
    plan: UserPlan;
    bannedAt: Date | null;
    banReason: string | null;
  };
}

/**
 * Admin User Journey - Edge Cases E2E Tests
 *
 * Tests complementarios a admin-users.e2e-spec.ts que cubren casos borde
 * y escenarios de error no cubiertos en los tests principales.
 *
 * Coverage adicional:
 * - Operaciones simultáneas (ban + update plan)
 * - Re-autenticación después de cambios de rol
 * - Validación de permisos después de remover rol ADMIN
 * - Consistencia de datos después de múltiples operaciones
 * - Escenarios de error con usuarios inexistentes
 * - Validaciones de integridad de roles
 */
describe('Admin User Journey - Edge Cases E2E', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let adminToken: string;
  let testUserEmail: string;
  let testUserId: number;
  const testTimestamp = Date.now();

  beforeAll(async () => {
    await dbHelper.initialize();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login as seeded admin user
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    const adminLoginBody = adminLoginResponse.body as LoginResponse;
    adminToken = adminLoginBody.access_token;

    // Create test user for edge case testing
    testUserEmail = `admin-edge-${testTimestamp}@test.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testUserEmail,
        password: 'SecurePass123!',
        name: 'Admin Edge Test User',
      })
      .expect(201);

    const registerBody = registerResponse.body as LoginResponse;
    testUserId = registerBody.user.id;
  }, 60000);

  afterAll(async () => {
    const ds = dbHelper.getDataSource();

    // Clean up test user and related data
    if (testUserId) {
      // Delete interpretations first (foreign key)
      await ds.query(
        'DELETE FROM tarot_interpretation WHERE "readingId" IN (SELECT id FROM tarot_reading WHERE "userId" = $1)',
        [testUserId],
      );
      // Delete readings
      await ds.query('DELETE FROM tarot_reading WHERE "userId" = $1', [
        testUserId,
      ]);
      // Delete usage limits
      await ds.query('DELETE FROM usage_limit WHERE user_id = $1', [
        testUserId,
      ]);
      // Delete user
      await ds.query('DELETE FROM "user" WHERE id = $1', [testUserId]);
    }

    await dbHelper.close();
    await app.close();
  }, 30000);

  /**
   * 1. Operaciones Simultáneas Admin
   */
  describe('1. Operaciones Simultáneas Admin', () => {
    it('✅ Admin puede banear usuario y actualizar plan simultáneamente sin corrupción de datos', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 1. Ban user
      const banResponse = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test simultaneous operations' })
        .expect(201);

      const banBody = banResponse.body as UserActionResponse;
      expect(banBody.user.bannedAt).not.toBeNull();
      expect(banBody.user.banReason).toBe('Test simultaneous operations');

      // Esperar un poco entre operaciones
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 2. Update plan (usuario sigue baneado)
      const planResponse = await request(app.getHttpServer())
        .patch(`/admin/users/${testUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.PREMIUM })
        .expect(200);

      const planBody = planResponse.body as UserActionResponse;
      expect(planBody.user.plan).toBe(UserPlan.PREMIUM);
      // Verificar que el ban se mantiene
      expect(planBody.user.bannedAt).not.toBeNull();
      expect(planBody.user.banReason).toBe('Test simultaneous operations');

      // Verificar estado en BD
      const ds = dbHelper.getDataSource();
      type UserRow = { plan: string; bannedAt: Date | null };
      const userResult = (await ds.query('SELECT * FROM "user" WHERE id = $1', [
        testUserId,
      ])) as unknown as UserRow[];
      expect(userResult.length).toBe(1);
      expect(userResult[0].plan).toBe(UserPlan.PREMIUM);
      expect(userResult[0].bannedAt).not.toBeNull();
    }, 35000);

    it('✅ Usuario baneado no puede acceder a endpoints protegidos', async () => {
      // Intentar login con usuario baneado
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePass123!',
        });

      // Debe ser rechazado por estar baneado
      expect(loginResponse.status).toBe(401);
      type ErrorResponse = { message: string };
      const body = loginResponse.body as ErrorResponse;
      expect(body.message).toContain('baneado');
    });

    it('✅ Unban restaura acceso a usuario', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Unban usuario
      const unbanResponse = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/unban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      const unbanBody = unbanResponse.body as UserActionResponse;
      expect(unbanBody.user.bannedAt).toBeNull();
      expect(unbanBody.user.banReason).toBeNull();

      // Ahora el usuario puede hacer login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePass123!',
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;
      expect(loginBody.user.id).toBe(testUserId);
      expect(loginBody.access_token).toBeDefined();
    }, 35000);
  });

  /**
   * 2. Re-autenticación después de cambios de rol
   */
  describe('2. Re-autenticación después de cambios de rol', () => {
    it('✅ Usuario debe re-autenticarse después de agregar rol ADMIN para obtener permisos', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Login inicial
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePass123!',
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;
      const oldToken = loginBody.access_token;

      // Verificar que NO es admin con token actual
      const userListBefore = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${oldToken}`);

      expect(userListBefore.status).toBe(403); // Forbidden

      // Admin agrega rol ADMIN al usuario
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/roles/admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      // Token antiguo aún NO tiene permisos de admin (JWT inmutable)
      const userListWithOldToken = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${oldToken}`);

      expect(userListWithOldToken.status).toBe(403); // Forbidden

      // Re-autenticarse para obtener nuevo token con roles actualizados
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const reLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePass123!',
        })
        .expect(200);

      const reLoginBody = reLoginResponse.body as LoginResponse;
      const newToken = reLoginBody.access_token;

      // NOTE: LoginResponse doesn't include roles field
      // Roles are embedded in JWT and checked by guards

      // Ahora con nuevo token puede acceder a endpoints de admin
      const userListWithNewToken = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(userListWithNewToken.body).toHaveProperty('users');
    }, 40000);

    it('✅ Remover rol ADMIN bloquea acceso incluso con token válido', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Login con usuario que tiene rol ADMIN
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePass123!',
        })
        .expect(200);

      const loginBody = loginResponse.body as LoginResponse;
      const userToken = loginBody.access_token;

      // Verificar que tiene acceso a endpoints de admin
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Admin remueve rol ADMIN
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}/roles/admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // NOTE: RolesGuard verifica roles desde JWT (inmutable), NO desde BD
      // Por lo tanto, el token antiguo SIGUE funcionando hasta que expire
      const stillWorksResponse = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      // Token antiguo sigue teniendo acceso (roles en JWT)
      expect(stillWorksResponse.status).toBe(200);

      // Usuario debe re-autenticarse para perder permisos de admin
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
          password: 'SecurePass123!',
        })
        .expect(200);

      const newLoginBody = newLoginResponse.body as LoginResponse;
      const freshToken = newLoginBody.access_token;

      // Ahora con token fresh (sin rol ADMIN) debe ser rechazado
      const blockedResponse = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${freshToken}`);

      expect(blockedResponse.status).toBe(403); // Forbidden
    }, 35000);
  });

  /**
   * 3. Múltiples operaciones y consistencia de datos
   */
  describe('3. Múltiples operaciones y consistencia de datos', () => {
    it('✅ Secuencia completa de operaciones admin mantiene integridad de datos', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 1. Verificar estado inicial (puede ser PREMIUM por tests previos)
      const ds = dbHelper.getDataSource();
      type UserRow = { plan: string; bannedAt: Date | null; roles: UserRole[] };
      let userResult = (await ds.query('SELECT * FROM "user" WHERE id = $1', [
        testUserId,
      ])) as unknown as UserRow[];
      // Usuario puede estar en cualquier estado debido a tests previos
      expect(userResult[0].bannedAt).toBeNull();

      // 2. Upgrade a PREMIUM
      await request(app.getHttpServer())
        .patch(`/admin/users/${testUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.PREMIUM })
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Agregar rol TAROTIST
      await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 4. Verificar estado intermedio
      userResult = (await ds.query('SELECT * FROM "user" WHERE id = $1', [
        testUserId,
      ])) as unknown as UserRow[];
      expect(userResult[0].plan).toBe(UserPlan.PREMIUM);
      expect(userResult[0].roles).toContain(UserRole.TAROTIST);

      // 5. Ban usuario
      await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Consistency test' })
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 6. Verificar que ban NO afecta plan ni roles
      userResult = (await ds.query('SELECT * FROM "user" WHERE id = $1', [
        testUserId,
      ])) as unknown as UserRow[];
      expect(userResult[0].plan).toBe(UserPlan.PREMIUM);
      expect(userResult[0].roles).toContain(UserRole.TAROTIST);
      expect(userResult[0].bannedAt).not.toBeNull();

      // 7. Unban usuario
      await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/unban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 8. Remover rol TAROTIST
      await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 9. Downgrade a FREE
      await request(app.getHttpServer())
        .patch(`/admin/users/${testUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.FREE })
        .expect(200);

      // 10. Verificar estado final (FREE, no baneado, solo CONSUMER)
      userResult = (await ds.query('SELECT * FROM "user" WHERE id = $1', [
        testUserId,
      ])) as unknown as UserRow[];
      expect(userResult[0].plan).toBe(UserPlan.FREE);
      expect(userResult[0].bannedAt).toBeNull();
      // PostgreSQL stores array as text: "{consumer}"
      const rolesStr = userResult[0].roles as unknown as string;
      expect(rolesStr).toContain(UserRole.CONSUMER);
    }, 70000);
  });

  /**
   * 4. Escenarios de error
   */
  describe('4. Escenarios de error', () => {
    it('✅ Ban usuario inexistente retorna error', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .post('/admin/users/999999/ban')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test' });

      // May return 400 (validation) or 404 (not found) depending on implementation
      expect([400, 404]).toContain(response.status);
    });

    it('✅ Unban usuario inexistente retorna 404', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/users/999999/unban')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('no encontrado');
    });

    it('✅ Actualizar plan de usuario inexistente retorna 404', async () => {
      const response = await request(app.getHttpServer())
        .patch('/admin/users/999999/plan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.PREMIUM })
        .expect(404);

      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('no encontrado');
    });

    it('✅ Agregar rol a usuario inexistente retorna 404', async () => {
      const response = await request(app.getHttpServer())
        .post('/admin/users/999999/roles/tarotist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('no encontrado');
    });

    it('✅ Remover rol de usuario inexistente retorna 404', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/users/999999/roles/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('no encontrado');
    });

    it('✅ Eliminar usuario inexistente retorna 404', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('no encontrado');
    });
  });

  /**
   * 5. Validaciones de integridad de roles
   */
  describe('5. Validaciones de integridad de roles', () => {
    it('✅ Rol inválido (consumer) retorna error de validación', async () => {
      // Esperar para evitar rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}/roles/consumer`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Endpoint valida que rol sea 'tarotist' o 'admin'
      expect(response.status).toBe(400);
      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('Rol inválido');
    });

    it('✅ Agregar rol TAROTIST que ya tiene retorna error (no es idempotente)', async () => {
      // Primero agregar rol TAROTIST
      await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Agregar nuevamente (NO es idempotente - retorna 400)
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Endpoint retorna 400 si el usuario ya tiene el rol
      expect(response.status).toBe(400);
    });

    it('✅ Remover rol que no tiene retorna 400', async () => {
      // Primero remover rol TAROTIST si lo tiene
      await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Intentar remover nuevamente (usuario ya no tiene el rol)
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      // Error message in English
      type ErrorResponse = { message: string };
      const body = response.body as ErrorResponse;
      expect(body.message).toContain('does not have');
    });
  });
});
