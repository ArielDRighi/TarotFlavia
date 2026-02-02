import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserLocationFields1771400000000 implements MigrationInterface {
  name = 'AddUserLocationFields1771400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para hemisferio si no existe
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE hemisphere_enum AS ENUM ('north', 'south');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Agregar columnas de geolocalización a la tabla user
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'timezone',
        type: 'varchar',
        length: '50',
        isNullable: true,
        comment: 'Zona horaria del usuario (formato IANA)',
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'countryCode',
        type: 'varchar',
        length: '2',
        isNullable: true,
        comment: 'Código ISO de país del usuario (ISO 3166-1 alpha-2)',
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'hemisphere',
        type: 'hemisphere_enum',
        isNullable: true,
        comment: 'Hemisferio geográfico del usuario',
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'latitude',
        type: 'decimal',
        precision: 10,
        scale: 6,
        isNullable: true,
        comment: 'Latitud del usuario para detección automática de hemisferio',
      }),
    );

    // Crear índice para consultas por país
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_country ON "user"("countryCode");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_country;`);

    // Eliminar columnas
    await queryRunner.dropColumn('user', 'latitude');
    await queryRunner.dropColumn('user', 'hemisphere');
    await queryRunner.dropColumn('user', 'countryCode');
    await queryRunner.dropColumn('user', 'timezone');

    // Nota: No eliminamos el enum hemisphere_enum por si hay otras referencias
    // Si quieres eliminarlo, descomenta la siguiente línea:
    // await queryRunner.query(`DROP TYPE IF EXISTS hemisphere_enum;`);
  }
}
