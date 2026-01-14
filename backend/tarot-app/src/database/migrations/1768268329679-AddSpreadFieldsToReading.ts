import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpreadFieldsToReading1768268329679 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add spread_id and spread_name columns to tarot_reading table
    await queryRunner.query(`
            ALTER TABLE "tarot_reading" 
            ADD COLUMN "spread_id" integer NULL,
            ADD COLUMN "spread_name" character varying(100) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove spread_id and spread_name columns from tarot_reading table
    await queryRunner.query(`
            ALTER TABLE "tarot_reading" 
            DROP COLUMN "spread_id",
            DROP COLUMN "spread_name"
        `);
  }
}
