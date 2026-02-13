import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemConfigTable1770944236254 implements MigrationInterface {
  name = 'CreateSystemConfigTable1770944236254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create system_config table
    await queryRunner.query(
      `CREATE TABLE "system_config" (
        "id" SERIAL NOT NULL,
        "category" character varying(50) NOT NULL,
        "key" character varying(100) NOT NULL,
        "value" text NOT NULL,
        "description" character varying(255),
        "updatedBy" character varying(100),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "uq_system_config_category_key" UNIQUE ("category", "key"),
        CONSTRAINT "PK_db4e70ac0d27e588176e9bb44a0" PRIMARY KEY ("id")
      )`,
    );

    // Create index on category
    await queryRunner.query(
      `CREATE INDEX "idx_system_config_category" ON "system_config" ("category")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "public"."idx_system_config_category"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "system_config"`);
  }
}
