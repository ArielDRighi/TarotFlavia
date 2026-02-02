import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para crear las tablas del Calendario Sagrado
 *
 * Crea:
 * - Enums: hemisphere, sacred_event_type, sabbat, sacred_event_importance
 * - Tabla: sacred_events (eventos del calendario sagrado)
 * - Tabla: user_sacred_event_notifications (tracking de notificaciones)
 */
export class CreateSacredEventsTables1771500000000 implements MigrationInterface {
  name = 'CreateSacredEventsTables1771500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. CREAR ENUMS
    // ====================================

    // Crear enum hemisphere si no existe (puede haber sido creado por AddUserLocationFields)
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "hemisphere_enum" AS ENUM (
          'north',
          'south'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TYPE "sacred_event_type_enum" AS ENUM (
        'sabbat',
        'lunar_phase',
        'portal',
        'cultural',
        'eclipse'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "sabbat_enum" AS ENUM (
        'samhain',
        'yule',
        'imbolc',
        'ostara',
        'beltane',
        'litha',
        'lammas',
        'mabon'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE "sacred_event_importance_enum" AS ENUM (
        'high',
        'medium',
        'low'
      );
    `);

    // ====================================
    // 2. TABLA PRINCIPAL: sacred_events
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "sacred_events" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) NOT NULL,
        "description" TEXT NOT NULL,
        "event_type" "sacred_event_type_enum" NOT NULL,
        "sabbat" "sabbat_enum",
        "lunar_phase" "lunar_phase_enum",
        "event_date" DATE NOT NULL,
        "event_time" TIME,
        "hemisphere" "hemisphere_enum",
        "importance" "sacred_event_importance_enum" NOT NULL,
        "energy_description" TEXT NOT NULL,
        "suggested_ritual_categories" JSONB,
        "suggested_ritual_ids" JSONB,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Índices para la tabla sacred_events
    await queryRunner.query(
      `CREATE INDEX "idx_sacred_event_date" ON "sacred_events"("event_date");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sacred_event_type" ON "sacred_events"("event_type");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sacred_event_hemisphere" ON "sacred_events"("hemisphere");`,
    );
    // Índice único para slug (identificador estable, como en ritual.entity.ts)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_sacred_event_slug" ON "sacred_events"("slug");`,
    );

    // ====================================
    // 3. TABLA: user_sacred_event_notifications
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "user_sacred_event_notifications" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "event_id" INTEGER NOT NULL,
        "notified_24h" BOOLEAN DEFAULT false,
        "notified_on_day" BOOLEAN DEFAULT false,
        "dismissed" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT "fk_user_notification"
          FOREIGN KEY ("user_id")
          REFERENCES "user"("id")
          ON DELETE CASCADE,
          
        CONSTRAINT "fk_event_notification"
          FOREIGN KEY ("event_id")
          REFERENCES "sacred_events"("id")
          ON DELETE CASCADE
      );
    `);

    // Índices para la tabla user_sacred_event_notifications
    // UNIQUE constraint para prevenir duplicados por condiciones de carrera
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_user_event" ON "user_sacred_event_notifications"("user_id", "event_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso
    await queryRunner.query(
      `DROP TABLE IF EXISTS "user_sacred_event_notifications";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "sacred_events";`);

    // Eliminar enums específicos de esta funcionalidad
    // Nota: NO eliminamos hemisphere_enum porque es compartido con la tabla user
    // (creado en 1771400000000-AddUserLocationFields.ts)
    await queryRunner.query(
      `DROP TYPE IF EXISTS "sacred_event_importance_enum";`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "sabbat_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "sacred_event_type_enum";`);
  }
}
