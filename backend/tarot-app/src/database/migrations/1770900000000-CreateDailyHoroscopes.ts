import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyHoroscopes1770900000000 implements MigrationInterface {
  name = 'CreateDailyHoroscopes1770900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para zodiac_sign
    await queryRunner.query(`
      CREATE TYPE "zodiac_sign_enum" AS ENUM(
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
      )
    `);

    // Crear tabla daily_horoscopes
    await queryRunner.query(`
      CREATE TABLE "daily_horoscopes" (
        "id" SERIAL NOT NULL,
        "zodiac_sign" "zodiac_sign_enum" NOT NULL,
        "horoscope_date" date NOT NULL,
        "general_content" text NOT NULL,
        "areas" jsonb NOT NULL,
        "lucky_number" smallint,
        "lucky_color" character varying(50),
        "lucky_time" character varying(100),
        "ai_provider" character varying(50),
        "ai_model" character varying(100),
        "tokens_used" integer NOT NULL DEFAULT 0,
        "generation_time_ms" integer NOT NULL DEFAULT 0,
        "view_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_daily_horoscopes" PRIMARY KEY ("id")
      )
    `);

    // Crear índice único en (zodiac_sign, horoscope_date)
    // Esto previene duplicados: un horóscopo por signo por día
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_horoscope_sign_date" 
      ON "daily_horoscopes" ("zodiac_sign", "horoscope_date")
    `);

    // Crear índice en horoscope_date para consultas por fecha
    await queryRunner.query(`
      CREATE INDEX "idx_horoscope_date" 
      ON "daily_horoscopes" ("horoscope_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices
    await queryRunner.query(`DROP INDEX "public"."idx_horoscope_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_horoscope_sign_date"`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "daily_horoscopes"`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE "zodiac_sign_enum"`);
  }
}
