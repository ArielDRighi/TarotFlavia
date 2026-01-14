# 🔮 Auguria - Plataforma de Tarot con IA

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

Auguria es una plataforma completa de lecturas de tarot que combina inteligencia artificial con experiencia tradicional del tarot. El proyecto está en fase MVP con el backend completado al ~95% y el frontend en desarrollo activo.

**Arquitectura:**

- **Backend NestJS**: API RESTful robusta con arquitectura feature-based y capas (domain/application/infrastructure)
- **Base de datos PostgreSQL 16**: Esquema completo con 29 tablas para usuarios, lecturas, interpretaciones y marketplace
- **IA Multi-Provider**: Groq Llama 3.1 70B (principal), OpenAI GPT-4 Turbo y DeepSeek (fallback) con circuit breaker y retry
- **Sistema de Usuarios**: Autenticación JWT con refresh tokens, roles (CONSUMER, TAROTIST, ADMIN) y 3 planes configurables
- **Caché Inteligente**: Optimización de costos de IA mediante caché en memoria (preparado para Redis)
- **Testing Completo**: >80% coverage con 147 tests unitarios + 72 tests E2E/integración

### Características Principales

✅ **Sistema de Lecturas de Tarot Completo**

- **78 cartas** del Rider-Waite con significados completos (upright/reversed)
- **4 tipos de tiradas (spreads):**
  - 1 carta (respuesta rápida) - nivel `beginner`
  - 3 cartas (pasado-presente-futuro) - nivel `beginner`
  - 5 cartas (análisis profundo) - nivel `intermediate`
  - 10 cartas (Cruz Céltica) - nivel `advanced`
- Posiciones con significados específicos e `interpretation_focus`
- Historial de lecturas con soft-delete
- Compartir lecturas públicamente con token único

✅ **Carta del Día**

- Generación diaria automática por usuario
- Una carta aleatoria por día por tarotista seleccionado
- Interpretación personalizada con IA (Premium) o descripción estática (Free/Anonymous)
- Historial de cartas diarias consultable

✅ **IA Multi-Provider con Fallback**

- **Groq Llama 3.1 70B Versatile** como proveedor principal (más rápido y económico)
- **OpenAI GPT-4 Turbo** como fallback secundario
- **DeepSeek Chat** como último fallback
- Circuit breaker pattern para resiliencia
- Retry con backoff exponencial (3 intentos)
- Tracking de costos y uso de IA por usuario
- Rate limiting de AI según plan

✅ **Sistema de Usuarios y Autenticación**

- Registro con validación de email único
- Login con JWT access token (15 min) + refresh token (7 días)
- Recuperación de contraseña por email
- Sistema de roles: `CONSUMER`, `TAROTIST`, `ADMIN`
- Perfiles completos con avatar, bio, especialidades
- Guards de autenticación y autorización por rol

✅ **3 Planes de Usuario Configurables**

**ANONYMOUS (Sin Registro):**

- 1 Carta del Día/día (sin IA, solo descripción DB)
- SIN acceso a tiradas de tarot
- SIN historial ni compartir
- Objetivo: Conversión a FREE

**FREE (Autenticado):**

- 1 Carta del Día/día + 1 tirada/día (límites independientes)
- Spreads disponibles: 1 carta o 3 cartas
- Solo preguntas predefinidas por categoría (sin IA)
- ✅ Historial guardado (limitado)
- ✅ Compartir lecturas
- Objetivo: Conversión a PREMIUM

**PREMIUM (Suscripción $9.99/mes):**

- 1 Carta del Día/día + 3 tiradas/día (con IA)
- Spreads disponibles: 1, 3, 5 cartas + Cruz Céltica
- ✅ Preguntas personalizadas libres
- ✅ Interpretaciones completas con IA
- ✅ Historial ilimitado
- ✅ Compartir lecturas

Los límites y features son **configurables dinámicamente** desde el admin panel sin necesidad de redeploy (`/plan-config` endpoints).

✅ **Sistema de Categorías y Preguntas**

- **6 categorías temáticas:**
  - ❤️ Amor y Relaciones
  - 💼 Carrera y Trabajo
  - 💰 Dinero y Finanzas
  - 🏥 Salud y Bienestar
  - ✨ Crecimiento Espiritual
  - 🌟 Consulta General
