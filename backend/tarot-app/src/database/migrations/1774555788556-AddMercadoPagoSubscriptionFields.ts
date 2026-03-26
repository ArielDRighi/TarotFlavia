import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMercadoPagoSubscriptionFields1774555788556 implements MigrationInterface {
  name = 'AddMercadoPagoSubscriptionFields1774555788556';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP CONSTRAINT "FK_service_purchases_session"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP CONSTRAINT "FK_service_purchases_holistic_service"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP CONSTRAINT "FK_service_purchases_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_service_purchases_mp_payment_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mp_preapproval_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mp_customer_id" character varying(100)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_mp_preapproval_id" ON "user" ("mp_preapproval_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "temperature" SET DEFAULT '0.7'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "top_p" SET DEFAULT '0.9'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sessions_session_type_enum" RENAME TO "sessions_session_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."holistic_services_session_type_enum" AS ENUM('tarot_reading', 'energy_cleaning', 'hebrew_pendulum', 'consultation', 'family_tree')`,
    );
    await queryRunner.query(
      `ALTER TABLE "holistic_services" ALTER COLUMN "session_type" TYPE "public"."holistic_services_session_type_enum" USING "session_type"::"text"::"public"."holistic_services_session_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."sessions_session_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_article_slug" ON "encyclopedia_articles" ("slug") `,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" ADD CONSTRAINT "FK_f154e009dc94862afed76e7c20d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" ADD CONSTRAINT "FK_95eaaabe1b11d4fe3552980d6da" FOREIGN KEY ("holistic_service_id") REFERENCES "holistic_services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" ADD CONSTRAINT "FK_6a66aa15c9d8da52d6e8744aaed" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP CONSTRAINT "FK_6a66aa15c9d8da52d6e8744aaed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP CONSTRAINT "FK_95eaaabe1b11d4fe3552980d6da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" DROP CONSTRAINT "FK_f154e009dc94862afed76e7c20d"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_article_slug"`);
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_articles" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "encyclopedia_tarot_cards" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sessions_session_type_enum_old" AS ENUM('consultation', 'energy_cleaning', 'family_tree', 'hebrew_pendulum', 'tarot_reading')`,
    );
    await queryRunner.query(
      `ALTER TABLE "holistic_services" ALTER COLUMN "session_type" TYPE "public"."sessions_session_type_enum_old" USING "session_type"::"text"::"public"."sessions_session_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."holistic_services_session_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sessions_session_type_enum_old" RENAME TO "sessions_session_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "top_p" SET DEFAULT 0.9`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_config" ALTER COLUMN "temperature" SET DEFAULT 0.7`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mp_customer_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_mp_preapproval_id"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "mp_preapproval_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_service_purchases_mp_payment_id" ON "service_purchases" ("mercado_pago_payment_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" ADD CONSTRAINT "FK_service_purchases_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" ADD CONSTRAINT "FK_service_purchases_holistic_service" FOREIGN KEY ("holistic_service_id") REFERENCES "holistic_services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "service_purchases" ADD CONSTRAINT "FK_service_purchases_session" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
