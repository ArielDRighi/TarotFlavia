import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para crear la tabla de notificaciones in-app
 *
 * Crea:
 * - Enum: notification_type (tipos de notificaciones)
 * - Tabla: user_notifications (notificaciones para usuarios premium)
 * - Índices para optimizar consultas por usuario y estado de lectura
 *
 * Sistema de notificaciones in-app para alertar a usuarios Premium sobre:
 * - Eventos del calendario sagrado (hoy)
 * - Recordatorios de eventos importantes (mañana)
 * - Rituales recomendados
 * - Patrones detectados en lecturas
 */
export class CreateUserNotificationsTable1771600000000 implements MigrationInterface {
  name = 'CreateUserNotificationsTable1771600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. CREAR ENUM notification_type
    // ====================================

    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'sacred_event',
        'sacred_event_reminder',
        'ritual_reminder',
        'pattern_insight'
      );
    `);

    // ====================================
    // 2. CREAR TABLA user_notifications
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "user_notifications" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "type" "notification_type_enum" NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "message" TEXT NOT NULL,
        "data" JSONB,
        "action_url" VARCHAR(255),
        "read" BOOLEAN DEFAULT false,
        "read_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT "fk_notification_user"
          FOREIGN KEY ("user_id")
          REFERENCES "user"("id")
          ON DELETE CASCADE
      );
    `);

    // ====================================
    // 3. CREAR ÍNDICES
    // ====================================

    // Índice para obtener notificaciones de un usuario
    await queryRunner.query(
      `CREATE INDEX "idx_notification_user" ON "user_notifications"("user_id");`,
    );

    // Índice compuesto para filtrar por usuario y estado de lectura
    await queryRunner.query(
      `CREATE INDEX "idx_notification_read" ON "user_notifications"("user_id", "read");`,
    );

    // Índice para ordenar por fecha de creación
    await queryRunner.query(
      `CREATE INDEX "idx_notification_created" ON "user_notifications"("created_at");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índices explícitamente
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_created";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_read";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_notification_user";`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE IF EXISTS "user_notifications";`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_type_enum";`);
  }
}
