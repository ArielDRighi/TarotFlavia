/**
 * TASK-131: Script de backup de horóscopos chinos actuales
 *
 * Este script exporta todos los horóscopos chinos existentes a un archivo JSON
 * antes de ejecutar la migración que los eliminará para regenerar los 60 nuevos.
 *
 * Uso:
 *   npm run backup:chinese-horoscopes
 *
 * Output:
 *   - backups/chinese-horoscopes-backup-{timestamp}.json
 *
 * Rollback:
 *   Si necesitas restaurar los datos, usa el archivo generado con la migración down.
 */

import { DataSource } from 'typeorm';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
const envPath = join(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('[Backup] Cargando configuración de base de datos...');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tarot_dev',
  synchronize: false,
  logging: false,
});

async function backupChineseHoroscopes() {
  console.log('[Backup] Conectando a base de datos...');
  await AppDataSource.initialize();

  try {
    console.log('[Backup] Consultando horóscopos chinos existentes...');

    // Query todos los horóscopos
    const horoscopes = await AppDataSource.query(`
      SELECT 
        id,
        animal,
        element,
        year,
        general_overview,
        areas,
        lucky_elements,
        compatibility,
        monthly_highlights,
        ai_provider,
        ai_model,
        tokens_used,
        generation_time_ms,
        view_count,
        created_at,
        updated_at
      FROM chinese_horoscopes
      ORDER BY year, animal, element
    `);

    if (horoscopes.length === 0) {
      console.log('[Backup] ⚠️  No hay horóscopos para respaldar');
      return;
    }

    console.log(`[Backup] Encontrados ${horoscopes.length} horóscopos`);

    // Crear directorio de backups si no existe
    const backupsDir = join(__dirname, '../backups');
    mkdirSync(backupsDir, { recursive: true });

    // Generar nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `chinese-horoscopes-backup-${timestamp}.json`;
    const filepath = join(backupsDir, filename);

    // Preparar datos de backup
    const backup = {
      timestamp: new Date().toISOString(),
      totalRecords: horoscopes.length,
      databaseName: process.env.DB_NAME,
      horoscopes: horoscopes,
    };

    // Guardar a archivo
    writeFileSync(filepath, JSON.stringify(backup, null, 2), 'utf-8');

    console.log(`[Backup] ✓ Backup completado exitosamente`);
    console.log(`[Backup] Archivo: ${filepath}`);
    console.log(
      `[Backup] Total de registros respaldados: ${horoscopes.length}`,
    );

    // Mostrar resumen por año
    const yearSummary = horoscopes.reduce(
      (acc: Record<number, number>, h: any) => {
        acc[h.year] = (acc[h.year] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    console.log('[Backup] Resumen por año:');
    Object.entries(yearSummary).forEach(([year, count]) => {
      console.log(`  - ${year}: ${count} horóscopos`);
    });
  } catch (error) {
    console.error('[Backup] ✗ Error durante backup:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
    console.log('[Backup] Conexión cerrada');
  }
}

// Ejecutar backup
backupChineseHoroscopes()
  .then(() => {
    console.log('[Backup] Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Backup] Error fatal:', error);
    process.exit(1);
  });
