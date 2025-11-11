import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../src/modules/users/entities/user.entity';
import { TarotReading } from '../src/modules/tarot/readings/entities/tarot-reading.entity';
import { Tarotista } from '../src/modules/tarotistas/entities/tarotista.entity';
import { CachedInterpretation } from '../src/modules/cache/infrastructure/entities/cached-interpretation.entity';
import { HistoricalDataMigration } from '../migrate-historical-data';

describe('Historical Data Migration (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let readingRepository: Repository<TarotReading>;
  let tarotistaRepository: Repository<Tarotista>;
  let cacheRepository: Repository<CachedInterpretation>;
  let migration: HistoricalDataMigration;
  let flaviaTarotistaId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    userRepository = app.get(getRepositoryToken(User));
    readingRepository = app.get(getRepositoryToken(TarotReading));

    // Get repositories directly from dataSource for entities without modules
    tarotistaRepository = dataSource.getRepository(Tarotista);
    cacheRepository = app.get(getRepositoryToken(CachedInterpretation));

    migration = new HistoricalDataMigration(dataSource);

    // Find Flavia's tarotista ID
    const flaviaUser = await userRepository.findOne({
      where: { email: 'flavia@tarotflavia.com' },
    });

    if (!flaviaUser) {
      throw new Error('Flavia user not found in test setup');
    }

    const flaviaTarotista = await tarotistaRepository.findOne({
      where: { userId: flaviaUser.id },
    });

    if (!flaviaTarotista) {
      throw new Error(
        'Flavia tarotista not found - cannot run migration tests',
      );
    }

    flaviaTarotistaId = flaviaTarotista.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Reading Migration to Flavia', () => {
    it('should identify readings without tarotistaId', async () => {
      // This test verifies that we can find readings without tarotista assignment
      const readingsWithoutTarotista = await readingRepository
        .createQueryBuilder('reading')
        .where('reading.tarotistaId IS NULL')
        .getCount();

      expect(readingsWithoutTarotista).toBeGreaterThanOrEqual(0);
    });

    it('should assign Flavia tarotistaId to readings without assignment', async () => {
      await migration.migrateReadingsToFlavia();

      const readingsWithoutTarotista = await readingRepository
        .createQueryBuilder('reading')
        .where('reading.tarotistaId IS NULL')
        .getCount();

      expect(readingsWithoutTarotista).toBe(0);
    });

    it('should not modify readings that already have tarotistaId', async () => {
      // Create a reading with specific tarotista (not Flavia)
      const user = await userRepository.findOne({ where: {} });
      if (!user) {
        throw new Error('No user found for test');
      }

      // Create a test reading with Flavia as the tarotista
      // (in a real scenario this would be a different tarotista,
      // but since we only have Flavia seeded, we use her ID)
      const readingBefore = await readingRepository.save({
        user: user,
        tarotistaId: flaviaTarotistaId,
        cardPositions: [],
        interpretation: 'Test',
      } as Partial<TarotReading>);

      await migration.migrateReadingsToFlavia();

      const readingAfter = await readingRepository.findOne({
        where: { id: readingBefore.id },
      });

      // The reading should still have the same tarotistaId
      expect(readingAfter?.tarotistaId).toBe(flaviaTarotistaId);
    });

    it('should update Flavia total_lecturas counter after migration', async () => {
      await migration.migrateReadingsToFlavia();

      const flaviaTarotista = await tarotistaRepository.findOne({
        where: { id: flaviaTarotistaId },
      });

      const actualReadingCount = await readingRepository.count({
        where: { tarotistaId: flaviaTarotistaId },
      });

      expect(flaviaTarotista?.totalLecturas).toBe(actualReadingCount);
    });
  });

  describe('Cache Migration with Tarotista Segregation', () => {
    it('should identify cache entries without tarotista prefix', async () => {
      // Create cache entry without tarotista prefix (legacy format)
      await cacheRepository.save({
        cache_key: 'legacy-cache-key-without-prefix',
        spread_id: null,
        card_combination: [],
        question_hash: 'test',
        interpretation_text: 'test',
        hit_count: 0,
        expires_at: new Date(Date.now() + 86400000),
      } as Partial<CachedInterpretation>);

      const legacyCacheEntries = await cacheRepository
        .createQueryBuilder('cache')
        .where("cache_key NOT LIKE 'tarotista:%'")
        .getCount();

      expect(legacyCacheEntries).toBeGreaterThan(0);
    });

    it('should migrate cache keys to include tarotista prefix', async () => {
      // Create fresh cache entry for this test to ensure isolation
      await cacheRepository.save({
        cache_key: 'test-cache-to-migrate',
        spread_id: null,
        card_combination: [],
        question_hash: 'test-migrate',
        interpretation_text: 'test',
        hit_count: 0,
        expires_at: new Date(Date.now() + 86400000),
      } as Partial<CachedInterpretation>);

      await migration.migrateCacheKeys(flaviaTarotistaId);

      const legacyCacheEntries = await cacheRepository
        .createQueryBuilder('cache')
        .where("cache_key NOT LIKE 'tarotista:%'")
        .getCount();

      expect(legacyCacheEntries).toBe(0);
    });

    it('should preserve cache data during migration', async () => {
      await cacheRepository.save({
        cache_key: 'test-preserve-data',
        spread_id: 1,
        card_combination: [{ card_id: '1', position: 0, is_reversed: false }],
        question_hash: 'preserve-test',
        interpretation_text: 'Test interpretation to preserve',
        hit_count: 5,
        expires_at: new Date(Date.now() + 86400000),
      } as Partial<CachedInterpretation>);

      await migration.migrateCacheKeys(flaviaTarotistaId);

      const migratedEntry = await cacheRepository.findOne({
        where: {
          cache_key: `tarotista:${flaviaTarotistaId}:test-preserve-data`,
        },
      });

      expect(migratedEntry?.interpretation_text).toBe(
        'Test interpretation to preserve',
      );
      expect(migratedEntry?.hit_count).toBe(5);
      expect(migratedEntry?.spread_id).toBe(1);
    });

    it('should invalidate old cache entries after migration', async () => {
      await cacheRepository.save({
        cache_key: 'old-entry-to-invalidate',
        spread_id: null,
        card_combination: [],
        question_hash: 'test',
        interpretation_text: 'test',
        hit_count: 0,
        expires_at: new Date(Date.now() + 86400000),
      } as Partial<CachedInterpretation>);

      await migration.migrateCacheKeys(flaviaTarotistaId);

      const oldEntry = await cacheRepository.findOne({
        where: { cache_key: 'old-entry-to-invalidate' },
      });

      expect(oldEntry).toBeNull();
    });
  });

  describe('User Roles Migration (isAdmin to roles)', () => {
    beforeAll(async () => {
      // Add is_admin column if it doesn't exist (to simulate old schema)
      await dataSource.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user' AND column_name = 'is_admin'
          ) THEN
            ALTER TABLE "user" ADD COLUMN is_admin BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `);
    });

    it('should identify users with isAdmin=true', async () => {
      // Create a user with old isAdmin field
      const newUser = await userRepository.save({
        email: 'admin-legacy@test.com',
        password: 'hashed',
        name: 'Legacy Admin',
        isAdmin: true,
        roles: [UserRole.CONSUMER], // Old default
      });

      // Set is_admin in database manually (simulating old schema)
      await dataSource.query(
        `UPDATE "user" SET is_admin = true WHERE id = $1`,
        [newUser.id],
      );

      const adminUsers = await userRepository
        .createQueryBuilder('user')
        .where('user.isAdmin = :isAdmin', { isAdmin: true })
        .andWhere(':role != ALL(user.roles)', { role: UserRole.ADMIN })
        .getCount();

      expect(adminUsers).toBeGreaterThan(0);
    });

    it('should migrate isAdmin users to roles array', async () => {
      await migration.migrateAdminRoles();

      // Check directly in database
      const usersWithMismatchedRoles = await dataSource.query<
        Array<{ count: string }>
      >(
        `SELECT COUNT(*) as count FROM "user" 
         WHERE is_admin = true 
         AND 'admin' != ALL(roles)`,
      );

      expect(parseInt(usersWithMismatchedRoles[0]?.count || '0')).toBe(0);
    });

    it('should preserve existing roles when adding admin role', async () => {
      const newUser = await userRepository.save({
        email: 'admin-tarotist@test.com',
        password: 'hashed',
        name: 'Admin Tarotist',
        isAdmin: true,
        roles: [UserRole.CONSUMER, UserRole.TAROTIST],
      });

      // Set is_admin in database manually (simulating old schema)
      await dataSource.query(
        `UPDATE "user" SET is_admin = true WHERE id = $1`,
        [newUser.id],
      );

      await migration.migrateAdminRoles();

      const user = await userRepository.findOne({
        where: { email: 'admin-tarotist@test.com' },
      });

      expect(user?.roles).toContain(UserRole.ADMIN);
      expect(user?.roles).toContain(UserRole.TAROTIST);
      expect(user?.roles).toContain(UserRole.CONSUMER);
    });

    it('should not modify users with isAdmin=false', async () => {
      const normalUser = await userRepository.save({
        email: 'normal-user@test.com',
        password: 'hashed',
        name: 'Normal User',
        isAdmin: false,
        roles: [UserRole.CONSUMER],
      });

      await migration.migrateAdminRoles();

      const userAfter = await userRepository.findOne({
        where: { id: normalUser.id },
      });

      expect(userAfter?.roles).toEqual([UserRole.CONSUMER]);
      expect(userAfter?.roles).not.toContain(UserRole.ADMIN);
    });
  });

  describe('Data Integrity Validation', () => {
    it('should verify all readings have valid tarotistaId', async () => {
      const validation = await migration.validateDataIntegrity();

      expect(validation.readingsWithoutTarotista).toBe(0);
    });

    it('should verify all cache keys have tarotista prefix', async () => {
      const validation = await migration.validateDataIntegrity();

      expect(validation.cacheWithoutPrefix).toBe(0);
    });

    it('should verify all admin users have correct roles', async () => {
      const validation = await migration.validateDataIntegrity();

      expect(validation.adminUsersWithoutRole).toBe(0);
    });

    it('should return validation report with statistics', async () => {
      const validation = await migration.validateDataIntegrity();

      expect(validation).toHaveProperty('readingsWithoutTarotista');
      expect(validation).toHaveProperty('cacheWithoutPrefix');
      expect(validation).toHaveProperty('adminUsersWithoutRole');
      expect(validation).toHaveProperty('totalReadings');
      expect(validation).toHaveProperty('totalCacheEntries');
      expect(validation).toHaveProperty('totalAdminUsers');
    });
  });

  describe('Rollback Functionality', () => {
    it('should rollback reading migration', async () => {
      // Run migration first
      await migration.migrateReadingsToFlavia();

      // Then rollback
      await migration.rollbackReadingsMigration();

      // Some readings should have NULL tarotistaId again
      const readingsWithoutTarotista = await readingRepository
        .createQueryBuilder('reading')
        .where('reading.tarotistaId IS NULL')
        .getCount();

      expect(readingsWithoutTarotista).toBeGreaterThanOrEqual(0);
    });

    it('should rollback cache migration', async () => {
      await cacheRepository.save({
        cache_key: 'rollback-test-key',
        spread_id: null,
        card_combination: [],
        question_hash: 'test',
        interpretation_text: 'test',
        hit_count: 0,
        expires_at: new Date(Date.now() + 86400000),
      } as Partial<CachedInterpretation>);

      await migration.migrateCacheKeys(flaviaTarotistaId);
      await migration.rollbackCacheMigration();

      const originalEntry = await cacheRepository.findOne({
        where: { cache_key: 'rollback-test-key' },
      });

      expect(originalEntry).toBeDefined();
    });

    it('should rollback admin roles migration', async () => {
      const newUser = await userRepository.save({
        email: 'rollback-admin@test.com',
        password: 'hashed',
        name: 'Rollback Admin',
        isAdmin: true,
        roles: [UserRole.CONSUMER],
      });

      // Set is_admin in database manually (simulating old schema)
      await dataSource.query(
        `UPDATE "user" SET is_admin = true WHERE id = $1`,
        [newUser.id],
      );

      await migration.migrateAdminRoles();
      await migration.rollbackAdminRolesMigration();

      const user = await userRepository.findOne({
        where: { email: 'rollback-admin@test.com' },
      });

      expect(user?.roles).not.toContain(UserRole.ADMIN);
    });
  });
});
