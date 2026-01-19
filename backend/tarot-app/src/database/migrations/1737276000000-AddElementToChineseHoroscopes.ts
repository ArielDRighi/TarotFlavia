import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * TASK-124: Migración para agregar campo 'element' a chinese_horoscopes
 *
 * Esta migración modifica el schema para soportar 60 horóscopos por año
 * (12 animales × 5 elementos Wu Xing) en lugar de 12.
 *
 * Cambios:
 * 1. Crea enum chinese_element_enum con los 5 elementos
 * 2. Agrega columna 'element' a la tabla
 * 3. Elimina el constraint único (animal, year)
 * 4. Crea nuevo constraint único (animal, element, year)
 * 5. Crea índice en element para búsquedas rápidas
 *
 * IMPORTANTE:
 * - Esta migración NO elimina datos existentes
 * - Los registros existentes (12 horóscopos) recibirán element='earth' por defecto
 * - Después de ejecutar esta migración, se debe regenerar los 60 horóscopos
 */
export class AddElementToChineseHoroscopes1737276000000 implements MigrationInterface {
  name = 'AddElementToChineseHoroscopes1737276000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear enum para chinese_element
    await queryRunner.query(`
      CREATE TYPE "chinese_element_enum" AS ENUM(
        'metal', 'water', 'wood', 'fire', 'earth'
      )
    `);

    // 2. Agregar columna element con default 'earth' para registros existentes
    await queryRunner.query(`
      ALTER TABLE "chinese_horoscopes"
      ADD COLUMN "element" "chinese_element_enum" NOT NULL DEFAULT 'earth'
    `);

    // 3. Eliminar el constraint único viejo (animal, year)
    await queryRunner.query(`
      DROP INDEX "public"."idx_chinese_animal_year"
    `);

    // 4. Crear nuevo constraint único (animal, element, year)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_chinese_animal_element_year"
      ON "chinese_horoscopes" ("animal", "element", "year")
    `);

    // 5. Crear índice en element para búsquedas por elemento
    await queryRunner.query(`
      CREATE INDEX "idx_chinese_element"
      ON "chinese_horoscopes" ("element")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: volver al schema anterior

    // 1. Eliminar índices nuevos
    await queryRunner.query(`DROP INDEX "public"."idx_chinese_element"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_chinese_animal_element_year"`,
    );

    // 2. Recrear constraint único viejo (animal, year)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_chinese_animal_year"
      ON "chinese_horoscopes" ("animal", "year")
    `);

    // 3. Eliminar columna element
    await queryRunner.query(`
      ALTER TABLE "chinese_horoscopes"
      DROP COLUMN "element"
    `);

    // 4. Eliminar enum
    await queryRunner.query(`DROP TYPE "chinese_element_enum"`);
  }
}
