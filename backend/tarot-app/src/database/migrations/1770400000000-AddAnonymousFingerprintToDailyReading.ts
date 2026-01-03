import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnonymousFingerprintToDailyReading1770400000000 implements MigrationInterface {
  name = 'AddAnonymousFingerprintToDailyReading1770400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add anonymous_fingerprint column (nullable, for anonymous users)
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ADD COLUMN "anonymous_fingerprint" character varying(64) NULL
    `);

    // Make userId nullable (to support anonymous users)
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ALTER COLUMN "user_id" DROP NOT NULL
    `);

    // Make interpretation nullable (anonymous and FREE users don't use AI)
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ALTER COLUMN "interpretation" DROP NOT NULL
    `);

    // Add CHECK constraint: userId OR anonymous_fingerprint must be present
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ADD CONSTRAINT "CHK_daily_readings_user_or_fingerprint" 
      CHECK (
        (user_id IS NOT NULL AND anonymous_fingerprint IS NULL) OR 
        (user_id IS NULL AND anonymous_fingerprint IS NOT NULL)
      )
    `);

    // Create composite index for anonymous users lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_daily_readings_fingerprint_date" 
      ON "daily_readings" ("anonymous_fingerprint", "reading_date") 
      WHERE "anonymous_fingerprint" IS NOT NULL
    `);

    // Drop existing unique constraint (userId, readingDate, tarotistaId)
    await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."UQ_daily_readings_user_date_tarotista"
    `);

    // Create new unique constraint for authenticated users
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_daily_readings_user_date_tarotista" 
      ON "daily_readings" ("user_id", "reading_date", "tarotista_id") 
      WHERE "user_id" IS NOT NULL
    `);

    // Create new unique constraint for anonymous users
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_daily_readings_fingerprint_date_tarotista" 
      ON "daily_readings" ("anonymous_fingerprint", "reading_date", "tarotista_id") 
      WHERE "anonymous_fingerprint" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop unique constraints
    await queryRunner.query(`
      DROP INDEX "public"."UQ_daily_readings_fingerprint_date_tarotista"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."UQ_daily_readings_user_date_tarotista"
    `);

    // Recreate original unique constraint
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_daily_readings_user_date_tarotista" 
      ON "daily_readings" ("user_id", "reading_date", "tarotista_id")
    `);

    // Drop composite index
    await queryRunner.query(`
      DROP INDEX "public"."IDX_daily_readings_fingerprint_date"
    `);

    // Drop CHECK constraint
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      DROP CONSTRAINT "CHK_daily_readings_user_or_fingerprint"
    `);

    // Revert userId to NOT NULL (this will fail if there are anonymous records)
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ALTER COLUMN "user_id" SET NOT NULL
    `);

    // Revert interpretation to NOT NULL (this will fail if there are null interpretations)
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ALTER COLUMN "interpretation" SET NOT NULL
    `);

    // Remove anonymous_fingerprint column
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      DROP COLUMN "anonymous_fingerprint"
    `);
  }
}
