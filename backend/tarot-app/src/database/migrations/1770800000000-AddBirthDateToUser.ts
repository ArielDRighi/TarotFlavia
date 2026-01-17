import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBirthDateToUser1770800000000 implements MigrationInterface {
  name = 'AddBirthDateToUser1770800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna birthDate a la tabla user (nullable para no afectar datos existentes)
    await queryRunner.query(`ALTER TABLE "user" ADD "birthDate" date`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar columna birthDate
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "birthDate"`);
  }
}