- **43 preguntas predefinidas** distribuidas por categoría
- Iconos, colores y orden personalizables
- Toggle active/inactive por categoría y pregunta
- Usuarios FREE: Solo preguntas predefinidas
- Usuarios PREMIUM: Preguntas personalizadas libres

✅ **Marketplace de Tarotistas**

- Perfiles completos de tarotistas profesionales
- Especialidades e idiomas configurables
- Sistema de reviews y ratings (5 estrellas)
- **Configuración personalizada de IA:**
  - Prompts personalizados por tarotista
  - Ajuste de temperature, model y provider
  - Significados de cartas personalizados
  - Bulk import de custom meanings
- **Sistema de aplicaciones:**
  - Tarotistas aplican para unirse a la plataforma
  - Estados: `pending` → `approved` / `rejected`
  - Admin puede agregar notas y tracking de review
- Métricas de revenue y estadísticas
- 15 endpoints admin para gestión completa (CRUD + config + meanings + applications)

✅ **Sistema de Scheduling (Sesiones con Tarotistas)**

- **Disponibilidad de tarotistas:**
  - Configuración semanal por día (lunes-domingo)
  - Horarios de inicio y fin personalizables
  - Excepciones para días específicos (vacaciones, bloqueos)
- **Gestión de sesiones:**
  - Reserva con duraciones: 30, 60 o 90 minutos
  - Estados: `pending`, `confirmed`, `completed`, `cancelled`, `no_show`
  - Cancelación con mínimo 24 horas de anticipación
  - Confirmación por parte del tarotista
- Integración con Google Meet (link generado automáticamente)
- Notificaciones por email (preparado)

✅ **Admin Panel Completo**

- **Gestión de usuarios:**
  - Lista con paginación, filtros y búsqueda
  - Ban/unban con reason tracking
  - Cambio de plan dinámico
  - Asignación de roles (promote to admin/tarotist)
  - Estadísticas y métricas de actividad
  - Soft-delete con auditoría
- **Gestión de tarotistas:**
  - CRUD completo (crear, listar, actualizar, desactivar/reactivar)
  - Filtrado avanzado (search, isActive, sortBy, sortOrder)
  - Configuración individual de IA por tarotista
  - Custom card meanings system
  - Gestión de aplicaciones (aprobar/rechazar)
- **Configuración dinámica de planes:**
  - Endpoints `/plan-config` para CRUD de planes
  - Campos configurables: readingsLimit, aiQuotaMonthly, allowCustomQuestions, allowSharing, allowAdvancedSpreads, price
  - Actualización de límites sin redeploy
- **Dashboard con métricas:**
  - Estadísticas de usuarios por plan
  - Uso de IA y costos
  - Lecturas generadas por período
  - Charts y analytics
- **Audit Logging:**
  - Todas las acciones admin registradas
  - Tracking de cambios críticos
  - Búsqueda y filtrado de logs
- **Rate Limiting Management:**
  - Visualización de violaciones de rate limit
  - IP Whitelist para admins
  - Bloqueo automático de IPs abusivas
- **Security Events Monitoring:**
  - Eventos de seguridad registrados
  - Intentos de login fallidos
  - Accesos no autorizados
  - Paginación y filtros avanzados

✅ **Arquitectura Escalable y Robusta**

- **Arquitectura híbrida feature-based:**
  - Módulos simples (CRUD): Estructura flat
  - Módulos complejos: Capas (domain / application / infrastructure)
  - Repository Pattern para desacoplamiento
  - CQRS para operaciones complejas (readings)
  - Event-Driven Architecture preparado
- **Seguridad:**
  - Helmet.js security headers (CSP, HSTS, XSS protection)
  - Input validation con class-validator
  - Output sanitization para contenido IA
  - SQL injection protection (TypeORM parameterized queries)
  - Rate limiting global (100 req/min) y por endpoint
  - IP Whitelist para admins
  - Audit logging de acciones críticas
- **Optimización:**
  - Caché en memoria para interpretaciones (30 min TTL)
  - Query optimization con indexes
  - Connection pooling (PostgreSQL)
  - Soft-delete para recuperación de datos
- **Monitoreo:**
  - Winston logger con file + console transports
  - Request/response logging
  - Error logging con stack traces
  - AI request logging con tracking de costos
  - Security events logging
  - Performance metrics

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

