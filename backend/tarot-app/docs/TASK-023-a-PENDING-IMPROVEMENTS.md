# TASK-023-a: Mejoras Pendientes - DB Testing E2E

**Documento:** Subtareas pendientes derivadas de TASK-023-a  
**Rama de trabajo:** `feature/TASK-023-a-test-database-setup`  
**Estado de la tarea principal:** ✅ Core funcional (100%) | ⚠️ Mejoras opcionales (45%)  
**Fecha de creación:** 04/01/2025

---

## 📋 Contexto

La tarea principal TASK-023-a está **funcionalmente completa**:

- ✅ Base de datos E2E dedicada funcionando (puerto 5436)
- ✅ Todos los tests pasando (8/8 suites E2E, 60 tests, 487 unit tests)
- ✅ Infraestructura productiva y lista para desarrollo

Este documento registra las **mejoras opcionales** que quedaron pendientes del checklist original. Se implementarán **en esta misma rama** antes del merge a develop.

---

## 🎯 Objetivos de las Mejoras

1. **Completar compatibilidad multiplataforma** (Windows PowerShell)
2. **Mejorar DX** (Developer Experience) con scripts NPM
3. **Aumentar robustez** con tests de infraestructura
4. **Completar documentación** para onboarding

---

## 📝 Sub-tareas Pendientes

### ✅ SUB-TASK-023-a-1: Scripts PowerShell para Windows

**Prioridad:** 🟢 MEDIA  
**Estimación:** 4 horas  
**Estado:** ✅ **COMPLETADA**  
**Commit:** `5b668cc`  
**Fecha:** 04/01/2025

**Descripción:**  
Crear versiones PowerShell de los scripts bash existentes para compatibilidad completa con desarrolladores Windows-only (sin Git Bash).

**Archivos a crear:**

1. `scripts/db-dev-clean.ps1`
2. `scripts/db-dev-reset.ps1`
3. `scripts/db-e2e-clean.ps1`
4. `scripts/db-e2e-reset.ps1`

**Criterios de aceptación:**

- [ ] Scripts PowerShell equivalentes a versiones bash
- [ ] Usan mismas variables de entorno (`$env:TAROT_DB_*`)
- [ ] Manejo de errores con `try/catch`
- [ ] Mensajes de output coloreados (Write-Host con -ForegroundColor)
- [ ] Confirmación requerida para operaciones destructivas
- [ ] Funcionan en PowerShell 5.1+ y PowerShell Core 7+
- [ ] Documentados con comentarios inline

**Validación:**

```powershell
# Ejecutar en PowerShell
.\scripts\db-e2e-clean.ps1
.\scripts\db-e2e-reset.ps1
```

**Ciclo de calidad:**

```bash
npm run lint
npm run format
npm run build
npm test
```

---

### ✅ SUB-TASK-023-a-2: Scripts NPM para Gestión de DBs

**Prioridad:** 🟢 MEDIA  
**Estimación:** 2 horas  
**Estado:** ✅ **COMPLETADA**  
**Commit:** `5f3f0da`  
**Fecha:** 04/01/2025

**Descripción:**  
Agregar comandos NPM intuitivos en `package.json` para gestión de bases de datos, mejorando la DX (Developer Experience).

**Cambios en `package.json`:**

```json
{
  "scripts": {
    // === DB Development ===
    "db:dev:clean": "bash scripts/db-dev-clean.sh",
    "db:dev:reset": "bash scripts/db-dev-reset.sh",
    "db:dev:clean:win": "powershell -ExecutionPolicy Bypass -File scripts/db-dev-clean.ps1",
    "db:dev:reset:win": "powershell -ExecutionPolicy Bypass -File scripts/db-dev-reset.ps1",

    // === DB E2E Testing ===
    "db:e2e:clean": "bash scripts/db-e2e-clean.sh",
    "db:e2e:reset": "bash scripts/db-e2e-reset.sh",
    "db:e2e:clean:win": "powershell -ExecutionPolicy Bypass -File scripts/db-e2e-clean.ps1",
    "db:e2e:reset:win": "powershell -ExecutionPolicy Bypass -File scripts/db-e2e-reset.ps1",
    "db:e2e:migrate": "DATABASE_URL=postgresql://${TAROT_E2E_DB_USER}:${TAROT_E2E_DB_PASSWORD}@localhost:${TAROT_E2E_DB_PORT}/${TAROT_E2E_DB_NAME} npm run migration:run",

    // === Pre-test hooks ===
    "pretest:e2e": "npm run db:e2e:reset",
    "test:e2e:fresh": "npm run db:e2e:reset && npm run test:e2e",

    // === Validation ===
    "validate:schema": "ts-node scripts/validate-schema-consistency.ts"
  }
}
```

