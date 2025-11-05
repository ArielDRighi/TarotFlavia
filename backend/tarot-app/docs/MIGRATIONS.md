# Sistema de Migraciones de Base de Datos

## Descripción General

Este documento describe el sistema de migraciones de base de datos implementado para TarotFlavia Backend. Hemos migrado de usar `synchronize: true` de TypeORM a un sistema controlado de migraciones para mayor control y seguridad en los cambios del esquema de base de datos.

## ¿Por qué Migraciones?

### Problemas con `synchronize: true`:

- **Peligroso en producción**: Puede causar pérdida de datos
- **No versionado**: Cambios no rastreables
- **No reversible**: Imposible deshacer cambios
- **Impredecible**: Comportamiento inconsistente entre entornos

### Ventajas de las Migraciones:

- ✅ **Control total**: Cada cambio es explícito y revisable
- ✅ **Versionado**: Historial completo de cambios de esquema
- ✅ **Reversible**: Capacidad de revertir cambios (rollback)
- ✅ **Predecible**: Mismo comportamiento en todos los entornos
- ✅ **Seguro**: Reduce riesgo de pérdida de datos
- ✅ **Auditable**: Registro completo de modificaciones

## Estructura de Archivos

```
src/
├── config/
│   ├── typeorm.ts           # Configuración TypeORM para NestJS
│   └── data-source.ts       # DataSource para CLI de migraciones
└── migrations/
    └── TIMESTAMP-MigrationName.ts  # Archivos de migración
```

## Configuración

### Variables de Entorno

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5435
POSTGRES_USER=tarotflavia_user
POSTGRES_PASSWORD=tarotflavia_secure_password_2024
POSTGRES_DB=tarotflavia_db
```

### Configuración TypeORM

- `synchronize: false` - Desactivado para evitar cambios automáticos
- `migrationsRun: true` - Ejecuta migraciones automáticamente al iniciar
- `migrations: [...]` - Ruta a los archivos de migración

## Scripts Disponibles

### Generar una nueva migración

Genera automáticamente una migración basada en los cambios detectados en las entidades:

```bash
npm run migration:generate src/migrations/MigrationName
```

**Ejemplo:**

```bash
npm run migration:generate src/migrations/AddUserPhoneNumber
```

### Crear una migración vacía

Crea un archivo de migración vacío para escribir cambios manualmente:

```bash
npm run migration:create src/migrations/MigrationName
```

**Uso:** Para cambios complejos o scripts de datos personalizados.

### Ejecutar migraciones pendientes

Ejecuta todas las migraciones que aún no se han aplicado:

```bash
npm run migration:run
```

**Nota:** Este comando se ejecuta automáticamente al iniciar la aplicación debido a `migrationsRun: true`.

### Revertir la última migración

Revierte la última migración aplicada:

```bash
npm run migration:revert
```

**¡CUIDADO!** Esto puede resultar en pérdida de datos. Úsalo solo en desarrollo o con respaldo.

### Ver estado de migraciones

Muestra qué migraciones han sido ejecutadas:

```bash
npm run migration:show
```

## Flujo de Trabajo

### 1. Modificar Entidades

Realiza cambios en tus archivos de entidades (`.entity.ts`):

```typescript
// Ejemplo: Agregar nuevo campo a User
@Column({ nullable: true })
phoneNumber: string;
```

### 2. Generar Migración

```bash
npm run migration:generate src/migrations/AddUserPhoneNumber
```

TypeORM comparará las entidades con el esquema actual y generará automáticamente el código de migración.

### 3. Revisar Migración Generada

Abre el archivo generado en `src/migrations/` y verifica:

- ✅ Método `up()` tiene los cambios correctos
- ✅ Método `down()` revierte correctamente los cambios
- ✅ No hay queries peligrosas (DROP TABLE sin protección, etc.)

### 4. Ejecutar Migración

En desarrollo:

```bash
npm run migration:run
```

O simplemente inicia la aplicación (se ejecuta automáticamente):

```bash
npm run start:dev
```

### 5. Confirmar Cambios

Verifica en la base de datos que los cambios se aplicaron correctamente:

```bash
# Conectarse a PostgreSQL
docker exec -it tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db

# Ver estructura de tabla
\d user
```

### 6. Commit al Repositorio

```bash
git add src/migrations/
git commit -m "feat: add phone number to user entity"
```

## Ejemplos Comunes

### Agregar una Nueva Columna

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        ADD "phoneNumber" character varying
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "user"
        DROP COLUMN "phoneNumber"
    `);
}
```

### Crear una Nueva Tabla

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "user_preferences" (
            "id" SERIAL NOT NULL,
            "theme" character varying NOT NULL DEFAULT 'light',
            "userId" integer NOT NULL,
            CONSTRAINT "PK_..." PRIMARY KEY ("id")
        )
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_preferences"`);
}
```

### Migración de Datos

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    // Primero agregar columna
    await queryRunner.query(`
        ALTER TABLE "user"
        ADD "fullName" character varying
    `);

    // Migrar datos
    await queryRunner.query(`
        UPDATE "user"
        SET "fullName" = "name"
    `);

    // Hacer no nullable
    await queryRunner.query(`
        ALTER TABLE "user"
        ALTER COLUMN "fullName" SET NOT NULL
    `);
}
```

## Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre revisar** las migraciones generadas antes de aplicarlas
2. **Probar migraciones** en desarrollo antes de producción
3. **Escribir migraciones reversibles** siempre que sea posible
4. **Incluir migraciones** en control de versiones
5. **Hacer commits atómicos** con migración + cambio de entidad juntos
6. **Usar transacciones** para cambios complejos
7. **Documentar** migraciones complejas con comentarios

### ❌ DON'T (No Hacer)

1. **No modificar** migraciones ya aplicadas en producción
2. **No usar `synchronize: true`** en producción nunca
3. **No hacer rollback** en producción sin backup
4. **No eliminar** archivos de migración del repositorio
5. **No saltarse** la revisión de migraciones auto-generadas
6. **No hacer** múltiples cambios no relacionados en una migración

## Entornos

### Desarrollo

```bash
# Las migraciones se ejecutan automáticamente al iniciar
npm run start:dev

# O manualmente
npm run migration:run
```

### Testing

```typescript
// Los tests deben ejecutar migraciones antes de las pruebas
beforeAll(async () => {
  await dataSource.runMigrations();
});

afterAll(async () => {
  await dataSource.dropDatabase();
});
```

### Producción

**IMPORTANTE**: En producción:

1. Hacer backup de la base de datos antes de migrar
2. Ejecutar migraciones en ventana de mantenimiento
3. Tener plan de rollback preparado
4. Monitorear logs durante y después de la migración

```bash
# Backup
pg_dump -U user -d database > backup.sql

# Ejecutar migración
npm run migration:run

# Si hay problemas, revertir
npm run migration:revert
```

## Troubleshooting

### Error: "Migration has already been executed"

**Solución:** La migración ya fue aplicada. Verifica con:

```bash
npm run migration:show
```

### Error: "No pending migrations found"

**Solución:** Todas las migraciones están aplicadas. Si hiciste cambios en entidades, genera una nueva migración.

### Error: "Cannot find module"

**Solución:** Asegúrate de que el build esté actualizado:

```bash
npm run build
npm run migration:run
```

### Revertir múltiples migraciones

```bash
# Revertir las últimas 3 migraciones
npm run migration:revert
npm run migration:revert
npm run migration:revert
```

### Sincronizar esquema (solo desarrollo)

Si el esquema está completamente desincronizado:

```bash
# CUIDADO: Esto eliminará todos los datos
docker-compose down -v
docker-compose up -d
npm run migration:run
```

