import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMercadoPagoFieldsToServicePurchases1772400000000 implements MigrationInterface {
  name = 'AddMercadoPagoFieldsToServicePurchases1772400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add selectedDate field: date chosen by user before paying (for auto-scheduling post-webhook)
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD COLUMN IF NOT EXISTS "selected_date" date
    `);

    // Add selectedTime field: time slot chosen by user (HH:MM)
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD COLUMN IF NOT EXISTS "selected_time" character varying(10)
    `);

    // Add mercadoPagoPaymentId: ID of the payment in MP (populated via webhook IPN)
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD COLUMN IF NOT EXISTS "mercado_pago_payment_id" character varying(255)
    `);

    // Add preferenceId: Checkout Pro preference ID generated at purchase creation
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD COLUMN IF NOT EXISTS "preference_id" character varying(255)
    `);

    // Index for fast lookup by mercadoPagoPaymentId during webhook processing
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_service_purchases_mp_payment_id"
      ON "service_purchases" ("mercado_pago_payment_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_service_purchases_mp_payment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP COLUMN IF EXISTS "preference_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP COLUMN IF EXISTS "mercado_pago_payment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP COLUMN IF EXISTS "selected_time"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP COLUMN IF EXISTS "selected_date"`,
    );
  }
}
