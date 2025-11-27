import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { AuthOrchestratorService } from '../../src/modules/auth/application/services/auth-orchestrator.service';

// Entities
import { User, UserPlan } from '../../src/modules/users/entities/user.entity';
import { UserRole } from '../../src/common/enums/user-role.enum';
import { AuditLog } from '../../src/modules/audit/entities/audit-log.entity';

describe('Admin Operations Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let authService: AuthOrchestratorService;

  // Test data
  let adminUser: User;
  let adminToken: string;
  let regularUser: User;

  // Repositories
  let userRepository: any;
  let auditLogRepository: any;

  const adminUserData = {
    password: 'AdminPass123!',
    name: 'Admin Test User',
  };

  const regularUserData = {
    password: 'RegularPass123!',
    name: 'Regular Test User',
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
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthOrchestratorService>(
      AuthOrchestratorService,
    );

    // Inicializar repositorios
    userRepository = dataSource.getRepository(User);
    auditLogRepository = dataSource.getRepository(AuditLog);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Crear usuario ADMIN
    const uniqueAdminEmail = `admin-test-${Date.now()}-${Math.random()}@example.com`;
    const adminWithoutPassword = await usersService.create({
      email: uniqueAdminEmail,
      password: adminUserData.password,
      name: adminUserData.name,
    });

    adminUser = (await userRepository.findOne({
      where: { id: adminWithoutPassword.id },
    }))!;

    // Promover a ADMIN
    adminUser.roles = [UserRole.CONSUMER, UserRole.ADMIN];
    await userRepository.save(adminUser);

    // Obtener token de admin
    const adminLoginResponse = await authService.login(
      adminUser.id,
      adminUser.email,
      '127.0.0.1',
      'test-admin-agent',
    );
    adminToken = adminLoginResponse.access_token;

    // Crear usuario regular
    const uniqueUserEmail = `regular-test-${Date.now()}-${Math.random()}@example.com`;
    const regularWithoutPassword = await usersService.create({
      email: uniqueUserEmail,
      password: regularUserData.password,
      name: regularUserData.name,
    });

    regularUser = (await userRepository.findOne({
      where: { id: regularWithoutPassword.id },
    }))!;
  });

  afterEach(async () => {
    if (adminUser?.id) {
      await userRepository.delete({ id: adminUser.id });
    }
    if (regularUser?.id) {
      await userRepository.delete({ id: regularUser.id });
    }
  });

  describe('User Management', () => {
    it('should list all users with pagination', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      // ASSERT
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('totalItems');
      expect(response.body.meta).toHaveProperty('currentPage');
      expect(response.body.meta).toHaveProperty('itemsPerPage');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);

      // Verificar que incluye nuestros usuarios de prueba
      const emails = response.body.users.map(
        (user: { email: string }) => user.email,
      );
      expect(emails).toContain(adminUser.email);
      expect(emails).toContain(regularUser.email);
    });

    it('should get user detail with statistics', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get(`/admin/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // ASSERT
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(regularUser.id);
      expect(response.body.user.email).toBe(regularUser.email);
      expect(response.body.user.plan).toBe(UserPlan.FREE);

      // Verificar que NO devuelve el password
      expect(response.body.user.password).toBeUndefined();
    });

    it('should update user plan from FREE to PREMIUM', async () => {
      // ARRANGE
      const updatePayload = { plan: UserPlan.PREMIUM };

      // ACT
      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${regularUser.id}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatePayload)
        .expect(200);

      // ASSERT
      expect(response.body.message).toContain('actualizado');
      expect(response.body.user.plan).toBe(UserPlan.PREMIUM);

      // Verificar en BD
      const updatedUser = await userRepository.findOne({
        where: { id: regularUser.id },
      });
      expect(updatedUser.plan).toBe(UserPlan.PREMIUM);

      // Verificar audit log
      const auditLog = await auditLogRepository.findOne({
        where: {
          targetUserId: regularUser.id,
          action: 'plan_changed',
        },
        order: { createdAt: 'DESC' },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.userId).toBe(adminUser.id);
      expect(auditLog.oldValue).toEqual({ plan: UserPlan.FREE });
      expect(auditLog.newValue).toEqual({ plan: UserPlan.PREMIUM });
    });

    it('should ban user with reason', async () => {
      // ARRANGE
      const banPayload = { reason: 'Violación de términos de servicio' };

      // ACT
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(banPayload)
        .expect(201);

      // ASSERT
      expect(response.body.message).toContain('baneado');
      expect(response.body.user.bannedAt).toBeDefined();
      expect(response.body.user.banReason).toBe(banPayload.reason);

      // Verificar en BD
      const bannedUser = await userRepository.findOne({
        where: { id: regularUser.id },
      });
      expect(bannedUser.bannedAt).not.toBeNull();
      expect(bannedUser.banReason).toBe(banPayload.reason);

      // Verificar audit log
      const auditLog = await auditLogRepository.findOne({
        where: {
          targetUserId: regularUser.id,
          action: 'user_banned',
        },
        order: { createdAt: 'DESC' },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.userId).toBe(adminUser.id);
    });

    it('should unban previously banned user', async () => {
      // ARRANGE: Banear primero
      await usersService.banUser(regularUser.id, 'Test ban');

      // ACT
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/unban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      // ASSERT
      expect(response.body.message).toContain('desbaneado');
      expect(response.body.user.bannedAt).toBeNull();
      expect(response.body.user.banReason).toBeNull();

      // Verificar en BD
      const unbannedUser = await userRepository.findOne({
        where: { id: regularUser.id },
      });
      expect(unbannedUser.bannedAt).toBeNull();
      expect(unbannedUser.banReason).toBeNull();
    });
  });

  describe('Role Management', () => {
    it('should promote user to TAROTIST role', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      // ASSERT
      expect(response.body.message).toContain('TAROTIST');
      expect(response.body.user.roles).toContain(UserRole.TAROTIST);

      // Verificar en BD
      const updatedUser = await userRepository.findOne({
        where: { id: regularUser.id },
      });
      expect(updatedUser.roles).toContain(UserRole.TAROTIST);

      // Verificar audit log
      const auditLog = await auditLogRepository.findOne({
        where: {
          targetUserId: regularUser.id,
          action: 'role_added',
        },
        order: { createdAt: 'DESC' },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.newValue.roles).toContain(UserRole.TAROTIST);
    });

    it('should promote user to ADMIN role', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/roles/admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      // ASSERT
      expect(response.body.message).toContain('ADMIN');
      expect(response.body.user.roles).toContain(UserRole.ADMIN);

      // Verificar en BD
      const updatedUser = await userRepository.findOne({
        where: { id: regularUser.id },
      });
      expect(updatedUser.roles).toContain(UserRole.ADMIN);
    });

    it('should remove TAROTIST role from user', async () => {
      // ARRANGE: Agregar rol primero
      await usersService.addTarotistRole(regularUser.id);

      // ACT
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${regularUser.id}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // ASSERT
      expect(response.body.message).toContain('TAROTIST');
      expect(response.body.message).toContain('eliminado');
      expect(response.body.user.roles).not.toContain(UserRole.TAROTIST);

      // Verificar en BD
      const updatedUser = await userRepository.findOne({
        where: { id: regularUser.id },
      });
      expect(updatedUser.roles).not.toContain(UserRole.TAROTIST);
    });
  });

  describe('Authorization and Security', () => {
    it('should deny access to admin endpoints for regular users', async () => {
      // ARRANGE: Obtener token de usuario regular
      const regularLogin = await authService.login(
        regularUser.id,
        regularUser.email,
        '127.0.0.1',
        'test-user-agent',
      );
      const regularToken = regularLogin.access_token;

      // ACT & ASSERT
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });

    it('should deny access without authentication', async () => {
      // ACT & ASSERT
      await request(app.getHttpServer()).get('/admin/users').expect(401);
    });

    it('should validate plan enum values', async () => {
      // ARRANGE
      const invalidPayload = { plan: 'INVALID_PLAN' };

      // ACT & ASSERT
      await request(app.getHttpServer())
        .patch(`/admin/users/${regularUser.id}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload)
        .expect(400);
    });
  });

  describe('Audit Logging', () => {
    it('should log all admin actions in audit_log table', async () => {
      // ARRANGE
      const actionsBefore = await auditLogRepository.count({
        where: { userId: adminUser.id },
      });

      // ACT: Realizar varias acciones
      await request(app.getHttpServer())
        .patch(`/admin/users/${regularUser.id}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.PREMIUM })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/admin/users/${regularUser.id}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // ASSERT
      const actionsAfter = await auditLogRepository.count({
        where: { userId: adminUser.id },
      });

      expect(actionsAfter).toBe(actionsBefore + 3);

      // Verificar tipos de acciones
      const auditLogs = await auditLogRepository.find({
        where: { userId: adminUser.id },
        order: { createdAt: 'DESC' },
        take: 3,
      });

      const actions = auditLogs.map((log: AuditLog) => log.action);
      expect(actions).toContain('plan_changed');
      expect(actions).toContain('role_added');
      expect(actions).toContain('role_removed');
    });

    it('should store IP address and user agent in audit log', async () => {
      // ACT
      await request(app.getHttpServer())
        .patch(`/admin/users/${regularUser.id}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('User-Agent', 'TestAgent/1.0')
        .send({ plan: UserPlan.PREMIUM })
        .expect(200);

      // ASSERT
      const auditLog = await auditLogRepository.findOne({
        where: {
          targetUserId: regularUser.id,
          action: 'plan_changed',
        },
        order: { createdAt: 'DESC' },
      });

      expect(auditLog).toBeDefined();
      expect(auditLog.userAgent).toContain('TestAgent');
      expect(auditLog.ipAddress).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle update plan for non-existent user', async () => {
      // ARRANGE
      const nonExistentId = 999999;

      // ACT & ASSERT
      await request(app.getHttpServer())
        .patch(`/admin/users/${nonExistentId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.PREMIUM })
        .expect(404);
    });

    it('should handle ban for already banned user', async () => {
      // ARRANGE: Banear primero
      await usersService.banUser(regularUser.id, 'First ban');

      // ACT
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Second ban' })
        .expect(201);

      // ASSERT: Debe actualizar la razón del ban
      expect(response.body.user.banReason).toBe('Second ban');
    });

    it('should handle adding duplicate TAROTIST role', async () => {
      // ARRANGE: Agregar rol primero
      await usersService.addTarotistRole(regularUser.id);

      // ACT & ASSERT
      await request(app.getHttpServer())
        .post(`/admin/users/${regularUser.id}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should handle removing non-existent role', async () => {
      // ACT & ASSERT: Usuario regular no tiene rol TAROTIST
      await request(app.getHttpServer())
        .delete(`/admin/users/${regularUser.id}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });
});
