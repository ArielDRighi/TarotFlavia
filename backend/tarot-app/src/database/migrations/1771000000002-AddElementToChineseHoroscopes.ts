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
export class AddElementToChineseHoroscopes1771000000002 implements MigrationInterface {
  name = 'AddElementToChineseHoroscopes1771000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear enum para chinese_element (si no existe)
    // NOTA: Los valores deben coincidir con CHINESE_ELEMENTS en chinese-zodiac.utils.ts
    // Usamos DO block para manejar el caso donde el tipo ya existe
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chinese_element_enum') THEN
          CREATE TYPE "chinese_element_enum" AS ENUM(
            'metal', 'water', 'wood', 'fire', 'earth'
          );
        END IF;
      END$$
    `);

    // 2. Agregar columna element con default 'earth' para registros existentes
    // Solo si la columna no existe (para re-runs parciales)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'chinese_horoscopes' AND column_name = 'element'
        ) THEN
          ALTER TABLE "chinese_horoscopes"
          ADD COLUMN "element" "chinese_element_enum" NOT NULL DEFAULT 'earth';
        END IF;
      END$$
    `);

    // 3. Eliminar el constraint único viejo (animal, year) si existe
    // Usamos IF EXISTS porque el índice puede no existir en instalaciones limpias
    // NOTA: El índice puede tener diferentes nombres según la migración que lo creó
    await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."idx_chinese_animal_year"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "public"."idx_chinese_horoscope_animal_year"
    `);

    // 4. Crear nuevo constraint único (animal, element, year) si no existe
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_chinese_animal_element_year"
      ON "chinese_horoscopes" ("animal", "element", "year")
    `);

    // 5. Crear índice en element para búsquedas por elemento si no existe
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_chinese_element"
      ON "chinese_horoscopes" ("element")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: volver al schema anterior

    // 1. Eliminar índices nuevos (si existen)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_chinese_element"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."idx_chinese_animal_element_year"`,
    );

    // 2. Recrear constraint único viejo (animal, year) si no existe
    // Usar el nombre original del índice
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "idx_chinese_horoscope_animal_year"
      ON "chinese_horoscopes" ("animal", "year")
    `);

    // 3. Eliminar columna element si existe
    await queryRunner.query(`
      ALTER TABLE "chinese_horoscopes"
      DROP COLUMN IF EXISTS "element"
    `);

    // 4. Eliminar enum si existe
    await queryRunner.query(`DROP TYPE IF EXISTS "chinese_element_enum"`);
  }
}
