import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-FBK-009: Carta astral ilimitada para Free + fuente única del límite en DB.
 *
 * Agrega la columna `birth_chart_monthly_limit` a `plans` (default -1 = ilimitado)
 * y alinea los datos existentes con la decisión de producto: la carta astral es
 * ilimitada para todos los planes; el diferenciador Premium es solo el resumen
 * personalizado con IA, no la cantidad.
 *
 * Antes el límite estaba hardcodeado en `usage-limits.constants.ts` (FREE 3/mes).
 * A partir de esta migración, la fuente de verdad es la tabla `plans`, gestionable
 * desde el panel de admin de planes.
 */
export class AddBirthChartMonthlyLimitToPlans1776600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plans" ADD COLUMN IF NOT EXISTS "birth_chart_monthly_limit" integer NOT NULL DEFAULT -1`,
    );
    // Free/Premium/Anonymous: ilimitada (-1). El límite lifetime del anónimo lo
    // sigue gobernando el tracking anónimo, no esta columna.
    await queryRunner.query(
      `UPDATE "plans" SET "birth_chart_monthly_limit" = -1`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plans" DROP COLUMN IF EXISTS "birth_chart_monthly_limit"`,
    );
  }
}
