import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * No-op migration: the "generation_time_ms" column is already created
 * in the initial CreateChineseHoroscopes1771000000000 migration (line 29).
 * This migration is kept for historical consistency.
 */
export class AddGenerationTimeMsToChineseHoroscopes1771000000001 implements MigrationInterface {
  name = 'AddGenerationTimeMsToChineseHoroscopes1771000000001';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(queryRunner: QueryRunner): Promise<void> {
    // No-op: column already exists in initial migration
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op: column belongs to initial table creation migration
  }
}