- **Groq**: Llama 3.1 70B Versatile (principal - rápido y económico)
- **OpenAI**: GPT-4 Turbo (fallback secundario)
- **DeepSeek**: DeepSeek Chat (fallback terciario)

### Infraestructura

- **Docker**: PostgreSQL 16 containerizado (puerto 5435)
- **Cache**: In-memory (preparado para Redis)
- **Logs**: Winston con file + console transports, rotación diaria
- **CI/CD**: Preparado para GitHub Actions
- **Monorepo**: npm workspaces (backend + frontend)

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
git clone https://github.com/ArielDRighi/Auguria.git
cd Auguria
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
Auguria/
├── backend/
│   └── tarot-app/                   # Backend NestJS (puerto 3000)
│       ├── src/
│       │   ├── modules/             # Módulos por dominio (feature-based)
│       │   │   ├── tarot/           # Dominio principal de tarot
│       │   │   │   ├── readings/          # Lecturas de tarot (CQRS + eventos)
│       │   │   │   ├── interpretations/   # Interpretaciones IA (multi-provider)
│       │   │   │   ├── spreads/           # Configuración de tiradas
│       │   │   │   ├── cards/             # Catálogo de 78 cartas
│       │   │   │   ├── daily-reading/     # Carta del Día
│       │   │   │   └── decks/             # Mazos de cartas (Rider-Waite)
│       │   │   ├── users/           # Gestión de usuarios
│       │   │   ├── auth/            # Autenticación JWT + refresh tokens
│       │   │   ├── tarotistas/      # Marketplace de tarotistas
│       │   │   │   ├── domain/            # Interfaces y contratos
│       │   │   │   ├── application/       # Servicios de aplicación
│       │   │   │   └── infrastructure/    # Repositories, controllers, entities
│       │   │   ├── scheduling/      # Sistema de reservas de sesiones
│       │   │   ├── categories/      # Categorías de consulta (6 categorías)
│       │   │   ├── predefined-questions/  # 43 preguntas predefinidas
│       │   │   ├── subscriptions/   # Gestión de suscripciones y tarotista favorito
│       │   │   ├── plan-config/     # Configuración dinámica de planes
│       │   │   ├── usage-limits/    # Límites de uso por plan
│       │   │   ├── admin/           # Panel de administración
│       │   │   │   ├── admin-users.controller.ts      # Gestión de usuarios
│       │   │   │   ├── admin-dashboard.controller.ts   # Métricas y analytics
│       │   │   │   ├── rate-limits/                    # Rate limiting management
│       │   │   │   └── ip-whitelist-admin.controller.ts
│       │   │   ├── audit/           # Audit logging
│       │   │   ├── security/        # Security events monitoring
│       │   │   ├── ai/              # Abstracción multi-provider IA
│       │   │   │   ├── providers/         # Groq, OpenAI, DeepSeek
│       │   │   │   ├── circuit-breaker/   # Circuit breaker pattern
│       │   │   │   └── ai.service.ts      # Servicio principal con fallback
│       │   │   ├── ai-usage/        # Tracking de uso de IA
│       │   │   ├── cache/           # Sistema de caché (capas)
│       │   │   ├── email/           # Notificaciones por email
│       │   │   └── health/          # Health checks
│       │   ├── common/              # Utilidades compartidas
│       │   │   ├── decorators/      # @CheckUsageLimit, @Roles, etc.
│       │   │   ├── guards/          # JwtAuthGuard, RolesGuard, AdminGuard, AIQuotaGuard
│       │   │   ├── interceptors/    # Logging, transformación
│       │   │   ├── pipes/           # Validación personalizada
│       │   │   └── services/        # Servicios compartidos
│       │   ├── config/              # Configuración (TypeORM, JWT, IA providers)
│       │   ├── database/            # Migraciones y seeders
│       │   │   ├── migrations/      # TypeORM migrations
│       │   │   └── seeds/           # 78 cartas, 6 categorías, 43 preguntas
│       │   └── main.ts              # Entry point + Swagger setup
│       ├── test/                    # Tests E2E e integración (72 archivos)
│       ├── docs/                    # Documentación técnica completa
│       │   ├── API_DOCUMENTATION.md       # Endpoints y contratos
│       │   ├── ARCHITECTURE.md            # Arquitectura y patrones
│       │   ├── DATABASE.md                # Esquema de 29 tablas
│       │   ├── DEPLOYMENT.md              # Guías de deployment
│       │   ├── DEVELOPMENT.md             # Setup de entorno
│       │   ├── TESTING.md                 # Estrategia de testing
│       │   ├── SECURITY.md                # Políticas de seguridad
│       │   ├── MVP_ESTADO_ACTUAL.md       # Estado del MVP (~95% completado)
│       │   └── CHANGELOG.md               # Historial de cambios
│       ├── docker-compose.yml       # PostgreSQL 16 en Docker
│       ├── .env.example             # Variables de entorno
│       └── package.json             # Dependencias backend
├── frontend/                        # Frontend Next.js 14 (puerto 3001) - EN DESARROLLO
│   ├── src/
│   │   ├── app/                     # Rutas Next.js (App Router)
│   │   │   ├── login/               # Pantalla de login
│   │   │   ├── registro/            # Registro de usuarios
│   │   │   ├── carta-del-dia/       # Carta del Día
│   │   │   ├── ritual/              # Experiencia de lectura (ritual)
│   │   │   ├── historial/           # Historial de lecturas
│   │   │   ├── perfil/              # Perfil de usuario
│   │   │   ├── tarotistas/          # Marketplace de tarotistas
│   │   │   ├── sesiones/            # Reserva de sesiones
│   │   │   ├── admin/               # Panel admin
│   │   │   └── compartida/          # Vista pública de lectura compartida
│   │   ├── components/
│   │   │   ├── ui/                  # Componentes shadcn/ui
│   │   │   └── features/            # Componentes de negocio por dominio
│   │   │       ├── auth/            # LoginForm, RegisterForm
│   │   │       ├── readings/        # ReadingCard, ReadingExperience
│   │   │       ├── daily-card/      # DailyCardDisplay
│   │   │       ├── tarotistas/      # TarotistaCard, TarotistaProfile
│   │   │       └── admin/           # Admin components
│   │   ├── hooks/
│   │   │   ├── api/                 # React Query hooks (useReadings, useAuth)
│   │   │   └── utils/               # Utility hooks
│   │   ├── stores/                  # Zustand stores (authStore, readingStore)
│   │   ├── lib/
│   │   │   ├── api/                 # Axios config + endpoints + API functions
│   │   │   ├── utils/               # Utilidades (cn, format, etc.)
│   │   │   ├── validations/         # Zod schemas
│   │   │   └── constants/           # Constantes (rutas, config)
│   │   └── types/                   # TypeScript types (API contracts)
│   ├── docs/                        # Documentación frontend
│   │   ├── ARCHITECTURE.md          # Arquitectura feature-based
│   │   ├── AI_DEVELOPMENT_GUIDE.md  # Workflow TDD y reglas
│   │   ├── FRONTEND_BACKLOG.md      # Tareas y estado actual
│   │   ├── MODELO_NEGOCIO_DEFINIDO.md  # Reglas de negocio ANÓNIMO/FREE/PREMIUM
│   │   ├── DESIGN_HAND-OFF.md       # Design tokens y UI
│   │   └── AI_PROMPTS.md            # Prompts para desarrollo
│   ├── tests/                       # Tests unitarios + E2E (Vitest + Playwright)
│   ├── .env.local                   # NEXT_PUBLIC_API_URL=http://localhost:3000/api
│   └── package.json                 # Dependencias frontend
├── docs/                            # Documentación general del proyecto
│   ├── MVP_STRATEGY_SUMMARY.md      # Estrategia de MVP
│   ├── MVP_FEATURES_BREAKDOWN.md    # Desglose de features
│   ├── USER_EXPERIENCE_FLOWS.md     # Flujos de usuario ANÓNIMO/FREE/PREMIUM
│   ├── TECHNICAL_BACKLOG.md         # Backlog técnico global
│   └── QA_TESTING_REPORT.md         # Reportes de QA
├── .github/
│   └── copilot-instructions.md      # Instrucciones para Copilot (contexto del proyecto)
├── package.json                     # Root - coordina workspaces
└── README.md                        # Este archivo
```

### Arquitectura de Módulos

El proyecto usa **arquitectura híbrida feature-based**:

- **Módulos simples** (CRUD): Estructura flat (entity, dto, service, controller)
- **Módulos complejos**: Capas (domain, application, infrastructure)

Ejemplo módulo con capas (`tarotistas/`):

```
tarotistas/
├── domain/
│   └── interfaces/                  # Contratos, abstracciones
│       ├── tarotista-repository.interface.ts
│       └── tarotista-config-repository.interface.ts
├── application/
│   ├── services/                    # Servicios de aplicación
│   │   ├── tarotistas-admin.service.ts        # CRUD + filtrado avanzado
│   │   ├── tarotista-config.service.ts        # Config IA personalizada
│   │   ├── tarotista-card-meanings.service.ts # Custom meanings
│   │   └── tarotista-applications.service.ts  # Sistema de aplicaciones
│   └── dto/                         # Data Transfer Objects
└── infrastructure/
    ├── repositories/                # Implementación de repositorios TypeORM
    ├── controllers/                 # Controladores HTTP
    │   ├── tarotistas-admin.controller.ts     # 15 endpoints admin
    │   ├── tarotistas-public.controller.ts    # Endpoints públicos
    │   ├── metrics.controller.ts              # Métricas
    │   └── reports.controller.ts              # Reportes
    └── entities/                    # Entidades TypeORM
        ├── tarotista.entity.ts
        ├── tarotista-config.entity.ts
        ├── tarotista-card-meaning.entity.ts
        └── tarotista-application.entity.ts
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

