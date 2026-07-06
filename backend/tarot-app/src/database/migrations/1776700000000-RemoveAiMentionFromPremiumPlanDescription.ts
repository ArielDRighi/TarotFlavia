import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-FBK-004 (Hallazgo FBK-003): la descripción del plan Premium se renderiza en
 * `/premium` desde la tabla `plans`. El seed ya se actualizó, pero las filas
 * existentes siguen mencionando "IA". Esta migración de datos reformula la
 * descripción en las filas ya persistidas (regla dura: sin "IA" en texto user-facing).
 */
const OLD_DESCRIPTION =
  'Plan completo con 1 carta del día + 3 tiradas diarias, interpretaciones con IA y preguntas personalizadas';
const NEW_DESCRIPTION =
  'Plan completo con 1 carta del día + 3 tiradas diarias, interpretaciones profundas y preguntas personalizadas';

export class RemoveAiMentionFromPremiumPlanDescription1776700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "plans" SET "description" = $1 WHERE "planType" = 'premium' AND "description" = $2`,
      [NEW_DESCRIPTION, OLD_DESCRIPTION],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "plans" SET "description" = $1 WHERE "planType" = 'premium' AND "description" = $2`,
      [OLD_DESCRIPTION, NEW_DESCRIPTION],
    );
  }
}
