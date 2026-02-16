import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBirthChartToUsageFeatureEnum1771800000000 implements MigrationInterface {
  name = 'AddBirthChartToUsageFeatureEnum1771800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar 'birth_chart' al enum usage_feature_enum si no existe
    // Este enum fue creado en InitialSchema pero nunca se agregó 'birth_chart'
    // a pesar de que el código TypeScript lo referencia desde T-CA-018
    await queryRunner.query(
      `ALTER TYPE "public"."usage_feature_enum" ADD VALUE IF NOT EXISTS 'birth_chart'`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL no permite eliminar valores de un enum directamente.
    // Para revertir, se necesitaría recrear el enum sin el valor, lo cual
    // es complejo y requiere recrear todas las columnas que lo usan.
    // Por eso, dejamos down() vacío: esta migración es irreversible.
    // Ver: https://www.postgresql.org/docs/current/sql-altertype.html
  }
}
