import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-SEO-013 (parte de tarot): saca la palabra "salud" del texto visible de las
 * fichas ya publicadas.
 *
 * Solo dos de las 78 cartas la traían, y en ninguna de las dos hablaba de salud:
 *
 * - `the-devil.description`: "el saludo vulgar de la ignorancia"
 * - `nine-of-wands.meaning_upright`: "límites saludables"
 *
 * Aun así el criterio de aceptación es un `grep -i salud` sobre el HTML servido,
 * así que las dos tienen que salir. Los archivos de seed ya quedaron corregidos
 * en el mismo commit; esta migración alcanza a las bases ya sembradas, donde el
 * seeder no llega: `seedEncyclopediaTarotCards` completa secciones extendidas
 * vacías y NUNCA reescribe las columnas base.
 *
 * SQL escrito a mano (no viene de `migration:generate`): son dos `UPDATE`
 * quirúrgicos con `REPLACE` sobre una subcadena exacta, con el `WHERE` acotado
 * al slug y al texto presente. Si el panel de admin reescribió esa ficha, el
 * `LIKE` no matchea y la migración no toca nada: no puede pisar una edición
 * editorial. Correrla dos veces no cambia nada la segunda.
 */
export class ReplaceSaludWordingInTarotCards1787274000000 implements MigrationInterface {
  name = 'ReplaceSaludWordingInTarotCards1787274000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards"
       SET "description" = REPLACE("description", 'el saludo vulgar de la ignorancia', 'el gesto vulgar de la ignorancia')
       WHERE "slug" = 'the-devil'
         AND "description" LIKE '%el saludo vulgar de la ignorancia%'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards"
       SET "meaning_upright" = REPLACE("meaning_upright", 'límites saludables', 'límites bien puestos')
       WHERE "slug" = 'nine-of-wands'
         AND "meaning_upright" LIKE '%límites saludables%'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards"
       SET "meaning_upright" = REPLACE("meaning_upright", 'límites bien puestos', 'límites saludables')
       WHERE "slug" = 'nine-of-wands'
         AND "meaning_upright" LIKE '%límites bien puestos%'`,
    );
    await queryRunner.query(
      `UPDATE "encyclopedia_tarot_cards"
       SET "description" = REPLACE("description", 'el gesto vulgar de la ignorancia', 'el saludo vulgar de la ignorancia')
       WHERE "slug" = 'the-devil'
         AND "description" LIKE '%el gesto vulgar de la ignorancia%'`,
    );
  }
}
