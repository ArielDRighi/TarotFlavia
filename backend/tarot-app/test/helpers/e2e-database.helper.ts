import { DataSource } from 'typeorm';
import { e2eConnectionSource } from '../../src/config/typeorm-e2e.config';

/**
 * Helper para gestionar la base de datos E2E durante los tests
 * Proporciona métodos para crear, limpiar y sembrar la base de datos de pruebas
 */
export class E2EDatabaseHelper {
  private dataSource: DataSource;

  constructor() {
    this.dataSource = e2eConnectionSource;
  }

  /**
   * Inicializa la conexión a la base de datos E2E
   */
  async initialize(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      console.log('[E2E Database Helper] Conexión E2E inicializada');
    }
  }

  /**
   * Cierra la conexión a la base de datos E2E
   */
  async close(): Promise<void> {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('[E2E Database Helper] Conexión E2E cerrada');
    }
  }

  /**
   * Elimina todas las tablas de la base de datos E2E
   */
  async dropDatabase(): Promise<void> {
    await this.initialize();
    console.log('[E2E Database Helper] Eliminando schema...');
    await this.dataSource.dropDatabase();
    console.log('[E2E Database Helper] Schema eliminado');
  }

  /**
   * Crea el schema de la base de datos E2E
   */
  async createDatabase(): Promise<void> {
    await this.initialize();
    console.log('[E2E Database Helper] Creando schema...');
    await this.dataSource.synchronize(false);
    console.log('[E2E Database Helper] Schema creado');
  }

  /**
   * Ejecuta todas las migraciones pendientes
   */
  async runMigrations(): Promise<void> {
    await this.initialize();
    console.log('[E2E Database Helper] Ejecutando migraciones...');
    await this.dataSource.runMigrations({ transaction: 'all' });
    console.log('[E2E Database Helper] Migraciones ejecutadas');
  }

  /**
   * Revierte todas las migraciones
   */
  async revertMigrations(): Promise<void> {
    await this.initialize();
    console.log('[E2E Database Helper] Revirtiendo migraciones...');
    const migrations = await this.dataSource.showMigrations();
    if (migrations) {
      const executedMigrations: Array<{ count: string }> =
        await this.dataSource.query(`SELECT COUNT(*) as count FROM migrations`);
      const count = parseInt(executedMigrations[0].count, 10);

      for (let i = 0; i < count; i++) {
        await this.dataSource.undoLastMigration({ transaction: 'all' });
      }
      console.log('[E2E Database Helper] Migraciones revertidas');
    }
  }

  /**
   * Limpia todas las tablas sin eliminar el schema
   */
  async cleanDatabase(): Promise<void> {
    await this.initialize();
    console.log('[E2E Database Helper] Limpiando datos...');

    const entities = this.dataSource.entityMetadatas;

    // Desactivar foreign keys temporalmente
    await this.dataSource.query('SET session_replication_role = replica;');

    // Truncar todas las tablas
    for (const entity of entities) {
      const tableName = entity.tableName;
      await this.dataSource.query(
        `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
      );
    }

    // Reactivar foreign keys
    await this.dataSource.query('SET session_replication_role = DEFAULT;');

    console.log('[E2E Database Helper] Datos limpiados');
  }

  /**
   * Ejecuta los seeders en la base de datos E2E
   * @param seeders Array de funciones seeder a ejecutar
   */
  async seedData(
    seeders: Array<(dataSource: DataSource) => Promise<void>>,
  ): Promise<void> {
    await this.initialize();
    console.log('[E2E Database Helper] Ejecutando seeders...');

    for (const seeder of seeders) {
      await seeder(this.dataSource);
    }

    console.log('[E2E Database Helper] Seeders ejecutados');
  }

  /**
   * Resetea completamente la base de datos E2E
   * Útil para tests que requieren un estado limpio
   */
  async resetDatabase(): Promise<void> {
    console.log('[E2E Database Helper] Reseteando base de datos...');
    await this.dropDatabase();
    await this.runMigrations();
    console.log('[E2E Database Helper] Base de datos reseteada');
  }

  /**
   * Obtiene el DataSource para operaciones avanzadas
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Verifica si la base de datos E2E está disponible
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.initialize();
      const result: Array<{ '?column?': number }> =
        await this.dataSource.query('SELECT 1');
      return result[0]['?column?'] === 1;
    } catch (error) {
      console.error('[E2E Database Helper] Health check falló:', error);
      return false;
    }
  }
}
