#!/usr/bin/env ts-node
/**
 * Script para mostrar las últimas llamadas a OpenAI con costos
 * Útil para debugging y análisis de costos
 *
 * Uso: npm run logs:openai [-- --limit=50]
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

interface AIUsageSummary {
  userId: number;
  userEmail: string;
  userName: string;
  aiRequestsCount: number;
  aiCostUsd: number;
  aiTokensUsed: number;
  aiProvider: string | null;
  lastResetAt: Date | null;
}

async function bootstrap() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  let limit = 50;

  args.forEach((arg) => {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.replace('--limit=', ''), 10);
    }
  });

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log(`📊 Fetching last ${limit} AI usage records...\n`);

    // Query para obtener uso de AI por usuario
    const aiUsageQuery = `
      SELECT 
        u.id as "userId",
        u.email as "userEmail",
        u.name as "userName",
        u.ai_requests_used_month as "aiRequestsCount",
        u.ai_cost_usd_month as "aiCostUsd",
        u.ai_tokens_used_month as "aiTokensUsed",
        u.ai_provider_used as "aiProvider",
        u.ai_usage_reset_at as "lastResetAt"
      FROM users u
      WHERE u.ai_requests_used_month > 0
      ORDER BY u.ai_requests_used_month DESC
      LIMIT $1
    `;

    const results: AIUsageSummary[] = await dataSource.query(aiUsageQuery, [
      limit,
    ]);

    if (results.length === 0) {
      console.log('📭 No AI usage found in the database.\n');
      console.log('💡 Tip: Generate some readings first with:');
      console.log('   npm run generate:reading\n');
      await app.close();
      return;
    }

    console.log(`🤖 AI Usage Summary (Top ${results.length} users)\n`);
    console.log('━'.repeat(100));

    let totalCost = 0;
    let totalRequests = 0;
    let totalTokens = 0;

    results.forEach((record: AIUsageSummary, index: number) => {
      console.log(
        `\n${index + 1}. User: ${record.userName} (${record.userEmail})`,
      );
      console.log(`   User ID: ${record.userId}`);
      console.log(`   Provider: ${record.aiProvider || 'N/A'}`);
      console.log(`   Requests: ${record.aiRequestsCount}`);
      console.log(`   Tokens: ${record.aiTokensUsed.toLocaleString()}`);
      console.log(`   Cost: $${record.aiCostUsd.toFixed(4)} USD`);
      console.log(
        `   Last Reset: ${record.lastResetAt ? new Date(record.lastResetAt).toISOString() : 'Never'}`,
      );

      totalCost += parseFloat(record.aiCostUsd.toString());
      totalRequests += record.aiRequestsCount;
      totalTokens += record.aiTokensUsed;
    });

    console.log('\n' + '━'.repeat(100));
    console.log('\n📈 Totals:');
    console.log(`   Total Requests: ${totalRequests}`);
    console.log(`   Total Tokens: ${totalTokens.toLocaleString()}`);
    console.log(`   Total Cost: $${totalCost.toFixed(4)} USD`);
    console.log(
      `   Avg Cost per Request: $${(totalCost / totalRequests).toFixed(6)} USD`,
    );
    console.log(
      `   Avg Tokens per Request: ${Math.round(totalTokens / totalRequests).toLocaleString()}`,
    );

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('❌ Error fetching AI logs:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