| Documento                                                               | Descripción                                         |
| ----------------------------------------------------------------------- | --------------------------------------------------- |
| **[ARCHITECTURE.md](backend/tarot-app/docs/ARCHITECTURE.md)**           | Arquitectura completa, patrones y decisiones        |
| **[API_DOCUMENTATION.md](backend/tarot-app/docs/API_DOCUMENTATION.md)** | Documentación detallada de todos los endpoints      |
| **[DATABASE.md](backend/tarot-app/docs/DATABASE.md)**                   | Esquema de 29 tablas, migraciones y seeders         |
| **[MVP_ESTADO_ACTUAL.md](backend/tarot-app/docs/MVP_ESTADO_ACTUAL.md)** | Estado actual del MVP (~95% completado)             |
| **[TESTING.md](backend/tarot-app/docs/TESTING.md)**                     | Estrategia de testing (unitarios + E2E)             |
| **[SECURITY.md](backend/tarot-app/docs/SECURITY.md)**                   | Políticas de seguridad y vulnerabilidades           |
| **[DEPLOYMENT.md](backend/tarot-app/docs/DEPLOYMENT.md)**               | Guías de deployment (Render, Railway, DigitalOcean) |
| **[DEVELOPMENT.md](backend/tarot-app/docs/DEVELOPMENT.md)**             | Setup de entorno de desarrollo                      |
| **[CONTRIBUTING.md](backend/tarot-app/CONTRIBUTING.md)**                | Guía de contribución y convenciones                 |

