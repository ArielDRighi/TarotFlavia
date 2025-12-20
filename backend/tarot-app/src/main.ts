import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

async function bootstrap() {
  // Explicitly load .env file
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    // Only log .env loading in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Loading .env from: ${envPath}`);
    }
    dotenv.config({ path: envPath });
  } else {
    console.warn('No .env file found!');
  }

  // Check database environment variables
  if (process.env.NODE_ENV !== 'production') {
    console.log('Database connection details:');
    console.log(`Host: ${process.env.POSTGRES_HOST}`);
    console.log(`Port: ${process.env.POSTGRES_PORT}`);
    console.log(`User: ${process.env.POSTGRES_USER}`);
    console.log(`Database: ${process.env.POSTGRES_DB}`);
    console.log(`Password exists: ${Boolean(process.env.POSTGRES_PASSWORD)}`);
  }

  const app = await NestFactory.create(AppModule);

  // Set global API prefix for versioning
  app.setGlobalPrefix('api/v1');

  // Get custom logger from the app context
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  // Log startup with custom logger
  loggerService.log('Application is starting...', 'Bootstrap');

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
    .setTitle('Tarot Marketplace API')
    .setDescription(
      `API completa para el marketplace de tarotistas profesionales.

**Características principales:**
- 🎴 Lecturas de tarot personalizadas con IA
- 🔮 Oracle y rituales espirituales
- 👥 Sistema de usuarios con planes Free y Premium
- 🛡️ Autenticación JWT con refresh tokens
- ⚡ Rate limiting y cuotas de uso
- 📊 Panel administrativo completo

**Flujo de autenticación:**
1. Registrarse con POST /auth/register
2. Iniciar sesión con POST /auth/login (obtener access_token y refresh_token)
3. Usar el access_token en header: \`Authorization: Bearer <token>\`
4. Refrescar token con POST /auth/refresh cuando expire

**Planes de usuario:**
- **Free:** Lecturas limitadas, solo preguntas predefinidas
- **Premium:** Lecturas ilimitadas, preguntas personalizadas, compartir lecturas

**Limitaciones:**
- Rate limiting por endpoint (ver respuestas 429)
- Cuotas mensuales de IA para usuarios premium
- Restricciones por plan de usuario`,
    )
    .setVersion('1.0.0')
    .setContact(
      'Soporte Tarot API',
      'https://github.com/ArielDRighi/TarotFlavia',
      'soporte@tarot-api.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000/api/v1', 'Desarrollo Local')
    .addServer('https://api-staging.tarot.com/api/v1', 'Staging')
    .addServer('https://api.tarot.com/api/v1', 'Producción')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Ingrese el access_token JWT obtenido del endpoint /auth/login',
      },
      'JWT-auth',
    )
    .addTag('Autenticación', 'Endpoints de registro, login y gestión de tokens')
    .addTag(
      'Lecturas de Tarot',
      'Crear, consultar y gestionar lecturas de tarot',
    )
    .addTag('Cartas', 'Catálogo de cartas del tarot')
    .addTag('Tiradas', 'Configuraciones de tiradas disponibles')
    .addTag('Mazos', 'Mazos de tarot disponibles')
    .addTag('Daily Card', 'Carta diaria del usuario')
    .addTag('Interpretaciones', 'Gestión de interpretaciones de IA')
    .addTag('Preguntas Predefinidas', 'Catálogo de preguntas predefinidas')
    .addTag('Usuarios', 'Gestión de perfil de usuario')
    .addTag('Lecturas Compartidas', 'Acceso público a lecturas compartidas')
    .addTag(
      'Compartir Lecturas',
      'Compartir y gestionar URLs públicas de lecturas',
    )
    .addTag('Rate Limiting', 'Estado de límites de tasa del usuario')
    .addTag('AI Usage', 'Cuotas y uso de IA')
    .addTag('User Scheduling', 'Gestión de citas para usuarios')
    .addTag('Tarotist Scheduling', 'Gestión de disponibilidad para tarotistas')
    .addTag('categories', 'Categorías de preguntas y lecturas')
    .addTag('health', 'Health checks y estado del sistema')
    .addTag('Admin - Usuarios', 'Administración de usuarios (solo admin)')
    .addTag(
      'Admin - Lecturas de Tarot',
      'Administración de lecturas (solo admin)',
    )
    .addTag('Admin - Dashboard', 'Métricas y estadísticas del sistema')
    .addTag('Admin - Cache', 'Gestión de caché del sistema')
    .addTag('Admin - Rate Limiting', 'Configuración de rate limits')
    .addTag('Admin - IP Whitelist', 'Gestión de IPs en whitelist')
    .addTag('Admin - AI Usage', 'Administración de uso de IA')
    .addTag('Admin - Audit Logs', 'Logs de auditoría del sistema')
    .addTag('security-events', 'Eventos de seguridad del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Tarot API - Documentación',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { font-size: 36px }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
    },
  });

  // Configure CORS with security headers (TASK-048-a)
  if (!process.env.CORS_ORIGIN) {
    loggerService.warn(
      'CORS_ORIGIN environment variable is not set. CORS will be disabled for security.',
      'Bootstrap',
    );
  }
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN : false,
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

  const appUrl = await app.getUrl();
  loggerService.log(`Application is running on: ${appUrl}`, 'Bootstrap');
  loggerService.log(
    `Swagger documentation available at: ${appUrl}/api`,
    'Bootstrap',
  );
}

void bootstrap();
