import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para crear las tablas del sistema de Péndulo Digital
 *
 * Crea:
 * - Enum: pendulum_response_enum (yes, no, maybe)
 * - Tabla: pendulum_interpretations (interpretaciones predefinidas)
 * - Tabla: pendulum_queries (historial de consultas)
 */
export class CreatePendulumTables1771700000000 implements MigrationInterface {
  name = 'CreatePendulumTables1771700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. CREAR ENUM
    // ====================================

    await queryRunner.query(`
      CREATE TYPE "pendulum_response_enum" AS ENUM (
        'yes',
        'no',
        'maybe'
      );
    `);

    // ====================================
    // 2. TABLA: pendulum_interpretations
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "pendulum_interpretations" (
        "id" SERIAL PRIMARY KEY,
        "responseType" "pendulum_response_enum" NOT NULL,
        "text" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true
      );
    `);

    // Índice para búsquedas por tipo de respuesta
    await queryRunner.query(
      `CREATE INDEX "idx_interpretation_response_type" ON "pendulum_interpretations"("responseType") WHERE "isActive" = true;`,
    );

    // ====================================
    // 3. TABLA: pendulum_queries
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "pendulum_queries" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL,
        "question" TEXT,
        "response" "pendulum_response_enum" NOT NULL,
        "interpretation" TEXT NOT NULL,
        "lunarPhase" VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT "fk_pendulum_query_user"
          FOREIGN KEY ("userId")
          REFERENCES "user"("id")
          ON DELETE CASCADE
      );
    `);

    // Índices para pendulum_queries
    await queryRunner.query(
      `CREATE INDEX "idx_pendulum_query_user" ON "pendulum_queries"("userId");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pendulum_query_created" ON "pendulum_queries"("createdAt");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_pendulum_query_response" ON "pendulum_queries"("response");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices explícitamente
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_pendulum_query_response";`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_pendulum_query_created";`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_pendulum_query_user";`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_interpretation_response_type";`,
    );

    // Eliminar tablas en orden inverso (por dependencias)
    await queryRunner.query(`DROP TABLE IF EXISTS "pendulum_queries";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pendulum_interpretations";`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE IF EXISTS "pendulum_response_enum";`);
  }
}