### Documentación Frontend

En `frontend/docs/`:

| Documento                                                                  | Descripción                                    |
| -------------------------------------------------------------------------- | ---------------------------------------------- |
| **[ARCHITECTURE.md](frontend/docs/ARCHITECTURE.md)**                       | Arquitectura feature-based del frontend        |
| **[AI_DEVELOPMENT_GUIDE.md](frontend/docs/AI_DEVELOPMENT_GUIDE.md)**       | Workflow TDD y reglas de desarrollo            |
| **[FRONTEND_BACKLOG.md](frontend/docs/FRONTEND_BACKLOG.md)**               | Backlog técnico y estado de tareas             |
| **[MODELO_NEGOCIO_DEFINIDO.md](frontend/docs/MODELO_NEGOCIO_DEFINIDO.md)** | Reglas de negocio ANÓNIMO/FREE/PREMIUM         |
| **[DESIGN_HAND-OFF.md](frontend/docs/DESIGN_HAND-OFF.md)**                 | Design tokens, componentes UI y guías visuales |
| **[AI_PROMPTS.md](frontend/docs/AI_PROMPTS.md)**                           | Prompts para desarrollo con IA                 |

### Documentación General

En `docs/`:

| Documento                                                       | Descripción                               |
| --------------------------------------------------------------- | ----------------------------------------- |
| **[MVP_STRATEGY_SUMMARY.md](docs/MVP_STRATEGY_SUMMARY.md)**     | Estrategia general del MVP                |
| **[MVP_FEATURES_BREAKDOWN.md](docs/MVP_FEATURES_BREAKDOWN.md)** | Desglose detallado de features            |
| **[USER_EXPERIENCE_FLOWS.md](docs/USER_EXPERIENCE_FLOWS.md)**   | Flujos de experiencia por tipo de usuario |
| **[TECHNICAL_BACKLOG.md](docs/TECHNICAL_BACKLOG.md)**           | Backlog técnico global del proyecto       |
| **[QA_TESTING_REPORT.md](docs/QA_TESTING_REPORT.md)**           | Reportes de QA y testing manual           |

