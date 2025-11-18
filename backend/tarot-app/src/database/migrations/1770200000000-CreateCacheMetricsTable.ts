import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCacheMetricsTable1770200000000
  implements MigrationInterface
{
  name = 'CreateCacheMetricsTable1770200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table cache_metrics
    await queryRunner.query(`
      CREATE TABLE "cache_metrics" (
        "id" SERIAL NOT NULL,
        "metric_date" date NOT NULL,
        "metric_hour" integer NOT NULL,
        "total_requests" integer NOT NULL DEFAULT '0',
        "cache_hits" integer NOT NULL DEFAULT '0',
        "cache_misses" integer NOT NULL DEFAULT '0',
        "hit_rate_percentage" numeric(5,2) NOT NULL DEFAULT '0',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cache_metrics" PRIMARY KEY ("id")
      )
    `);

    // Create unique index on (metric_date, metric_hour) to prevent duplicates
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_cache_metrics_date_hour" 
      ON "cache_metrics" ("metric_date", "metric_hour")
    `);

    // Create index for efficient date range queries
    await queryRunner.query(`
      CREATE INDEX "IDX_cache_metrics_date" 
      ON "cache_metrics" ("metric_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_cache_metrics_date"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cache_metrics_date_hour"`,
    );
    await queryRunner.query(`DROP TABLE "cache_metrics"`);
  }
}
