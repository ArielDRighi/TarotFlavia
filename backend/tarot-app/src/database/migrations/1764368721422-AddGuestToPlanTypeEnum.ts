import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestToPlanTypeEnum1764368721422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'guest' value to the existing plans_plantype_enum
    await queryRunner.query(`
      ALTER TYPE plans_plantype_enum ADD VALUE IF NOT EXISTS 'guest'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // This would require recreating the enum type and all dependent objects
    // For this migration, we'll leave the enum as-is in the down migration
    // If rollback is needed, it should be done manually with careful consideration
    console.warn(
      'WARNING: Cannot automatically remove enum value. Manual intervention required for rollback.',
    );
  }
}
