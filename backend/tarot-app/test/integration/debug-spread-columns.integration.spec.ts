import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TarotReading } from '../../src/modules/tarot/readings/entities/tarot-reading.entity';

/**
 * Test de Diagnóstico: Verificar Columnas spread_id/spread_name
 *
 * Este test NO prueba lógica de negocio, solo diagnostica
 * por qué TypeORM no reconoce las columnas spread_id/spread_name
 * en el ambiente de integración.
 */
describe('DEBUG: Spread Columns Investigation', () => {
  let app;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Database Schema Inspection', () => {
    it('should show actual columns in tarot_reading table', async () => {
      const queryRunner = dataSource.createQueryRunner();

      try {
        // Obtener columnas reales de la tabla
        const columns = await queryRunner.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'tarot_reading'
          ORDER BY ordinal_position;
        `);

        console.log('\n=== COLUMNAS REALES EN tarot_reading ===');
        console.log(JSON.stringify(columns, null, 2));

        // Verificar si spread_id y spread_name existen
        const spreadIdColumn = columns.find(
          (c) => c.column_name === 'spread_id',
        );
        const spreadNameColumn = columns.find(
          (c) => c.column_name === 'spread_name',
        );

        console.log('\n=== VERIFICACIÓN ===');
        console.log('spread_id existe:', !!spreadIdColumn);
        console.log('spread_name existe:', !!spreadNameColumn);

        if (spreadIdColumn) {
          console.log('spread_id details:', spreadIdColumn);
        }
        if (spreadNameColumn) {
          console.log('spread_name details:', spreadNameColumn);
        }
      } finally {
        await queryRunner.release();
      }
    });

    it('should show TypeORM metadata for TarotReading entity', () => {
      const metadata = dataSource.getMetadata(TarotReading);

      console.log('\n=== METADATOS TYPEORM: TarotReading ===');
      console.log('Table name:', metadata.tableName);
      console.log('\nColumnas mapeadas:');

      metadata.columns.forEach((column) => {
        const columnType =
          typeof column.type === 'function'
            ? column.type.name
            : String(column.type);
        console.log(
          `  ${column.propertyName} -> ${column.databaseName} (${columnType})`,
        );
      });

      // Buscar específicamente las columnas spread
      const spreadIdColumn = metadata.columns.find(
        (c) => c.databaseName === 'spread_id',
      );
      const spreadNameColumn = metadata.columns.find(
        (c) => c.databaseName === 'spread_name',
      );

      console.log('\n=== COLUMNAS SPREAD EN METADATA ===');
      console.log('spread_id mapeada:', !!spreadIdColumn);
      console.log('spread_name mapeada:', !!spreadNameColumn);

      if (spreadIdColumn) {
        console.log('spread_id metadata:', {
          propertyName: spreadIdColumn.propertyName,
          databaseName: spreadIdColumn.databaseName,
          type: spreadIdColumn.type,
          isNullable: spreadIdColumn.isNullable,
        });
      }

      if (spreadNameColumn) {
        console.log('spread_name metadata:', {
          propertyName: spreadNameColumn.propertyName,
          databaseName: spreadNameColumn.databaseName,
          type: spreadNameColumn.type,
          isNullable: spreadNameColumn.isNullable,
        });
      }
    });

    it('should test direct INSERT with spread_id', async () => {
      const queryRunner = dataSource.createQueryRunner();

      try {
        // Intentar INSERT directo con SQL
        console.log('\n=== TEST: INSERT DIRECTO SQL ===');

        const result = await queryRunner.query(`
          INSERT INTO tarot_reading (
            user_id,
            question,
            spread_id,
            spread_name,
            created_at
          ) VALUES (
            1,
            'Test question',
            1,
            'Test Spread',
            NOW()
          ) RETURNING id;
        `);

        console.log('✅ INSERT directo exitoso:', result);

        // Limpiar
        if (result && result[0]) {
          await queryRunner.query(`DELETE FROM tarot_reading WHERE id = $1`, [
            result[0].id,
          ]);
          console.log('✅ Cleanup exitoso');
        }
      } catch (error) {
        console.error('❌ INSERT directo falló:', error.message);
        throw error;
      } finally {
        await queryRunner.release();
      }
    });

    it('should compare entity columns vs actual table columns', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const metadata = dataSource.getMetadata(TarotReading);

      try {
        // Columnas de la entidad
        const entityColumns = metadata.columns.map((c) => ({
          property: c.propertyName,
          database: c.databaseName,
          type: c.type,
        }));

        // Columnas de la tabla
        const tableColumns = (await queryRunner.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'tarot_reading'
          ORDER BY ordinal_position;
        `)) as Array<{ column_name: string }>;

        const tableColumnNames = tableColumns.map((c) => c.column_name);
        const entityColumnNames = entityColumns.map((c) => c.database);

        console.log('\n=== COMPARACIÓN: Entidad vs Tabla ===');
        console.log('\nColumnas en ENTIDAD pero NO en TABLA:');
        const missingInTable = entityColumnNames.filter(
          (col) => !tableColumnNames.includes(col),
        );
        console.log(missingInTable.length ? missingInTable : 'Ninguna ✅');

        console.log('\nColumnas en TABLA pero NO en ENTIDAD:');
        const missingInEntity = tableColumnNames.filter(
          (col) => !entityColumnNames.includes(col),
        );
        console.log(missingInEntity.length ? missingInEntity : 'Ninguna ✅');

        // Verificar spread_id y spread_name específicamente
        console.log('\n=== VERIFICACIÓN ESPECÍFICA ===');
        console.log(
          'spread_id en entidad:',
          entityColumnNames.includes('spread_id'),
        );
        console.log(
          'spread_id en tabla:',
          tableColumnNames.includes('spread_id'),
        );
        console.log(
          'spread_name en entidad:',
          entityColumnNames.includes('spread_name'),
        );
        console.log(
          'spread_name en tabla:',
          tableColumnNames.includes('spread_name'),
        );
      } finally {
        await queryRunner.release();
      }
    });
  });

  describe('DataSource Connection Test', () => {
    it('should show DataSource configuration', () => {
      console.log('\n=== DATASOURCE CONFIG ===');
      const options = dataSource.options as {
        database?: string;
        host?: string;
        port?: number;
        synchronize?: boolean;
        dropSchema?: boolean;
      };
      console.log('Database:', options.database);
      console.log('Host:', options.host);
      console.log('Port:', options.port);
      console.log('Synchronize:', options.synchronize);
      console.log('DropSchema:', options.dropSchema);

      console.log('\nEntities loaded:');
      dataSource.entityMetadatas.forEach((meta) => {
        console.log(`  - ${meta.name} (${meta.tableName})`);
      });
    });
  });
});
