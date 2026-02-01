import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración para crear las tablas del sistema de Rituales
 *
 * Crea:
 * - Enums: ritual_category, ritual_difficulty, lunar_phase, material_type
 * - Tabla: rituals (rituales principales)
 * - Tabla: ritual_steps (pasos de cada ritual)
 * - Tabla: ritual_materials (materiales necesarios)
 * - Tabla: user_ritual_history (historial de rituales completados)
 */
export class CreateRitualsTables1771300000000 implements MigrationInterface {
  name = 'CreateRitualsTables1771300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. CREAR ENUMS
    // ====================================

    await queryRunner.query(`
      CREATE TYPE ritual_category_enum AS ENUM (
        'tarot',
        'lunar',
        'cleansing',
        'meditation',
        'protection',
        'abundance',
        'love',
        'healing'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE ritual_difficulty_enum AS ENUM (
        'beginner',
        'intermediate',
        'advanced'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE lunar_phase_enum AS ENUM (
        'new_moon',
        'waxing_crescent',
        'first_quarter',
        'waxing_gibbous',
        'full_moon',
        'waning_gibbous',
        'last_quarter',
        'waning_crescent'
      );
    `);

    await queryRunner.query(`
      CREATE TYPE material_type_enum AS ENUM (
        'required',
        'optional',
        'alternative'
      );
    `);

    // ====================================
    // 2. TABLA PRINCIPAL: rituals
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "rituals" (
        "id" SERIAL PRIMARY KEY,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "description" TEXT NOT NULL,
        "category" ritual_category_enum NOT NULL,
        "difficulty" ritual_difficulty_enum NOT NULL,
        "duration_minutes" SMALLINT NOT NULL,
        "best_lunar_phase" lunar_phase_enum,
        "best_lunar_phases" JSONB,
        "best_time_of_day" VARCHAR(255),
        "purpose" TEXT,
        "preparation" TEXT,
        "closing" TEXT,
        "tips" JSONB,
        "image_url" VARCHAR(255) NOT NULL,
        "thumbnail_url" VARCHAR(255),
        "audio_url" VARCHAR(255),
        "is_active" BOOLEAN DEFAULT true,
        "is_featured" BOOLEAN DEFAULT false,
        "completion_count" INTEGER DEFAULT 0,
        "view_count" INTEGER DEFAULT 0,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Índices para la tabla rituals
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_ritual_slug" ON "rituals"("slug");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ritual_category" ON "rituals"("category");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ritual_difficulty" ON "rituals"("difficulty");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ritual_lunar_phase" ON "rituals"("best_lunar_phase");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_ritual_featured" ON "rituals"("is_featured") WHERE "is_featured" = true;`,
    );

    // ====================================
    // 3. TABLA: ritual_steps
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "ritual_steps" (
        "id" SERIAL PRIMARY KEY,
        "ritual_id" INTEGER NOT NULL,
        "step_number" SMALLINT NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "description" TEXT NOT NULL,
        "duration_seconds" SMALLINT,
        "image_url" VARCHAR(255),
        "mantra" TEXT,
        "visualization" TEXT,
        
        CONSTRAINT "fk_step_ritual"
          FOREIGN KEY ("ritual_id")
          REFERENCES "rituals"("id")
          ON DELETE CASCADE
      );
    `);

    // Índices para ritual_steps
    await queryRunner.query(
      `CREATE INDEX "idx_step_ritual" ON "ritual_steps"("ritual_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_step_order" ON "ritual_steps"("ritual_id", "step_number");`,
    );

    // ====================================
    // 4. TABLA: ritual_materials
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "ritual_materials" (
        "id" SERIAL PRIMARY KEY,
        "ritual_id" INTEGER NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "type" material_type_enum DEFAULT 'required',
        "alternative" VARCHAR(100),
        "quantity" SMALLINT DEFAULT 1,
        "unit" VARCHAR(50),
        
        CONSTRAINT "fk_material_ritual"
          FOREIGN KEY ("ritual_id")
          REFERENCES "rituals"("id")
          ON DELETE CASCADE
      );
    `);

    // Índices para ritual_materials
    await queryRunner.query(
      `CREATE INDEX "idx_material_ritual" ON "ritual_materials"("ritual_id");`,
    );

    // ====================================
    // 5. TABLA: user_ritual_history
    // ====================================

    await queryRunner.query(`
      CREATE TABLE "user_ritual_history" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "ritual_id" INTEGER NOT NULL,
        "completed_at" TIMESTAMPTZ NOT NULL,
        "lunar_phase" lunar_phase_enum,
        "lunar_sign" VARCHAR(50),
        "notes" TEXT,
        "rating" SMALLINT CHECK ("rating" >= 1 AND "rating" <= 5),
        "duration_minutes" SMALLINT,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT "fk_history_user"
          FOREIGN KEY ("user_id")
          REFERENCES "user"("id")
          ON DELETE CASCADE,
          
        CONSTRAINT "fk_history_ritual"
          FOREIGN KEY ("ritual_id")
          REFERENCES "rituals"("id")
          ON DELETE CASCADE
      );
    `);

    // Índices para user_ritual_history
    await queryRunner.query(
      `CREATE INDEX "idx_history_user" ON "user_ritual_history"("user_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_history_ritual" ON "user_ritual_history"("ritual_id");`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_history_date" ON "user_ritual_history"("completed_at");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso (por dependencias)
    await queryRunner.query(`DROP TABLE IF EXISTS "user_ritual_history";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ritual_materials";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ritual_steps";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rituals";`);

    // Eliminar enums
    await queryRunner.query(`DROP TYPE IF EXISTS material_type_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS lunar_phase_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS ritual_difficulty_enum;`);
    await queryRunner.query(`DROP TYPE IF EXISTS ritual_category_enum;`);
  }
}