### API Documentation (Swagger)

Cuando el servidor esté corriendo, la documentación interactiva está disponible en:

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI JSON**: http://localhost:3000/api/docs-json

### Principales Grupos de Endpoints

| Grupo                       | Base Path                | Descripción                                    |
| --------------------------- | ------------------------ | ---------------------------------------------- |
| **Autenticación**           | `/auth`                  | Registro, login, refresh, logout               |
| **Usuarios**                | `/users`                 | Perfil, capabilities, actualización            |
| **Lecturas**                | `/readings`              | CRUD lecturas, compartir, trash                |
| **Carta del Día**           | `/daily-reading`         | Generar, consultar hoy, historial              |
| **Tarotistas Públicos**     | `/tarotistas`            | Listar, ver perfil, reviews                    |
| **Scheduling**              | `/scheduling`            | Disponibilidad, reservas de sesiones           |
| **Spreads**                 | `/spreads`               | Tipos de tiradas disponibles                   |
| **Cartas**                  | `/cards`                 | Catálogo de 78 cartas                          |
| **Categorías**              | `/categories`            | 6 categorías de consulta                       |
| **Preguntas**               | `/predefined-questions`  | 43 preguntas predefinidas                      |
| **Suscripciones**           | `/subscriptions`         | Gestionar tarotista favorito, all-access       |
| **Admin - Usuarios**        | `/admin/users`           | Gestión de usuarios, ban/unban, roles          |
| **Admin - Dashboard**       | `/admin/dashboard`       | Métricas, estadísticas, charts                 |
| **Admin - Tarotistas**      | `/admin/tarotistas`      | CRUD, config IA, custom meanings, applications |
| **Admin - Plan Config**     | `/plan-config`           | Configuración dinámica de planes               |
| **Admin - Rate Limits**     | `/admin/rate-limits`     | Violaciones, IP whitelist                      |
| **Admin - Security Events** | `/admin/security-events` | Eventos de seguridad, audit logging            |
| **Admin - Audit Logs**      | `/audit-logs`            | Logs de auditoría de acciones críticas         |
| **Health**                  | `/health`                | Health checks de la API                        |

