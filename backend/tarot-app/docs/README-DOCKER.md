# 🔮 Tarot - Docker Setup Guide

Configuración completa de Docker para el desarrollo local de Tarot Backend.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Migración desde Nomenclatura Antigua](#-migración-desde-nomenclatura-antigua)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración Inicial](#-configuración-inicial)
- [Sistema de Migraciones](#-sistema-de-migraciones)
- [Comandos Útiles](#-comandos-útiles)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Conexión desde NestJS](#-conexión-desde-nestjs)
- [Base de Datos de Testing E2E](#-base-de-datos-de-testing-e2e)
- [Troubleshooting](#-troubleshooting)
- [Mantenimiento](#-mantenimiento)

---

## ✨ Características

Esta configuración Docker proporciona:

- ✅ **PostgreSQL 16** con persistencia de datos
- ✅ **pgAdmin 4** para gestión visual de la base de datos (opcional)
- ✅ **Nombres descriptivos** para evitar confusión con otros proyectos
- ✅ **Puerto personalizado (5435)** para desarrollo y **5436** para E2E tests
- ✅ **Health checks** automáticos
- ✅ **Inicialización automática** con extensiones necesarias
- ✅ **Network aislada** para servicios de Tarot
- ✅ **Base de datos dedicada para tests E2E** (aislada de desarrollo)

**Identificadores únicos (Desarrollo):**

- Contenedor PostgreSQL: `tarot-postgres-db`
- Contenedor pgAdmin: `tarot-pgadmin`
- Volume de datos: `tarot-postgres-data`
- Network: `tarot-network`
- DB: `tarot_db`
- User: `tarot_user`

**Identificadores únicos (Testing E2E):**

- Contenedor PostgreSQL: `tarot-postgres-e2e-db`
- Volume de datos: `tarot-postgres-e2e-data`
- DB: `tarot_e2e`
- User: `tarot_e2e_user`

---

## 🔄 Migración desde Nomenclatura Antigua

Si vienes de una versión anterior que usaba `tarot-*`:

### ¿Por qué el cambio?

La nomenclatura se actualizó de `tarot-*` a `tarot-*` para mantener consistencia con el contenedor principal `tarot-app` y tener una nomenclatura más limpia y profesional.

### Pasos para migrar

1. **Ejecutar script de migración:**

   ```bash
   bash scripts/migrate-docker-nomenclature.sh
   ```

   Este script:

   - ✅ Crea backup automático de tus datos
   - ✅ Muestra el estado actual de recursos Docker
   - ✅ Proporciona instrucciones claras para continuar

2. **Actualizar archivo `.env`:**

   Renombrar variables con prefijo `TAROT_` en lugar de `TAROT_`:

   ```bash
   # ANTES
   TAROT_DB_PORT=5435
   TAROT_DB_USER=tarot_user
   TAROT_DB_PASSWORD=...

   # AHORA
   TAROT_DB_PORT=5435
   TAROT_DB_USER=tarot_user
   TAROT_DB_PASSWORD=...
   ```

3. **Levantar nuevos servicios:**

   ```bash
   docker-compose down
   docker-compose up -d tarot-postgres
   ```

4. **Restaurar datos (si es necesario):**

   ```bash
   cat backups/migration-XXXXXX/tarot_db.sql | docker exec -i tarot-postgres-db psql -U tarot_user -d tarot_db
   ```

5. **Verificar que todo funciona:**

   ```bash
   npm run start:dev
   npm run test:e2e
   ```

6. **Limpiar recursos antiguos (opcional):**

   Después de confirmar que todo funciona correctamente:

   ```bash
   bash scripts/cleanup-old-docker-resources.sh
   ```

   Este script requiere confirmación explícita ("SI") antes de eliminar recursos antiguos.

**Notas importantes:**

- ⚠️ Los backups se mantienen incluso después de la limpieza
- ⚠️ Los contenedores antiguos NO se eliminan automáticamente
- ✅ Puedes ejecutar ambas versiones en paralelo durante la transición
- ✅ Rollback posible: los contenedores antiguos siguen disponibles si algo falla

---

## 🔧 Requisitos Previos

1. **Docker Desktop** instalado y corriendo
2. **Git** para clonar el repositorio
3. **Puertos disponibles:**
   - `5435` para PostgreSQL
   - `5050` para pgAdmin (opcional)

### Verificar puertos disponibles

```bash
# Ver contenedores Docker activos
docker ps -a --format "table {{.Names}}\t{{.Ports}}"

# Verificar si el puerto 5435 está libre
netstat -an | grep 5435
```

---

## 🚀 Configuración Inicial

### 1. Crear archivo de variables de entorno

```bash
# Desde el directorio backend/tarot-app/
cp .env.example .env
```

### 2. Editar el archivo `.env` (opcional)

Si necesitas cambiar los valores por defecto, edita `.env`:

```bash
# Ejemplo de configuración personalizada
TAROT_DB_PORT=5435
TAROT_DB_USER=tarot_user
TAROT_DB_PASSWORD=mi_password_super_seguro
TAROT_DB_NAME=tarot_db
```

### 3. Iniciar los servicios Docker

**Opción A: Solo PostgreSQL**

```bash
docker-compose up -d tarot-postgres
```

**Opción B: PostgreSQL + pgAdmin**

```bash
docker-compose --profile tools up -d
```

### 4. Verificar que los contenedores están corriendo

```bash
docker ps --filter "name=tarotflavia"
```

Deberías ver algo como:

```
CONTAINER ID   IMAGE                    STATUS                    PORTS                    NAMES
abc123def456   postgres:16-alpine       Up 30 seconds (healthy)   0.0.0.0:5435->5432/tcp   tarot-postgres-db
xyz789ghi012   dpage/pgadmin4:latest    Up 29 seconds             0.0.0.0:5050->80/tcp     tarot-pgadmin
```

---

## 💻 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Iniciar solo PostgreSQL
docker-compose up -d tarot-postgres

# Iniciar con pgAdmin
docker-compose --profile tools up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA TODOS LOS DATOS)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de PostgreSQL
docker-compose logs -f tarot-postgres

# Reiniciar servicios
docker-compose restart
```

### Inspección y Debugging

```bash
# Ver estado de salud de PostgreSQL
docker inspect tarot-postgres-db --format='{{.State.Health.Status}}'

# Conectar a PostgreSQL desde línea de comandos
docker exec -it tarot-postgres-db psql -U tarot_user -d tarot_db

# Ejecutar comandos SQL directamente
docker exec -it tarot-postgres-db psql -U tarot_user -d tarot_db -c "SELECT version();"

# Ver variables de entorno del contenedor
docker exec tarot-postgres-db env

# Abrir shell en el contenedor
docker exec -it tarot-postgres-db sh
```

### Gestión de Volúmenes

```bash
# Listar volúmenes de Tarot
docker volume ls --filter "name=tarotflavia"

# Ver detalles del volumen de datos
docker volume inspect tarot-postgres-data

# Backup de la base de datos
docker exec tarot-postgres-db pg_dump -U tarot_user tarot_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup
cat backup_20241027_120000.sql | docker exec -i tarot-postgres-db psql -U tarot_user -d tarot_db
```

### Limpieza

```bash
# Eliminar solo el contenedor (mantiene datos)
docker rm -f tarot-postgres-db

# Eliminar contenedor y volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Eliminar imágenes no usadas
docker image prune -a

# Limpieza completa de Docker (⚠️ AFECTA TODOS LOS PROYECTOS)
docker system prune -a --volumes
```

---

## 📁 Estructura de Archivos

```
backend/tarot-app/
├── docker-compose.yml              # Configuración de servicios Docker
├── .env.example                     # Template de variables de entorno
├── .env                             # Variables de entorno (NO COMMITEAR)
├── docker/
│   └── postgres/
│       └── init/
│           └── 01-init-database.sh  # Script de inicialización automática
└── README-DOCKER.md                 # Este archivo
```

---

## 🧪 Base de Datos de Testing E2E

Este proyecto incluye una **base de datos PostgreSQL dedicada para tests E2E**, completamente aislada del entorno de desarrollo.

### Características

- ✅ **Puerto 5436** (diferente del desarrollo en 5435)
- ✅ **Profile Docker `e2e`** para iniciar solo cuando sea necesario
- ✅ **E2EDatabaseHelper** para gestión automática del ciclo de vida
- ✅ **Seeders** para datos de prueba consistentes
- ✅ **Limpieza automática** entre tests
- ✅ **Aislamiento completo** del entorno de desarrollo

### Iniciar E2E Database

```bash
# Iniciar contenedor de E2E (profile: e2e)
docker-compose --profile e2e up -d tarot-postgres-e2e

# Verificar que está corriendo
docker ps --filter "name=tarot-postgres-e2e"
```

### Script de Gestión: `manage-e2e-db.sh`

El proyecto incluye un script bash para gestión completa de la E2E database:

```bash
# Desde backend/tarot-app/
chmod +x scripts/manage-e2e-db.sh

# Ver ayuda
./scripts/manage-e2e-db.sh help

# Iniciar contenedor E2E
./scripts/manage-e2e-db.sh start

# Parar contenedor E2E
./scripts/manage-e2e-db.sh stop

# Limpiar base de datos (DELETE all data)
./scripts/manage-e2e-db.sh clean

# Setup completo: migraciones + seeders
./scripts/manage-e2e-db.sh setup

# Ejecutar tests E2E
./scripts/manage-e2e-db.sh test

# Verificar estado
./scripts/manage-e2e-db.sh status

# Resetear completamente (clean + setup)
./scripts/manage-e2e-db.sh reset

# Parar y eliminar contenedor
./scripts/manage-e2e-db.sh destroy
```

### Workflow Típico de Testing

```bash
# 1. Iniciar E2E database
./scripts/manage-e2e-db.sh start

# 2. Setup inicial (solo primera vez o después de destroy)
./scripts/manage-e2e-db.sh setup

# 3. Ejecutar tests E2E
npm run test:e2e

# 4. Limpiar datos entre ejecuciones (opcional)
./scripts/manage-e2e-db.sh clean

# 5. Parar cuando termines
./scripts/manage-e2e-db.sh stop
```

### E2EDatabaseHelper Class

Los tests E2E usan la clase `E2EDatabaseHelper` que proporciona:

```typescript
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

const dbHelper = new E2EDatabaseHelper();

// En beforeAll
await dbHelper.initialize();
await dbHelper.cleanDatabase();

// En tests
const dataSource = dbHelper.getDataSource();
await dataSource.query('SELECT ...');

// En afterAll
await dbHelper.close();
```

**Ventajas:**

- ✅ Conexión automática a E2E database (puerto 5436)
- ✅ Limpieza de datos entre tests
- ✅ Gestión segura del ciclo de vida
- ✅ Seeders integrados para datos de prueba

### Datos de Prueba (Seeders)

La E2E database se inicializa con datos consistentes:

- 6 categorías de lectura
- 1 mazo de tarot (Rider-Waite)
- 78 cartas de tarot completas
- 4 tipos de tiradas (spreads)
- 42 preguntas predefinidas
- 3 usuarios de prueba:
  - `admin@test.com` (Admin, plan Premium)
  - `premium@test.com` (Premium user)
  - `free@test.com` (Free user)
  - Contraseña para todos: `Test123456!`

### Troubleshooting E2E Database

**❌ Puerto 5436 ya en uso:**

```bash
# Ver qué proceso usa el puerto
netstat -ano | grep 5436

# Cambiar puerto en docker-compose.yml o .env
```

**❌ Tests fallan por datos inconsistentes:**

```bash
# Resetear E2E database completamente
./scripts/manage-e2e-db.sh reset

# Volver a ejecutar tests
npm run test:e2e
```

**❌ Contenedor E2E no se levanta:**

```bash
# Ver logs del contenedor
docker logs tarot-postgres-e2e-db

# Verificar que no hay conflictos
docker ps -a --filter "name=tarot"

# Recrear contenedor
./scripts/manage-e2e-db.sh destroy
./scripts/manage-e2e-db.sh start
./scripts/manage-e2e-db.sh setup
```

---

## 🔌 Conexión desde NestJS

### Opción 1: Usar la URL de conexión completa

En tu archivo `.env` de NestJS:

```env
DATABASE_URL=postgresql://tarot_user:tarot_secure_password_2024@localhost:5435/tarot_db
```

### Opción 2: Usar configuración TypeORM individual

En `src/config/typeorm.ts`:

```typescript
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('TAROT_DB_HOST', 'localhost'),
  port: configService.get('TAROT_DB_PORT_INTERNAL', 5435),
  username: configService.get('TAROT_DB_USERNAME', 'tarot_user'),
  password: configService.get(
    'TAROT_DB_PASSWORD_VALUE',
    'tarot_secure_password_2024',
  ),
  database: configService.get('TAROT_DB_DATABASE', 'tarot_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('TAROT_DB_SYNCHRONIZE', true), // ⚠️ false en producción
  logging: configService.get('TAROT_DB_LOGGING', true),
});
```

### Verificar conexión

```bash
# Desde tu backend NestJS
npm run start:dev

   # Deberías ver en los logs:
   # [TypeORM] Connected to PostgreSQL database: tarot_db
```

---

## 🔄 Sistema de Migraciones

**IMPORTANTE:** Este proyecto usa un sistema de migraciones controlado en lugar de `synchronize: true`.

### ¿Por qué migraciones?

- ✅ Control total sobre cambios de esquema
- ✅ Historial versionado de cambios
- ✅ Capacidad de revertir (rollback)
- ✅ Seguro para producción

### Comandos de Migración

```bash
# Generar migración automática desde cambios en entidades
npm run migration:generate src/migrations/MigrationName

# Crear migración vacía para cambios manuales
npm run migration:create src/migrations/MigrationName

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir última migración
npm run migration:revert

# Ver estado de migraciones
npm run migration:show
```

### Ejemplo: Agregar nuevo campo

1. Modificar entidad:

   ```typescript
   @Column({ nullable: true })
   phoneNumber: string;
   ```

2. Generar migración:

   ```bash
   npm run migration:generate src/migrations/AddUserPhoneNumber
   ```

3. Revisar el archivo generado en `src/migrations/`

4. Ejecutar migración:
   ```bash
   npm run migration:run
   # O simplemente: npm run start:dev (se ejecuta automáticamente)
   ```

### Documentación Completa

Para más información sobre el sistema de migraciones, consulta:
📖 [docs/MIGRATIONS.md](./docs/MIGRATIONS.md)

---

## 🛠️ Troubleshooting

### ❌ Error: Puerto 5435 ya está en uso

**Solución:**

```bash
# Ver qué proceso está usando el puerto
netstat -ano | grep 5435

# Cambiar el puerto en .env
TAROT_DB_PORT=5436  # Usar otro puerto

# Reiniciar servicios
docker-compose down && docker-compose up -d
```

### ❌ Error: Cannot connect to database

**Verificaciones:**

1. **Contenedor está corriendo:**

   ```bash
   docker ps --filter "name=tarot-postgres"
   ```

2. **Health check está OK:**

   ```bash
   docker inspect tarot-postgres-db --format='{{.State.Health.Status}}'
   ```

3. **Logs del contenedor:**

   ```bash
   docker logs tarot-postgres-db --tail 50
   ```

4. **Conexión manual:**
   ```bash
   docker exec -it tarot-postgres-db psql -U tarot_user -d tarot_db
   ```

### ❌ Error: Conflicto con otros contenedores PostgreSQL

Si ves errores como `ecommerce-postgres` o `microservices-postgres`, verifica:

```bash
# Listar TODOS los contenedores PostgreSQL
docker ps -a --filter "ancestor=postgres"

# Ver nombres y puertos
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Tarot usa puerto 5435, otros proyectos usan:
# - ecommerce-postgres: 5432
# - microservices-postgres: 5433
# - go-api-postgres: 5434
```

### ❌ pgAdmin no se conecta a PostgreSQL

**Configuración en pgAdmin (http://localhost:5050):**

1. Login:

   - Email: `admin@tarotflavia.local`
   - Password: `change_me_to_secure_password` (o la que hayas configurado en `.env`)

2. Agregar servidor:
   - Name: `Tarot DB`
   - Host: `tarot-postgres` (⚠️ NO usar `localhost`)
   - Port: `5432` (⚠️ Puerto interno, NO 5435)
   - Username: `tarot_user`
   - Password: `tarot_secure_password_2024`

**Explicación:** pgAdmin corre dentro de Docker, debe usar el nombre del servicio (`tarot-postgres`) y el puerto interno (`5432`), no el puerto expuesto al host (`5435`).

### ❌ Error: Permission denied en scripts de inicialización

```bash
# Dar permisos de ejecución al script
chmod +x docker/postgres/init/01-init-database.sh

# Reiniciar el contenedor
docker-compose restart tarot-postgres
```

### ❌ Datos corruptos o necesitas empezar de cero

```bash
# ⚠️ ESTO BORRARÁ TODOS LOS DATOS

# 1. Detener servicios
docker-compose down

# 2. Eliminar el volumen
docker volume rm tarot-postgres-data

# 3. Iniciar de nuevo (recreará el volumen vacío)
docker-compose up -d
```

---

## 🧹 Mantenimiento

### Backup Regular

```bash
# Crear directorio de backups
mkdir -p backups

# Backup automático con timestamp
docker exec tarot-postgres-db pg_dump -U tarot_user tarot_db > backups/tarot_backup_$(date +%Y%m%d_%H%M%S).sql

# Comprimir backup
gzip backups/tarot_backup_*.sql
```

### Actualizar PostgreSQL

```bash
# 1. Hacer backup
docker exec tarot-postgres-db pg_dump -U tarot_user tarot_db > backup_before_upgrade.sql

# 2. Cambiar versión en docker-compose.yml
# image: postgres:16-alpine → postgres:17-alpine

# 3. Recrear contenedor
docker-compose down
docker-compose up -d

# 4. Verificar versión
docker exec tarot-postgres-db psql -U tarot_user -d tarot_db -c "SELECT version();"
```

### Monitoreo de Uso

```bash
# Espacio usado por volúmenes
docker system df -v | grep tarotflavia

# Estadísticas del contenedor
docker stats tarot-postgres-db

# Conexiones activas a la base de datos
docker exec tarot-postgres-db psql -U tarot_user -d tarot_db -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Official Image](https://hub.docker.com/_/postgres)
- [pgAdmin Docker Documentation](https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html)
- [NestJS TypeORM Integration](https://docs.nestjs.com/techniques/database)

---

## 🔐 Seguridad

**Para Producción:**

1. ✅ Cambiar contraseñas por defecto
2. ✅ Usar variables de entorno seguras
3. ✅ NO exponer puertos innecesarios
4. ✅ Desactivar pgAdmin en producción
5. ✅ Usar SSL para conexiones a la base de datos
6. ✅ Implementar backups automáticos
7. ✅ Configurar `synchronize: false` en TypeORM

**Para Desarrollo:**

- Los valores por defecto son seguros para desarrollo local
- No es necesario cambiar puertos a menos que haya conflictos
- pgAdmin es útil para debugging y gestión visual

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la sección [Troubleshooting](#-troubleshooting)
2. Verifica los logs: `docker-compose logs -f`
3. Consulta la documentación oficial de PostgreSQL y Docker
4. Abre un issue en el repositorio

---

**¡Happy Coding! 🔮✨**
