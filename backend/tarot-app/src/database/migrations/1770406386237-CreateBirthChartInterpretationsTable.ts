import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para crear la tabla birth_chart_interpretations y sus enums
 *
 * Crea:
 * - Enum: planet_enum (10 planetas)
 * - Enum: aspect_type_enum (5 tipos de aspectos)
 * - Enum: interpretation_category_enum (5 categorías)
 * - Tabla: birth_chart_interpretations (textos de interpretación)
 *
 * Nota: zodiac_sign_enum se reutiliza si ya existe (definido a nivel global) y,
 * en caso contrario, esta migración lo crea de forma condicional.
 */
export class CreateBirthChartInterpretationsTable1770406386237 implements MigrationInterface {
  name = 'CreateBirthChartInterpretationsTable1770406386237';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. CREAR ENUMS
    // ====================================

    // Enum de planetas
    await queryRunner.query(`
      CREATE TYPE "planet_enum" AS ENUM (
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto'
      );
    `);

    // Enum de tipos de aspecto
    await queryRunner.query(`
      CREATE TYPE "aspect_type_enum" AS ENUM (
        'conjunction',
        'opposition',
        'square',
        'trine',
        'sextile'
      );
    `);

    // Enum de categorías de interpretación
    await queryRunner.query(`
      CREATE TYPE "interpretation_category_enum" AS ENUM (
        'planet_intro',
        'planet_in_sign',
        'planet_in_house',
        'aspect',
        'ascendant'
      );
    `);

    // Enum de signos zodiacales (para birth_chart_interpretations)
    // Nota: Verificar si ya existe antes de crear
    const zodiacEnumExists = (await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'zodiac_sign_enum'
      );
    `)) as Array<{ exists: boolean }>;

    if (!zodiacEnumExists[0].exists) {
      await queryRunner.query(`
        CREATE TYPE "zodiac_sign_enum" AS ENUM (
          'aries',
          'taurus',
          'gemini',
          'cancer',
          'leo',
          'virgo',
          'libra',
          'scorpio',
          'sagittarius',
          'capricorn',
          'aquarius',
          'pisces'
        );
      `);
    }

    // ====================================
    // 2. CREAR TABLA birth_chart_interpretations
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "birth_chart_interpretations" (
        "id" SERIAL PRIMARY KEY,
        "category" "interpretation_category_enum" NOT NULL,
        "planet" "planet_enum",
        "sign" "zodiac_sign_enum",
        "house" SMALLINT,
        "aspectType" "aspect_type_enum",
        "planet2" "planet_enum",
        "content" TEXT NOT NULL,
        "summary" VARCHAR(255),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // ====================================
    // 3. CREAR ÍNDICES
    // ====================================

    // Índice para búsquedas por categoría
    await queryRunner.query(
      `CREATE INDEX "idx_interpretation_category" ON "birth_chart_interpretations"("category");`,
    );

    // Índice compuesto para planeta + signo
    await queryRunner.query(
      `CREATE INDEX "idx_interpretation_planet_sign" ON "birth_chart_interpretations"("planet", "sign");`,
    );

    // Índice compuesto para planeta + casa
    await queryRunner.query(
      `CREATE INDEX "idx_interpretation_planet_house" ON "birth_chart_interpretations"("planet", "house");`,
    );

    // Índice compuesto para aspectos
    await queryRunner.query(
      `CREATE INDEX "idx_interpretation_aspect" ON "birth_chart_interpretations"("planet", "planet2", "aspectType");`,
    );

    // ====================================
    // 4. CREAR CONSTRAINT ÚNICO
    // ====================================

    // Constraint único para prevenir duplicados (NULLS NOT DISTINCT en PostgreSQL 15+)
    await queryRunner.query(`
      ALTER TABLE "birth_chart_interpretations"
      ADD CONSTRAINT "uq_interpretation_combo"
      UNIQUE NULLS NOT DISTINCT ("category", "planet", "sign", "house", "aspectType", "planet2");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. ELIMINAR CONSTRAINT
    // ====================================

    await queryRunner.query(`
      ALTER TABLE "birth_chart_interpretations"
      DROP CONSTRAINT IF EXISTS "uq_interpretation_combo";
    `);

    // ====================================
    // 2. ELIMINAR ÍNDICES
    // ====================================

    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_interpretation_aspect";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_interpretation_planet_house";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_interpretation_planet_sign";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_interpretation_category";`,
    );

    // ====================================
    // 3. ELIMINAR TABLA
    // ====================================

    await queryRunner.query(
      `DROP TABLE IF EXISTS "birth_chart_interpretations";`,
    );

    // ====================================
    // 4. ELIMINAR ENUMS
    // ====================================

    await queryRunner.query(
      `DROP TYPE IF EXISTS "interpretation_category_enum";`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "aspect_type_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "planet_enum";`);

    // Nota: zodiac_sign_enum NO se elimina porque puede estar siendo usado por otras tablas
  }
}
