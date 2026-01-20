import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * TASK-131: Migración de datos de 12 a 60 horóscopos chinos
 *
 * Esta migración elimina los horóscopos genéricos existentes (12 por año)
 * para hacer espacio a los 60 nuevos horóscopos personalizados (12 animales × 5 elementos).
 *
 * IMPORTANTE:
 * - ANTES de ejecutar esta migración, ejecuta: npm run backup:chinese-horoscopes
 * - Esta migración solo ELIMINA datos viejos, NO genera los 60 nuevos
 * - Después de ejecutar, ejecuta manualmente la generación:
 *   - Opción 1 (Admin): POST /chinese-horoscope/admin/generate/2025
 *   - Opción 2 (CLI): npm run cli generate-chinese 2025
 *   - Opción 3 (Script): Ver scripts/generate-chinese-horoscopes.ts
 *
 * Razón de eliminación:
 * - Los horóscopos viejos son genéricos por animal (ej: "Dragón")
 * - Los nuevos son personalizados por animal + elemento (ej: "Dragón de Tierra")
 * - No tiene sentido mantener ambos, solo crearía confusión
 *
 * Rollback:
 * - El backup creado con npm run backup:chinese-horoscopes contiene todos los datos
 * - La migración down restaura el schema pero NO los datos (usar backup manualmente)
 */
export class MigrateChineseHoroscopesTo601771100000000 implements MigrationInterface {
  name = 'MigrateChineseHoroscopesTo601771100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Contar registros actuales antes de eliminar
    const countResult = (await queryRunner.query(
      `SELECT COUNT(*) as total FROM chinese_horoscopes`,
    )) as Array<{ total: string }>;
    const totalRecords = parseInt(countResult[0].total, 10);

    if (totalRecords > 0) {
      console.log(
        `[Migración] ⚠️  Se eliminarán ${totalRecords} horóscopos existentes`,
      );
      console.log(
        `[Migración] IMPORTANTE: Asegúrate de haber ejecutado 'npm run backup:chinese-horoscopes'`,
      );

      // 2. Mostrar resumen de lo que se va a eliminar
      const summary = (await queryRunner.query(`
        SELECT year, COUNT(*) as count
        FROM chinese_horoscopes
        GROUP BY year
        ORDER BY year
      `)) as Array<{ year: number; count: string }>;

      console.log('[Migración] Resumen de registros a eliminar:');
      summary.forEach((row) => {
        console.log(`  - Año ${row.year}: ${row.count} horóscopos`);
      });

      // 3. Eliminar todos los horóscopos genéricos existentes
      console.log('[Migración] Eliminando horóscopos viejos...');
      await queryRunner.query(`DELETE FROM chinese_horoscopes`);
      console.log('[Migración] ✓ Horóscopos eliminados exitosamente');
    } else {
      console.log('[Migración] No hay horóscopos para eliminar');
    }

    // 4. Resetear secuencia de IDs (opcional, para tener IDs limpios)
    console.log('[Migración] Reseteando secuencia de IDs...');
    await queryRunner.query(`
      ALTER SEQUENCE chinese_horoscopes_id_seq RESTART WITH 1
    `);

    console.log('[Migración] ✓ Migración completada');
    console.log(
      '[Migración] SIGUIENTE PASO: Generar 60 horóscopos nuevos con uno de estos métodos:',
    );
    console.log(
      '  1. Admin panel: POST /chinese-horoscope/admin/generate/2025',
    );
    console.log('  2. CLI: npm run cli generate-chinese 2025');
    console.log(
      '  3. Script: ts-node scripts/generate-chinese-horoscopes.ts 2025',
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async down(): Promise<void> {
    console.log(
      '[Rollback] ⚠️  Esta migración NO restaura datos automáticamente',
    );
    console.log(
      '[Rollback] Para restaurar los datos, usa el backup generado con:',
    );
    console.log('  npm run backup:chinese-horoscopes');
    console.log(
      '[Rollback] El archivo de backup está en: backups/chinese-horoscopes-backup-*.json',
    );
    console.log(
      '[Rollback] Restauración manual requerida con INSERT statements desde el backup',
    );

    // La migración down NO restaura datos, solo informa al usuario
    // Los datos deben ser restaurados manualmente desde el backup
  }
}
