import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChineseHoroscopes1771000000000 implements MigrationInterface {
  name = 'CreateChineseHoroscopes1771000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para chinese_zodiac_animal
    await queryRunner.query(`
      CREATE TYPE "chinese_zodiac_animal_enum" AS ENUM(
        'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
        'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'
      )
    `);

    // Crear tabla chinese_horoscopes
    await queryRunner.query(`
      CREATE TABLE "chinese_horoscopes" (
        "id" SERIAL NOT NULL,
        "animal" "chinese_zodiac_animal_enum" NOT NULL,
        "year" smallint NOT NULL,
        "general_overview" text NOT NULL,
        "areas" jsonb NOT NULL,
        "lucky_elements" jsonb NOT NULL,
        "compatibility" jsonb NOT NULL,
        "monthly_highlights" text,
        "ai_provider" character varying(50),
        "ai_model" character varying(100),
        "tokens_used" integer NOT NULL DEFAULT 0,
        "view_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chinese_horoscopes" PRIMARY KEY ("id")
      )
    `);

    // Crear índice único en (animal, year)
    // Esto previene duplicados: un horóscopo por animal por año
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_chinese_horoscope_animal_year" 
      ON "chinese_horoscopes" ("animal", "year")
    `);

    // Crear índice en year para consultas por año
    await queryRunner.query(`
      CREATE INDEX "idx_chinese_horoscope_year" 
      ON "chinese_horoscopes" ("year")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX "public"."idx_chinese_horoscope_year"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_chinese_horoscope_animal_year"`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "chinese_horoscopes"`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE "chinese_zodiac_animal_enum"`);
  }
}
