import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeInterpretationNullableInDailyReading1770500000000 implements MigrationInterface {
  name = 'MakeInterpretationNullableInDailyReading1770500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make interpretation column nullable to support anonymous and FREE users
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ALTER COLUMN "interpretation" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert interpretation column back to NOT NULL
    // Note: This will fail if there are null values in the database
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ALTER COLUMN "interpretation" SET NOT NULL
    `);
  }
}
