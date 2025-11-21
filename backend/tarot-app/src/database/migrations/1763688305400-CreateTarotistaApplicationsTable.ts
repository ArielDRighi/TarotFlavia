import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTarotistaApplicationsTable1763688305400
  implements MigrationInterface
{
  name = 'CreateTarotistaApplicationsTable1763688305400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create ApplicationStatus enum
    await queryRunner.query(
      `CREATE TYPE "tarotista_applications_status_enum" AS ENUM('pending', 'approved', 'rejected')`,
    );

    // 2. Create tarotista_applications table
    await queryRunner.query(
      `CREATE TABLE "tarotista_applications" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "nombre_publico" character varying(100) NOT NULL,
        "biografia" text NOT NULL,
        "especialidades" text[] NOT NULL DEFAULT '{}',
        "motivacion" text NOT NULL,
        "experiencia" text NOT NULL,
        "status" "tarotista_applications_status_enum" NOT NULL DEFAULT 'pending',
        "admin_notes" text,
        "reviewed_by_user_id" integer,
        "reviewed_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tarotista_applications" PRIMARY KEY ("id")
      )`,
    );

    // 3. Create indexes
    await queryRunner.query(
      `CREATE INDEX "idx_application_user" ON "tarotista_applications" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_application_status" ON "tarotista_applications" ("status")`,
    );

    // 4. Add foreign keys
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" 
       ADD CONSTRAINT "FK_tarotista_applications_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" 
       ADD CONSTRAINT "FK_tarotista_applications_reviewer" 
       FOREIGN KEY ("reviewed_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" DROP CONSTRAINT IF EXISTS "FK_tarotista_applications_reviewer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarotista_applications" DROP CONSTRAINT IF EXISTS "FK_tarotista_applications_user"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_application_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_application_user"`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS "tarotista_applications"`);

    // Drop enum
    await queryRunner.query(
      `DROP TYPE IF EXISTS "tarotista_applications_status_enum"`,
    );
  }
}