Ver [API_DOCUMENTATION.md](backend/tarot-app/docs/API_DOCUMENTATION.md) para documentación completa de todos los endpoints con ejemplos de request/response.

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
feat(readings): agregar endpoint de compartir
fix(auth): corregir validación de token expirado
refactor(arch): aplicar Repository Pattern
docs(api): actualizar documentación de endpoints
test(cache): agregar tests de invalidación
```

## 🔒 Seguridad

Para reportar vulnerabilidades de seguridad, por favor **NO** crear un issue público. Enviar un email a: [seguridad@auguria.com] (o contactar directamente al mantenedor).

Ver [SECURITY.md](backend/tarot-app/docs/SECURITY.md) para más información sobre políticas de seguridad.

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados.

## 👥 Equipo

- **Desarrollo Backend**: Ariel Righi
- **Arquitectura**: Ariel Righi
- **Testing**: Ariel Righi

## 📞 Soporte

Para preguntas o soporte:

- **Issues**: [GitHub Issues](https://github.com/ArielDRighi/Auguria/issues)
- **Email**: soporte@auguria.com
- **Documentación**: Ver carpeta `docs/`

## 🗺️ Roadmap

### ✅ MVP Backend (Completado al ~95%)

- ✅ Sistema de usuarios y autenticación (JWT + refresh tokens)
- ✅ 3 planes configurables (ANONYMOUS, FREE, PREMIUM)
- ✅ Lecturas de tarot (4 tipos de spreads, 78 cartas)
- ✅ Carta del Día con interpretación IA (Premium) o estática (Free/Anonymous)
- ✅ Integración multi-provider IA (Groq → OpenAI → DeepSeek con fallback)
- ✅ Sistema de categorías (6) y preguntas predefinidas (43)
- ✅ Marketplace de tarotistas (CRUD + config IA + custom meanings + applications)
- ✅ Sistema de scheduling (reservas de sesiones con tarotistas)
- ✅ Admin panel completo (gestión de usuarios, tarotistas, planes, métricas)
- ✅ Rate limiting, security, audit logging
- ✅ Caché de interpretaciones IA
- ✅ Testing completo (>80% coverage, 147 tests unitarios + 72 E2E)
- ✅ Documentación completa (API, arquitectura, database, deployment)

### 🚧 MVP Frontend (En Desarrollo Activo)

- ✅ Setup Next.js 14 con App Router + TypeScript + Tailwind CSS
- ✅ Configuración de testing (Vitest + Testing Library + Playwright)
- ✅ Arquitectura feature-based definida
- ✅ Design tokens y componentes base (shadcn/ui)
- 🚧 Pantallas de autenticación (Login, Registro, Recuperar Password)
- 🚧 Home page dual (Landing para anónimos + Dashboard para autenticados)
- 🚧 Carta del Día (experiencia diferenciada ANONYMOUS/FREE/PREMIUM)
- 🚧 Ritual de lectura (selección de cartas, spreads, interpretación)
- 🚧 Historial de lecturas (paginado, filtros, compartir)
- 🚧 Marketplace de tarotistas (explorar, perfiles, reviews)
- 🚧 Sistema de reservas (calendario, horarios disponibles)
- 🚧 Perfil de usuario (edición, cambio de plan, configuración)
- 🚧 Panel admin (gestión de usuarios, tarotistas, configuración de planes)

### 📋 Post-MVP

**Monetización:**

- ⏳ Integración de pagos (Stripe)
- ⏳ Sistema de suscripciones recurrentes
- ⏳ Trial de 7 días para Premium
- ⏳ Google Ads para usuarios Free
- ⏳ Sistema de referidos

**Funcionalidades Avanzadas:**

- ⏳ Notificaciones push y por email
- ⏳ Sistema de favoritos (lecturas, tarotistas)
- ⏳ Estadísticas avanzadas (gráficos, tendencias)
- ⏳ Exportar lecturas a PDF
- ⏳ Compartir en redes sociales (integración nativa)
- ⏳ Chat en vivo con tarotistas (WebSocket)
- ⏳ Videollamadas integradas (Jitsi o similar)

**Infraestructura:**

- ⏳ Migrar caché a Redis
- ⏳ Implementar message queue (RabbitMQ/Bull)
- ⏳ Escalado horizontal (Kubernetes)
- ⏳ CDN para assets estáticos
- ⏳ Monitoring avanzado (Prometheus + Grafana)

**Expansión:**

- ⏳ App móvil (React Native)
- ⏳ Multiidioma (i18n)
- ⏳ Más tipos de tiradas (10+ spreads)
- ⏳ Mazos adicionales (Tarot de Marsella, Oracle, etc.)
- ⏳ Integraciones con calendarios (Google, Outlook)

## 🙏 Agradecimientos

- **Groq**: Por Llama 3.1 70B y la API ultrarrápida
- **OpenAI**: Por GPT-4 Turbo y la API
- **DeepSeek**: Por DeepSeek Chat como fallback confiable
- **NestJS**: Por el framework backend robusto y escalable
- **TypeORM**: Por el ORM y sistema de migraciones
- **Next.js**: Por el framework frontend moderno
- **shadcn/ui**: Por los componentes UI accesibles y customizables
- **Comunidad Open Source**: Por todas las librerías y herramientas utilizadas

---

**Versión**: 0.1.0 (Backend), 0.0.1 (Frontend - en desarrollo)  
**Última actualización**: Enero 2026  
**Estado**: MVP Backend ~95% completado | Frontend en desarrollo activo  
**Tipo**: Proyecto privado / propietario  
**Arquitectura**: Monorepo (npm workspaces)
