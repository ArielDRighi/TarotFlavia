import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMercadoPagoSubscriptionFields1774555788556 implements MigrationInterface {
  name = 'AddMercadoPagoSubscriptionFields1774555788556';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mp_preapproval_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "mp_customer_id" character varying(100)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_mp_preapproval_id" ON "user" ("mp_preapproval_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_user_mp_preapproval_id"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "mp_customer_id"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "mp_preapproval_id"`,
    );
  }
}
