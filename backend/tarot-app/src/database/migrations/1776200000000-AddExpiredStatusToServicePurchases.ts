import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiredStatusToServicePurchases1776200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add 'expired' value to the existing payment_status enum in PostgreSQL.
    // PostgreSQL does not allow removing values from enums, so this is
    // a one-way operation.
    await queryRunner.query(
      `ALTER TYPE "service_purchases_payment_status_enum" ADD VALUE IF NOT EXISTS 'expired'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support dropping enum values natively.
    // The rollback strategy is to convert any 'expired' rows back to
    // 'cancelled' before recreating the enum without 'expired'.
    await queryRunner.query(`
      UPDATE "service_purchases"
      SET "payment_status" = 'cancelled'
      WHERE "payment_status" = 'expired'
    `);

    // Recreate the enum without 'expired' by:
    // 1. Creating a new enum with the original values
    // 2. Migrating the column type to the new enum
    // 3. Dropping the old enum
    await queryRunner.query(
      `CREATE TYPE "service_purchases_payment_status_enum_old" AS ENUM('pending', 'paid', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
        ALTER COLUMN "payment_status" TYPE "service_purchases_payment_status_enum_old"
        USING "payment_status"::text::"service_purchases_payment_status_enum_old"
    `);
    await queryRunner.query(
      `DROP TYPE "service_purchases_payment_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "service_purchases_payment_status_enum_old" RENAME TO "service_purchases_payment_status_enum"`,
    );
  }
}
