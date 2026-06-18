import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateCardImagesToLocalWebP1776400000000 implements MigrationInterface {
  name = 'MigrateCardImagesToLocalWebP1776400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Major Arcana
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-fool.webp' WHERE "name" = 'El Loco'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-magician.webp' WHERE "name" = 'El Mago'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-high-priestess.webp' WHERE "name" = 'La Sacerdotisa'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-empress.webp' WHERE "name" = 'La Emperatriz'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-emperor.webp' WHERE "name" = 'El Emperador'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-hierophant.webp' WHERE "name" = 'El Papa (El Hierofante)'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-lovers.webp' WHERE "name" = 'Los Amantes'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-chariot.webp' WHERE "name" = 'El Carro'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/strength.webp' WHERE "name" = 'La Fuerza'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-hermit.webp' WHERE "name" = 'El Ermitaño'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/wheel-of-fortune.webp' WHERE "name" = 'La Rueda de la Fortuna'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/justice.webp' WHERE "name" = 'La Justicia'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-hanged-man.webp' WHERE "name" = 'El Colgado'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/death.webp' WHERE "name" = 'La Muerte'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/temperance.webp' WHERE "name" = 'La Templanza'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-devil.webp' WHERE "name" = 'El Diablo'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-tower.webp' WHERE "name" = 'La Torre'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-star.webp' WHERE "name" = 'La Estrella'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-moon.webp' WHERE "name" = 'La Luna'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-sun.webp' WHERE "name" = 'El Sol'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/judgement.webp' WHERE "name" = 'El Juicio'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/the-world.webp' WHERE "name" = 'El Mundo'`,
    );

    // Bastos
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ace-of-wands.webp' WHERE "name" = 'As de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/two-of-wands.webp' WHERE "name" = 'Dos de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/three-of-wands.webp' WHERE "name" = 'Tres de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/four-of-wands.webp' WHERE "name" = 'Cuatro de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/five-of-wands.webp' WHERE "name" = 'Cinco de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/six-of-wands.webp' WHERE "name" = 'Seis de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/seven-of-wands.webp' WHERE "name" = 'Siete de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/eight-of-wands.webp' WHERE "name" = 'Ocho de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/nine-of-wands.webp' WHERE "name" = 'Nueve de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ten-of-wands.webp' WHERE "name" = 'Diez de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/page-of-wands.webp' WHERE "name" = 'Sota de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/knight-of-wands.webp' WHERE "name" = 'Caballero de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/queen-of-wands.webp' WHERE "name" = 'Reina de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/king-of-wands.webp' WHERE "name" = 'Rey de Bastos'`,
    );

    // Copas
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ace-of-cups.webp' WHERE "name" = 'As de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/two-of-cups.webp' WHERE "name" = 'Dos de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/three-of-cups.webp' WHERE "name" = 'Tres de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/four-of-cups.webp' WHERE "name" = 'Cuatro de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/five-of-cups.webp' WHERE "name" = 'Cinco de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/six-of-cups.webp' WHERE "name" = 'Seis de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/seven-of-cups.webp' WHERE "name" = 'Siete de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/eight-of-cups.webp' WHERE "name" = 'Ocho de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/nine-of-cups.webp' WHERE "name" = 'Nueve de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ten-of-cups.webp' WHERE "name" = 'Diez de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/page-of-cups.webp' WHERE "name" = 'Sota de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/knight-of-cups.webp' WHERE "name" = 'Caballero de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/queen-of-cups.webp' WHERE "name" = 'Reina de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/king-of-cups.webp' WHERE "name" = 'Rey de Copas'`,
    );

    // Espadas
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ace-of-swords.webp' WHERE "name" = 'As de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/two-of-swords.webp' WHERE "name" = 'Dos de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/three-of-swords.webp' WHERE "name" = 'Tres de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/four-of-swords.webp' WHERE "name" = 'Cuatro de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/five-of-swords.webp' WHERE "name" = 'Cinco de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/six-of-swords.webp' WHERE "name" = 'Seis de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/seven-of-swords.webp' WHERE "name" = 'Siete de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/eight-of-swords.webp' WHERE "name" = 'Ocho de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/nine-of-swords.webp' WHERE "name" = 'Nueve de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ten-of-swords.webp' WHERE "name" = 'Diez de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/page-of-swords.webp' WHERE "name" = 'Sota de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/knight-of-swords.webp' WHERE "name" = 'Caballero de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/queen-of-swords.webp' WHERE "name" = 'Reina de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/king-of-swords.webp' WHERE "name" = 'Rey de Espadas'`,
    );

    // Oros
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ace-of-pentacles.webp' WHERE "name" = 'As de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/two-of-pentacles.webp' WHERE "name" = 'Dos de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/three-of-pentacles.webp' WHERE "name" = 'Tres de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/four-of-pentacles.webp' WHERE "name" = 'Cuatro de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/five-of-pentacles.webp' WHERE "name" = 'Cinco de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/six-of-pentacles.webp' WHERE "name" = 'Seis de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/seven-of-pentacles.webp' WHERE "name" = 'Siete de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/eight-of-pentacles.webp' WHERE "name" = 'Ocho de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/nine-of-pentacles.webp' WHERE "name" = 'Nueve de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/ten-of-pentacles.webp' WHERE "name" = 'Diez de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/page-of-pentacles.webp' WHERE "name" = 'Sota de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/knight-of-pentacles.webp' WHERE "name" = 'Caballero de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/queen-of-pentacles.webp' WHERE "name" = 'Reina de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = '/images/tarot/king-of-pentacles.webp' WHERE "name" = 'Rey de Oros'`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Major Arcana
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg' WHERE "name" = 'El Loco'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg' WHERE "name" = 'El Mago'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg' WHERE "name" = 'La Sacerdotisa'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg' WHERE "name" = 'La Emperatriz'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg' WHERE "name" = 'El Emperador'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg' WHERE "name" = 'El Papa (El Hierofante)'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg' WHERE "name" = 'Los Amantes'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg' WHERE "name" = 'El Carro'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg' WHERE "name" = 'La Fuerza'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg' WHERE "name" = 'El Ermitaño'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg' WHERE "name" = 'La Rueda de la Fortuna'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg' WHERE "name" = 'La Justicia'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg' WHERE "name" = 'El Colgado'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg' WHERE "name" = 'La Muerte'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg' WHERE "name" = 'La Templanza'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg' WHERE "name" = 'El Diablo'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg' WHERE "name" = 'La Torre'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg' WHERE "name" = 'La Estrella'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg' WHERE "name" = 'La Luna'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg' WHERE "name" = 'El Sol'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg' WHERE "name" = 'El Juicio'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg' WHERE "name" = 'El Mundo'`,
    );

    // Bastos
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg' WHERE "name" = 'As de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg' WHERE "name" = 'Dos de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg' WHERE "name" = 'Tres de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg' WHERE "name" = 'Cuatro de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg' WHERE "name" = 'Cinco de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg' WHERE "name" = 'Seis de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Wands07.jpg' WHERE "name" = 'Siete de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg' WHERE "name" = 'Ocho de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Tarot_Nine_of_Wands.jpg' WHERE "name" = 'Nueve de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wands10.jpg' WHERE "name" = 'Diez de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Wands11.jpg' WHERE "name" = 'Sota de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/16/Wands12.jpg' WHERE "name" = 'Caballero de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Wands13.jpg' WHERE "name" = 'Reina de Bastos'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Wands14.jpg' WHERE "name" = 'Rey de Bastos'`,
    );

    // Copas
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg' WHERE "name" = 'As de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg' WHERE "name" = 'Dos de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg' WHERE "name" = 'Tres de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg' WHERE "name" = 'Cuatro de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg' WHERE "name" = 'Cinco de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg' WHERE "name" = 'Seis de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg' WHERE "name" = 'Siete de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg' WHERE "name" = 'Ocho de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg' WHERE "name" = 'Nueve de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/84/Cups10.jpg' WHERE "name" = 'Diez de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg' WHERE "name" = 'Sota de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cups12.jpg' WHERE "name" = 'Caballero de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/62/Cups13.jpg' WHERE "name" = 'Reina de Copas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg' WHERE "name" = 'Rey de Copas'`,
    );

    // Espadas
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg' WHERE "name" = 'As de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Swords02.jpg' WHERE "name" = 'Dos de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/0/02/Swords03.jpg' WHERE "name" = 'Tres de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Swords04.jpg' WHERE "name" = 'Cuatro de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Swords05.jpg' WHERE "name" = 'Cinco de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/29/Swords06.jpg' WHERE "name" = 'Seis de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/34/Swords07.jpg' WHERE "name" = 'Siete de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Swords08.jpg' WHERE "name" = 'Ocho de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Swords09.jpg' WHERE "name" = 'Nueve de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords10.jpg' WHERE "name" = 'Diez de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Swords11.jpg' WHERE "name" = 'Sota de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Swords12.jpg' WHERE "name" = 'Caballero de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords13.jpg' WHERE "name" = 'Reina de Espadas'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/33/Swords14.jpg' WHERE "name" = 'Rey de Espadas'`,
    );

    // Oros
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg' WHERE "name" = 'As de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Pents02.jpg' WHERE "name" = 'Dos de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents03.jpg' WHERE "name" = 'Tres de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Pents04.jpg' WHERE "name" = 'Cuatro de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/9/96/Pents05.jpg' WHERE "name" = 'Cinco de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Pents06.jpg' WHERE "name" = 'Seis de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Pents07.jpg' WHERE "name" = 'Siete de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pents08.jpg' WHERE "name" = 'Ocho de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg' WHERE "name" = 'Nueve de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg' WHERE "name" = 'Diez de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Pents11.jpg' WHERE "name" = 'Sota de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Pents12.jpg' WHERE "name" = 'Caballero de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/8/88/Pents13.jpg' WHERE "name" = 'Reina de Oros'`,
    );
    await queryRunner.query(
      `UPDATE "tarot_card" SET "image_url" = 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Pents14.jpg' WHERE "name" = 'Rey de Oros'`,
    );
  }
}
