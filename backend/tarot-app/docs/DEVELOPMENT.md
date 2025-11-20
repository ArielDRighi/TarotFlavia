# 🛠️ Development Guide - TarotFlavia

## Tabla de Contenido

- [Setup del Entorno de Desarrollo](#setup-del-entorno-de-desarrollo)
- [Herramientas Recomendadas](#herramientas-recomendadas)
- [Scripts Útiles](#scripts-útiles)
- [Debugging Tips](#debugging-tips)
- [Troubleshooting Común](#troubleshooting-común)
- [Workflows de Desarrollo](#workflows-de-desarrollo)
- [Testing durante Desarrollo](#testing-durante-desarrollo)
- [Database Development](#database-development)
- [Hot Reload y Watch Mode](#hot-reload-y-watch-mode)

---

## Setup del Entorno de Desarrollo

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js**: v18.x o superior (recomendado v20 LTS)
- **npm**: v9.x o superior
- **Git**: Última versión
- **PostgreSQL**: 15+ (puede correr en Docker)
- **Docker** (opcional): Para PostgreSQL y pgAdmin
- **VS Code** (recomendado): Editor principal

### Verificar Versiones

```bash
node --version  # v20.x.x
npm --version   # v10.x.x
git --version   # 2.x.x
psql --version  # PostgreSQL 15.x
docker --version  # 24.x.x (si usas Docker)
```

### 1. Clonar el Repositorio

```bash
# Clonar
git clone https://github.com/ArielDRighi/TarotFlavia.git
cd TarotFlavia

# Configurar upstream (para mantener fork actualizado)
git remote add upstream https://github.com/ArielDRighi/TarotFlavia.git
git fetch upstream
```

### 2. Instalar Dependencias

```bash
# Desde la raíz (instala workspaces: backend + frontend)
npm install

# O solo backend
cd backend/tarot-app
npm install
```

### 3. Configurar Base de Datos

#### Opción A: Docker (Recomendado)

```bash
cd backend/tarot-app

# Copiar .env de ejemplo
cp .env.example .env

# Iniciar PostgreSQL en Docker
docker-compose up -d tarot-postgres

# Verificar que está corriendo
docker ps

# Ver logs
docker logs tarot-postgres

# Acceder a psql
docker exec -it tarot-postgres psql -U tarot_user -d tarot_db
```

#### Opción B: PostgreSQL Local

```bash
# Crear usuario y database
psql -U postgres
CREATE USER tarot_user WITH PASSWORD 'tarot_password_2024';
CREATE DATABASE tarot_db OWNER tarot_user;
GRANT ALL PRIVILEGES ON DATABASE tarot_db TO tarot_user;
\q

# Actualizar .env
nano .env
# Cambiar POSTGRES_HOST=localhost, POSTGRES_PORT=5432
```

### 4. Configurar Variables de Entorno

```bash
cd backend/tarot-app
cp .env.example .env
```

Editar `.env`:

```bash
# ========================================
# DATABASE (Docker por defecto)
# ========================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5435  # 5432 si usas PostgreSQL local
POSTGRES_USER=tarot_user
POSTGRES_PASSWORD=tarot_password_2024
POSTGRES_DB=tarot_db

TAROT_DATABASE_URL=postgresql://tarot_user:tarot_password_2024@localhost:5435/tarot_db

# ========================================
# JWT SECRETS (desarrollo)
# ========================================
JWT_SECRET=dev-secret-key-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-not-for-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# ========================================
# OPENAI (opcional en desarrollo)
# ========================================
# Si no tienes key, la app funcionará pero las lecturas
# usarán interpretaciones fallback (sin IA)
# OPENAI_API_KEY=sk-your-openai-key-here
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# ========================================
# ENVIRONMENT
# ========================================
NODE_ENV=development
PORT=3000

# ========================================
# LOGGING
# ========================================
LOG_LEVEL=debug  # debug, info, warn, error

# ========================================
# CACHE
# ========================================
CACHE_STORE=memory
CACHE_TTL=3600

# ========================================
# CORS
# ========================================
CORS_ORIGIN=http://localhost:5173  # Puerto del frontend Vite
```

### 5. Ejecutar Migraciones y Seeders

```bash
cd backend/tarot-app

# Ejecutar migraciones (crear tablas)
npm run migration:run

# Seedear cartas de tarot (78 cartas Rider-Waite)
npm run db:seed:cards

# (Opcional) Seedear usuarios de prueba
npm run db:seed:users

# Verificar que todo se creó
# Opción A: psql
docker exec -it tarot-postgres psql -U tarot_user -d tarot_db -c "\dt"

# Opción B: pgAdmin (http://localhost:5050)
# Email: admin@tarot.local
# Password: change_me_to_secure_password
```

### 6. Iniciar el Servidor de Desarrollo

```bash
cd backend/tarot-app

# Modo desarrollo con hot-reload
npm run start:dev

# El servidor estará en:
# API: http://localhost:3000
# Swagger: http://localhost:3000/api/docs
```

### 7. Verificar que Funciona

```bash
# Health check
curl http://localhost:3000/health

# Listar cartas
curl http://localhost:3000/api/cards | jq

# Ver Swagger UI
open http://localhost:3000/api/docs  # macOS
start http://localhost:3000/api/docs  # Windows
xdg-open http://localhost:3000/api/docs  # Linux
```

---

## Herramientas Recomendadas

### VS Code Extensions

Instalar estas extensiones para mejor DX:

```json
{
  "recommendations": [
    // TypeScript & Node.js
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "orta.vscode-jest",
    "firsttris.vscode-jest-runner",
    
    // Database
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg",
    "cweijan.vscode-postgresql-client2",
    
    // Git
    "eamodio.gitlens",
    "mhutchie.git-graph",
    
    // Markdown
    "yzhang.markdown-all-in-one",
    "davidanson.vscode-markdownlint",
    
    // Utilities
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "wayou.vscode-todo-highlight",
    "gruntfuggly.todo-tree",
    
    // Docker
    "ms-azuretools.vscode-docker",
    
    // REST Client
    "humao.rest-client"
  ]
}
```

Guardar como `.vscode/extensions.json` en la raíz del proyecto.

### VS Code Settings

Crear `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": false
}
```

### Git Hooks (Husky)

**Opcional:** Configurar hooks pre-commit:

```bash
npm install --save-dev husky lint-staged

# Inicializar husky
npx husky install

# Crear pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm test"
```

Configurar `lint-staged` en `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,js}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### Database Tools

#### pgAdmin (Web UI)

Si usas Docker:

```
URL: http://localhost:5050
Email: admin@tarot.local
Password: change_me_to_secure_password
```

Agregar servidor:

```
Name: Tarot DB
Host: tarot-postgres (o localhost)
Port: 5432
Username: tarot_user
Password: tarot_password_2024
Database: tarot_db
```

#### DBeaver (Desktop Client)

Descargar: https://dbeaver.io/

Configurar conexión:

```
Host: localhost
Port: 5435 (Docker) o 5432 (local)
Database: tarot_db
Username: tarot_user
Password: tarot_password_2024
```

### REST Client (Alternative to Postman)

Crear archivo `test.http` en la raíz:

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Health Check
GET http://localhost:3000/health

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "dev@example.com",
  "password": "Password123!",
  "name": "Developer"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "dev@example.com",
  "password": "Password123!"
}

### Get Cards
GET {{baseUrl}}/cards
Authorization: Bearer {{token}}

### Create Reading
POST {{baseUrl}}/readings
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "spreadId": 1,
  "predefinedQuestionId": 1,
  "tarotistaId": 1
}
```

---

## Scripts Útiles

### NPM Scripts

```bash
# ========================================
# DESARROLLO
# ========================================

# Iniciar en modo desarrollo (hot-reload)
npm run start:dev

# Iniciar en modo debug (chrome://inspect)
npm run start:debug

# Build del proyecto
npm run build

# Ejecutar en modo producción (después de build)
npm run start:prod

# ========================================
# TESTING
# ========================================

# Ejecutar tests unitarios
npm test

# Tests en modo watch (recomendado durante desarrollo)
npm run test:watch

# Tests con coverage
npm run test:cov

# Ver coverage en HTML
npm run test:cov:html

# Tests E2E
npm run test:e2e

# Tests E2E en watch mode
npm run test:e2e:watch

# ========================================
# CALIDAD DE CÓDIGO
# ========================================

# Linter (detectar problemas)
npm run lint

# Formatear código con Prettier
npm run format

# ========================================
# BASE DE DATOS
# ========================================

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver migraciones ejecutadas
npm run migration:show

# Generar nueva migración
npm run migration:generate -- -n NombreMigracion

# Crear migración vacía
npm run migration:create -- -n NombreMigracion

# Seeders
npm run db:seed:all       # Todos los seeders
npm run db:seed:cards     # Solo cartas
npm run db:seed:users     # Solo usuarios

# Resetear DB desarrollo
npm run db:dev:reset      # Drop + create + migrate + seed

# ========================================
# UTILIDADES
# ========================================

# Ver logs de OpenAI
npm run logs:openai

# Ver estadísticas de caché
npm run stats:cache

# CLI interactivo
npm run cli

# Validar arquitectura
node scripts/validate-architecture.js
```

### Scripts Personalizados

Crear `scripts/dev-setup.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Setting up development environment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d tarot-postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 5

# 3. Run migrations
echo "🗄️  Running migrations..."
npm run migration:run

# 4. Seed database
echo "🌱 Seeding database..."
npm run db:seed:cards

echo "✅ Development environment ready!"
echo "🎯 Run 'npm run start:dev' to start the server"
```

Hacer ejecutable:

```bash
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

---

## Debugging Tips

### Debug en VS Code

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": [
        "--nolazy",
        "-r",
        "ts-node/register",
        "-r",
        "tsconfig-paths/register"
      ],
      "args": ["${workspaceFolder}/backend/tarot-app/src/main.ts"],
      "sourceMaps": true,
      "envFile": "${workspaceFolder}/backend/tarot-app/.env",
      "cwd": "${workspaceFolder}/backend/tarot-app",
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Current File",
      "program": "${workspaceFolder}/backend/tarot-app/node_modules/.bin/jest",
      "args": [
        "${fileBasenameNoExtension}",
        "--runInBand",
        "--no-cache",
        "--watchAll=false"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "cwd": "${workspaceFolder}/backend/tarot-app"
    }
  ]
}
```

**Uso:**

1. Poner breakpoint (click en número de línea)
2. Presionar `F5` o click "Run and Debug"
3. Navegar con `F10` (step over), `F11` (step into), `F5` (continue)

### Debug con Chrome DevTools

```bash
npm run start:debug
```

Abrir en Chrome:

```
chrome://inspect
```

Click "inspect" en el proceso de Node.

### Logging durante Desarrollo

El proyecto usa Winston para logging. Los logs se guardan en:

```
backend/tarot-app/logs/
  app-2025-11-20.log       # Info general
  error-2025-11-20.log     # Solo errores
```

Ver logs en tiempo real:

```bash
# Todos los logs
tail -f logs/app-$(date +%Y-%m-%d).log

# Solo errores
tail -f logs/error-$(date +%Y-%m-%d).log

# Con filtro
tail -f logs/app-*.log | grep "ERROR"
```

### Debug de Queries SQL

Habilitar logging de TypeORM en `.env`:

```bash
TAROT_DB_LOGGING=true
```

Verás todas las queries SQL en la consola:

```sql
query: SELECT * FROM "users" WHERE "id" = $1 -- PARAMETERS: [1]
query: INSERT INTO "tarot_readings" ("userId", "spreadId") VALUES ($1, $2) RETURNING "id" -- PARAMETERS: [1,2]
```

---

## Troubleshooting Común

### Error: "Port 3000 is already in use"

**Solución:**

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O cambiar puerto en .env
PORT=3001
```

### Error: "Cannot connect to database"

**Síntomas:**

```
Error: Connection terminated unexpectedly
```

**Solución:**

```bash
# 1. Verificar Docker está corriendo
docker ps

# 2. Si no está, iniciar
docker-compose up -d tarot-postgres

# 3. Verificar logs
docker logs tarot-postgres

# 4. Verificar credenciales en .env
echo $POSTGRES_PASSWORD
```

### Error: "Module not found"

**Solución:**

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar paths en tsconfig.json
cat tsconfig.json | grep paths
```

### Error: "Tests failing: Cannot find module 'src/...'"

**Solución:**

Verificar `moduleNameMapper` en `package.json` (sección jest):

```json
{
  "jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### Migrations ya ejecutadas

**Error:**

```
QueryFailedError: relation "users" already exists
```

**Solución:**

```bash
# Ver migraciones ejecutadas
npm run migration:show

# Revertir si es necesario
npm run migration:revert

# O resetear DB completa (desarrollo)
npm run db:dev:reset
```

### OpenAI API no funciona

**Síntomas:**

```
Error: Invalid OpenAI API key
```

**Solución:**

```bash
# 1. Verificar key está en .env
grep OPENAI_API_KEY .env

# 2. Verificar key es válida en https://platform.openai.com/api-keys

# 3. Temporal: comentar key para usar fallback
# OPENAI_API_KEY=sk-...
```

### Hot Reload no funciona

**Solución:**

```bash
# 1. Reiniciar servidor
Ctrl+C
npm run start:dev

# 2. Si persiste, limpiar cache
rm -rf dist
npm run build
npm run start:dev

# 3. Verificar watchman no está causando problemas
# En package.json jest config:
"watchman": false
```

---

## Workflows de Desarrollo

### Workflow: Nueva Feature

```bash
# 1. Actualizar develop
git checkout develop
git pull upstream develop

# 2. Crear branch
git checkout -b feature/TASK-XXX-descripcion

# 3. Activar test watch mode
npm run test:watch

# 4. Desarrollar con TDD
# - Escribir test (RED)
# - Implementar código (GREEN)
# - Refactorizar (REFACTOR)

# 5. Verificar lint
npm run lint

# 6. Commit
git add .
git commit -m "feat(module): descripcion"

# 7. Push
git push origin feature/TASK-XXX-descripcion

# 8. Crear PR en GitHub
```

### Workflow: Fixing Bug

```bash
# 1. Crear branch
git checkout -b fix/TASK-XXX-descripcion

# 2. Escribir test que reproduce el bug
# El test debe FALLAR (confirma el bug)

# 3. Fix el bug
# El test debe PASAR

# 4. Verificar tests
npm test

# 5. Commit y push
git commit -m "fix(module): descripcion"
git push origin fix/TASK-XXX-descripcion
```

### Workflow: Actualizar Branch con Develop

```bash
# Opción A: Merge (mantiene historial)
git checkout feature/mi-rama
git merge develop

# Opción B: Rebase (historial limpio)
git checkout feature/mi-rama
git rebase develop

# Si hay conflictos
# 1. Resolver conflictos en archivos
# 2. git add .
# 3. git rebase --continue
# 4. git push --force-with-lease origin feature/mi-rama
```

---

## Testing durante Desarrollo

### Watch Mode (Recomendado)

```bash
# Iniciar watch mode
npm run test:watch

# Comandos interactivos:
# Press f to run only failed tests
# Press o to only run tests related to changed files
# Press p to filter by a filename regex pattern
# Press t to filter by a test name regex pattern
# Press a to run all tests
# Press q to quit watch mode
```

### Ejecutar Test Específico

```bash
# Por nombre de archivo
npm run test:watch
# Presionar 'p'
# Escribir: readings.service

# Por nombre de test
npm run test:watch
# Presionar 't'
# Escribir: should create reading

# Desde CLI
npx jest readings.service.spec.ts
```

### Coverage durante Desarrollo

```bash
# Ver coverage summary
npm run test:cov:summary

# Ver coverage HTML
npm run test:cov:html
open coverage/index.html

# Coverage de archivo específico
npx jest --coverage --collectCoverageFrom=src/modules/tarot/readings/readings.service.ts
```

---

## Database Development

### Crear Nueva Migración

```bash
# 1. Crear entidad o modificar existente
# src/modules/users/entities/user.entity.ts

# 2. Generar migración automáticamente
npm run migration:generate -- -n AddEmailVerified

# 3. Revisar archivo generado
# backend/tarot-app/src/database/migrations/1699999999-AddEmailVerified.ts

# 4. Ejecutar migración
npm run migration:run

# 5. Si algo sale mal, revertir
npm run migration:revert
```

### Seeders Personalizados

Crear `scripts/seed-custom.ts`:

```typescript
import { AppDataSource } from '../src/config/data-source';
import { User } from '../src/modules/users/entities/user.entity';

async function seed() {
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(User);
  
  await userRepo.save({
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    name: 'Admin',
    roles: [UserRole.ADMIN],
  });
  
  console.log('✅ Custom seed completed');
  await AppDataSource.destroy();
}

seed();
```

Ejecutar:

```bash
ts-node -r tsconfig-paths/register scripts/seed-custom.ts
```

### Database Reset (Solo Desarrollo)

```bash
# ⚠️ CUIDADO: Borra todos los datos

# Opción A: Script npm
npm run db:dev:reset

# Opción B: Manual
docker-compose down -v  # Borra volúmenes
docker-compose up -d tarot-postgres
npm run migration:run
npm run db:seed:all
```

---

## Hot Reload y Watch Mode

### NestJS Hot Reload

Ya configurado en `npm run start:dev`:

```json
{
  "scripts": {
    "start:dev": "nest start --watch"
  }
}
```

### Qué se Recompila Automáticamente

✅ **Recompila automáticamente:**
- Archivos `.ts` en `src/`
- Cambios en módulos
- Cambios en servicios, controllers, etc.

❌ **Requiere restart manual:**
- Cambios en `package.json`
- Cambios en `.env`
- Cambios en archivos de configuración (`tsconfig.json`, etc.)
- Instalación de nuevas dependencias

### Forzar Recompilación

```bash
# Ctrl+C para detener
# npm run start:dev para reiniciar

# O usar nodemon (alternativa)
npm install --save-dev nodemon
```

---

## Best Practices

### Durante Desarrollo

✅ **DO:**
- Usar test watch mode durante desarrollo
- Hacer commits pequeños y frecuentes
- Escribir tests antes de código (TDD)
- Limpiar imports no utilizados
- Usar VS Code para auto-formatting
- Verificar lint antes de commit
- Usar debug mode para investigar bugs

❌ **DON'T:**
- Commitear `console.log` en código de producción
- Ignorar warnings de TypeScript
- Hacer commits gigantes (>500 líneas)
- Pushear código sin tests
- Ignorar errores de linter
- Subir `.env` o secrets al repositorio

---

**Versión**: 1.0.0  
**Última actualización**: Noviembre 2025  
**Próxima revisión**: Al agregar nuevas herramientas de desarrollo
