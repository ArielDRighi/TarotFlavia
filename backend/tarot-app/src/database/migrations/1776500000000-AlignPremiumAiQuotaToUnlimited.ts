import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-FBK-006: Resolver la incoherencia de la cuota de IA (fuente de verdad única).
 *
 * Alinea las filas existentes de `plans` con el criterio único:
 * - PREMIUM: aiQuotaMonthly = -1 (ilimitado), coherente con el enforcement
 *   (AI_MONTHLY_QUOTAS) y con la UI. Antes estaba en 100 en la seed.
 *
 * FREE/ANONYMOUS ya están en 0 en la seed, por lo que no requieren cambio de datos.
 */
export class AlignPremiumAiQuotaToUnlimited1776500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "plans" SET "aiQuotaMonthly" = -1 WHERE "planType" = 'premium' AND "aiQuotaMonthly" = 100`,
    );
    // Alinea el default de la columna con la fuente de verdad (0 = sin IA).
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "aiQuotaMonthly" SET DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plans" ALTER COLUMN "aiQuotaMonthly" SET DEFAULT 100`,
    );
    await queryRunner.query(
      `UPDATE "plans" SET "aiQuotaMonthly" = 100 WHERE "planType" = 'premium' AND "aiQuotaMonthly" = -1`,
    );
  }
}
