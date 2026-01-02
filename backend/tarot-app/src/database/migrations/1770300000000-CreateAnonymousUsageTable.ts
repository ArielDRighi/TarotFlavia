import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnonymousUsageTable1770300000000 implements MigrationInterface {
  name = 'CreateAnonymousUsageTable1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table anonymous_usage
    await queryRunner.query(`
      CREATE TYPE "anonymous_usage_feature_enum" AS ENUM('TAROT_READING');
    `);
    await queryRunner.query(`
      CREATE TABLE "anonymous_usage" (
        "id" SERIAL NOT NULL,
        "fingerprint" character varying(64) NOT NULL,
        "ip" character varying(45) NOT NULL,
        "date" date NOT NULL,
        "feature" "anonymous_usage_feature_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_anonymous_usage" PRIMARY KEY ("id")
      )
    `);

    // Create composite index for efficient lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_anonymous_usage_fingerprint_date_feature" 
      ON "anonymous_usage" ("fingerprint", "date", "feature")
    `);

    // Create index for date-based cleanup queries
    await queryRunner.query(`
      CREATE INDEX "IDX_anonymous_usage_date" 
      ON "anonymous_usage" ("date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_anonymous_usage_date"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_anonymous_usage_fingerprint_date_feature"`,
    );
    await queryRunner.query(`DROP TABLE "anonymous_usage"`);
  }
}
