import { DataSource, QueryRunner } from 'typeorm';
import { e2eConnectionSource } from '../config/typeorm-e2e.config';
import { InitialSchema1761655973524 } from './migrations/1761655973524-InitialSchema';

describe('Migration Validation', () => {
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    dataSource = e2eConnectionSource;
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    queryRunner = dataSource.createQueryRunner();
  }, 60000);

  afterAll(async () => {
    try {
      if (queryRunner && !queryRunner.isReleased) {
        await queryRunner.release();
      }
    } catch {
      // Silently ignore if already released
    }

    try {
      if (dataSource?.isInitialized) {
        await dataSource.destroy();
      }
    } catch {
      // Silently ignore if already destroyed
    }
  }, 30000);

  describe('InitialSchema Migration', () => {
    it('should have up and down methods defined', () => {
      const migration = new InitialSchema1761655973524();

      const { up, down } = migration;
      expect(up).toBeDefined();
      expect(down).toBeDefined();
      expect(typeof up).toBe('function');
      expect(typeof down).toBe('function');
    });

    it('should create all core tables', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result = await queryRunner.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      `);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
      const tableNames = result.map((r: any) => r.table_name);

      expect(tableNames).toContain('user');
      expect(tableNames).toContain('tarot_card');
      expect(tableNames).toContain('tarot_reading');
      expect(tableNames).toContain('migrations');
    }, 10000);

    it('should create user table with critical columns', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const columns = await queryRunner.query(`
        SELECT column_name, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user'
      `);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(columns.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
      const columnNames = columns.map((c: any) => c.column_name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('password');
      expect(columnNames).toContain('plan');
    }, 10000);

    it('should have PostgreSQL uuid-ossp extension enabled', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const uuidExtension = await queryRunner.query(
        "SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'",
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(uuidExtension.length).toBeGreaterThan(0);
    }, 10000);

    it('should have foreign key constraints on reading table', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const constraints = await queryRunner.query(`
        SELECT 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'tarot_reading'
      `);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(constraints.length).toBeGreaterThan(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
      const fkColumns = constraints.map((c: any) => c.column_name);

      expect(fkColumns).toContain('userId');
      expect(fkColumns).toContain('deckId');
    }, 10000);
  });

  describe('Migration Tracking', () => {
    it('should record migration execution', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const migrations = await queryRunner.query('SELECT * FROM migrations');
      expect(Array.isArray(migrations)).toBe(true);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(migrations.length).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const firstMigration = migrations[0];
      expect(firstMigration).toHaveProperty('id');
      expect(firstMigration).toHaveProperty('timestamp');
      expect(firstMigration).toHaveProperty('name');
    }, 10000);
  });
});