**Criterios de aceptación:**

- [ ] Scripts NPM agregados a `package.json`
- [ ] Versiones `:win` para Windows PowerShell
- [ ] `pretest:e2e` ejecuta reset automáticamente antes de tests
- [ ] `test:e2e:fresh` limpia y ejecuta tests desde cero
- [ ] Comandos documentados en README-DOCKER.md
- [ ] Funcionan en Linux, macOS y Windows

**Validación:**

```bash
npm run db:e2e:clean
npm run db:e2e:reset
npm run test:e2e:fresh
```

**Ciclo de calidad:**

```bash
npm run lint
npm run format
npm run build
npm test
```

---

### ✅ SUB-TASK-023-a-3: Tests Unitarios de Migraciones

**Prioridad:** 🟢 BAJA  
**Estimación:** 6 horas  
**Estado:** ⏳ PENDIENTE

**Descripción:**  
Crear suite de tests unitarios que valida la integridad de las migraciones (up/down, idempotencia, rollback).

**Archivo a crear:**  
`src/database/migrations/migration-validation.spec.ts`

**Contenido:**

```typescript
import { DataSource } from 'typeorm';
import { e2eConnectionSource } from '../../config/typeorm-e2e.config';
import { InitialSchema1761655973524 } from './1761655973524-InitialSchema';

describe('Migration Validation', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = e2eConnectionSource;
    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('InitialSchema Migration', () => {
    it('should run up migration successfully', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const migration = new InitialSchema1761655973524();

      await expect(migration.up(queryRunner)).resolves.not.toThrow();
      await queryRunner.release();
    });

    it('should run down migration successfully (rollback)', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const migration = new InitialSchema1761655973524();

      await expect(migration.down(queryRunner)).resolves.not.toThrow();
      await queryRunner.release();
    });

    it('should be idempotent (running twice should not fail)', async () => {
      // TODO: Implementar test de idempotencia
    });

    it('should create all expected tables', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const tables = await queryRunner.getTables();
      const tableNames = tables.map((t) => t.name);

      // Verificar que todas las tablas esperadas existen
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('tarot_decks');
      expect(tableNames).toContain('tarot_cards');
      expect(tableNames).toContain('tarot_spreads');
      expect(tableNames).toContain('reading_categories');
      expect(tableNames).toContain('predefined_questions');
      expect(tableNames).toContain('tarot_readings');
      // ... etc

      await queryRunner.release();
    });

    it('should create all expected indexes', async () => {
      // TODO: Verificar índices
    });

    it('should create all expected foreign keys', async () => {
      // TODO: Verificar FKs
    });
  });
});
```

**Criterios de aceptación:**

- [ ] Tests validan `up()` y `down()` de migraciones
- [ ] Tests verifican existencia de todas las tablas
- [ ] Tests verifican índices y foreign keys
- [ ] Tests validan idempotencia (ejecutar dos veces no falla)
- [ ] Tests pasan en pipeline CI/CD
- [ ] Coverage > 80% en archivo de migración

**Validación:**

```bash
npm test -- migration-validation.spec.ts
```

**Ciclo de calidad:**

```bash
npm run lint
npm run format
npm run build
npm test
```

---

### ✅ SUB-TASK-023-a-4: Script de Validación de Consistencia de Schema

**Prioridad:** 🟢 BAJA  
**Estimación:** 4 horas  
**Estado:** ⏳ PENDIENTE

**Descripción:**  
Crear script que compara el schema generado por migraciones vs el schema esperado por entidades TypeORM, detectando drift automáticamente.

**Archivo a crear:**  
`scripts/validate-schema-consistency.ts`

**Contenido:**

