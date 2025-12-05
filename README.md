# 🔮 Tarot Flavia - Plataforma de Tarot con IA

Marketplace de tarotistas profesionales con generación de lecturas de tarot asistidas por inteligencia artificial.

## 📋 Índice

- [Descripción](#-descripción)
- [Stack Tecnológico](#-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecutar el Proyecto](#-ejecutar-el-proyecto)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## 🎯 Descripción

TarotFlavia es una plataforma completa de lecturas de tarot que combina:

- **Backend NestJS**: API RESTful robusta con arquitectura escalable
- **Base de datos PostgreSQL**: Almacenamiento de usuarios, lecturas e interpretaciones
- **Integración IA**: Generación de interpretaciones mediante OpenAI GPT-4 y Anthropic Claude
- **Sistema de Usuarios**: Autenticación JWT, roles y límites de uso
- **Caché Inteligente**: Optimización de costos de IA mediante caché de interpretaciones
- **Testing Completo**: Cobertura >80% con tests unitarios y E2E

### Características Principales

✅ **Lecturas de Tarot Personalizadas**

- 5+ tipos de tiradas (Cruz Celta, Tres Cartas, etc.)
- 78 cartas con interpretaciones detalladas
- Preguntas personalizadas del usuario

✅ **IA Multi-Provider**

- Soporte para OpenAI GPT-4 Turbo
- Soporte para Anthropic Claude 3.5 Sonnet
- Fallback automático entre proveedores
- Retry con backoff exponencial

✅ **Sistema de Usuarios Completo**

- Registro y autenticación con JWT
- Roles: user, premium, admin
- Límites de uso por plan (3 lecturas/día free, ilimitadas premium)
- Gestión de sesiones con refresh tokens
- **4 planes configurables**: GUEST, FREE, PREMIUM, PROFESSIONAL

**Planes de Usuario:**

| Plan             | Lecturas  | IA Quota  | Custom Questions | Sharing | Advanced Spreads | Precio |
| ---------------- | --------- | --------- | ---------------- | ------- | ---------------- | ------ |
| **GUEST**        | 3/mes     | 0         | ❌               | ❌      | ❌               | Gratis |
| **FREE**         | 10/mes    | 100/mes   | ❌               | ❌      | ❌               | Gratis |
| **PREMIUM**      | Ilimitado | Ilimitado | ✅               | ✅      | ✅               | $9.99  |
| **PROFESSIONAL** | Ilimitado | Ilimitado | ✅               | ✅      | ✅               | $19.99 |

Los límites y features son **configurables dinámicamente** desde el admin panel sin necesidad de redeploy.

✅ **Admin Panel Completo**

- Gestión completa de tarotistas (CRUD + configuración)
- Sistema de aplicaciones para nuevos tarotistas
- Configuración individual de IA por tarotista
- Significados personalizados de cartas
- Dashboard con métricas y analytics
- Audit logging de acciones administrativas
- **Configuración dinámica de planes** (readingsLimit, aiQuota, features)
- Límites y capacidades actualizables sin redeploy

✅ **Arquitectura Escalable**

- Arquitectura híbrida feature-based con capas
- Repository Pattern para desacoplamiento
- CQRS para operaciones complejas
- Event-Driven Architecture

✅ **Seguridad Robusta**

- Validación de inputs (class-validator)
- Sanitización de outputs (XSS protection)
- Rate limiting por usuario
- Security headers (Helmet.js)
- Audit logging de acciones críticas

## 🛠️ Stack Tecnológico

### Backend

- **Framework**: NestJS 11.x (Node.js + TypeScript)
- **ORM**: TypeORM 0.3.x
- **Base de datos**: PostgreSQL 15+
- **Validación**: class-validator, class-transformer
- **Testing**: Jest (unitarios + E2E)
- **Seguridad**: Helmet, Passport JWT, bcrypt
- **Documentación API**: Swagger/OpenAPI

### IA Providers

- **OpenAI**: GPT-4 Turbo
- **Anthropic**: Claude 3.5 Sonnet
- **Groq**: Llama 3.1 70B (futuro)

### Infraestructura

- **Docker**: PostgreSQL containerizado
- **Cache**: In-memory (preparado para Redis)
- **Logs**: Winston con rotación diaria
- **CI/CD**: GitHub Actions

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v18.x o superior
- **npm**: v9.x o superior
- **PostgreSQL**: 15+ (puede correr en Docker)
- **Docker** (opcional): Para correr PostgreSQL en contenedor
- **Git**: Para clonar el repositorio

### Verificar Versiones

```bash
node --version  # v18.x o superior
npm --version   # v9.x o superior
psql --version  # PostgreSQL 15+ (opcional si usas Docker)
docker --version  # Opcional para PostgreSQL en contenedor
```

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ArielDRighi/TarotFlavia.git
cd TarotFlavia
```

### 2. Instalar Dependencias

Este es un monorepo con workspaces de npm:

```bash
# Instalar todas las dependencias (backend + frontend)
npm install

# O solo backend
cd backend/tarot-app
npm install
```

### 3. Configurar Base de Datos

#### Opción A: Usando Docker (Recomendado)

```bash
cd backend/tarot-app

# Copiar archivo de configuración
cp .env.example .env

# Editar .env y ajustar credenciales si es necesario
# Por defecto: puerto 5435, usuario tarot_user, password tarot_password_2024

# Iniciar PostgreSQL en Docker
docker-compose up -d tarot-postgres

# Verificar que esté corriendo
docker ps
```

#### Opción B: PostgreSQL Local

Si tienes PostgreSQL instalado localmente:

```bash
# Crear usuario y base de datos
psql -U postgres
CREATE USER tarot_user WITH PASSWORD 'tarot_password_2024';
CREATE DATABASE tarot_db OWNER tarot_user;
GRANT ALL PRIVILEGES ON DATABASE tarot_db TO tarot_user;
\q

# Actualizar .env con tus credenciales
```

## ⚙️ Configuración

### Variables de Entorno

Copiar el archivo de ejemplo y ajustar según tu entorno:

```bash
cd backend/tarot-app
cp .env.example .env
```

### Variables Esenciales

Editar `backend/tarot-app/.env`:

```bash
# Base de Datos (ajustar si cambiaste las credenciales)
TAROT_DATABASE_URL=postgresql://tarot_user:tarot_password_2024@localhost:5435/tarot_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5435
POSTGRES_USER=tarot_user
POSTGRES_PASSWORD=tarot_password_2024
POSTGRES_DB=tarot_db

# JWT Secrets (CAMBIAR en producción)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# OpenAI API (opcional para desarrollo, requerido para lecturas IA)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Anthropic API (opcional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Entorno
NODE_ENV=development
PORT=3000
```

### Generar Secrets Seguros (Producción)

```bash
# Generar JWT secrets fuertes
openssl rand -base64 64
```

### Migraciones y Seeders

```bash
cd backend/tarot-app

# Ejecutar migraciones (crear tablas)
npm run migration:run

# Seedear cartas de tarot (78 cartas Rider-Waite)
npm run db:seed:cards

# (Opcional) Crear usuarios de prueba
npm run db:seed:users
```

## 🏃 Ejecutar el Proyecto

### Desarrollo

```bash
cd backend/tarot-app

# Modo desarrollo con hot-reload
npm run start:dev

# La API estará disponible en:
# http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

### Producción

```bash
cd backend/tarot-app

# Build
npm run build

# Ejecutar en producción
npm run start:prod
```

### Verificar que Todo Funcione

```bash
# Health check
curl http://localhost:3000/health

# Debe retornar: {"status":"ok","info":{...}}
```

## 🧪 Testing

### Tests Unitarios

```bash
cd backend/tarot-app

# Ejecutar todos los tests unitarios
npm test

# Con coverage
npm run test:cov

# En modo watch (durante desarrollo)
npm run test:watch
```

### Tests E2E (End-to-End)

```bash
cd backend/tarot-app

# Ejecutar todos los tests E2E
npm run test:e2e

# Con coverage
npm run test:e2e:cov

# Test específico
npm run test:e2e -- auth.e2e-spec.ts
```

### Linting y Formato

```bash
# Linter
npm run lint

# Formatear código
npm run format

# Build (verificar que compila)
npm run build
```

### Coverage Mínimo Requerido

El proyecto mantiene los siguientes umbrales de coverage:

- **Líneas**: ≥70%
- **Branches**: ≥55%
- **Funciones**: ≥65%
- **Statements**: ≥70%

## 📁 Estructura del Proyecto

```
TarotFlavia/
├── backend/
│   └── tarot-app/               # Backend NestJS
│       ├── src/
│       │   ├── modules/         # Módulos por dominio (feature-based)
│       │   │   ├── tarot/       # Dominio principal de tarot
│       │   │   │   ├── readings/        # Lecturas de tarot (CQRS + eventos)
│       │   │   │   ├── interpretations/ # Interpretaciones IA
│       │   │   │   ├── spreads/         # Configuración de tiradas
│       │   │   │   ├── cards/           # Catálogo de 78 cartas
│       │   │   │   ├── cache/           # Sistema de caché (capas)
│       │   │   │   └── ai/              # Abstracción multi-provider IA
│       │   │   ├── users/       # Gestión de usuarios
│       │   │   ├── auth/        # Autenticación JWT
│       │   │   ├── tarotistas/  # Marketplace de tarotistas
│       │   │   └── usage-limits/ # Límites por plan
│       │   ├── common/          # Utilidades compartidas
│       │   │   ├── decorators/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── pipes/
│       │   │   └── services/
│       │   ├── config/          # Configuración (TypeORM, JWT, etc.)
│       │   ├── database/        # Migraciones y seeders
│       │   └── main.ts          # Entry point
│       ├── test/                # Tests E2E
│       ├── docs/                # Documentación técnica
│       ├── docker-compose.yml   # Docker services
│       └── package.json
├── frontend/                    # Frontend (futuro)
├── docs/                        # Documentación general
└── package.json                 # Workspace root
```

### Arquitectura de Módulos

El proyecto usa **arquitectura híbrida feature-based**:

- **Módulos simples** (CRUD): Estructura flat (entity, dto, service, controller)
- **Módulos complejos**: Capas (domain, application, infrastructure)

Ejemplo módulo con capas (`readings/`):

```
readings/
├── domain/
│   └── interfaces/              # Contratos, abstracciones
│       └── reading-repository.interface.ts
├── application/
│   ├── commands/                # CQRS - Comandos (escritura)
│   ├── queries/                 # CQRS - Queries (lectura)
│   ├── events/                  # Eventos de dominio
│   ├── services/                # Servicios de aplicación
│   └── dto/                     # Data Transfer Objects
└── infrastructure/
    ├── repositories/            # Implementación de repositorios
    ├── controllers/             # Controladores HTTP
    └── entities/                # Entidades TypeORM
```

Ver [ARCHITECTURE.md](backend/tarot-app/docs/ARCHITECTURE.md) para más detalles.

## 🎛️ Configuración Dinámica de Planes

El proyecto implementa un sistema de configuración de planes **database-driven** que permite ajustar límites y capacidades sin redesplegar la aplicación.

### Endpoints Admin (plan-config)

**Base URL**: `/plan-config` (Requiere: JwtAuthGuard + AdminGuard)

| Método | Endpoint                 | Descripción                                               |
| ------ | ------------------------ | --------------------------------------------------------- |
| GET    | `/plan-config`           | Lista todos los planes configurados                       |
| GET    | `/plan-config/:planType` | Obtiene plan específico (guest/free/premium/professional) |
| POST   | `/plan-config`           | Crea nuevo plan con configuración personalizada           |
| PUT    | `/plan-config/:planType` | Actualiza límites y features de plan existente            |
| DELETE | `/plan-config/:planType` | Elimina plan (solo si no hay usuarios)                    |

### Campos Configurables

```typescript
{
  planType: 'FREE' | 'PREMIUM' | 'PROFESSIONAL' | 'GUEST',
  name: string,                    // Nombre del plan
  description: string,             // Descripción
  price: number,                   // Precio mensual
  readingsLimit: number,           // Lecturas/mes (-1 = ilimitado)
  aiQuotaMonthly: number,          // Requests IA/mes (-1 = ilimitado)
  allowCustomQuestions: boolean,   // Preguntas personalizadas
  allowSharing: boolean,           // Compartir lecturas
  allowAdvancedSpreads: boolean,   // Tiradas avanzadas
  isActive: boolean                // Plan activo/inactivo
}
```

### Integración con UsageLimits

El `UsageLimitsService` lee dinámicamente los límites de lecturas desde `PlanConfigService`:

```typescript
// Enforcement en tiempo real
async checkLimit(user: User, feature: UsageFeatureType): Promise<boolean> {
  // Para TAROT_READING, leer límite dinámico de BD
  if (feature === UsageFeatureType.TAROT_READING) {
    const limit = await this.planConfigService.getReadingsLimit(user.plan);
    // Validar contra límite dinámico
  }
}
```

**Ventajas:**

- ✅ Cambios inmediatos sin redeploy
- ✅ Promociones temporales (ej: PREMIUM gratis 30 días)
- ✅ Ajustes de cuotas de IA según costos reales
- ✅ Testing A/B de diferentes límites
- ✅ Gestión diferenciada por ambiente (dev/staging/prod)

Ver [docs/Tasks/TASK-076.md](backend/tarot-app/docs/Tasks/TASK-076.md) para documentación completa.

## 📚 Documentación

### Documentación Técnica

Toda la documentación técnica está en `backend/tarot-app/docs/`:

- **[ARCHITECTURE.md](backend/tarot-app/docs/ARCHITECTURE.md)**: Arquitectura completa del proyecto
- **[CONTRIBUTING.md](backend/tarot-app/CONTRIBUTING.md)**: Guía de contribución
- **[API_DOCUMENTATION.md](backend/tarot-app/docs/API_DOCUMENTATION.md)**: Documentación de la API
- **[DEPLOYMENT.md](backend/tarot-app/docs/DEPLOYMENT.md)**: Guía de deployment
- **[DEVELOPMENT.md](backend/tarot-app/docs/DEVELOPMENT.md)**: Setup de entorno de desarrollo
- **[DATABASE.md](backend/tarot-app/docs/DATABASE.md)**: Esquema y migraciones de base de datos
- **[SECURITY.md](backend/tarot-app/docs/SECURITY.md)**: Políticas de seguridad
- **[CHANGELOG.md](backend/tarot-app/CHANGELOG.md)**: Historial de cambios

### Documentación de Desarrollo

- **[TESTING.md](backend/tarot-app/docs/TESTING.md)**: Estrategia de testing
- **[DEVELOPER_WORKFLOWS.md](backend/tarot-app/docs/DEVELOPER_WORKFLOWS.md)**: Workflows de desarrollo
- **[FIXTURES_GUIDE.md](backend/tarot-app/docs/FIXTURES_GUIDE.md)**: Uso de fixtures
- **[TESTING_MOCKS.md](backend/tarot-app/docs/TESTING_MOCKS.md)**: Mocking de servicios

### API Documentation (Swagger)

Cuando el servidor esté corriendo:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee la [Guía de Contribución](backend/tarot-app/CONTRIBUTING.md) antes de enviar un PR.

### Flujo de Trabajo

1. Fork el repositorio
2. Crear una rama: `git checkout -b feature/TASK-XXX-descripcion`
3. Hacer cambios y commitear: `git commit -m "feat(module): descripcion"`
4. Asegurar que tests pasan: `npm test && npm run test:e2e`
5. Push: `git push origin feature/TASK-XXX-descripcion`
6. Crear Pull Request

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(readings): agregar endpoint de regeneración
fix(auth): corregir validación de token expirado
refactor(arch): aplicar Repository Pattern
docs(api): actualizar documentación de endpoints
test(cache): agregar tests de invalidación
```

## 🔒 Seguridad

Para reportar vulnerabilidades de seguridad, por favor **NO** crear un issue público. Enviar un email a: [seguridad@tarotflavia.com] (o contactar directamente al mantenedor).

Ver [SECURITY.md](backend/tarot-app/docs/SECURITY.md) para más información sobre políticas de seguridad.

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados.

## 👥 Equipo

- **Desarrollo Backend**: Ariel Righi
- **Arquitectura**: Ariel Righi
- **Testing**: Ariel Righi

## 📞 Soporte

Para preguntas o soporte:

- **Issues**: [GitHub Issues](https://github.com/ArielDRighi/TarotFlavia/issues)
- **Email**: soporte@tarotflavia.com
- **Documentación**: Ver carpeta `docs/`

## 🗺️ Roadmap

### MVP (Fase Actual)

- ✅ Sistema de usuarios y autenticación
- ✅ Lecturas de tarot con 5+ tiradas
- ✅ Integración multi-provider IA (OpenAI + Claude)
- ✅ Caché de interpretaciones
- ✅ Límites de uso por plan
- ✅ Testing completo (>80% coverage)
- 🚧 Frontend React (en desarrollo)

### Próximas Features

- ⏳ Dashboard de usuario
- ⏳ Marketplace de tarotistas
- ⏳ Sistema de pagos (Stripe)
- ⏳ Suscripciones premium
- ⏳ Notificaciones por email
- ⏳ App móvil (React Native)

## 🙏 Agradecimientos

- **OpenAI**: Por GPT-4 y la API
- **Anthropic**: Por Claude 3.5 Sonnet
- **NestJS**: Por el framework backend
- **TypeORM**: Por el ORM
- **Comunidad Open Source**: Por todas las librerías utilizadas

---

**Versión**: 0.1.0  
**Última actualización**: Noviembre 2025  
**Estado**: MVP en desarrollo activo
