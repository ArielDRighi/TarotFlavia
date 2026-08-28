import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * T-DEUDA-002 — Crea los dos índices compuestos de `sessions` que la entidad
 * declara con `@Index(...)` y ninguna migración creaba.
 *
 * Con `synchronize: false` un `@Index` en la entidad no crea nada, así que
 * estos dos índices no existían en ninguna base. Cubren las tres queries de
 * métricas de tarotistas (`typeorm-metrics.repository.ts`):
 *
 * - `idx_session_completed_at_status (status, completed_at)`
 *   → conteo de sesiones completadas de toda la plataforma en un período.
 * - `idx_session_tarotista_completed (tarotista_id, status, completed_at)`
 *   → conteo por tarotista y el agregado con `GROUP BY tarotista_id` del top 5.
 *
 * **No se usa `CREATE INDEX CONCURRENTLY`**: TypeORM corre cada migración
 * dentro de una transacción y `CONCURRENTLY` no puede ejecutarse ahí adentro.
 * El `CREATE INDEX` común toma un lock `SHARE` sobre `sessions` —bloquea
 * escrituras, no lecturas— durante la construcción. Se acepta porque la tabla
 * es chica (0 filas en dev, y el módulo de agendamiento todavía no tiene
 * volumen). Si `sessions` creciera a un tamaño donde el lock moleste, la
 * alternativa es correr los dos `CREATE INDEX CONCURRENTLY` a mano fuera de
 * TypeORM y dejar que estos `IF NOT EXISTS` los encuentren ya creados.
 *
 * `IF NOT EXISTS` justamente por eso, y porque alguna base pudo haberlos
 * recibido a mano.
 */
export class AddSessionMetricsIndexes1787832000000 implements MigrationInterface {
  name = 'AddSessionMetricsIndexes1787832000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_session_completed_at_status"
        ON "sessions" ("status", "completed_at")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_session_tarotista_completed"
        ON "sessions" ("tarotista_id", "status", "completed_at")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_session_tarotista_completed"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_session_completed_at_status"`,
    );
  }
}