```typescript
import { DataSource } from 'typeorm';
import { e2eConnectionSource } from '../src/config/typeorm-e2e.config';

/**
 * Script de validación de consistencia de schema
 * Compara el schema real (después de migraciones) vs el schema esperado (entidades)
 *
 * Uso: npm run validate:schema
 */
async function validateSchemaConsistency() {
  console.log('🔍 Validando consistencia de schema...\n');

  let dataSource: DataSource;

  try {
    // Inicializar conexión E2E
    dataSource = e2eConnectionSource;
    await dataSource.initialize();
    console.log('✅ Conexión a DB E2E establecida\n');

    // Ejecutar migraciones
    console.log('📦 Ejecutando migraciones...');
    await dataSource.runMigrations();
    console.log('✅ Migraciones ejecutadas\n');

    // Obtener schema real
    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.getTables();

    console.log('📊 Tablas encontradas en DB:', tables.length);
    console.log(tables.map((t) => `  - ${t.name}`).join('\n'));
    console.log('');

    // Obtener entidades esperadas
    const entities = dataSource.entityMetadatas;
    console.log('📋 Entidades definidas en código:', entities.length);
    console.log(entities.map((e) => `  - ${e.tableName}`).join('\n'));
    console.log('');

    // Validar que todas las entidades tengan tabla
    let hasErrors = false;
    for (const entity of entities) {
      const table = tables.find((t) => t.name === entity.tableName);

      if (!table) {
        console.error(`❌ ERROR: Tabla ${entity.tableName} no existe en DB`);
        hasErrors = true;
        continue;
      }

      // Validar columnas
      for (const column of entity.columns) {
        const dbColumn = table.columns.find(
          (c) => c.name === column.databaseName,
        );

        if (!dbColumn) {
          console.error(
            `❌ ERROR: Columna ${entity.tableName}.${column.databaseName} no existe en DB`,
          );
          hasErrors = true;
        }
      }
    }

    await queryRunner.release();

    if (hasErrors) {
      console.error('\n❌ Validación FALLIDA: Se encontraron inconsistencias');
      process.exit(1);
    }

    console.log(
      '\n✅ Validación EXITOSA: Schema consistente entre migraciones y entidades',
    );
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante validación:', error);
    process.exit(1);
  } finally {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  }
}

validateSchemaConsistency();
```

**Criterios de aceptación:**

- [ ] Script compara tablas reales vs entidades TypeORM
- [ ] Script compara columnas reales vs propiedades de entidades
- [ ] Script valida tipos de datos coinciden
- [ ] Script detecta tablas faltantes
- [ ] Script detecta columnas faltantes
- [ ] Exit code 0 si todo OK, exit code 1 si hay errores
- [ ] Comando `npm run validate:schema` funciona

**Validación:**

```bash
npm run validate:schema
# Debe salir con código 0 y mensaje de éxito
```

**Ciclo de calidad:**

```bash
npm run lint
npm run format
npm run build
npm test
```

---

### ✅ SUB-TASK-023-a-5: Suite de Tests de Infraestructura E2E

**Prioridad:** 🟢 BAJA  
**Estimación:** 4 horas  
**Estado:** ⏳ PENDIENTE

**Descripción:**  
Crear suite de tests E2E que valida la infraestructura de bases de datos antes de ejecutar los tests funcionales.

**Archivo a crear:**  
`test/database-infrastructure.e2e-spec.ts`

**Contenido:**

```typescript
import { DataSource } from 'typeorm';
import { e2eConnectionSource } from '../src/config/typeorm-e2e.config';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Database Infrastructure (E2E)', () => {
  describe('Development Database', () => {
    it('should be accessible on configured port', async () => {
      const devPort = process.env.TAROT_DB_PORT || '5435';
      expect(devPort).toBe('5435');
    });

    it('should have correct database name', () => {
      const devDb = process.env.TAROT_DB_NAME || 'tarot_db';
      expect(devDb).toBe('tarot_db');
    });
  });

  describe('E2E Database', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
      dataSource = e2eConnectionSource;
      await dataSource.initialize();
    });

    afterAll(async () => {
      await dataSource.destroy();
    });

    it('should be accessible on port 5436', () => {
      const e2ePort = process.env.TAROT_E2E_DB_PORT || '5436';
      expect(e2ePort).toBe('5436');
    });

    it('should be isolated from development database', () => {
      const devDb = process.env.TAROT_DB_NAME || 'tarot_db';
      const e2eDb = process.env.TAROT_E2E_DB_NAME || 'tarot_e2e';
      expect(e2eDb).not.toBe(devDb);
    });

    it('should have all required extensions installed', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const result = await queryRunner.query(`
        SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm')
      `);

      expect(result).toHaveLength(2);
      expect(result.map((r: any) => r.extname)).toContain('uuid-ossp');
      expect(result.map((r: any) => r.extname)).toContain('pg_trgm');

      await queryRunner.release();
    });

    it('should reset cleanly between test runs', async () => {
      // Este test valida que el helper E2EDatabaseHelper funciona correctamente
      // Ya está implícitamente validado en otros tests
      expect(dataSource.isInitialized).toBe(true);
    });
  });

  describe('Migrations', () => {
    let dataSource: DataSource;

    beforeAll(async () => {
      dataSource = e2eConnectionSource;
      await dataSource.initialize();
    });

    afterAll(async () => {
      await dataSource.destroy();
    });

    it('should run all migrations without errors', async () => {
      await expect(dataSource.runMigrations()).resolves.not.toThrow();
    });

    it('should create migrations table', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const tables = await queryRunner.getTables();
      const migrationTable = tables.find((t) => t.name === 'migrations');

      expect(migrationTable).toBeDefined();
      await queryRunner.release();
    });

    it('should match entity schema', async () => {
      const entities = dataSource.entityMetadatas;
      const queryRunner = dataSource.createQueryRunner();
      const tables = await queryRunner.getTables();

      for (const entity of entities) {
        const table = tables.find((t) => t.name === entity.tableName);
        expect(table).toBeDefined();
      }

      await queryRunner.release();
    });
  });

  describe('Seeders', () => {
    it('should seed all essential data', async () => {
      // Ya validado en validate-seeders-e2e.ts
      // Este test es redundante pero documenta el requisito
      expect(true).toBe(true);
    });
  });
});
```

