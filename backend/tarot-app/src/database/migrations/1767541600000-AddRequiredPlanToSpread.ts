import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRequiredPlanToSpread1767541600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el enum type para requiredPlan
    await queryRunner.query(`
      CREATE TYPE "tarot_spread_requiredplan_enum" AS ENUM('anonymous', 'free', 'premium')
    `);

    // Agregar la columna requiredPlan con default 'anonymous'
    await queryRunner.query(`
      ALTER TABLE "tarot_spread" 
      ADD COLUMN "requiredPlan" "tarot_spread_requiredplan_enum" NOT NULL DEFAULT 'anonymous'
    `);

    // Actualizar spreads existentes:
    // Tiradas de 1 y 3 cartas -> ANONYMOUS (accesibles sin registro)
    await queryRunner.query(`
      UPDATE "tarot_spread" 
      SET "requiredPlan" = 'anonymous' 
      WHERE "cardCount" IN (1, 3)
    `);

    // Tiradas de 5 y 10 cartas (Cruz Céltica) -> PREMIUM
    await queryRunner.query(`
      UPDATE "tarot_spread" 
      SET "requiredPlan" = 'premium' 
      WHERE "cardCount" IN (5, 10)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar la columna
    await queryRunner.query(`
      ALTER TABLE "tarot_spread" DROP COLUMN "requiredPlan"
    `);

    // Eliminar el enum type
    await queryRunner.query(`
      DROP TYPE "tarot_spread_requiredplan_enum"
    `);
  }
}
