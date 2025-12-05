import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class CreatePlanConfigTable1764367226428 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for plan types
    await queryRunner.query(`
      CREATE TYPE plans_plantype_enum AS ENUM('free', 'premium', 'professional')
    `);

    // Create plans table
    await queryRunner.createTable(
      new Table({
        name: 'plans',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'planType',
            type: 'plans_plantype_enum',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'readingsLimit',
            type: 'integer',
            default: 10,
            isNullable: false,
          },
          {
            name: 'aiQuotaMonthly',
            type: 'integer',
            default: 100,
            isNullable: false,
          },
          {
            name: 'allowCustomQuestions',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'allowSharing',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'allowAdvancedSpreads',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add unique constraint on planType
    await queryRunner.createUniqueConstraint(
      'plans',
      new TableUnique({
        name: 'UQ_plans_planType',
        columnNames: ['planType'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('plans', 'UQ_plans_planType');

    // Drop table
    await queryRunner.dropTable('plans');

    // Drop enum type
    await queryRunner.query(`DROP TYPE plans_plantype_enum`);
  }
}
