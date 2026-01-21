import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNumerologyInterpretation1771200000000 implements MigrationInterface {
  name = 'CreateNumerologyInterpretation1771200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla numerology_interpretations
    await queryRunner.query(`
      CREATE TABLE "numerology_interpretations" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "life_path" smallint NOT NULL,
        "birthday_number" smallint NOT NULL,
        "expression_number" smallint,
        "soul_urge" smallint,
        "personality" smallint,
        "birth_date" date NOT NULL,
        "full_name" character varying(100),
        "interpretation" text NOT NULL,
        "ai_provider" character varying(50) NOT NULL,
        "ai_model" character varying(100) NOT NULL,
        "tokens_used" integer NOT NULL DEFAULT 0,
        "generation_time_ms" integer NOT NULL DEFAULT 0,
        "generated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_numerology_interpretations" PRIMARY KEY ("id")
      )
    `);

    // Crear índice único en user_id
    // Esto previene duplicados: una interpretación por usuario
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_numerology_interpretation_user" 
      ON "numerology_interpretations" ("user_id")
    `);

    // Crear foreign key hacia la tabla user
    await queryRunner.query(`
      ALTER TABLE "numerology_interpretations"
      ADD CONSTRAINT "FK_numerology_interpretation_user"
      FOREIGN KEY ("user_id")
      REFERENCES "user"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key
    await queryRunner.query(
      `ALTER TABLE "numerology_interpretations" DROP CONSTRAINT "FK_numerology_interpretation_user"`,
    );

    // Eliminar índice
    await queryRunner.query(
      `DROP INDEX "public"."idx_numerology_interpretation_user"`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "numerology_interpretations"`);
  }
}
