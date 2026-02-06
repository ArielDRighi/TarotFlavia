import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBirthChartsTable1770406386236 implements MigrationInterface {
  name = 'CreateBirthChartsTable1770406386236';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create birth_charts table
    await queryRunner.query(
      `CREATE TABLE "birth_charts" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "name" character varying(100) NOT NULL,
        "birthDate" date NOT NULL,
        "birthTime" TIME NOT NULL,
        "birthPlace" character varying(255) NOT NULL,
        "latitude" numeric(10,6) NOT NULL,
        "longitude" numeric(10,6) NOT NULL,
        "timezone" character varying(100) NOT NULL,
        "chartData" jsonb NOT NULL,
        "sunSign" character varying(20) NOT NULL,
        "moonSign" character varying(20) NOT NULL,
        "ascendantSign" character varying(20) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6adf9d4c56c90eb3ef9c2ec691f" PRIMARY KEY ("id")
      )`,
    );

    // Create unique composite index for preventing duplicate charts
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_birth_chart_user_birth" 
       ON "birth_charts" ("userId", "birthDate", "birthTime", "latitude", "longitude")`,
    );

    // Create index for user lookup
    await queryRunner.query(
      `CREATE INDEX "idx_birth_chart_user" ON "birth_charts" ("userId")`,
    );

    // Add foreign key to user table
    await queryRunner.query(
      `ALTER TABLE "birth_charts" 
       ADD CONSTRAINT "FK_7727043dfc6bc17b0305483a3d2" 
       FOREIGN KEY ("userId") REFERENCES "user"("id") 
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.query(
      `ALTER TABLE "birth_charts" DROP CONSTRAINT "FK_7727043dfc6bc17b0305483a3d2"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."idx_birth_chart_user"`);
    await queryRunner.query(`DROP INDEX "public"."idx_birth_chart_user_birth"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "birth_charts"`);
  }
}
