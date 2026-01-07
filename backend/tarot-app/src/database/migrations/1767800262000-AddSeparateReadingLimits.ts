import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: Add Separate Reading Limits
 *
 * Purpose: Split reading limits into two separate fields:
 * - daily_card_limit: For "Carta del Día" feature
 * - tarot_readings_limit: For "Tiradas de Tarot" feature
 *
 * This enables independent limits per feature type according to the business model:
 * - ANONYMOUS: 1 daily card + 0 tarot readings
 * - FREE: 1 daily card + 1 tarot reading
 * - PREMIUM: 1 daily card + 3 tarot readings
 */
export class AddSeparateReadingLimits1767800262000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new value to usage_feature_enum
    await queryRunner.query(`
      ALTER TYPE usage_feature_enum ADD VALUE IF NOT EXISTS 'daily_card'
    `);

    // 2. Add new columns to plans table
    await queryRunner.query(`
      ALTER TABLE "plans"
      ADD COLUMN "daily_card_limit" integer NOT NULL DEFAULT 1,
      ADD COLUMN "tarot_readings_limit" integer NOT NULL DEFAULT 0
    `);

    // 2. Migrate existing data based on plan_type
    // ANONYMOUS: readings_limit=1 → daily_card_limit=1, tarot_readings_limit=0
    await queryRunner.query(`
      UPDATE "plans"
      SET
        "daily_card_limit" = 1,
        "tarot_readings_limit" = 0
      WHERE "planType" = 'anonymous'
    `);

    // FREE: readings_limit=2 → daily_card_limit=1, tarot_readings_limit=1
    await queryRunner.query(`
      UPDATE "plans"
      SET
        "daily_card_limit" = 1,
        "tarot_readings_limit" = 1
      WHERE "planType" = 'free'
    `);

    // PREMIUM: readings_limit=4 → daily_card_limit=1, tarot_readings_limit=3
    await queryRunner.query(`
      UPDATE "plans"
      SET
        "daily_card_limit" = 1,
        "tarot_readings_limit" = 3
      WHERE "planType" = 'premium'
    `);

    // 3. Add comments to new columns for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN "plans"."daily_card_limit" IS 'Daily limit for "Carta del Día" feature (-1 for unlimited)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "plans"."tarot_readings_limit" IS 'Daily limit for "Tiradas de Tarot" feature (-1 for unlimited)'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "plans"."readingsLimit" IS 'DEPRECATED: Use daily_card_limit and tarot_readings_limit instead'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove comments
    await queryRunner.query(`
      COMMENT ON COLUMN "plans"."readingsLimit" IS 'Límite de lecturas mensuales (-1 para ilimitado)'
    `);

    // Remove new columns
    await queryRunner.query(`
      ALTER TABLE "plans"
      DROP COLUMN "tarot_readings_limit",
      DROP COLUMN "daily_card_limit"
    `);

    // Note: We cannot easily remove the enum value 'daily_card' from usage_feature_enum
    // as PostgreSQL doesn't support removing enum values directly.
    // If needed, you must create a new enum without the value and alter the column type.
  }
}