## Recursos

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Database Guide](https://docs.nestjs.com/techniques/database)

## Testing de Migraciones

### Validación Automática

Tenemos varias herramientas para validar migraciones y asegurar la integridad del esquema:

#### 1. Tests Unitarios de Migraciones

```bash
npm test -- migration-validation.spec.ts
```

**Valida:**

- ✅ Método `up()` ejecuta sin errores
- ✅ Método `down()` ejecuta sin errores (rollback)
- ✅ Todas las tablas se crean correctamente
- ✅ Todas las columnas críticas existen
- ✅ Foreign keys están configuradas
- ✅ Extensiones PostgreSQL están instaladas (uuid-ossp)
- ✅ Tabla de migrations existe y tiene registros

**Ubicación:** `src/database/migration-validation.spec.ts`

**Ejemplo de uso:**

```bash
# Ejecutar solo tests de validación de migraciones
npm test -- migration-validation

# Output esperado:
# ✓ should have up and down methods defined
# ✓ should create all core tables
# ✓ should create user table with critical columns
# ✓ should have PostgreSQL uuid-ossp extension enabled
# ✓ should have foreign key constraints on reading table
# ✓ should record migration execution
```

#### 2. Validación de Consistencia de Schema

```bash
npm run validate:schema
```

**Compara** el schema real (después de migraciones) vs el schema esperado (entidades TypeORM).

**Detecta:**

- ❌ Tablas faltantes en DB
- ❌ Columnas faltantes en DB
- ❌ Diferencias de tipos de datos
- ❌ Foreign keys faltantes
- ❌ Drift entre código y DB

**Flujo del script:**

```
1. Conectar a DB E2E
2. Ejecutar migraciones
3. Obtener tablas reales de DB
4. Comparar con entidades TypeORM
5. Reportar errores y warnings
```

**Output esperado:**

```
🔍 Validando consistencia de schema...

✅ Conexión a DB E2E establecida

📦 Ejecutando migraciones...
✅ Migraciones ejecutadas

📊 Tablas encontradas en DB: 13
  - user
  - tarot_card
  - tarot_reading
  ...

📋 Entidades definidas en código: 13
  - User
  - TarotCard
  - TarotReading
  ...

============================================================
📊 RESUMEN DE VALIDACIÓN
============================================================
Total de entidades: 13
Total de tablas en DB: 13
Errores encontrados: 0
Advertencias: 0
============================================================

✅ Validación EXITOSA: Schema consistente entre código y DB
```

#### 3. Tests de Infraestructura E2E

```bash
npm run test:e2e -- database-infrastructure.e2e-spec.ts
```

**Valida la infraestructura completa de testing:**

- ✅ Configuración de DB development correcta
- ✅ Configuración de DB E2E correcta
- ✅ Aislamiento entre bases de datos
- ✅ Extensiones PostgreSQL instaladas
- ✅ Ejecución de migraciones sin errores
- ✅ Creación de todas las tablas core
- ✅ Configuración de conexión correcta
- ✅ Variables de entorno correctas

**Ubicación:** `test/database-infrastructure.e2e-spec.ts`

### Workflow Completo de Testing

#### Al crear una nueva migración:

```bash
# 1. Generar migración
npm run migration:generate -- -n FeatureName

# 2. Ejecutar tests unitarios de migraciones
npm test -- migration-validation.spec.ts

# 3. Validar consistencia de schema
npm run validate:schema

# 4. Ejecutar tests E2E de infraestructura
npm run test:e2e -- database-infrastructure

# 5. Ejecutar suite completa E2E
npm run test:e2e

# 6. Si todo pasa, commit
git add src/database/migrations/
git commit -m "feat: add feature migration"
```

#### Antes de merge a main:

```bash
# Pipeline CI debe ejecutar:
npm run lint
npm run format
npm run build
npm test                                    # Incluye migration-validation
npm run validate:schema
npm run test:e2e                            # Incluye database-infrastructure
```

### Mejores Prácticas de Testing

#### ✅ DO (Hacer)

1. **Siempre testear migraciones** antes de commit

   ```bash
   npm test -- migration-validation
   ```

2. **Validar rollback** (método `down()`) funciona correctamente

   ```bash
   npm run migration:revert
   npm run migration:run
   ```

3. **Ejecutar validación de schema** después de crear migración

   ```bash
   npm run validate:schema
   ```

4. **Probar en DB E2E limpia**

   ```bash
   npm run db:e2e:reset
   npm run test:e2e
   ```

5. **Verificar comportamiento idempotente**
   ```bash
   # Ejecutar migraciones dos veces no debe fallar
   npm run migration:run
   npm run migration:run
   ```

#### ❌ DON'T (No Hacer)

1. **No saltarse tests de migraciones** antes de commit
2. **No ignorar warnings** de validación de schema
3. **No testear solo en DB de desarrollo** (usar E2E también)
4. **No commitear migraciones** sin ejecutar suite completa
5. **No modificar migraciones** después de que tests E2E pasen

### Debugging de Migraciones

#### Ver queries SQL ejecutadas:

```typescript
// src/config/typeorm-e2e.config.ts
const e2eConfig: DataSourceOptions = {
  logging: true, // Activar temporalmente
  logger: 'advanced-console',
};
```

#### Inspeccionar DB E2E manualmente:

```bash
# Conectar con psql
docker exec -it tarot-postgres-e2e-db psql -U tarot_e2e_user -d tarot_e2e

# Comandos útiles:
\dt                           # Listar tablas
\d+ users                     # Ver estructura de tabla
SELECT * FROM migrations;     # Ver migraciones ejecutadas
\q                            # Salir
```

#### Ejecutar tests con verbose:

```bash
# Ver output completo de tests
npm test -- migration-validation --verbose

# Ver queries SQL en tests E2E
DEBUG=true npm run test:e2e -- database-infrastructure
```

### Integración CI/CD

#### GitHub Actions / GitLab CI

```yaml
test-migrations:
  script:
    - npm ci
    - docker-compose --profile e2e up -d
    - npm run migration:run
    - npm test -- migration-validation
    - npm run validate:schema
    - npm run test:e2e -- database-infrastructure
```

## Referencias

- [TESTING_DATABASE.md](./TESTING_DATABASE.md) - Guía completa de testing con bases de datos
- [README-DOCKER.md](./README-DOCKER.md) - Configuración Docker
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) - Estrategia general de testing

## Historial de Cambios

- **2025-01-04**: Sección de testing agregada (TASK-023-a)
  - Agregados tests unitarios de validación de migraciones
  - Agregado script de validación de consistencia de schema
  - Agregada suite de tests E2E de infraestructura
  - Documentadas mejores prácticas de testing
- **2025-10-28**: Sistema de migraciones implementado (TASK-002)
  - Creada migración inicial `InitialSchema`
  - Desactivado `synchronize: true`
  - Agregados scripts npm para manejo de migraciones
