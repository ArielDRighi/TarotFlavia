import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixSpreadColumnNames1770600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if camelCase columns exist and rename them to snake_case
    const hasSpreadId = (await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tarot_reading' 
      AND column_name = 'spreadId'
    `)) as Array<{ column_name: string }>;

    if (hasSpreadId.length > 0) {
      await queryRunner.query(
        `ALTER TABLE "tarot_reading" RENAME COLUMN "spreadId" TO "spread_id"`,
      );
    }

    const hasSpreadName = (await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tarot_reading' 
      AND column_name = 'spreadName'
    `)) as Array<{ column_name: string }>;

    if (hasSpreadName.length > 0) {
      await queryRunner.query(`
        ALTER TABLE "tarot_reading" RENAME COLUMN "spreadName" TO "spread_name"
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to camelCase (if needed for rollback)
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" RENAME COLUMN "spread_id" TO "spreadId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_reading" RENAME COLUMN "spread_name" TO "spreadName"`,
    );
  }
}
