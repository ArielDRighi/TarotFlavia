/**
 * Script para analizar el performance de queries antes de optimizaciones
 * Este script ejecuta EXPLAIN ANALYZE en queries críticos para establecer una línea base
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface QueryAnalysis {
  query: string;
  description: string;
  planningTime?: number;
  executionTime?: number;
  totalTime?: number;
  plan?: string;
}

async function analyzeQuery(
  dataSource: DataSource,
  query: string,
  description: string,
): Promise<QueryAnalysis> {
  console.log(`\n📊 Analizando: ${description}`);
  console.log(`Query: ${query.substring(0, 100)}...`);

  const result = await dataSource.query(`EXPLAIN (ANALYZE, BUFFERS) ${query}`);

  const planText = result.map((r: any) => r['QUERY PLAN']).join('\n');
  const planningTimeMatch = planText.match(/Planning Time: ([\d.]+) ms/);
  const executionTimeMatch = planText.match(/Execution Time: ([\d.]+) ms/);

  const analysis: QueryAnalysis = {
    query,
    description,
    planningTime: planningTimeMatch
      ? parseFloat(planningTimeMatch[1])
      : undefined,
    executionTime: executionTimeMatch
      ? parseFloat(executionTimeMatch[1])
      : undefined,
    totalTime:
      planningTimeMatch && executionTimeMatch
        ? parseFloat(planningTimeMatch[1]) + parseFloat(executionTimeMatch[1])
        : undefined,
    plan: planText,
  };

  console.log(
    `⏱️  Planning: ${analysis.planningTime?.toFixed(2)}ms | Execution: ${analysis.executionTime?.toFixed(2)}ms | Total: ${analysis.totalTime?.toFixed(2)}ms`,
  );

  return analysis;
}

async function main() {
  console.log('🔍 Iniciando análisis de performance de queries...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.TAROT_DB_HOST || 'localhost',
    port: parseInt(process.env.TAROT_DB_PORT || '5435', 10),
    username: process.env.TAROT_DB_USER || 'tarot_user',
    password: process.env.TAROT_DB_PASSWORD,
    database: process.env.TAROT_DB_NAME || 'tarot_db',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    const analyses: QueryAnalysis[] = [];

    // Query 1: Listar lecturas de un usuario con todas sus relaciones (findByUserId)
    analyses.push(
      await analyzeQuery(
        dataSource,
        `
        SELECT reading.*, deck.*, cards.*, user.*, category.*
        FROM tarot_reading reading
        LEFT JOIN tarot_deck deck ON reading.deckId = deck.id
        LEFT JOIN tarot_reading_cards_tarot_card reading_cards ON reading.id = reading_cards.tarotReadingId
        LEFT JOIN tarot_card cards ON reading_cards.tarotCardId = cards.id
        LEFT JOIN "user" user ON reading.userId = user.id
        LEFT JOIN reading_category category ON reading.categoryId = category.id
        WHERE reading.userId = 1 AND reading.deletedAt IS NULL
        ORDER BY reading.createdAt DESC
        LIMIT 10
      `,
        'findByUserId - Lecturas de usuario con relaciones',
      ),
    );

    // Query 2: Obtener lectura por ID con interpretaciones (findById)
    analyses.push(
      await analyzeQuery(
        dataSource,
        `
        SELECT reading.*, interpretations.*
        FROM tarot_reading reading
        LEFT JOIN tarot_interpretation interpretations ON interpretations.readingId = reading.id
        WHERE reading.id = 1
      `,
        'findById - Lectura con interpretaciones',
      ),
    );

    // Query 3: Listar todas las cartas con deck (cards.service.ts)
    analyses.push(
      await analyzeQuery(
        dataSource,
        `
        SELECT card.*, deck.*
        FROM tarot_card card
        LEFT JOIN tarot_deck deck ON card.deckId = deck.id
      `,
        'Listar cartas con deck',
      ),
    );

    // Query 4: Admin dashboard - últimas lecturas
    analyses.push(
      await analyzeQuery(
        dataSource,
        `
        SELECT reading.*, user.*, category.*
        FROM tarot_reading reading
        LEFT JOIN "user" user ON reading.userId = user.id
        LEFT JOIN reading_category category ON reading.categoryId = category.id
        WHERE reading.deletedAt IS NULL
        ORDER BY reading.createdAt DESC
        LIMIT 10
      `,
        'Admin Dashboard - Últimas lecturas',
      ),
    );

    // Query 5: Refresh token con user
    analyses.push(
      await analyzeQuery(
        dataSource,
        `
        SELECT token.*, user.*
        FROM refresh_token token
        LEFT JOIN "user" user ON token.userId = user.id
        WHERE token.token = 'some-token'
      `,
        'Refresh Token - Validación con user',
      ),
    );

    console.log('\n' + '='.repeat(80));
    console.log('📈 RESUMEN DE ANÁLISIS');
    console.log('='.repeat(80) + '\n');

    analyses.forEach((analysis, index) => {
      console.log(
        `${index + 1}. ${analysis.description}: ${analysis.totalTime?.toFixed(2)}ms`,
      );
    });

    console.log('\n💡 Queries más lentos (candidatos para optimización):');
    const sorted = [...analyses].sort(
      (a, b) => (b.totalTime || 0) - (a.totalTime || 0),
    );
    sorted.slice(0, 3).forEach((analysis, index) => {
      console.log(
        `   ${index + 1}. ${analysis.description}: ${analysis.totalTime?.toFixed(2)}ms`,
      );
    });

    console.log(
      '\n📝 Resultados detallados guardados en: query-performance-baseline.json',
    );

    // Guardar análisis en archivo
    const fs = require('fs');
    fs.writeFileSync(
      path.join(__dirname, '../query-performance-baseline.json'),
      JSON.stringify(analyses, null, 2),
    );
  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

main().catch(console.error);
