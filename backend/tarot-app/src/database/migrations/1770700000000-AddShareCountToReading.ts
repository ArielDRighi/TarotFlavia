import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShareCountToReading1770700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add shareCount column to tarot_reading table
    await queryRunner.query(`
      ALTER TABLE "tarot_reading" 
      ADD COLUMN "shareCount" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove shareCount column
    await queryRunner.query(`
      ALTER TABLE "tarot_reading" 
      DROP COLUMN "shareCount"
    `);
  }
}
