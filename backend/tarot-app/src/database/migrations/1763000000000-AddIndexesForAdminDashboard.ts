import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForAdminDashboard1763000000000
  implements MigrationInterface
{
  name = 'AddIndexesForAdminDashboard1763000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Índices para optimizar queries de users
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_created_at" 
      ON "user" ("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_plan" 
      ON "user" ("plan")
    `);

    // Índices para optimizar queries de readings
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tarot_reading_created_at" 
      ON "tarot_reading" ("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tarot_reading_deleted_at" 
      ON "tarot_reading" ("deletedAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tarot_reading_user_created" 
      ON "tarot_reading" ("userId", "createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_tarot_reading_question_type" 
      ON "tarot_reading" ("questionType")
    `);

    // Índices para optimizar queries de AI usage logs
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ai_usage_created_at" 
      ON "ai_usage_logs" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ai_usage_provider" 
      ON "ai_usage_logs" ("provider")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ai_usage_status" 
      ON "ai_usage_logs" ("status")
    `);

    // Índice para optimizar queries de predefined questions usage
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_predefined_question_usage" 
      ON "predefined_question" ("usage_count" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop índices en orden inverso
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_predefined_question_usage"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_usage_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_usage_provider"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ai_usage_created_at"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_tarot_reading_question_type"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_tarot_reading_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_tarot_reading_deleted_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_tarot_reading_created_at"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_plan"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_created_at"`);
  }
}
