import { DataSource } from 'typeorm';

export interface ValidationReport {
  readingsWithoutTarotista: number;
  cacheWithoutPrefix: number;
  adminUsersWithoutRole: number;
  totalReadings: number;
  totalCacheEntries: number;
  totalAdminUsers: number;
}

interface TarotistaIdResult {
  id: number;
}

interface CacheEntry {
  id: number;
  cache_key: string;
  spread_id: number | null;
  card_combination: unknown;
  question_hash: string;
  interpretation_text: string;
  hit_count: number;
  created_at: Date;
  last_used_at: Date;
  expires_at: Date;
}

interface UserWithRoles {
  id: number;
  email: string;
  roles: string[];
}

interface CountResult {
  count: string;
}

export class HistoricalDataMigration {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Migra todas las lecturas sin tarotistaId a Flavia
   */
  async migrateReadingsToFlavia(): Promise<void> {
    console.log('🔄 Starting migration of readings to Flavia...');

    // 1. Find Flavia's tarotista ID
    const result = await this.dataSource.query<TarotistaIdResult[]>(
      `SELECT t.id FROM tarotistas t
       INNER JOIN "user" u ON u.id = t.user_id
       WHERE u.email = 'flavia@tarotflavia.com'
       LIMIT 1`,
    );

    if (!result || result.length === 0) {
      console.warn(
        '⚠️  Flavia tarotista not found. Skipping migration of readings.',
      );
      return;
    }

    const flaviaId = result[0].id;
    console.log(`✅ Found Flavia tarotista (ID: ${flaviaId})`);

    // 2. Update all readings without tarotista_id to point to Flavia
    const updateResult = await this.dataSource.query<[unknown, number]>(
      `UPDATE tarot_reading 
       SET tarotista_id = $1 
       WHERE tarotista_id IS NULL`,
      [flaviaId],
    );

    const rowsUpdated = updateResult[1] || 0;
    console.log(`✅ Migrated ${rowsUpdated} readings to Flavia`);

    // 3. Update Flavia's total_lecturas counter
    await this.dataSource.query(
      `UPDATE tarotistas 
       SET total_lecturas = (
         SELECT COUNT(*) 
         FROM tarot_reading 
         WHERE tarotista_id = $1
       )
       WHERE id = $1`,
      [flaviaId],
    );

    console.log(`✅ Updated Flavia's total_lecturas counter`);
    console.log('✨ Migration completed successfully!');
  }

  /**
   * Migra las cache keys para incluir prefijo de tarotista
   */
  async migrateCacheKeys(tarotistaId: number): Promise<void> {
    console.log('🔄 Starting cache keys migration...');

    // 1. Find all cache entries without tarotista prefix
    const legacyEntries = await this.dataSource.query<CacheEntry[]>(
      `SELECT * FROM cached_interpretations 
       WHERE cache_key NOT LIKE 'tarotista:%'`,
    );

    console.log(`📊 Found ${legacyEntries.length} legacy cache entries`);

    // 2. Migrate each entry
    for (const entry of legacyEntries) {
      const newCacheKey = `tarotista:${tarotistaId}:${entry.cache_key}`;

      // Insert new entry with tarotista prefix
      await this.dataSource.query(
        `INSERT INTO cached_interpretations (
           cache_key, spread_id, card_combination, question_hash, 
           interpretation_text, hit_count, created_at, last_used_at, expires_at
         )
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (cache_key) DO NOTHING`,
        [
          newCacheKey,
          entry.spread_id,
          JSON.stringify(entry.card_combination),
          entry.question_hash,
          entry.interpretation_text,
          entry.hit_count,
          entry.created_at,
          entry.last_used_at,
          entry.expires_at,
        ],
      );

      // Delete old entry
      await this.dataSource.query(
        `DELETE FROM cached_interpretations WHERE id = $1`,
        [entry.id],
      );
    }

    console.log(`✅ Migrated ${legacyEntries.length} cache entries`);
    console.log('✨ Cache migration completed successfully!');
  }

