import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPendulumLimitsToPlan1771800000000 implements MigrationInterface {
  name = 'AddPendulumLimitsToPlan1771800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna pendulum_daily_limit
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'pendulum_daily_limit',
        type: 'int',
        default: 1,
        comment: 'Límite diario de consultas al Péndulo (-1 para ilimitado)',
      }),
    );

    // Agregar columna pendulum_monthly_limit
    await queryRunner.addColumn(
      'plans',
      new TableColumn({
        name: 'pendulum_monthly_limit',
        type: 'int',
        default: 3,
        comment: 'Límite mensual de consultas al Péndulo (-1 para ilimitado)',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar columnas
    await queryRunner.dropColumn('plans', 'pendulum_monthly_limit');
    await queryRunner.dropColumn('plans', 'pendulum_daily_limit');
  }
}
