import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * Script de validación de consistencia de schema
 * Compara el schema real (después de migraciones) vs el schema esperado (entidades)
 *
 * Uso: npm run validate:schema
 */
async function validateSchemaConsistency() {
  console.log('🔍 Validando consistencia de schema...\n');

  let dataSource: DataSource | undefined;

  try {
    // Crear conexión E2E sin spec files
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.TAROT_E2E_DB_HOST || 'localhost',
      port: parseInt(process.env.TAROT_E2E_DB_PORT || '5436', 10),
      username: process.env.TAROT_E2E_DB_USER || 'tarot_e2e_user',
      password: process.env.TAROT_E2E_DB_PASSWORD || 'tarot_e2e_password_2024',
      database: process.env.TAROT_E2E_DB_NAME || 'tarot_e2e',
      entities: [
        path.join(__dirname, '..', 'dist', 'src', '**', '*.entity.js'),
      ],
      migrations: [
        path.join(
          __dirname,
          '..',
          'dist',
          'src',
          'database',
          'migrations',
          '*.js',
        ),
      ],
      synchronize: false,
      logging: false,
    });

    await dataSource.initialize();
    console.log('✅ Conexión a DB E2E establecida\n');

    // Ejecutar migraciones
    console.log('📦 Ejecutando migraciones...');
    await dataSource.runMigrations();
    console.log('✅ Migraciones ejecutadas\n');

    // Obtener schema real
    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.getTables();

    console.log('📊 Tablas encontradas en DB:', tables.length);
    console.log(tables.map((t) => `  - ${t.name}`).join('\n'));
    console.log('');

    // Obtener entidades esperadas
    const entities = dataSource.entityMetadatas;
    console.log('📋 Entidades definidas en código:', entities.length);
    console.log(entities.map((e) => `  - ${e.tableName}`).join('\n'));
    console.log('');

    // Validar que todas las entidades tengan tabla
    let hasErrors = false;
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const entity of entities) {
      const table = tables.find((t) => t.name === entity.tableName);

      if (!table) {
        const error = `❌ ERROR: Tabla ${entity.tableName} no existe en DB`;
        console.error(error);
        errors.push(error);
        hasErrors = true;
        continue;
      }

      // Validar columnas
      for (const column of entity.columns) {
        const dbColumn = table.columns.find(
          (c) => c.name === column.databaseName,
        );

        if (!dbColumn) {
          const error = `❌ ERROR: Columna ${entity.tableName}.${column.databaseName} no existe en DB`;
          console.error(error);
          errors.push(error);
          hasErrors = true;
        } else {
          // Validar tipo de dato (opcional - puede generar warnings)
          const expectedType = column.type.toString().toLowerCase();
          const actualType = dbColumn.type.toLowerCase();

          if (
            !actualType.includes(expectedType) &&
            !expectedType.includes(actualType)
          ) {
            const warning = `⚠️  WARNING: Columna ${entity.tableName}.${column.databaseName} - tipo esperado: ${expectedType}, tipo actual: ${actualType}`;
            console.warn(warning);
            warnings.push(warning);
          }
        }
      }

      // Validar relaciones (foreign keys)
      for (const relation of entity.foreignKeys) {
        const dbForeignKey = table.foreignKeys.find((fk) =>
          fk.columnNames.every((colName) =>
            relation.columnNames.includes(colName),
          ),
        );

        if (!dbForeignKey) {
          const error = `❌ ERROR: Foreign key ${entity.tableName}.(${relation.columnNames.join(', ')}) no existe en DB`;
          console.error(error);
          errors.push(error);
          hasErrors = true;
        }
      }

      // Validar índices únicos
      for (const index of entity.indices.filter((idx) => idx.isUnique)) {
        const dbIndex = table.indices.find(
          (idx) =>
            idx.isUnique &&
            idx.columnNames.length === index.columns.length &&
            idx.columnNames.every((colName) =>
              index.columns.map((c) => c.databaseName).includes(colName),
            ),
        );

        if (!dbIndex) {
          const warning = `⚠️  WARNING: Índice único en ${entity.tableName}.(${index.columns.map((c) => c.databaseName).join(', ')}) no encontrado en DB`;
          console.warn(warning);
          warnings.push(warning);
        }
      }
    }

    await queryRunner.release();
    await dataSource.destroy();

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(60));
    console.log(`Total de entidades: ${entities.length}`);
    console.log(`Total de tablas en DB: ${tables.length}`);
    console.log(`Errores encontrados: ${errors.length}`);
    console.log(`Advertencias: ${warnings.length}`);
    console.log('='.repeat(60) + '\n');

    if (hasErrors) {
      console.error('❌ Validación FALLIDA: Se encontraron inconsistencias');
      console.error('\nErrores:');
      errors.forEach((err) => console.error(`  ${err}`));
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.warn('\n⚠️  Advertencias (no bloqueantes):');
      warnings.forEach((warn) => console.warn(`  ${warn}`));
    }

    console.log(
      '\n✅ Validación EXITOSA: Schema consistente entre código y DB',
    );
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la validación:', error);
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Ejecutar script
void validateSchemaConsistency();
