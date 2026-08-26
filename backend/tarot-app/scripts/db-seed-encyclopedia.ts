#!/usr/bin/env ts-node
/**
 * Siembra SOLO la enciclopedia: las 78 fichas de tarot y sus artículos.
 *
 * Por qué existe: el contenido extendido de T-SEO-009 —las 7 secciones que
 * llevan cada ficha de 166 a ~766 palabras— vive en un **seeder**, no en una
 * migración. En el deploy corren solas las migraciones (`migrationsRun: true`
 * en `config/typeorm.ts`), no los seeders, así que una base de producción ya
 * sembrada se queda con las 78 cartas y los 7 campos nuevos en `null`: el
 * contenido no lo ve nadie. Pasó en el deploy del 26-ago-2026.
 *
 * Y `db:seed:all` NO es una opción contra producción: incluye `seedUsers`, que
 * crea `free@test.com` / `premium@test.com` / `admin@test.com` con una
 * contraseña conocida. Este script corre únicamente los dos seeders de la
 * enciclopedia.
 *
 * Los dos son seguros de repetir:
 *  - `seedEncyclopediaTarotCards` sobre una base ya sembrada hace *backfill*:
 *    completa solo las secciones vacías y NUNCA pisa las columnas base ni una
 *    sección que ya tenga texto (una edición del panel de admin queda intacta).
 *  - `seedEncyclopediaArticles` es skip-if-exists.
 *
 * Uso local:      npm run db:seed:encyclopedia
 * Uso producción: apuntar POSTGRES_HOST/PORT/USER/PASSWORD/DB a esa base y
 *                 correr el mismo comando. Verificar después que las 78 fichas
 *                 tengan las 7 secciones y **recién entonces** redeployar el
 *                 frontend: sus páginas de enciclopedia son estáticas
 *                 (`revalidate = 86400`) y se prerenderizan contra la API, así
 *                 que un frontend construido antes del backfill sirve las
 *                 fichas vacías durante 24 h.
 */

import { AppDataSource } from '../src/config/data-source';
import { seedEncyclopediaTarotCards } from '../src/database/seeds/encyclopedia-tarot-cards.seeder';
import { seedEncyclopediaArticles } from '../src/database/seeds/encyclopedia-articles.seeder';

async function bootstrap(): Promise<void> {
  const dataSource = await AppDataSource.initialize();

  try {
    const { host, database } = dataSource.options as {
      host?: string;
      database?: string;
    };
    console.log(`📚 Sembrando la enciclopedia en ${host}/${database}\n`);

    console.log('📍 Paso 1/2: cartas de la enciclopedia (backfill extendido)');
    await seedEncyclopediaTarotCards(dataSource);

    console.log('\n📍 Paso 2/2: artículos de la enciclopedia');
    await seedEncyclopediaArticles(dataSource);

    console.log('\n✨ Enciclopedia sembrada.');
  } finally {
    await dataSource.destroy();
  }
}

bootstrap().catch((error) => {
  console.error('❌ Falló la siembra de la enciclopedia:', error);
  process.exit(1);
});
