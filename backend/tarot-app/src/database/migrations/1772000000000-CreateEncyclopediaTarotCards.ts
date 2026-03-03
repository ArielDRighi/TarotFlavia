import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: CreateEncyclopediaTarotCards
 *
 * Crea la tabla `encyclopedia_tarot_cards` con sus enums e índices
 * para la Enciclopedia Mística del módulo de enciclopedia.
 *
 * Soporta las 78 cartas del Tarot:
 * - 22 Arcanos Mayores
 * - 56 Arcanos Menores (14 × 4 palos)
 */
export class CreateEncyclopediaTarotCards1772000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tipos ENUM
    await queryRunner.query(`
      CREATE TYPE enc_arcana_type_enum AS ENUM ('major', 'minor');
    `);

    await queryRunner.query(`
      CREATE TYPE enc_suit_enum AS ENUM ('wands', 'cups', 'swords', 'pentacles');
    `);

    await queryRunner.query(`
      CREATE TYPE enc_court_rank_enum AS ENUM ('page', 'knight', 'queen', 'king');
    `);

    await queryRunner.query(`
      CREATE TYPE enc_element_enum AS ENUM ('fire', 'water', 'air', 'earth', 'spirit');
    `);

    await queryRunner.query(`
      CREATE TYPE enc_planet_enum AS ENUM (
        'sun', 'moon', 'mercury', 'venus', 'mars',
        'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE enc_zodiac_association_enum AS ENUM (
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
      );
    `);

    // Crear tabla principal
    await queryRunner.query(`
      CREATE TABLE encyclopedia_tarot_cards (
        id            SERIAL PRIMARY KEY,
        slug          VARCHAR(50)                     UNIQUE NOT NULL,
        name_en       VARCHAR(100)                    NOT NULL,
        name_es       VARCHAR(100)                    NOT NULL,
        arcana_type   enc_arcana_type_enum            NOT NULL,
        number        SMALLINT                        NOT NULL,
        roman_numeral VARCHAR(10),
        suit          enc_suit_enum,
        court_rank    enc_court_rank_enum,
        element       enc_element_enum,
        planet        enc_planet_enum,
        zodiac_sign   enc_zodiac_association_enum,
        meaning_upright  TEXT                         NOT NULL,
        meaning_reversed TEXT                         NOT NULL,
        description   TEXT,
        keywords      JSONB                           NOT NULL,
        image_url     VARCHAR(255)                    NOT NULL,
        thumbnail_url VARCHAR(255),
        related_cards JSONB,
        view_count    INTEGER                         NOT NULL DEFAULT 0,
        created_at    TIMESTAMPTZ                     NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ                     NOT NULL DEFAULT NOW()
      );
    `);

    // Crear índices para búsquedas comunes
    await queryRunner.query(`
      CREATE INDEX idx_enc_card_arcana ON encyclopedia_tarot_cards(arcana_type);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_enc_card_suit ON encyclopedia_tarot_cards(suit);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS encyclopedia_tarot_cards`);

    // Eliminar tipos ENUM en orden inverso
    await queryRunner.query(`DROP TYPE IF EXISTS enc_zodiac_association_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS enc_planet_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS enc_element_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS enc_court_rank_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS enc_suit_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS enc_arcana_type_enum`);
  }
}
