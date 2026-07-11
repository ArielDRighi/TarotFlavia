import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Alinea las imágenes de la enciclopedia (`encyclopedia_tarot_cards`) con las WebP
 * locales servidas por el frontend desde `/images/tarot/`.
 *
 * La seed data de la enciclopedia ya apunta a las WebP locales, pero el seeder es
 * idempotente por omisión (si la tabla tiene filas, no las toca). Los entornos cuya
 * base se sembró antes de esa migración de datos conservan las URLs de Wikimedia, que
 * `next/image` rechaza porque `remotePatterns` está vacío en `next.config.ts`.
 *
 * El slug de cada carta coincide exactamente con el nombre del archivo WebP, así que
 * la URL local se deriva del slug en una única sentencia idempotente.
 */
export class MigrateEncyclopediaCardImagesToLocalWebP1776800000000 implements MigrationInterface {
  name = 'MigrateEncyclopediaCardImagesToLocalWebP1776800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = '/images/tarot/' || "slug" || '.webp' WHERE "image_url" NOT LIKE '/images/tarot/%'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg' WHERE "slug" = 'the-fool'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg' WHERE "slug" = 'the-magician'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg' WHERE "slug" = 'the-high-priestess'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg' WHERE "slug" = 'the-empress'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg' WHERE "slug" = 'the-emperor'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg' WHERE "slug" = 'the-hierophant'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg' WHERE "slug" = 'the-lovers'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg' WHERE "slug" = 'the-chariot'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg' WHERE "slug" = 'strength'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg' WHERE "slug" = 'the-hermit'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg' WHERE "slug" = 'wheel-of-fortune'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg' WHERE "slug" = 'justice'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg' WHERE "slug" = 'the-hanged-man'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg' WHERE "slug" = 'death'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg' WHERE "slug" = 'temperance'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg' WHERE "slug" = 'the-devil'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg' WHERE "slug" = 'the-tower'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg' WHERE "slug" = 'the-star'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg' WHERE "slug" = 'the-moon'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg' WHERE "slug" = 'the-sun'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg' WHERE "slug" = 'judgement'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg' WHERE "slug" = 'the-world'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg' WHERE "slug" = 'ace-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg' WHERE "slug" = 'two-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg' WHERE "slug" = 'three-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg' WHERE "slug" = 'four-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg' WHERE "slug" = 'five-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg' WHERE "slug" = 'six-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Wands07.jpg' WHERE "slug" = 'seven-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg' WHERE "slug" = 'eight-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Tarot_Nine_of_Wands.jpg' WHERE "slug" = 'nine-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wands10.jpg' WHERE "slug" = 'ten-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Wands11.jpg' WHERE "slug" = 'page-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/16/Wands12.jpg' WHERE "slug" = 'knight-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Wands13.jpg' WHERE "slug" = 'queen-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Wands14.jpg' WHERE "slug" = 'king-of-wands'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg' WHERE "slug" = 'ace-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg' WHERE "slug" = 'two-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg' WHERE "slug" = 'three-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg' WHERE "slug" = 'four-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg' WHERE "slug" = 'five-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg' WHERE "slug" = 'six-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg' WHERE "slug" = 'seven-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg' WHERE "slug" = 'eight-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg' WHERE "slug" = 'nine-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/84/Cups10.jpg' WHERE "slug" = 'ten-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg' WHERE "slug" = 'page-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cups12.jpg' WHERE "slug" = 'knight-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/62/Cups13.jpg' WHERE "slug" = 'queen-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg' WHERE "slug" = 'king-of-cups'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg' WHERE "slug" = 'ace-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Swords02.jpg' WHERE "slug" = 'two-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/02/Swords03.jpg' WHERE "slug" = 'three-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Swords04.jpg' WHERE "slug" = 'four-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Swords05.jpg' WHERE "slug" = 'five-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/29/Swords06.jpg' WHERE "slug" = 'six-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/34/Swords07.jpg' WHERE "slug" = 'seven-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Swords08.jpg' WHERE "slug" = 'eight-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Swords09.jpg' WHERE "slug" = 'nine-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords10.jpg' WHERE "slug" = 'ten-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Swords11.jpg' WHERE "slug" = 'page-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Swords12.jpg' WHERE "slug" = 'knight-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords13.jpg' WHERE "slug" = 'queen-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/33/Swords14.jpg' WHERE "slug" = 'king-of-swords'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg' WHERE "slug" = 'ace-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Pents02.jpg' WHERE "slug" = 'two-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents03.jpg' WHERE "slug" = 'three-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Pents04.jpg' WHERE "slug" = 'four-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Pents05.jpg' WHERE "slug" = 'five-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Pents06.jpg' WHERE "slug" = 'six-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Pents07.jpg' WHERE "slug" = 'seven-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pents08.jpg' WHERE "slug" = 'eight-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg' WHERE "slug" = 'nine-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg' WHERE "slug" = 'ten-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Pents11.jpg' WHERE "slug" = 'page-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Pents12.jpg' WHERE "slug" = 'knight-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/88/Pents13.jpg' WHERE "slug" = 'queen-of-pentacles'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Pents14.jpg' WHERE "slug" = 'king-of-pentacles'`,
    );
  }
}