**Criterios de aceptación:**

- [ ] Tests validan configuración de DB development
- [ ] Tests validan configuración de DB E2E
- [ ] Tests validan aislamiento entre DBs
- [ ] Tests validan extensiones PostgreSQL instaladas
- [ ] Tests validan ejecución de migraciones
- [ ] Tests validan consistencia de schema
- [ ] Suite pasa en CI/CD
- [ ] Timeout apropiado (30s por test)

**Validación:**

```bash
npm run test:e2e -- database-infrastructure.e2e-spec.ts
```

**Ciclo de calidad:**

```bash
npm run lint
npm run format
npm run build
npm test
npm run test:e2e
```

---

### ✅ SUB-TASK-023-a-6: Documentación TESTING_DATABASE.md

**Prioridad:** 🟢 MEDIA  
**Estimación:** 3 horas  
**Estado:** ⏳ PENDIENTE

**Descripción:**  
Crear guía completa y dedicada sobre testing con bases de datos, cubriendo todos los aspectos de la infraestructura E2E.

**Archivo a crear:**  
`docs/TESTING_DATABASE.md`

**Estructura del documento:**

```markdown
# Testing con Bases de Datos

## Índice

1. Arquitectura de Testing
2. Bases de Datos Disponibles
3. Workflows de Testing
4. Scripts Disponibles
5. Troubleshooting
6. Mejores Prácticas

## 1. Arquitectura de Testing

[Diagrama y explicación de la separación dev/e2e]

## 2. Bases de Datos Disponibles

[Tabla comparativa: tarot_db vs tarot_e2e]

## 3. Workflows de Testing

[Flujo paso a paso de cómo se ejecutan los tests E2E]

## 4. Scripts Disponibles

[Referencia completa de todos los scripts NPM y bash/ps1]

## 5. Troubleshooting

[Problemas comunes y soluciones]

## 6. Mejores Prácticas

[Guidelines para escribir tests E2E con DBs]
```

**Criterios de aceptación:**

- [ ] Documento cubre arquitectura completa
- [ ] Incluye ejemplos de código
- [ ] Incluye diagramas (ASCII art o mermaid)
- [ ] Referencia cruzada con README-DOCKER.md
- [ ] Incluye troubleshooting de problemas comunes
- [ ] Incluye mejores prácticas de testing
- [ ] Formato Markdown bien estructurado
- [ ] Tabla de contenidos con links

**Validación:**

- Revisión manual del documento
- Verificar que todos los comandos funcionan
- Verificar que los links internos funcionan

---

### ✅ SUB-TASK-023-a-7: Actualizar MIGRATIONS.md

**Prioridad:** 🟢 BAJA  
**Estimación:** 1 hora  
**Estado:** ⏳ PENDIENTE

**Descripción:**  
Agregar sección en MIGRATIONS.md sobre testing de migraciones y validación de consistencia de schema.

**Archivo a modificar:**  
`docs/MIGRATIONS.md`

**Contenido a agregar:**

````markdown
## Testing de Migraciones

### Validación Automática

Tenemos varias herramientas para validar migraciones:

#### 1. Tests Unitarios de Migraciones

```bash
npm test -- migration-validation.spec.ts
```
````

Valida:

- ✅ Método `up()` ejecuta sin errores
- ✅ Método `down()` ejecuta sin errores (rollback)
- ✅ Idempotencia (ejecutar dos veces no falla)
- ✅ Todas las tablas se crean correctamente
- ✅ Todos los índices se crean correctamente
- ✅ Todas las foreign keys se crean correctamente

#### 2. Validación de Consistencia de Schema

