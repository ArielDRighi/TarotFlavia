import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestToUserPlanEnum1770300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'guest' value to the existing user_plan_enum
    // NOTE: This migration requires PostgreSQL 9.3+ due to the use of 'ADD VALUE IF NOT EXISTS'
    await queryRunner.query(`
      ALTER TYPE user_plan_enum ADD VALUE IF NOT EXISTS 'guest'
    `);
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing enum values directly
    // This would require recreating the enum type and all dependent objects
    // For this migration, we'll leave the enum as-is in the down migration
    // If rollback is needed, it should be done manually with careful consideration
    console.warn(
      'WARNING: Cannot automatically remove enum value. Manual intervention required for rollback.',
    );
  }
}
