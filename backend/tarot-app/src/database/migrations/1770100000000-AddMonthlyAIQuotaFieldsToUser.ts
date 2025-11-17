import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonthlyAIQuotaFieldsToUser1770100000000
  implements MigrationInterface
{
  name = 'AddMonthlyAIQuotaFieldsToUser1770100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar campos de tracking mensual de uso de IA
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "ai_requests_used_month" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "ai_cost_usd_month" decimal(10,6) NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "ai_tokens_used_month" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "ai_provider_used" character varying(50)
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "quota_warning_sent" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "ai_usage_reset_at" TIMESTAMP
    `);

    // Crear índice para optimizar queries de cuotas
    await queryRunner.query(`
      CREATE INDEX "IDX_user_ai_quota_reset" 
      ON "user" ("ai_usage_reset_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(`DROP INDEX "public"."IDX_user_ai_quota_reset"`);

    // Eliminar columnas
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "ai_usage_reset_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "quota_warning_sent"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "ai_provider_used"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "ai_tokens_used_month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "ai_cost_usd_month"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "ai_requests_used_month"`,
    );
  }
}
