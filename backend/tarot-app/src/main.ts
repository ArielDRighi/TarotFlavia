import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

async function bootstrap() {
  // Explicitly load .env file
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log(`Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    console.warn('No .env file found!');
  }

  // Check database environment variables
  console.log('Database connection details:');
  console.log(`Host: ${process.env.POSTGRES_HOST}`);
  console.log(`Port: ${process.env.POSTGRES_PORT}`);
  console.log(`User: ${process.env.POSTGRES_USER}`);
  console.log(`Database: ${process.env.POSTGRES_DB}`);
  console.log(`Password exists: ${Boolean(process.env.POSTGRES_PASSWORD)}`);

  const app = await NestFactory.create(AppModule);

  // Configure security headers with Helmet (TASK-048-a)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for API compatibility
      xssFilter: true,
      noSniff: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Tarot')
    .setDescription('API para la aplicación de lectura de cartas de Tarot')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Configure CORS with security headers (TASK-048-a)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    exposedHeaders: [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`La aplicación está corriendo en: ${await app.getUrl()}`);
  console.log(
    `Documentación de Swagger disponible en: ${await app.getUrl()}/api`,
  );
}

void bootstrap();
