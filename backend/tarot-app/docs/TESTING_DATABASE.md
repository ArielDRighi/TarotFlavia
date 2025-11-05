# Testing con Bases de Datos

Guía completa sobre la infraestructura de testing con bases de datos en el proyecto Tarot App.

## Índice

1. [Arquitectura de Testing](#1-arquitectura-de-testing)
2. [Bases de Datos Disponibles](#2-bases-de-datos-disponibles)
3. [Workflows de Testing](#3-workflows-de-testing)
4. [Scripts Disponibles](#4-scripts-disponibles)
5. [Troubleshooting](#5-troubleshooting)
6. [Mejores Prácticas](#6-mejores-prácticas)

---

## 1. Arquitectura de Testing

### Separación de Entornos

El proyecto utiliza **dos bases de datos PostgreSQL completamente aisladas**:

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌────────────────────────┐   │
│  │   tarot-postgres-dev     │  │ tarot-postgres-e2e-db │   │
│  │                          │  │                        │   │
│  │  Puerto: 5435           │  │  Puerto: 5436         │   │
│  │  DB: tarot_db           │  │  DB: tarot_e2e        │   │
│  │  User: tarot_user       │  │  User: tarot_e2e_user │   │
│  │                          │  │                        │   │
│  │  Uso: Desarrollo        │  │  Uso: Tests E2E       │   │
│  │  Ciclo: Manual          │  │  Ciclo: Setup/Teardown│   │
│  └──────────────────────────┘  └────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

1. **Aislamiento Total**: Tests E2E nunca afectan datos de desarrollo
2. **Setup Automático**: DB E2E se limpia y seedea automáticamente antes de cada suite
3. **Migraciones Primero**: `synchronize: false` fuerza uso de migraciones
4. **Consistencia**: Mismo schema en dev y E2E via migraciones compartidas

---

## 2. Bases de Datos Disponibles

### Comparativa: Development vs E2E

| Aspecto              | **Development DB** (`tarot_db`)  | **E2E Testing DB** (`tarot_e2e`)   |
| -------------------- | -------------------------------- | ---------------------------------- |
| **Puerto**           | `5435`                           | `5436`                             |
| **Nombre DB**        | `tarot_db`                       | `tarot_e2e`                        |
| **Usuario**          | `tarot_user`                     | `tarot_e2e_user`                   |
| **Password**         | `tarot_password_2024`            | `tarot_e2e_password_2024`          |
| **Propósito**        | Desarrollo manual                | Tests automatizados E2E            |
| **Gestión de datos** | Manual (seeders opcionales)      | Automática (setup/teardown)        |
| **Ciclo de vida**    | Persistente                      | Limpiado entre suites              |
| **Sincronización**   | Deshabilitada (usar migraciones) | Deshabilitada (usar migraciones)   |
| **Acceso**           | Desarrollador + aplicación       | Solo tests                         |
| **Config file**      | `src/config/typeorm.ts`          | `src/config/typeorm-e2e.config.ts` |
| **Variable prefix**  | `TAROT_DB_*`                     | `TAROT_E2E_DB_*`                   |

### Variables de Entorno

#### Development

```bash
TAROT_DB_HOST=localhost
TAROT_DB_PORT=5435
TAROT_DB_USER=tarot_user
TAROT_DB_PASSWORD=tarot_password_2024
TAROT_DB_NAME=tarot_db
```

#### E2E Testing

```bash
TAROT_E2E_DB_HOST=localhost
TAROT_E2E_DB_PORT=5436
TAROT_E2E_DB_USER=tarot_e2e_user
TAROT_E2E_DB_PASSWORD=tarot_e2e_password_2024
TAROT_E2E_DB_NAME=tarot_e2e
```

---

## 3. Workflows de Testing

### Workflow E2E Completo

```
┌──────────────────────────────────────────────────────────────┐
│  npm run test:e2e                                            │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼
   ┌───────────────────┐
   │  Global Setup     │
   │  (setup-e2e-db)   │
   └────────┬──────────┘
            │
            ├──► Health check E2E DB
            ├──► Drop all tables (clean slate)
            ├──► Run migrations
            └──► Seed test data
                 │
                 ▼
         ┌──────────────────┐
         │  Run Test Suites │
         └────────┬─────────┘
                  │
                  ├──► mvp-complete.e2e-spec.ts
                  ├──► readings-hybrid.e2e-spec.ts
                  ├──► password-recovery.e2e-spec.ts
                  ├──► rate-limiting.e2e-spec.ts
                  ├──► database-infrastructure.e2e-spec.ts
                  └──► ...
                       │
                       ▼
               ┌──────────────────┐
               │ Global Teardown  │
               │ (teardown-e2e-db)│
               └────────┬─────────┘
                        │
                        └──► Keep data (for reuse)
```

### Workflow Test Unitario de Migraciones

```bash
npm test -- migration-validation.spec.ts
```

```
┌────────────────────────────────────────┐
│  Initialize E2E DataSource             │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Create QueryRunner                    │
└────────┬───────────────────────────────┘
         │
         ├──► Test: up() and down() defined
         ├──► Test: Create core tables
         ├──► Test: Create user table columns
         ├──► Test: PostgreSQL extensions
         ├──► Test: Foreign key constraints
         └──► Test: Migration tracking
              │
              ▼
      ┌──────────────────┐
      │  Release Runner  │
      └──────────────────┘
```

### Workflow Validación de Schema

```bash
npm run validate:schema
```

```
┌────────────────────────────────────────┐
│  Build project (npm run build)         │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Compile validation script (tsc)       │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Connect to E2E DB                     │
└────────┬───────────────────────────────┘
         │
         ├──► Run migrations
         ├──► Get actual tables from DB
         ├──► Get expected entities from code
         ├──► Compare tables vs entities
         └──► Report errors/warnings
              │
              ▼
      ┌──────────────────┐
      │  Exit with code  │
      │  0 = success     │
      │  1 = errors      │
      └──────────────────┘
```

---

## 4. Scripts Disponibles

### Scripts NPM

#### Tests

```bash
# Tests unitarios
npm test                                      # Todos los tests unitarios
npm test -- migration-validation.spec.ts      # Solo tests de migraciones

# Tests E2E
npm run test:e2e                              # Todos los tests E2E
npm run test:e2e -- mvp-complete              # Suite MVP completo
npm run test:e2e -- database-infrastructure   # Tests de infraestructura

# Tests E2E con reset fresco
npm run test:e2e:fresh                        # Reset DB + tests E2E
```

#### Validación

```bash
# Validar consistencia schema
npm run validate:schema                       # Comparar DB vs entidades
```

#### Gestión DB Development

```bash
# Linux/Mac/Git Bash
npm run db:dev:clean                          # Limpiar datos dev
npm run db:dev:reset                          # Reset completo dev

# Windows PowerShell
npm run db:dev:clean:win                      # Limpiar datos dev (PS)
npm run db:dev:reset:win                      # Reset completo dev (PS)
```

#### Gestión DB E2E

```bash
# Linux/Mac/Git Bash
npm run db:e2e:clean                          # Limpiar datos E2E
npm run db:e2e:reset                          # Reset completo E2E
npm run db:e2e:migrate                        # Solo migraciones E2E

# Windows PowerShell
npm run db:e2e:clean:win                      # Limpiar datos E2E (PS)
npm run db:e2e:reset:win                      # Reset completo E2E (PS)
```

#### Migraciones

```bash
npm run migration:generate -- -n MigrationName  # Generar migración
npm run migration:create -- -n MigrationName    # Crear migración vacía
npm run migration:run                           # Ejecutar migraciones
npm run migration:revert                        # Revertir última migración
npm run migration:show                          # Mostrar migraciones
```

### Scripts Bash/PowerShell

Todos los scripts están en `scripts/`:

#### Bash Scripts (Linux/Mac/Git Bash)

```bash
# Development DB
./scripts/db-dev-clean.sh                     # Limpiar datos
./scripts/db-dev-reset.sh                     # Reset completo

# E2E DB
./scripts/db-e2e-clean.sh                     # Limpiar datos
./scripts/db-e2e-reset.sh                     # Reset completo
```

#### PowerShell Scripts (Windows)

```powershell
# Development DB
.\scripts\db-dev-clean.ps1                    # Limpiar datos
.\scripts\db-dev-reset.ps1                    # Reset completo

# E2E DB
.\scripts\db-e2e-clean.ps1                    # Limpiar datos
.\scripts\db-e2e-reset.ps1                    # Reset completo
```

---

## 5. Troubleshooting

### Problemas Comunes

#### 1. Error: "Database connection failed"

**Síntomas:**

```
Error: connect ECONNREFUSED localhost:5436
```

**Solución:**

```bash
# Verificar que contenedores Docker estén corriendo
docker ps | grep tarot-postgres

# Si no están corriendo, iniciarlos
docker-compose --profile e2e up -d

# Verificar health de contenedores
docker ps --filter name=tarot-postgres
```

#### 2. Error: "password authentication failed"

**Síntomas:**

```
error: password authentication failed for user "tarot_e2e_user"
```

**Solución:**

```bash
# 1. Verificar variables de entorno en .env
grep TAROT_E2E_DB .env

# 2. Verificar que .env tiene las credenciales correctas
TAROT_E2E_DB_PASSWORD=tarot_e2e_password_2024

# 3. Reconstruir contenedores si cambiaste credenciales
docker-compose down -v
docker-compose --profile e2e up -d
```

#### 3. Tests E2E fallan: "describe is not defined"

**Síntomas:**

```
ReferenceError: describe is not defined
```

**Causa:** Archivo `.spec.ts` dentro de `src/database/migrations/` siendo cargado por TypeORM.

**Solución:**

- Los specs de migraciones deben estar **fuera** del directorio `migrations/`
- Verificar pattern en `typeorm-e2e.config.ts`:

```typescript
migrations: [__dirname + '/../database/migrations/*-*{.ts,.js}'],
// Pattern *-* solo carga archivos con timestamp (NNNNNNNNNN-Name.ts)
```

#### 4. Schema drift: "Table X not found"

**Síntomas:**

```
❌ ERROR: Tabla users no existe en DB
```

**Solución:**

```bash
# 1. Ejecutar migraciones pendientes
npm run migration:run

# 2. Si el problema persiste, reset completo
npm run db:e2e:reset

# 3. Validar schema
npm run validate:schema
```

#### 5. Tests lentos o timeout

**Síntomas:**

```
Timeout of 5000ms exceeded
```

**Solución:**

```typescript
// Aumentar timeout en tests E2E
beforeAll(async () => {
  // ...setup
}, 30000); // 30 segundos

it('test con DB', async () => {
  // ...
}, 15000); // 15 segundos
```

---

## 6. Mejores Prácticas

### Escritura de Tests E2E

#### ✅ DO: Usar setup/teardown global

```typescript
// test/jest-e2e.json ya configura:
{
  "globalSetup": "<rootDir>/setup-e2e-db.ts",
  "globalTeardown": "<rootDir>/teardown-e2e-db.ts"
}

// No necesitas limpiar DB en cada test
```

#### ✅ DO: Importar el DataSource E2E correcto

```typescript
import { e2eConnectionSource } from '../src/config/typeorm-e2e.config';

// NO uses el DataSource de desarrollo
```

#### ✅ DO: Usar timeouts apropiados

```typescript
describe('Feature', () => {
  beforeAll(async () => {
    // DB operations need time
  }, 30000); // 30s for setup

  it('test', async () => {
    // Individual test
  }, 15000); // 15s for test
});
```

#### ❌ DON'T: Hacer operaciones DB sin QueryRunner

```typescript
// ❌ MAL
const result = await connection.query('SELECT...');

// ✅ BIEN
const queryRunner = dataSource.createQueryRunner();
try {
  const result = await queryRunner.query('SELECT...');
} finally {
  await queryRunner.release();
}
```

#### ❌ DON'T: Hardcodear credenciales

```typescript
// ❌ MAL
const password = 'tarot_e2e_password';

// ✅ BIEN
const password = process.env.TAROT_E2E_DB_PASSWORD;
```

### Escritura de Migraciones

#### ✅ DO: Testear migraciones antes de commit

```bash
# 1. Crear migración
npm run migration:generate -- -n FeatureName

# 2. Testear up()
npm run db:e2e:reset

# 3. Testear down() (rollback)
npm run migration:revert

# 4. Validar schema
npm run validate:schema

# 5. Ejecutar tests E2E
npm run test:e2e
```

#### ✅ DO: Implementar down() completo

```typescript
export class FeatureMigration1234567890 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE...`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // ✅ IMPORTANTE: Siempre implementar rollback
    await queryRunner.query(`DROP TABLE...`);
  }
}
```

#### ❌ DON'T: Usar synchronize en producción

```typescript
// ❌ MAL - NUNCA en producción
{
  synchronize: true,  // Modifica schema automáticamente
}

// ✅ BIEN
{
  synchronize: false,  // Usar migraciones explícitas
  migrationsRun: false, // Control manual
}
```

### Debugging

#### Habilitar logs de TypeORM

```typescript
// src/config/typeorm-e2e.config.ts
const e2eConfig: DataSourceOptions = {
  // ...
  logging: true, // Cambiar a true temporalmente
  logger: 'advanced-console',
};
```

#### Ejecutar con verbose

```bash
# Ver logs completos de Jest
npm run test:e2e -- --verbose

# Ver queries SQL
DEBUG=true npm run test:e2e
```

#### Inspeccionar DB E2E manualmente

```bash
# Conectar con psql
docker exec -it tarot-postgres-e2e-db psql -U tarot_e2e_user -d tarot_e2e

# Listar tablas
\dt

# Ver estructura de tabla
\d+ users

# Salir
\q
```

---

## Referencias

- [README-DOCKER.md](./README-DOCKER.md) - Configuración Docker completa
- [MIGRATIONS.md](./MIGRATIONS.md) - Guía de migraciones
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Estrategia de testing general

---

**Última actualización:** 2025-01-04  
**Versión:** 1.0.0
