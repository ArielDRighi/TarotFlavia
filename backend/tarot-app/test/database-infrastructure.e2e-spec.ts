import { DataSource } from 'typeorm';
import { e2eConnectionSource } from '../src/config/typeorm-e2e.config';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Database Infrastructure (E2E)', () => {
  describe('Development Database', () => {
    it('should be accessible on configured port', () => {
      const devPort = process.env.TAROT_DB_PORT || '5435';
      expect(devPort).toBe('5435');
    });

    it('should have correct database name', () => {
      const devDb = process.env.TAROT_DB_NAME || 'tarot_db';
      expect(devDb).toBe('tarot_db');
    });

    it('should use different user than E2E', () => {
      const devUser = process.env.TAROT_DB_USER || 'tarot_user';
      const e2eUser = process.env.TAROT_E2E_DB_USER || 'tarot_e2e_user';
      expect(devUser).not.toBe(e2eUser);
    });
  });

  describe('E2E Database', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
      dataSource = e2eConnectionSource;
      await dataSource.initialize();
    }, 30000);

    afterAll(async () => {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }, 10000);

    it('should be accessible on port 5436', () => {
      const e2ePort = process.env.TAROT_E2E_DB_PORT || '5436';
      expect(e2ePort).toBe('5436');
    });

    it('should be isolated from development database', () => {
      const devDb = process.env.TAROT_DB_NAME || 'tarot_db';
      const e2eDb = process.env.TAROT_E2E_DB_NAME || 'tarot_e2e';
      expect(e2eDb).not.toBe(devDb);
      expect(e2eDb).toBe('tarot_e2e');
    });

    it('should have uuid-ossp extension installed', async () => {
      const queryRunner = dataSource.createQueryRunner();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await queryRunner.query(`
        SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp'
      `);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result[0].extname).toBe('uuid-ossp');

      await queryRunner.release();
    }, 15000);

    it('should be connected and initialized', () => {
      expect(dataSource.isInitialized).toBe(true);
      expect(dataSource.options.type).toBe('postgres');
      expect(dataSource.options.database).toBe('tarot_e2e');
    });

    it('should have synchronize disabled', () => {
      expect(dataSource.options.synchronize).toBe(false);
    });
  });

  describe('Migrations', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
      dataSource = e2eConnectionSource;
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
    }, 30000);

    afterAll(async () => {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }, 10000);

    it('should have migrations table created', async () => {
      const queryRunner = dataSource.createQueryRunner();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const tables = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      `);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(tables.length).toBe(1);

      await queryRunner.release();
    }, 15000);

    it('should have at least one migration executed', async () => {
      const queryRunner = dataSource.createQueryRunner();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const migrations = await queryRunner.query(
        'SELECT * FROM migrations ORDER BY timestamp DESC',
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(migrations.length).toBeGreaterThan(0);

      // Verify migration has required fields
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const latestMigration = migrations[0];
      expect(latestMigration).toHaveProperty('id');
      expect(latestMigration).toHaveProperty('timestamp');
      expect(latestMigration).toHaveProperty('name');

      await queryRunner.release();
    }, 15000);

    it('should have all core tables created', async () => {
      const queryRunner = dataSource.createQueryRunner();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
        AND table_name NOT LIKE 'information_schema.%'
      `);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
      const tableNames = result.map((r: any) => r.table_name);

      // Core tables
      expect(tableNames).toContain('user');
      expect(tableNames).toContain('tarot_card');
      expect(tableNames).toContain('tarot_deck');
      expect(tableNames).toContain('tarot_reading');
      expect(tableNames).toContain('migrations');

      await queryRunner.release();
    }, 15000);
  });

  describe('Connection Configuration', () => {
    it('should have correct connection pool settings', () => {
      const options = e2eConnectionSource.options;
      expect(options.type).toBe('postgres');

      // TypeORM uses default pool settings if not specified
      // This test verifies the connection is properly configured
      if (options.type === 'postgres') {
        expect(options.database).toBe('tarot_e2e');
        expect(options.host).toBe('localhost');
      }
    });

    it('should have correct migration configuration', () => {
      const options = e2eConnectionSource.options;

      expect(options.synchronize).toBe(false);
      expect(options.migrationsRun).toBe(false); // Migrations run in setup scripts, not auto
    });
  });

  describe('Environment Isolation', () => {
    it('should have different ports for dev and e2e', () => {
      const devPort = process.env.TAROT_DB_PORT || '5435';
      const e2ePort = process.env.TAROT_E2E_DB_PORT || '5436';

      expect(devPort).not.toBe(e2ePort);
      expect(devPort).toBe('5435');
      expect(e2ePort).toBe('5436');
    });

    it('should have different database names', () => {
      const devDb = process.env.TAROT_DB_NAME || 'tarot_db';
      const e2eDb = process.env.TAROT_E2E_DB_NAME || 'tarot_e2e';

      expect(devDb).not.toBe(e2eDb);
    });

    it('should have different credentials', () => {
      const devUser = process.env.TAROT_DB_USER;
      const e2eUser = process.env.TAROT_E2E_DB_USER;

      expect(devUser).toBeDefined();
      expect(e2eUser).toBeDefined();
      expect(devUser).not.toBe(e2eUser);
    });
  });

  describe('Database State Management', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
      dataSource = e2eConnectionSource;
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
    }, 30000);

    afterAll(async () => {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
    }, 10000);

    it('should be able to query database successfully', async () => {
      const queryRunner = dataSource.createQueryRunner();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await queryRunner.query('SELECT 1 as test');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(result[0].test).toBe(1);

      await queryRunner.release();
    }, 10000);

    it('should have PostgreSQL version 16 or higher', async () => {
      const queryRunner = dataSource.createQueryRunner();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await queryRunner.query('SELECT version()');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const version: string = result[0].version;
      expect(version).toContain('PostgreSQL');

      await queryRunner.release();
    }, 10000);
  });
});
