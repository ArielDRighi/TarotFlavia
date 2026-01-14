/**
 * Test de diagnóstico para verificar metadatos de TypeORM
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { TarotReading } from '../../src/modules/tarot/readings/entities/tarot-reading.entity';

describe('TypeORM Metadata Diagnostic', () => {
  let app;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should have correct column metadata for spreadId', () => {
    const readingMetadata = dataSource.getMetadata(TarotReading);

    console.log('\\n=== TarotReading Metadata ===');
    console.log('Entity name:', readingMetadata.name);
    console.log('Table name:', readingMetadata.tableName);

    // Encontrar la columna spreadId
    const spreadIdColumn = readingMetadata.columns.find(
      (col) => col.propertyName === 'spreadId',
    );

    console.log('\\n=== spreadId Column ===');
    console.log('Property name:', spreadIdColumn?.propertyName);
    console.log('Database name:', spreadIdColumn?.databaseName);
    console.log('Type:', spreadIdColumn?.type);
    console.log('Is nullable:', spreadIdColumn?.isNullable);

    // Encontrar la columna spreadName
    const spreadNameColumn = readingMetadata.columns.find(
      (col) => col.propertyName === 'spreadName',
    );

    console.log('\\n=== spreadName Column ===');
    console.log('Property name:', spreadNameColumn?.propertyName);
    console.log('Database name:', spreadNameColumn?.databaseName);
    console.log('Type:', spreadNameColumn?.type);
    console.log('Is nullable:', spreadNameColumn?.isNullable);

    // Verificaciones
    expect(spreadIdColumn).toBeDefined();
    expect(spreadIdColumn?.databaseName).toBe('spread_id');
    expect(spreadNameColumn).toBeDefined();
    expect(spreadNameColumn?.databaseName).toBe('spread_name');
  });
});
