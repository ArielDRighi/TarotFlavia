import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { AuthService } from '../../src/modules/auth/auth.service';

// Entities
import { User } from '../../src/modules/users/entities/user.entity';
import { Tarotista } from '../../src/modules/tarotistas/entities/tarotista.entity';
import { TarotDeck as _TarotDeck } from '../../src/modules/tarot/decks/entities/tarot-deck.entity';
import { TarotCard as _TarotCard } from '../../src/modules/tarot/cards/entities/tarot-card.entity';
import { TarotSpread as _TarotSpread } from '../../src/modules/tarot/spreads/entities/tarot-spread.entity';
import { CachedInterpretation } from '../../src/modules/cache/infrastructure/entities/cached-interpretation.entity';

// Helpers
import { setupDefaultTarotista } from '../helpers/setup-default-tarotista';

// NOTE: Estos tests validan la estructura y configuración del sistema de cache
// Los tests que requieren llamadas reales a OpenAI API se marcan como .skip()
// debido a que requieren API key configurada

describe('Cache + AI Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let authService: AuthService;

  // Test data
  let testUser: User;
  let _authToken: string;

  // Repositories
  let userRepository: any;
  let _cacheRepository: any;

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
    authService = moduleFixture.get<AuthService>(AuthService);

    // Inicializar repositorios
    userRepository = dataSource.getRepository(User);
    _cacheRepository = dataSource.getRepository(CachedInterpretation);

    // Setup tarotista Flavia
    await setupDefaultTarotista(dataSource, usersService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const uniqueEmail = `cache-test-${Date.now()}-${Math.random()}@example.com`;

    const userWithoutPassword = await usersService.create({
      email: uniqueEmail,
      password: 'TestPass123!',
      name: 'Cache Test User',
    });

    testUser = (await userRepository.findOne({
      where: { id: userWithoutPassword.id },
    }))!;

    const tarotistaRepo = dataSource.getRepository(Tarotista);
    const tarotista = (await tarotistaRepo.findOne({
      where: { nombrePublico: 'Flavia' },
    }))!;

    const subscriptionRepo = dataSource.getRepository(
      'UserTarotistaSubscription',
    );
    await subscriptionRepo.save({
      userId: testUser.id,
      subscriptionType: 'favorite',
      status: 'active',
      tarotistaId: tarotista.id,
      startDate: new Date(),
    });

    const loginResponse = await authService.login(
      testUser,
      'test-user-agent',
      '127.0.0.1',
    );
    _authToken = loginResponse.access_token;
  });

  afterEach(async () => {
    if (testUser?.id) {
      const readingRepo = dataSource.getRepository('TarotReading');
      await readingRepo.delete({ user: { id: testUser.id } });
      await userRepository.delete({ id: testUser.id });
    }
  });

  describe('Cache Table Structure', () => {
    it('should have cached_interpretations table with correct schema', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      expect(table).toBeDefined();
      expect(table?.columns.map((col) => col.name)).toEqual(
        expect.arrayContaining([
          'id',
          'cache_key',
          'tarotista_id',
          'spread_id',
          'card_combination',
          'question_hash',
          'interpretation_text',
          'hit_count',
          'last_used_at',
          'created_at',
          'expires_at',
        ]),
      );

      await queryRunner.release();
    });

    it('should have tarotista_id as nullable column', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      const tarotistaColumn = table?.columns.find(
        (col) => col.name === 'tarotista_id',
      );

      expect(tarotistaColumn).toBeDefined();
      expect(tarotistaColumn?.isNullable).toBe(true);

      await queryRunner.release();
    });

    it('should have hit_count tracking column', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      const hitCountColumn = table?.columns.find(
        (col) => col.name === 'hit_count',
      );

      expect(hitCountColumn).toBeDefined();
      expect(hitCountColumn?.type).toContain('int');

      await queryRunner.release();
    });

    it('should have last_used_at timestamp column', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      const lastUsedColumn = table?.columns.find(
        (col) => col.name === 'last_used_at',
      );

      expect(lastUsedColumn).toBeDefined();
      expect(lastUsedColumn?.type).toContain('timestamp');

      await queryRunner.release();
    });
  });

  describe('Cache Cleanup System', () => {
    it('should be able to query expired cache entries', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const expiredCaches = await queryRunner.query(
        'SELECT COUNT(*) as count FROM cached_interpretations WHERE expires_at < NOW()',
      );

      expect(expiredCaches).toBeDefined();
      expect(expiredCaches[0]).toHaveProperty('count');

      await queryRunner.release();
    });
  });

  describe('Cache Integration with Readings', () => {
    it.skip('should cache interpretation after first reading (requires OpenAI key)', () => {
      // Este test requiere:
      // 1. OPENAI_API_KEY configurada en .env.test
      // 2. Crear lectura con generateInterpretation=true
      // 3. Verificar que se guarda en cached_interpretations

      expect(true).toBe(true);
    });

    it.skip('should reuse cached interpretation for identical reading (requires OpenAI key)', () => {
      // Este test requiere:
      // 1. OPENAI_API_KEY configurada
      // 2. Crear 2 lecturas idénticas
      // 3. Verificar que cache count no aumenta
      // 4. Verificar que hit_count aumenta

      expect(true).toBe(true);
    });

    it.skip('should invalidate cache when tarotista updates meanings (requires implementation)', () => {
      // Este test requiere:
      // 1. Sistema de card meanings personalizados implementado
      // 2. Crear lectura → guardar cache
      // 3. Tarotista actualiza significado
      // 4. Cache se invalida
      // 5. Nueva lectura genera nueva interpretación

      expect(true).toBe(true);
    });
  });

  describe('Cache Performance Metrics', () => {
    it('should track when cache was created', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      const createdAtColumn = table?.columns.find(
        (col) => col.name === 'created_at',
      );

      expect(createdAtColumn).toBeDefined();
      expect(createdAtColumn?.type).toContain('timestamp');

      await queryRunner.release();
    });

    it('should track cache expiration time', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      const expiresAtColumn = table?.columns.find(
        (col) => col.name === 'expires_at',
      );

      expect(expiresAtColumn).toBeDefined();
      expect(expiresAtColumn?.type).toContain('timestamp');

      await queryRunner.release();
    });

    it('should store card combination as JSONB', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const table = await queryRunner.getTable('cached_interpretations');

      const cardCombinationColumn = table?.columns.find(
        (col) => col.name === 'card_combination',
      );

      expect(cardCombinationColumn).toBeDefined();
      expect(cardCombinationColumn?.type).toBe('jsonb');

      await queryRunner.release();
    });
  });
});
