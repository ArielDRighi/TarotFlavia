import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tarotista } from '../src/modules/tarotistas/entities/tarotista.entity';
import { User, UserPlan } from '../src/modules/users/entities/user.entity';
import {
  UserTarotistaSubscription,
  SubscriptionType,
  SubscriptionStatus,
} from '../src/modules/tarotistas/entities/user-tarotista-subscription.entity';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    plan: string;
  };
  access_token: string;
}

/**
 * E2E Tests para Sistema de Suscripciones a Tarotistas
 *
 * Valida el modelo de negocio core del marketplace:
 * - FREE: 1 tarotista favorito, cooldown 30 días
 * - PREMIUM: cambio sin cooldown o all-access
 * - Tracking de lecturas por tarotista
 */
describe('Subscriptions System E2E', () => {
  let app: INestApplication;
  const dbHelper = new E2EDatabaseHelper();
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUserId: number;
  let premiumUserId: number;
  let tarotistaRepo: Repository<Tarotista>;
  let userRepo: Repository<User>;
  let subscriptionRepo: Repository<UserTarotistaSubscription>;
  let flaviaId: number;
  let testTarotistaId: number;
  const testTimestamp = Date.now();

  beforeAll(async () => {
    await dbHelper.initialize();

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

    tarotistaRepo = moduleFixture.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );
    userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    subscriptionRepo = moduleFixture.get<Repository<UserTarotistaSubscription>>(
      getRepositoryToken(UserTarotistaSubscription),
    );

    // Buscar Flavia (debe existir del seed)
    const flavia = await tarotistaRepo.findOne({
      where: { nombrePublico: 'Flavia' },
    });
    flaviaId = flavia!.id;

    // Crear un tarotista adicional para tests
    const testUser = await userRepo.save({
      email: `tarotista-${testTimestamp}@test.com`,
      password: 'hashedpassword',
      name: 'Test Tarotista',
    });

    const testTarotista = await tarotistaRepo.save({
      userId: testUser.id,
      nombrePublico: 'Test Tarotista',
      isActive: true,
      isAcceptingNewClients: true,
      especialidades: ['Amor'],
      idiomas: ['Español'],
    });
    testTarotistaId = testTarotista.id;

    // Registrar usuarios de prueba
    const freeUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `free-user-${testTimestamp}@test.com`,
        password: 'Test1234!',
        name: 'Free User',
      });

    freeUserId = freeUser.body.user.id;
    freeUserToken = freeUser.body.access_token;

    const premiumUser = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `premium-user-${testTimestamp}@test.com`,
        password: 'Test1234!',
        name: 'Premium User',
      });

    premiumUserId = premiumUser.body.user.id;
    premiumUserToken = premiumUser.body.access_token;

    // Actualizar usuario a PREMIUM
    await userRepo.update(premiumUserId, {
      plan: UserPlan.PREMIUM,
      planStartedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await subscriptionRepo.delete({ userId: freeUserId });
    await subscriptionRepo.delete({ userId: premiumUserId });
    await tarotistaRepo.delete({ id: testTarotistaId });
    await userRepo.delete({ id: freeUserId });
    await userRepo.delete({ id: premiumUserId });
    await userRepo.delete({ email: `tarotista-${testTimestamp}@test.com` });

    await app.close();
  });

  describe('POST /subscriptions/set-favorite (FREE user)', () => {
    it('debería permitir elegir primer tarotista favorito', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: flaviaId })
        .expect(200);

      expect(response.body.message).toBe(
        'Tarotista favorito establecido correctamente',
      );
      expect(response.body.subscription).toBeDefined();
      expect(response.body.subscription.tarotistaId).toBe(flaviaId);
      expect(response.body.subscription.subscriptionType).toBe(
        SubscriptionType.FAVORITE,
      );
      expect(response.body.subscription.canChangeAt).toBeDefined();

      // Verificar que canChangeAt es ~30 días en el futuro
      const canChangeAt = new Date(response.body.subscription.canChangeAt);
      const daysDiff = Math.floor(
        (canChangeAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(daysDiff).toBeGreaterThanOrEqual(29);
      expect(daysDiff).toBeLessThanOrEqual(30);
    });

    it('debería rechazar cambio antes del cooldown de 30 días', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: testTarotistaId })
        .expect(400);

      expect(response.body.message).toContain(
        'No puedes cambiar de tarotista favorito aún',
      );
    });

    it('debería rechazar si tarotista no existe', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 99999 })
        .expect(404);

      expect(response.body.message).toBe('Tarotista no encontrado');
    });
  });

  describe('POST /subscriptions/set-favorite (PREMIUM user)', () => {
    it('debería permitir elegir tarotista sin cooldown', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: flaviaId })
        .expect(200);

      expect(response.body.subscription.tarotistaId).toBe(flaviaId);
      expect(response.body.subscription.subscriptionType).toBe(
        SubscriptionType.PREMIUM_INDIVIDUAL,
      );
      expect(response.body.subscription.canChangeAt).toBeNull();
    });

    it('debería permitir cambiar inmediatamente a otro tarotista', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: testTarotistaId })
        .expect(200);

      expect(response.body.subscription.tarotistaId).toBe(testTarotistaId);
      expect(response.body.subscription.changeCount).toBeGreaterThan(0);
    });
  });

  describe('GET /subscriptions/my-subscription', () => {
    it('debería retornar información de suscripción FREE', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscriptions/my-subscription')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.subscriptionType).toBe(SubscriptionType.FAVORITE);
      expect(response.body.tarotistaId).toBe(flaviaId);
      expect(response.body.tarotistaNombre).toBe('Flavia');
      expect(response.body.canChange).toBe(false); // Todavía en cooldown
      expect(response.body.canChangeAt).toBeDefined();
    });

    it('debería retornar información de suscripción PREMIUM', async () => {
      const response = await request(app.getHttpServer())
        .get('/subscriptions/my-subscription')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.subscriptionType).toBe(
        SubscriptionType.PREMIUM_INDIVIDUAL,
      );
      expect(response.body.tarotistaId).toBe(testTarotistaId);
      expect(response.body.canChange).toBe(true); // PREMIUM siempre puede cambiar
    });
  });

  describe('POST /subscriptions/enable-all-access', () => {
    it('debería permitir a PREMIUM activar modo all-access', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/enable-all-access')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(response.body.message).toBe(
        'Modo all-access activado correctamente',
      );
      expect(response.body.subscription.subscriptionType).toBe(
        SubscriptionType.PREMIUM_ALL_ACCESS,
      );
      expect(response.body.subscription.tarotistaId).toBeNull();
    });

    it('debería rechazar activación para usuario FREE', async () => {
      // Asegurar que el usuario FREE tenga una suscripción
      const existingSub = await subscriptionRepo.findOne({
        where: { userId: freeUserId, status: SubscriptionStatus.ACTIVE },
      });

      if (!existingSub) {
        await subscriptionRepo.save({
          userId: freeUserId,
          tarotistaId: flaviaId,
          subscriptionType: SubscriptionType.FAVORITE,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          canChangeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          changeCount: 0,
        });
      }

      const response = await request(app.getHttpServer())
        .post('/subscriptions/enable-all-access')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);

      expect(response.body.message).toContain('Solo usuarios PREMIUM');
    });
  });

  describe('Flujo completo: Upgrade FREE → PREMIUM', () => {
    it('debería permitir cambio inmediato después de upgrade', async () => {
      // Usuario FREE tiene favorito con cooldown activo
      const subBefore = await subscriptionRepo.findOne({
        where: { userId: freeUserId },
      });

      // Si no existe suscripción, crearla primero
      if (!subBefore) {
        await subscriptionRepo.save({
          userId: freeUserId,
          tarotistaId: flaviaId,
          subscriptionType: SubscriptionType.FAVORITE,
          status: SubscriptionStatus.ACTIVE,
          startedAt: new Date(),
          canChangeAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          changeCount: 0,
        });
      }

      // Upgrade a PREMIUM
      await userRepo.update(freeUserId, {
        plan: UserPlan.PREMIUM,
        planStartedAt: new Date(),
      });

      // Ahora debería poder cambiar inmediatamente
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: testTarotistaId })
        .expect(200);

      expect(response.body.subscription.tarotistaId).toBe(testTarotistaId);
      expect(response.body.subscription.canChangeAt).toBeNull(); // Sin cooldown
    });
  });

  describe('Validaciones de negocio', () => {
    it('debería rechazar tarotistaId inválido (string)', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 'invalid' })
        .expect(400);

      expect(
        Array.isArray(response.body.message)
          ? response.body.message[0]
          : response.body.message,
      ).toContain('must be');
    });

    it('debería rechazar tarotistaId negativo', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: -1 })
        .expect(400);

      expect(
        Array.isArray(response.body.message)
          ? response.body.message[0]
          : response.body.message,
      ).toContain('positive');
    });

    it('debería rechazar tarotistaId faltante', async () => {
      const response = await request(app.getHttpServer())
        .post('/subscriptions/set-favorite')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({})
        .expect(400);

      const message = Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message;
      expect(message).toContain('tarotistaId');
    });

    it('debería rechazar acceso sin autenticación', async () => {
      await request(app.getHttpServer())
        .get('/subscriptions/my-subscription')
        .expect(401);
    });
  });
});
