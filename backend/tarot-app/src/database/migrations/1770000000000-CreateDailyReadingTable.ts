import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyReadingTable1770000000000
  implements MigrationInterface
{
  name = 'CreateDailyReadingTable1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create daily_readings table
    await queryRunner.query(`
      CREATE TABLE "daily_readings" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "tarotista_id" integer NOT NULL,
        "card_id" integer NOT NULL,
        "is_reversed" boolean NOT NULL DEFAULT false,
        "interpretation" text NOT NULL,
        "reading_date" date NOT NULL,
        "was_regenerated" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_daily_readings" PRIMARY KEY ("id")
      )
    `);

    // Create unique constraint: 1 daily card per user per day per tarotista
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_daily_readings_user_date_tarotista" 
      ON "daily_readings" ("user_id", "reading_date", "tarotista_id")
    `);

    // Create index for efficient queries by user + date
    await queryRunner.query(`
      CREATE INDEX "IDX_daily_readings_user_date" 
      ON "daily_readings" ("user_id", "reading_date")
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ADD CONSTRAINT "FK_daily_readings_user" 
      FOREIGN KEY ("user_id") 
      REFERENCES "user"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ADD CONSTRAINT "FK_daily_readings_tarotista" 
      FOREIGN KEY ("tarotista_id") 
      REFERENCES "tarotistas"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      ADD CONSTRAINT "FK_daily_readings_card" 
      FOREIGN KEY ("card_id") 
      REFERENCES "tarot_card"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      DROP CONSTRAINT "FK_daily_readings_card"
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      DROP CONSTRAINT "FK_daily_readings_tarotista"
    `);

    await queryRunner.query(`
      ALTER TABLE "daily_readings" 
      DROP CONSTRAINT "FK_daily_readings_user"
    `);

    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "public"."IDX_daily_readings_user_date"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."UQ_daily_readings_user_date_tarotista"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE "daily_readings"`);
  }
}
