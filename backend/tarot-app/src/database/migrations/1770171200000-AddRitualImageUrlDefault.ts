import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRitualImageUrlDefault1770171200000 implements MigrationInterface {
  name = 'AddRitualImageUrlDefault1770171200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar valor por defecto al campo image_url de la tabla rituals
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "image_url" SET DEFAULT '/ritual-placeholder.svg'`,
    );

    // Actualizar registros existentes que tengan URLs inválidas
    await queryRunner.query(
      `UPDATE "rituals" 
       SET "image_url" = '/ritual-placeholder.svg' 
       WHERE "image_url" LIKE '/images/rituals/%'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover el valor por defecto
    await queryRunner.query(
      `ALTER TABLE "rituals" ALTER COLUMN "image_url" DROP DEFAULT`,
    );
  }
}
