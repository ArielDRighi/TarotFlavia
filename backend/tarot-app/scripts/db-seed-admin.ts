#!/usr/bin/env ts-node
/**
 * Script para crear/promover un usuario ADMIN de forma parametrizable.
 *
 * A diferencia de db:seed:users (credenciales hardcodeadas de test), este script
 * toma las credenciales desde variables de entorno, para poder crear el primer
 * admin en producción sin exponer secretos en el repo.
 *
 * IMPORTANTE: usa un DataSource AISLADO (NO bootea el AppModule), con
 * `migrationsRun: false` y `synchronize: false`. Así, correrlo contra producción
 * solo inserta/actualiza el usuario admin y NUNCA dispara migraciones ni DDL.
 *
 * Conexión (en este orden de prioridad):
 *   1. DATABASE_URL (o DB_URL): string de conexión completo. Útil para apuntar a
 *      producción vía el proxy público de Railway (DATABASE_PUBLIC_URL).
 *   2. Variables POSTGRES_* individuales (host/port/user/password/db).
 * Opcional: DB_SSL=true para habilitar SSL (rejectUnauthorized: false).
 *
 * Uso (local, con POSTGRES_* del .env):
 *   ADMIN_EMAIL=admin@dominio.com ADMIN_PASSWORD='...' npm run db:seed:admin
 *
 * Uso (producción, vía proxy público de Railway):
 *   DATABASE_URL='postgresql://user:pass@junction.proxy.rlwy.net:PORT/railway' \
 *   ADMIN_EMAIL=admin@dominio.com ADMIN_PASSWORD='...' ADMIN_NAME='...' \
 *   npm run db:seed:admin
 *
 * ADMIN_NAME es opcional (default: 'Admin'). ADMIN_EMAIL y ADMIN_PASSWORD son
 * obligatorios. Es idempotente: si el email ya existe, lo promueve a admin.
 */

import 'reflect-metadata';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';
import { seedAdminUser } from '../src/database/seeds/admin-user.seeder';

/**
 * Construye un DataSource aislado (sin migraciones ni synchronize) para operar
 * solo sobre las entidades, sin arrastrar el arranque completo del AppModule.
 */
function buildDataSource(): DataSource {
  const url = process.env.DATABASE_URL ?? process.env.DB_URL;
  const ssl =
    process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
  const entities = [path.join(__dirname, '..', 'src', '**', '*.entity{.ts,.js}')];

  if (url) {
    return new DataSource({
      type: 'postgres',
      url,
      entities,
      synchronize: false,
      migrationsRun: false,
      ssl,
      logging: ['error'],
    });
  }

  return new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    entities,
    synchronize: false,
    migrationsRun: false,
    ssl,
    logging: ['error'],
  });
}

async function bootstrap(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    console.error(
      '❌ Faltan variables de entorno obligatorias: ADMIN_EMAIL y ADMIN_PASSWORD.',
    );
    console.error(
      "   Ejemplo: ADMIN_EMAIL=admin@dominio.com ADMIN_PASSWORD='...' npm run db:seed:admin",
    );
    process.exit(1);
  }

  const dataSource = buildDataSource();
  await dataSource.initialize();
  console.log('✅ Conectado a la base de datos.');

  try {
    console.log(`👤 Seeding admin (${email})...`);
    const result = await seedAdminUser(dataSource.getRepository(User), {
      email,
      password,
      name,
    });
    console.log(
      `✨ Listo: acción=${result.action}, userId=${result.userId}. ` +
        'Cambiá la password desde la app apenas ingreses.',
    );
  } catch (error) {
    console.error('❌ Error creando el admin:', error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

void bootstrap();
