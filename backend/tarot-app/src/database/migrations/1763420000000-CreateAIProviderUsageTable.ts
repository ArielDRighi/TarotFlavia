import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAIProviderUsageTable1763420000000
  implements MigrationInterface
{
  name = 'CreateAIProviderUsageTable1763420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table ai_provider_usage
    await queryRunner.query(`
      CREATE TABLE "ai_provider_usage" (
        "id" SERIAL NOT NULL,
        "provider" "ai_provider_enum" NOT NULL,
        "month" date NOT NULL,
        "requests_count" integer NOT NULL DEFAULT '0',
        "tokens_used" bigint NOT NULL DEFAULT '0',
        "cost_usd" numeric(10,4) NOT NULL DEFAULT '0',
        "monthly_limit_usd" numeric(10,4) NOT NULL,
        "limit_reached" boolean NOT NULL DEFAULT false,
        "warning_at_80_sent" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_provider_usage" PRIMARY KEY ("id")
      )
    `);

    // Create unique index on (provider, month)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_ai_provider_usage_provider_month" 
      ON "ai_provider_usage" ("provider", "month")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_provider_usage_provider_month"`,
    );
    await queryRunner.query(`DROP TABLE "ai_provider_usage"`);
  }
}
