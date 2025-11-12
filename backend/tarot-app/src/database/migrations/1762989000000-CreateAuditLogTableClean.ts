import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogTableClean1762989000000
  implements MigrationInterface
{
  name = 'CreateAuditLogTableClean1762989000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear enum para audit_logs_action
    await queryRunner.query(`
      CREATE TYPE "public"."audit_logs_action_enum" AS ENUM(
        'user_created', 
        'user_banned', 
        'user_unbanned', 
        'role_added', 
        'role_removed', 
        'plan_changed', 
        'reading_deleted', 
        'reading_restored', 
        'card_modified', 
        'spread_modified', 
        'config_changed', 
        'user_deleted'
      )
    `);

    // Crear tabla audit_logs
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" integer NOT NULL,
        "target_user_id" integer,
        "action" "public"."audit_logs_action_enum" NOT NULL,
        "entity_type" character varying(100) NOT NULL,
        "entity_id" character varying(255) NOT NULL,
        "old_value" jsonb,
        "new_value" jsonb NOT NULL,
        "ip_address" character varying(45),
        "user_agent" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id")
      )
    `);

    // Crear índices
    await queryRunner.query(
      `CREATE INDEX "IDX_2f68e345c05e8166ff9deea1ab" ON "audit_logs" ("user_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99fca4a3a4a93c26a756c5aca5" ON "audit_logs" ("action", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_43c81a4d688b5a5394a69a8ddd" ON "audit_logs" ("entity_type", "created_at")`,
    );

    // Agregar foreign keys
    await queryRunner.query(`
      ALTER TABLE "audit_logs" 
      ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" 
      FOREIGN KEY ("user_id") REFERENCES "user"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs" 
      ADD CONSTRAINT "FK_c49454aef596e6f9dc3eb64f3c6" 
      FOREIGN KEY ("target_user_id") REFERENCES "user"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_c49454aef596e6f9dc3eb64f3c6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`,
    );

    // Eliminar índices
    await queryRunner.query(
      `DROP INDEX "public"."IDX_43c81a4d688b5a5394a69a8ddd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99fca4a3a4a93c26a756c5aca5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2f68e345c05e8166ff9deea1ab"`,
    );

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "audit_logs"`);

    // Eliminar enum
    await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
  }
}
