import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: CreateEncyclopediaArticles
 *
 * Crea la tabla `encyclopedia_articles` con su enum e índices
 * para los artículos no-tarot de la Enciclopedia Mística.
 *
 * Soporta ~95 artículos de 11 categorías:
 * - Signos zodiacales (12)
 * - Planetas (10)
 * - Casas astrales (12)
 * - Elementos (5), Modalidades (3)
 * - Guías de actividades (numerología, péndulo, carta natal, rituales, horóscopo, chino)
 */
export class CreateEncyclopediaArticles1772100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tipo ENUM para categorías de artículo
    await queryRunner.query(`
      CREATE TYPE enc_article_category_enum AS ENUM (
        'zodiac_sign',
        'planet',
        'astro_house',
        'element',
        'modality',
        'guide_numerology',
        'guide_pendulum',
        'guide_birth_chart',
        'guide_ritual',
        'guide_horoscope',
        'guide_chinese'
      );
    `);

    // Crear tabla principal
    await queryRunner.query(`
      CREATE TABLE encyclopedia_articles (
        id               SERIAL PRIMARY KEY,
        slug             VARCHAR(80)                     UNIQUE NOT NULL,
        name_es          VARCHAR(120)                    NOT NULL,
        name_en          VARCHAR(120),
        category         enc_article_category_enum       NOT NULL,
        snippet          TEXT                            NOT NULL,
        content          TEXT                            NOT NULL,
        metadata         JSONB,
        related_articles JSONB,
        related_tarot_cards JSONB,
        image_url        VARCHAR(255),
        sort_order       SMALLINT                        NOT NULL DEFAULT 0,
        view_count       INTEGER                         NOT NULL DEFAULT 0,
        created_at       TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ                     NOT NULL DEFAULT NOW()
      );
    `);

    // Crear índices para búsquedas comunes
    await queryRunner.query(`
      CREATE INDEX idx_article_category ON encyclopedia_articles(category);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS encyclopedia_articles`);

    // Eliminar tipo ENUM
    await queryRunner.query(`DROP TYPE IF EXISTS enc_article_category_enum`);
  }
}