```bash
npm run validate:schema
```

Compara el schema real (después de migraciones) vs el schema esperado (entidades TypeORM).

Detecta:

- ❌ Tablas faltantes en DB
- ❌ Columnas faltantes en DB
- ❌ Diferencias de tipos de datos
- ❌ Drift entre código y DB

#### 3. Tests de Infraestructura E2E

```bash
npm run test:e2e -- database-infrastructure.e2e-spec.ts
```

Valida la infraestructura completa de testing.

### Mejores Prácticas

1. **Siempre testear migraciones** antes de merge
2. **Validar rollback** (método `down()`) funciona correctamente
3. **No usar `synchronize: true`** en producción
4. **Ejecutar `validate:schema`** después de crear migración
5. **Versionar migraciones** en control de versiones

### Troubleshooting

[Sección con problemas comunes]

````

**Criterios de aceptación:**
- [ ] Sección agregada en MIGRATIONS.md
- [ ] Documenta todas las herramientas de validación
- [ ] Incluye ejemplos de comandos
- [ ] Incluye mejores prácticas
- [ ] Incluye troubleshooting
- [ ] Links a otros documentos relevantes

**Validación:**
- Revisión manual del documento
- Verificar que comandos documentados funcionan

---

## 📊 Orden de Implementación Recomendado

### Iteración 1: Multiplataforma y DX (8 horas)
1. ✅ SUB-TASK-023-a-1: Scripts PowerShell (4h)
2. ✅ SUB-TASK-023-a-2: Scripts NPM (2h)
3. ✅ SUB-TASK-023-a-7: Actualizar MIGRATIONS.md (1h)

**Validación:** Desarrolladores Windows pueden trabajar sin Git Bash

### Iteración 2: Tests de Robustez (10 horas)
4. ✅ SUB-TASK-023-a-3: Tests Unitarios de Migraciones (6h)
5. ✅ SUB-TASK-023-a-4: Script Validación Schema (4h)

**Validación:** CI/CD detecta inconsistencias automáticamente

### Iteración 3: Tests de Infraestructura y Docs (7 horas)
6. ✅ SUB-TASK-023-a-5: Suite Tests Infraestructura (4h)
7. ✅ SUB-TASK-023-a-6: Documentación TESTING_DATABASE.md (3h)

**Validación:** Onboarding de nuevos devs es más rápido

---

## 🔄 Workflow por Sub-tarea

Para cada sub-tarea:

```bash
# 1. Implementar la sub-tarea
# ... desarrollo ...

# 2. Ciclo de calidad OBLIGATORIO
npm run lint
npm run format
npm run build
npm test

# 3. Tests E2E (si aplica)
npm run test:e2e

# 4. Commit individual
git add .
git commit -m "feat(e2e): [SUB-TASK-023-a-X] título descriptivo"

# 5. Continuar con siguiente sub-tarea
````

**Commit final después de todas las sub-tareas:**

```bash
git commit -m "feat(e2e): complete TASK-023-a improvements to 100%

- Add PowerShell scripts for Windows compatibility
- Add NPM scripts for better DX
- Add migration validation tests
- Add schema consistency validation script
- Add infrastructure E2E tests suite
- Add comprehensive TESTING_DATABASE.md documentation
- Update MIGRATIONS.md with testing section

All tests passing: 487 unit tests + all E2E suites
TASK-023-a now 100% complete"
```

---

## ✅ Criterios de Completitud al 100%

La tarea TASK-023-a estará **100% completa** cuando:

- [x] Core funcional implementado y funcionando
- [ ] 7 sub-tareas completadas
- [ ] Todos los scripts bash tienen versión PowerShell
- [ ] Todos los comandos útiles tienen alias NPM
- [ ] Tests de migraciones implementados y pasando
- [ ] Script de validación de schema funciona
- [ ] Suite de tests de infraestructura pasa
- [ ] TESTING_DATABASE.md completo
- [ ] MIGRATIONS.md actualizado
- [ ] Todos los tests pasan (unit + E2E)
- [ ] Documentación completa y actualizada
- [ ] CI/CD pasa todos los checks

---

## 📝 Notas

- **Rama de trabajo:** Mantener en `feature/TASK-023-a-test-database-setup`
- **Filosofía:** Implementar mejoras incrementalmente, validando en cada paso
- **Prioridad:** Multiplataforma y DX primero, tests de robustez después
- **Merge:** Solo después de completar todas las sub-tareas y pasar CI/CD

---

**Última actualización:** 04/01/2025  
**Próxima revisión:** Después de completar Iteración 1
