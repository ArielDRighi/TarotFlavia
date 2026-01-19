import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGenerationTimeMsToChineseHoroscopes1771000000001
  implements MigrationInterface
{
  name = 'AddGenerationTimeMsToChineseHoroscopes1771000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists first
    const columnExists = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'chinese_horoscopes' AND column_name = 'generation_time_ms'
    `);

    if (columnExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "chinese_horoscopes"
        ADD COLUMN "generation_time_ms" integer NOT NULL DEFAULT 0
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "chinese_horoscopes"
      DROP COLUMN IF EXISTS "generation_time_ms"
    `);
  }
}
