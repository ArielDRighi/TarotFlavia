import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to assign all existing readings to Flavia tarotista
 * This migration should run after Flavia user and tarotista profile are seeded
 */
export class MigrateReadingsToFlavia1762725922094
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting migration of readings to Flavia...');

    // 1. Find Flavia's tarotista ID
    const result = (await queryRunner.query(
      `SELECT t.id FROM tarotistas t
       INNER JOIN "user" u ON u.id = t.user_id
       WHERE u.email = 'flavia@tarotflavia.com'
       LIMIT 1`,
    )) as Array<{ id: number }>;

    if (!result || result.length === 0) {
      console.warn(
        '⚠️  Flavia tarotista not found. Skipping migration of readings.',
      );
      console.warn(
        '   Make sure to run seeders before running migrations in production.',
      );
      return;
    }

    const flaviaId = result[0].id;
    console.log(`✅ Found Flavia tarotista (ID: ${flaviaId})`);

    // 2. Update all readings without tarotista_id to point to Flavia
    const updateResult = (await queryRunner.query(
      `UPDATE tarot_reading 
       SET tarotista_id = $1 
       WHERE tarotista_id IS NULL`,
      [flaviaId],
    )) as [unknown, number];

    const rowsUpdated = updateResult[1] || 0;
    console.log(`✅ Migrated ${rowsUpdated} readings to Flavia`);

    // 3. Update Flavia's total_lecturas counter
    await queryRunner.query(
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back migration of readings to Flavia...');

    // Rollback: set tarotista_id to NULL for all readings
    const updateResult = (await queryRunner.query(
      `UPDATE tarot_reading SET tarotista_id = NULL`,
    )) as [unknown, number];

    const rowsUpdated = updateResult[1] || 0;
    console.log(
      `✅ Reverted ${rowsUpdated} readings (set tarotista_id to NULL)`,
    );

    // Reset total_lecturas counter for all tarotistas
    await queryRunner.query(`UPDATE tarotistas SET total_lecturas = 0`);

    console.log('✨ Rollback completed successfully!');
  }
}