  /**
   * Migra usuarios con isAdmin=true al sistema de roles
   */
  async migrateAdminRoles(): Promise<void> {
    console.log('🔄 Starting admin roles migration...');

    // Check if is_admin column exists
    const columnCheck = await this.dataSource.query<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'user' AND column_name = 'is_admin'
       ) as exists`,
    );

    if (!columnCheck[0]?.exists) {
      console.log(
        '⚠️  Column is_admin does not exist. Skipping admin roles migration.',
      );
      return;
    }

    // 1. Find users with isAdmin=true but without admin role
    const adminUsers = await this.dataSource.query<UserWithRoles[]>(
      `SELECT * FROM "user" 
       WHERE is_admin = true 
       AND 'admin' != ALL(roles)`,
    );

    console.log(`📊 Found ${adminUsers.length} admin users to migrate`);

    // 2. Add admin role to each user
    for (const user of adminUsers) {
      // Use array_append to add 'admin' role if not present
      await this.dataSource.query(
        `UPDATE "user" 
         SET roles = array_append(roles, 'admin'::user_role_enum)
         WHERE id = $1 
         AND 'admin' != ALL(roles)`,
        [user.id],
      );

      console.log(`✅ Added admin role to user: ${user.email}`);
    }

    console.log('✨ Admin roles migration completed successfully!');
  }

  /**
   * Valida la integridad de los datos después de la migración
   */
  async validateDataIntegrity(): Promise<ValidationReport> {
    console.log('🔍 Validating data integrity...');

    // 1. Count readings without tarotistaId
    const readingsWithoutTarotistaResult = await this.dataSource.query<
      CountResult[]
    >(`SELECT COUNT(*) as count FROM tarot_reading WHERE tarotista_id IS NULL`);

    const readingsWithoutTarotista = parseInt(
      readingsWithoutTarotistaResult[0]?.count || '0',
      10,
    );

    // 2. Count total readings
    const totalReadingsResult = await this.dataSource.query<CountResult[]>(
      `SELECT COUNT(*) as count FROM tarot_reading`,
    );

    const totalReadings = parseInt(totalReadingsResult[0]?.count || '0', 10);

    // 3. Count cache entries without prefix
    const cacheWithoutPrefixResult = await this.dataSource.query<CountResult[]>(
      `SELECT COUNT(*) as count FROM cached_interpretations 
       WHERE cache_key NOT LIKE 'tarotista:%'`,
    );

    const cacheWithoutPrefix = parseInt(
      cacheWithoutPrefixResult[0]?.count || '0',
      10,
    );

    // 4. Count total cache entries
    const totalCacheResult = await this.dataSource.query<CountResult[]>(
      `SELECT COUNT(*) as count FROM cached_interpretations`,
    );

    const totalCacheEntries = parseInt(totalCacheResult[0]?.count || '0', 10);

    // 5. Count admin users without role (skip if is_admin column doesn't exist)
    let adminUsersWithoutRole = 0;
    let totalAdminUsers = 0;

    const columnCheck = await this.dataSource.query<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'user' AND column_name = 'is_admin'
       ) as exists`,
    );

    if (columnCheck[0]?.exists) {
      const adminUsersWithoutRoleResult = await this.dataSource.query<
        CountResult[]
      >(
        `SELECT COUNT(*) as count FROM "user" 
         WHERE is_admin = true 
         AND 'admin' != ALL(roles)`,
      );

      adminUsersWithoutRole = parseInt(
        adminUsersWithoutRoleResult[0]?.count || '0',
        10,
      );

      // 6. Count total admin users
      const totalAdminUsersResult = await this.dataSource.query<CountResult[]>(
        `SELECT COUNT(*) as count FROM "user" WHERE is_admin = true`,
      );

      totalAdminUsers = parseInt(totalAdminUsersResult[0]?.count || '0', 10);
    }

    const report: ValidationReport = {
      readingsWithoutTarotista,
      cacheWithoutPrefix,
      adminUsersWithoutRole,
      totalReadings,
      totalCacheEntries,
      totalAdminUsers,
    };

    console.log('📊 Validation Report:');
    console.log(`   Readings without tarotista: ${readingsWithoutTarotista}`);
    console.log(`   Cache entries without prefix: ${cacheWithoutPrefix}`);
    console.log(`   Admin users without role: ${adminUsersWithoutRole}`);
    console.log(`   Total readings: ${totalReadings}`);
    console.log(`   Total cache entries: ${totalCacheEntries}`);
    console.log(`   Total admin users: ${totalAdminUsers}`);

    const hasIssues =
      readingsWithoutTarotista > 0 ||
      cacheWithoutPrefix > 0 ||
      adminUsersWithoutRole > 0;

    if (hasIssues) {
      console.warn('⚠️  Data integrity issues detected!');
    } else {
      console.log('✅ All data integrity checks passed!');
    }

    return report;
  }

  /**
   * Rollback de la migración de lecturas
   * ADVERTENCIA: Esta operación establece tarotista_id = NULL para TODAS las lecturas
   * Es una operación de emergencia para revertir el sistema a su estado pre-migración
   * En un entorno de producción, considere hacer backup antes de ejecutar
   */
  async rollbackReadingsMigration(): Promise<void> {
    console.log('🔄 Rolling back migration of readings to Flavia...');
    console.warn(
      '⚠️  WARNING: This will set tarotista_id = NULL for ALL readings',
    );

    // Set tarotista_id to NULL for all readings
    const updateResult = await this.dataSource.query<[unknown, number]>(
      `UPDATE tarot_reading SET tarotista_id = NULL`,
    );

    const rowsUpdated = updateResult[1] || 0;
    console.log(
      `✅ Reverted ${rowsUpdated} readings (set tarotista_id to NULL)`,
    );

    // Reset total_lecturas counter for all tarotistas
    await this.dataSource.query(`UPDATE tarotistas SET total_lecturas = 0`);

    console.log('✨ Rollback completed successfully!');
  }

  /**
   * Rollback de la migración de cache
   */
  async rollbackCacheMigration(): Promise<void> {
    console.log('🔄 Rolling back cache migration...');

    // Find all cache entries with tarotista prefix
    const prefixedEntries = await this.dataSource.query<CacheEntry[]>(
      `SELECT * FROM cached_interpretations 
       WHERE cache_key LIKE 'tarotista:%'`,
    );

    console.log(`📊 Found ${prefixedEntries.length} prefixed cache entries`);

    // Restore original keys
    for (const entry of prefixedEntries) {
      // Extract original key by removing "tarotista:{id}:" prefix
      const originalKey = entry.cache_key.replace(/^tarotista:\d+:/, '');

      // Insert entry with original key
      await this.dataSource.query(
        `INSERT INTO cached_interpretations (
           cache_key, spread_id, card_combination, question_hash, 
           interpretation_text, hit_count, created_at, last_used_at, expires_at
         )
         VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (cache_key) DO NOTHING`,
        [
          originalKey,
          entry.spread_id,
          JSON.stringify(entry.card_combination),
          entry.question_hash,
          entry.interpretation_text,
          entry.hit_count,
          entry.created_at,
          entry.last_used_at,
          entry.expires_at,
        ],
      );

      // Delete prefixed entry
      await this.dataSource.query(
        `DELETE FROM cached_interpretations WHERE id = $1`,
        [entry.id],
      );
    }

    console.log(`✅ Restored ${prefixedEntries.length} cache entries`);
    console.log('✨ Cache rollback completed successfully!');
  }

  /**
   * Rollback de la migración de roles admin
   * NOTA: Solo remueve el rol 'admin' de usuarios que tienen is_admin=true
   * Si la columna is_admin no existe, no hace nada (esquema ya migrado permanentemente)
   */
  async rollbackAdminRolesMigration(): Promise<void> {
    console.log('🔄 Rolling back admin roles migration...');

    // Check if is_admin column exists
    const columnCheck = await this.dataSource.query<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'user' AND column_name = 'is_admin'
       ) as exists`,
    );

    if (!columnCheck[0]?.exists) {
      console.log(
        '⚠️  Column is_admin does not exist. Cannot rollback admin roles (schema already migrated).',
      );
      return;
    }

    // Find users with admin role AND is_admin=true (only those migrated by us)
    const adminUsers = await this.dataSource.query<UserWithRoles[]>(
      `SELECT * FROM "user" 
       WHERE 'admin' = ANY(roles) 
       AND is_admin = true`,
    );

    console.log(
      `📊 Found ${adminUsers.length} users with admin role to rollback`,
    );

    // Remove admin role from each user
    for (const user of adminUsers) {
      // Use array_remove to remove 'admin' role
      await this.dataSource.query(
        `UPDATE "user" 
         SET roles = array_remove(roles, 'admin'::user_role_enum)
         WHERE id = $1`,
        [user.id],
      );

      console.log(`✅ Removed admin role from user: ${user.email}`);
    }

    console.log('✨ Admin roles rollback completed successfully!');
  }

  /**
   * Ejecuta todas las migraciones en orden
   */
  async runAll(): Promise<void> {
    console.log('🚀 Starting full historical data migration...\n');

    try {
      // 1. Migrate readings to Flavia
      await this.migrateReadingsToFlavia();
      console.log('');

      // 2. Migrate cache keys (find Flavia's ID first)
      const flaviaResult = await this.dataSource.query<TarotistaIdResult[]>(
        `SELECT t.id FROM tarotistas t
         INNER JOIN "user" u ON u.id = t.user_id
         WHERE u.email = 'flavia@tarotflavia.com'
         LIMIT 1`,
      );

      if (flaviaResult && flaviaResult.length > 0) {
        await this.migrateCacheKeys(flaviaResult[0].id);
        console.log('');
      }

      // 3. Migrate admin roles
      await this.migrateAdminRoles();
      console.log('');

      // 4. Validate data integrity
      const report = await this.validateDataIntegrity();
      console.log('');

      if (
        report.readingsWithoutTarotista === 0 &&
        report.cacheWithoutPrefix === 0 &&
        report.adminUsersWithoutRole === 0
      ) {
        console.log('✨ All migrations completed successfully!');
      } else {
        console.warn('⚠️  Some migrations may have issues. Check the report.');
      }
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Rollback de todas las migraciones
   */
  async rollbackAll(): Promise<void> {
    console.log('🔄 Starting rollback of all migrations...\n');

    try {
      // Rollback in reverse order
      await this.rollbackAdminRolesMigration();
      console.log('');

      await this.rollbackCacheMigration();
      console.log('');

      await this.rollbackReadingsMigration();
      console.log('');

      console.log('✨ All rollbacks completed successfully!');
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}
