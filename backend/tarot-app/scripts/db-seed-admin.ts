#!/usr/bin/env ts-node
/**
 * Script para crear/promover un usuario ADMIN de forma parametrizable.
 *
 * A diferencia de db:seed:users (credenciales hardcodeadas de test), este script
 * toma las credenciales desde variables de entorno, para poder crear el primer
 * admin en producción sin exponer secretos en el repo.
 *
 * Conecta a la base definida por las variables POSTGRES_* del entorno actual, así
 * que para apuntar a producción hay que exportar las env de la DB de producción.
 *
 * Uso:
 *   ADMIN_EMAIL=florzenavilla@gmail.com \
 *   ADMIN_PASSWORD='TuPasswordTemporal' \
 *   ADMIN_NAME='Flor' \
 *   npm run db:seed:admin
 *
 * ADMIN_NAME es opcional (default: 'Admin'). ADMIN_EMAIL y ADMIN_PASSWORD son
 * obligatorios. Es idempotente: si el email ya existe, lo promueve a admin.
 */

import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/modules/users/entities/user.entity';
import { seedAdminUser } from '../src/database/seeds/admin-user.seeder';

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

  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    console.log(`👤 Seeding admin (${email})...`);
    const result = await seedAdminUser(userRepository, {
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
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
