import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHolisticServicesTables1772300000000 implements MigrationInterface {
  name = 'CreateHolisticServicesTables1772300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add FAMILY_TREE value to existing session_type enum
    await queryRunner.query(`
      ALTER TYPE "public"."sessions_session_type_enum"
      ADD VALUE IF NOT EXISTS 'family_tree'
    `);

    // Create holistic_services table
    await queryRunner.query(`
      CREATE TABLE "holistic_services" (
        "id" SERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "slug" character varying(255) NOT NULL,
        "short_description" text NOT NULL,
        "long_description" text NOT NULL,
        "price_ars" numeric(10,2) NOT NULL DEFAULT '0',
        "duration_minutes" integer NOT NULL,
        "session_type" "public"."sessions_session_type_enum" NOT NULL,
        "whatsapp_number" character varying(50) NOT NULL,
        "mercado_pago_link" character varying(500) NOT NULL,
        "image_url" character varying(500),
        "display_order" integer NOT NULL DEFAULT '0',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_holistic_services_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_holistic_services" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_holistic_services_display_order"
      ON "holistic_services" ("display_order")
    `);

    // Create purchase_status enum
    await queryRunner.query(`
      CREATE TYPE "public"."service_purchases_payment_status_enum"
      AS ENUM('pending', 'paid', 'cancelled', 'refunded')
    `);

    // Create service_purchases table
    await queryRunner.query(`
      CREATE TABLE "service_purchases" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "holistic_service_id" integer NOT NULL,
        "session_id" integer,
        "payment_status" "public"."service_purchases_payment_status_enum" NOT NULL DEFAULT 'pending',
        "amount_ars" numeric(10,2) NOT NULL,
        "payment_reference" character varying(255),
        "paid_at" TIMESTAMP,
        "approved_by_admin_id" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_service_purchases" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_service_purchases_user_status"
      ON "service_purchases" ("user_id", "payment_status")
    `);

    await queryRunner.query(`
      CREATE INDEX "idx_service_purchases_service_status"
      ON "service_purchases" ("holistic_service_id", "payment_status")
    `);

    // Foreign keys
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD CONSTRAINT "FK_service_purchases_user"
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD CONSTRAINT "FK_service_purchases_holistic_service"
      FOREIGN KEY ("holistic_service_id") REFERENCES "holistic_services"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      ADD CONSTRAINT "FK_service_purchases_session"
      FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      DROP CONSTRAINT IF EXISTS "FK_service_purchases_session"
    `);

    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      DROP CONSTRAINT IF EXISTS "FK_service_purchases_holistic_service"
    `);

    await queryRunner.query(`
      ALTER TABLE "service_purchases"
      DROP CONSTRAINT IF EXISTS "FK_service_purchases_user"
    `);

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_service_purchases_service_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_service_purchases_user_status"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_holistic_services_display_order"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "service_purchases"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."service_purchases_payment_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "holistic_services"`);

    // Note: Cannot remove enum values from PostgreSQL easily.
    // The 'family_tree' value in sessions_session_type_enum is left in place.
  }
}
