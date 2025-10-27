# 🔮 TarotFlavia - Docker Setup Guide

Configuración completa de Docker para el desarrollo local de TarotFlavia Backend.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración Inicial](#-configuración-inicial)
- [Comandos Útiles](#-comandos-útiles)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Conexión desde NestJS](#-conexión-desde-nestjs)
- [Troubleshooting](#-troubleshooting)
- [Mantenimiento](#-mantenimiento)

---

## ✨ Características

Esta configuración Docker proporciona:

- ✅ **PostgreSQL 16** con persistencia de datos
- ✅ **pgAdmin 4** para gestión visual de la base de datos (opcional)
- ✅ **Nombres descriptivos** para evitar confusión con otros proyectos
- ✅ **Puerto personalizado (5435)** para evitar conflictos
- ✅ **Health checks** automáticos
- ✅ **Inicialización automática** con extensiones necesarias
- ✅ **Network aislada** para servicios de TarotFlavia

**Identificadores únicos:**

- Contenedor PostgreSQL: `tarotflavia-postgres-db`
- Contenedor pgAdmin: `tarotflavia-pgadmin`
- Volume de datos: `tarotflavia-postgres-data`
- Network: `tarotflavia-network`

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
TAROTFLAVIA_DB_PORT=5435
TAROTFLAVIA_DB_USER=tarotflavia_user
TAROTFLAVIA_DB_PASSWORD=mi_password_super_seguro
TAROTFLAVIA_DB_NAME=tarotflavia_db
```

### 3. Iniciar los servicios Docker

**Opción A: Solo PostgreSQL**

```bash
docker-compose up -d tarotflavia-postgres
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
abc123def456   postgres:16-alpine       Up 30 seconds (healthy)   0.0.0.0:5435->5432/tcp   tarotflavia-postgres-db
xyz789ghi012   dpage/pgadmin4:latest    Up 29 seconds             0.0.0.0:5050->80/tcp     tarotflavia-pgadmin
```

---

## 💻 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Iniciar solo PostgreSQL
docker-compose up -d tarotflavia-postgres

# Iniciar con pgAdmin
docker-compose --profile tools up -d

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ BORRA TODOS LOS DATOS)
docker-compose down -v

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de PostgreSQL
docker-compose logs -f tarotflavia-postgres

# Reiniciar servicios
docker-compose restart
```

### Inspección y Debugging

```bash
# Ver estado de salud de PostgreSQL
docker inspect tarotflavia-postgres-db --format='{{.State.Health.Status}}'

# Conectar a PostgreSQL desde línea de comandos
docker exec -it tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db

# Ejecutar comandos SQL directamente
docker exec -it tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db -c "SELECT version();"

# Ver variables de entorno del contenedor
docker exec tarotflavia-postgres-db env

# Abrir shell en el contenedor
docker exec -it tarotflavia-postgres-db sh
```

### Gestión de Volúmenes

```bash
# Listar volúmenes de TarotFlavia
docker volume ls --filter "name=tarotflavia"

# Ver detalles del volumen de datos
docker volume inspect tarotflavia-postgres-data

# Backup de la base de datos
docker exec tarotflavia-postgres-db pg_dump -U tarotflavia_user tarotflavia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup
cat backup_20241027_120000.sql | docker exec -i tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db
```

### Limpieza

```bash
# Eliminar solo el contenedor (mantiene datos)
docker rm -f tarotflavia-postgres-db

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

## 🔌 Conexión desde NestJS

### Opción 1: Usar la URL de conexión completa

En tu archivo `.env` de NestJS:

```env
DATABASE_URL=postgresql://tarotflavia_user:tarotflavia_secure_password_2024@localhost:5435/tarotflavia_db
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
  host: configService.get('TAROTFLAVIA_DB_HOST', 'localhost'),
  port: configService.get('TAROTFLAVIA_DB_PORT_INTERNAL', 5435),
  username: configService.get('TAROTFLAVIA_DB_USERNAME', 'tarotflavia_user'),
  password: configService.get(
    'TAROTFLAVIA_DB_PASSWORD_VALUE',
    'tarotflavia_secure_password_2024',
  ),
  database: configService.get('TAROTFLAVIA_DB_DATABASE', 'tarotflavia_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('TAROTFLAVIA_DB_SYNCHRONIZE', true), // ⚠️ false en producción
  logging: configService.get('TAROTFLAVIA_DB_LOGGING', true),
});
```

### Verificar conexión

```bash
# Desde tu backend NestJS
npm run start:dev

# Deberías ver en los logs:
# [TypeORM] Connected to PostgreSQL database: tarotflavia_db
```

---

## 🛠️ Troubleshooting

### ❌ Error: Puerto 5435 ya está en uso

**Solución:**

```bash
# Ver qué proceso está usando el puerto
netstat -ano | grep 5435

# Cambiar el puerto en .env
TAROTFLAVIA_DB_PORT=5436  # Usar otro puerto

# Reiniciar servicios
docker-compose down && docker-compose up -d
```

### ❌ Error: Cannot connect to database

**Verificaciones:**

1. **Contenedor está corriendo:**

   ```bash
   docker ps --filter "name=tarotflavia-postgres"
   ```

2. **Health check está OK:**

   ```bash
   docker inspect tarotflavia-postgres-db --format='{{.State.Health.Status}}'
   ```

3. **Logs del contenedor:**

   ```bash
   docker logs tarotflavia-postgres-db --tail 50
   ```

4. **Conexión manual:**
   ```bash
   docker exec -it tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db
   ```

### ❌ Error: Conflicto con otros contenedores PostgreSQL

Si ves errores como `ecommerce-postgres` o `microservices-postgres`, verifica:

```bash
# Listar TODOS los contenedores PostgreSQL
docker ps -a --filter "ancestor=postgres"

# Ver nombres y puertos
docker ps --format "table {{.Names}}\t{{.Ports}}"

# TarotFlavia usa puerto 5435, otros proyectos usan:
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
   - Name: `TarotFlavia DB`
   - Host: `tarotflavia-postgres` (⚠️ NO usar `localhost`)
   - Port: `5432` (⚠️ Puerto interno, NO 5435)
   - Username: `tarotflavia_user`
   - Password: `tarotflavia_secure_password_2024`

**Explicación:** pgAdmin corre dentro de Docker, debe usar el nombre del servicio (`tarotflavia-postgres`) y el puerto interno (`5432`), no el puerto expuesto al host (`5435`).

### ❌ Error: Permission denied en scripts de inicialización

```bash
# Dar permisos de ejecución al script
chmod +x docker/postgres/init/01-init-database.sh

# Reiniciar el contenedor
docker-compose restart tarotflavia-postgres
```

### ❌ Datos corruptos o necesitas empezar de cero

```bash
# ⚠️ ESTO BORRARÁ TODOS LOS DATOS

# 1. Detener servicios
docker-compose down

# 2. Eliminar el volumen
docker volume rm tarotflavia-postgres-data

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
docker exec tarotflavia-postgres-db pg_dump -U tarotflavia_user tarotflavia_db > backups/tarotflavia_backup_$(date +%Y%m%d_%H%M%S).sql

# Comprimir backup
gzip backups/tarotflavia_backup_*.sql
```

### Actualizar PostgreSQL

```bash
# 1. Hacer backup
docker exec tarotflavia-postgres-db pg_dump -U tarotflavia_user tarotflavia_db > backup_before_upgrade.sql

# 2. Cambiar versión en docker-compose.yml
# image: postgres:16-alpine → postgres:17-alpine

# 3. Recrear contenedor
docker-compose down
docker-compose up -d

# 4. Verificar versión
docker exec tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db -c "SELECT version();"
```

### Monitoreo de Uso

```bash
# Espacio usado por volúmenes
docker system df -v | grep tarotflavia

# Estadísticas del contenedor
docker stats tarotflavia-postgres-db

# Conexiones activas a la base de datos
docker exec tarotflavia-postgres-db psql -U tarotflavia_user -d tarotflavia_db -c "SELECT count(*) FROM pg_stat_activity;"
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
