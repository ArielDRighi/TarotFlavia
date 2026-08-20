import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-SEO-008: Modelo de contenido extendido para las fichas de Tarot.
 *
 * Agrega a `encyclopedia_tarot_cards` las siete secciones que llevan cada ficha
 * de ~166 a ~500 palabras propias. Todas las columnas son NULLABLE: el deploy
 * sale antes de que exista el contenido, que carga T-SEO-009.
 *
 * ⚠️ La columna se llama `meaning_wellbeing`, nunca `meaning_health`: el nombre
 * termina en el DTO, en Swagger y en el tipo del frontend, y "salud" arrastra la
 * ficha a territorio YMYL (consejo médico). Ver la regla transversal de
 * terminología en docs/BACKLOG_SEO_CONTENIDO_2026_08.md.
 *
 * Nota sobre el origen del SQL: los `ALTER TABLE` son los que emitió
 * `npm run migration:generate`, pero el archivo generado traía además decenas de
 * sentencias de drift preexistente ajeno a esta tarea (renombres de FKs e
 * índices, y una reversión de `AuthTimestampsToTimestamptz1776900000000`).
 * Se conservaron solo las sentencias de esta entidad.
 */
export class AddExtendedContentToEncyclopediaCards1787187733536 implements MigrationInterface {
  name = 'AddExtendedContentToEncyclopediaCards1787187733536';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "meaning_love" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "meaning_work" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "meaning_wellbeing" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "symbolism" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "advice" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "yes_no" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD COLUMN IF NOT EXISTS "combinations" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "combinations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "yes_no"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "advice"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "symbolism"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "meaning_wellbeing"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "meaning_work"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN IF EXISTS "meaning_love"`,
    );
  }
}
