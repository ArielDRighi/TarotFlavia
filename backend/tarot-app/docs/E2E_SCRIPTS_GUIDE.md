# Guía de Scripts E2E - Base de Datos de Testing

Documentación completa de los scripts de gestión de bases de datos para desarrollo y testing E2E.

## Índice

1. [Scripts de Base de Datos E2E](#1-scripts-de-base-de-datos-e2e)
2. [Scripts de Base de Datos de Desarrollo](#2-scripts-de-base-de-datos-de-desarrollo)
3. [Scripts de Migración Docker](#3-scripts-de-migración-docker)
4. [Scripts NPM](#4-scripts-npm)
5. [Ejemplos de Uso](#5-ejemplos-de-uso)

---

## 1. Scripts de Base de Datos E2E

### `db-e2e-clean.sh` / `db-e2e-clean.ps1`

**Funcionalidad:**
Limpia completamente la base de datos E2E eliminando todos los datos pero manteniendo el esquema (estructura de tablas).

**Qué hace:**

- Verifica que el contenedor Docker `tarot-postgres-e2e-db` esté corriendo
- Ejecuta `DROP SCHEMA public CASCADE` para eliminar todas las tablas
- Recrea el schema público vacío
- Restaura extensiones PostgreSQL necesarias (`uuid-ossp`, `pg_trgm`)

**Cuándo usarlo:**

- Cuando necesitas una base de datos limpia sin datos
- Antes de ejecutar migraciones manualmente
- Para resolver problemas de datos corruptos en tests

**Cómo ejecutarlo:**

```bash
# Linux/Mac/Git Bash
bash scripts/db-e2e-clean.sh

# O usando NPM
npm run db:e2e:clean
```

```powershell
# Windows PowerShell
.\scripts\db-e2e-clean.ps1

# O usando NPM
npm run db:e2e:clean:win
```

**Salida esperada:**

```
🧹 Limpiando base de datos E2E...
  → Eliminando todas las tablas...
  → Reinstalando extensiones...
✅ Base de datos E2E limpiada exitosamente

📝 Próximos pasos:
   1. Ejecutar migraciones: npm run db:e2e:migrate
   2. Ejecutar seeders: NODE_ENV=test npm run seed
```

---

### `db-e2e-reset.sh` / `db-e2e-reset.ps1`

**Funcionalidad:**
Reinicia completamente la base de datos E2E: limpia, ejecuta migraciones y aplica seeders. Deja la DB lista para testing.

**Qué hace:**

1. Llama a `db-e2e-clean.sh` para limpiar la DB
2. Ejecuta migraciones en la DB E2E usando la conexión correcta
3. Ejecuta seeders con `NODE_ENV=test` para cargar datos de prueba

**Cuándo usarlo:**

- Antes de ejecutar la suite completa de tests E2E
- Cuando necesitas un estado fresco y conocido de la DB
- Para resolver problemas de tests que fallan por datos inconsistentes
- Automáticamente se ejecuta con `npm run test:e2e:fresh`

**Cómo ejecutarlo:**

```bash
# Linux/Mac/Git Bash
bash scripts/db-e2e-reset.sh

# O usando NPM
npm run db:e2e:reset
```

```powershell
# Windows PowerShell
.\scripts\db-e2e-reset.ps1

# O usando NPM
npm run db:e2e:reset:win
```

**Salida esperada:**

```
🔄 Reiniciando base de datos de TESTING E2E...

[ejecuta db-e2e-clean.sh]

📦 Ejecutando migraciones en DB de testing E2E...
[muestra migraciones aplicadas]

🌱 Ejecutando seeders esenciales...
[muestra seeders ejecutados]

✅ Base de datos de testing E2E reiniciada
```

---

## 2. Scripts de Base de Datos de Desarrollo

### `db-dev-clean.sh` / `db-dev-clean.ps1`

**Funcionalidad:**
Limpia completamente la base de datos de desarrollo eliminando todos los datos pero manteniendo el esquema.

**Qué hace:**

- Verifica que el contenedor Docker `tarot-postgres-db` esté corriendo
- Ejecuta `DROP SCHEMA public CASCADE` para eliminar todas las tablas
- Recrea el schema público vacío
- Restaura extensiones PostgreSQL necesarias

**Cuándo usarlo:**

- Cuando quieres empezar desde cero en desarrollo
- Para limpiar datos de prueba que ya no necesitas
- Antes de aplicar nuevas migraciones en desarrollo

**⚠️ ADVERTENCIA:** Este script elimina TODOS los datos de desarrollo. Asegúrate de tener backups si hay datos importantes.

**Cómo ejecutarlo:**

```bash
# Linux/Mac/Git Bash
bash scripts/db-dev-clean.sh

# O usando NPM
npm run db:dev:clean
```

```powershell
# Windows PowerShell
.\scripts\db-dev-clean.ps1

# O usando NPM
npm run db:dev:clean:win
```

**Salida esperada:**

```
🧹 Limpiando base de datos de DESARROLLO...
  → Eliminando todas las tablas...
  → Reinstalando extensiones...
✅ Base de datos de desarrollo limpiada exitosamente

📝 Próximos pasos:
   1. Ejecutar migraciones: npm run migration:run
   2. Ejecutar seeders: npm run seed
```

---

### `db-dev-reset.sh` / `db-dev-reset.ps1`

**Funcionalidad:**
Reinicia completamente la base de datos de desarrollo: limpia, ejecuta migraciones y aplica seeders.

**Qué hace:**

1. Llama a `db-dev-clean.sh` para limpiar la DB
2. Ejecuta migraciones usando la conexión de desarrollo
3. Ejecuta seeders para cargar datos iniciales

**Cuándo usarlo:**

- Cuando quieres resetear tu entorno de desarrollo
- Después de cambios importantes en el esquema de la DB
- Para sincronizar con la última versión de migraciones y seeders
- Cuando tu DB de desarrollo está en un estado inconsistente

**⚠️ ADVERTENCIA:** Este script elimina TODOS los datos de desarrollo y los reemplaza con datos de seed.

**Cómo ejecutarlo:**

```bash
# Linux/Mac/Git Bash
bash scripts/db-dev-reset.sh

# O usando NPM
npm run db:dev:reset
```

```powershell
# Windows PowerShell
.\scripts\db-dev-reset.ps1

# O usando NPM
npm run db:dev:reset:win
```

**Salida esperada:**

```
🔄 Reiniciando base de datos de DESARROLLO...

[ejecuta db-dev-clean.sh]

📦 Ejecutando migraciones...
[muestra migraciones aplicadas]

🌱 Ejecutando seeders...
[muestra seeders ejecutados]

✅ Base de datos de desarrollo reiniciada completamente
```

---

## 3. Scripts de Migración Docker

### `migrate-docker-nomenclature.sh` / `migrate-docker-nomenclature.ps1`

**Funcionalidad:**
Migra la nomenclatura de contenedores Docker de `tarotflavia-*` a `tarot-*` con backup automático de datos.

**Qué hace:**

1. **Backup automático:** Crea respaldo de la DB antigua antes de cualquier cambio
2. **Análisis:** Muestra el estado actual de todos los recursos Docker
3. **Instrucciones:** Proporciona pasos detallados para completar la migración
4. **Seguridad:** NO elimina nada automáticamente, solo prepara y guía

**Cuándo usarlo:**

- Una sola vez al actualizar de la nomenclatura antigua
- Si detectas que aún tienes contenedores con nombres `tarotflavia-*`

**Cómo ejecutarlo:**

```bash
# Linux/Mac/Git Bash
bash scripts/migrate-docker-nomenclature.sh
```

```powershell
# Windows PowerShell
.\scripts\migrate-docker-nomenclature.ps1
```

**Salida esperada:**

```
🔄 Migración de nomenclatura Docker: tarotflavia-* → tarot-*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FASE 1: BACKUP DE DATOS EXISTENTES
📦 Contenedor antiguo encontrado: tarotflavia-postgres-db
💾 Creando backup de base de datos...
✅ Backup creado exitosamente: 2.3MB
   Ubicación: backups/migration-20250105_143022/tarotflavia_db.sql

FASE 2: ESTADO ACTUAL DE RECURSOS DOCKER
📊 Contenedores tarotflavia-*:
   [lista de contenedores]

FASE 3: PRÓXIMOS PASOS PARA COMPLETAR LA MIGRACIÓN
1️⃣  ACTUALIZAR CONFIGURACIÓN:
   → Actualizar archivo .env con nuevas variables TAROT_*
   → Revisar docker-compose.yml actualizado

2️⃣  LEVANTAR NUEVOS SERVICIOS:
   → docker-compose up -d tarot-postgres
   ...
```

---

### `cleanup-old-docker-resources.sh` / `cleanup-old-docker-resources.ps1`

**Funcionalidad:**
Elimina de forma segura los recursos Docker antiguos (`tarotflavia-*`) después de verificar que la migración fue exitosa.

**Qué hace:**

1. **Confirmación:** Requiere escribir "SI" para proceder (seguridad)
2. **Detención:** Detiene contenedores antiguos si están corriendo
3. **Eliminación:** Elimina contenedores, volúmenes y networks antiguos
4. **Verificación:** Confirma que todo fue eliminado correctamente
5. **Preservación:** Mantiene los backups intactos

**Cuándo usarlo:**

- SOLO después de verificar que la aplicación funciona con los nuevos contenedores
- Después de ejecutar tests y confirmar que todo está OK
- Cuando estés seguro que no necesitas rollback

**⚠️ ADVERTENCIA:** Esta operación es IRREVERSIBLE. Asegúrate de tener backups y de que todo funciona antes de ejecutar.

**Cómo ejecutarlo:**

```bash
# Linux/Mac/Git Bash
bash scripts/cleanup-old-docker-resources.sh
```

```powershell
# Windows PowerShell
.\scripts\cleanup-old-docker-resources.ps1
```

**Salida esperada:**

```
🧹 Limpieza de recursos Docker antiguos (tarotflavia-*)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  ADVERTENCIA: Esta operación eliminará permanentemente:
   - Contenedores: tarotflavia-postgres-db, tarotflavia-pgadmin
   - Volúmenes: tarotflavia-postgres-data, tarotflavia-pgadmin-data
   - Network: tarotflavia-network

   Asegúrate de que:
   ✓ La aplicación funciona correctamente con los nuevos contenedores
   ✓ Tienes backups recientes
   ✓ Has verificado los datos en el nuevo contenedor

¿Deseas continuar con la limpieza? (escribe 'SI' para confirmar): SI

🗑️  Iniciando limpieza...

1. Deteniendo contenedores antiguos...
   ✓ tarotflavia-postgres-db detenido

2. Eliminando contenedores...
   ✓ tarotflavia-postgres-db eliminado

3. Eliminando volúmenes...
   ✓ tarotflavia-postgres-data eliminado

4. Eliminando network...
   ✓ tarotflavia-network eliminado

✅ Limpieza completada exitosamente
   No quedan recursos tarotflavia-* en Docker

📝 IMPORTANTE: Los backups en backups/migration-* se mantienen
   Puedes eliminarlos manualmente después de confirmar que todo funciona
```

---

## 4. Scripts NPM

Todos los scripts anteriores están disponibles como comandos NPM para mayor comodidad:

### Gestión DB E2E

```bash
# Limpiar DB E2E (Bash)
npm run db:e2e:clean

# Limpiar DB E2E (PowerShell)
npm run db:e2e:clean:win

# Reset completo DB E2E (Bash)
npm run db:e2e:reset

# Reset completo DB E2E (PowerShell)
npm run db:e2e:reset:win

# Solo ejecutar migraciones en DB E2E
npm run db:e2e:migrate
```

### Gestión DB Desarrollo

```bash
# Limpiar DB dev (Bash)
npm run db:dev:clean

# Limpiar DB dev (PowerShell)
npm run db:dev:clean:win

# Reset completo DB dev (Bash)
npm run db:dev:reset

# Reset completo DB dev (PowerShell)
npm run db:dev:reset:win
```

### Tests E2E

```bash
# Ejecutar tests E2E normales
npm run test:e2e

# Reset DB + ejecutar tests E2E
npm run test:e2e:fresh
```

**Nota:** `test:e2e:fresh` es el equivalente de:

```bash
npm run db:e2e:reset && npm run test:e2e
```

---

## 5. Ejemplos de Uso

### Flujo de Trabajo Diario - Desarrollo

```bash
# 1. Iniciar el día - levantar contenedores
docker-compose up -d

# 2. Si hay nuevas migraciones, aplicarlas
npm run migration:run

# 3. Si necesitas datos frescos
npm run seed

# 4. Trabajar normalmente...

# 5. Si algo se rompe, resetear DB
npm run db:dev:reset
```

### Flujo de Trabajo - Testing E2E

```bash
# Ejecutar tests con DB fresca (recomendado)
npm run test:e2e:fresh

# O manualmente:
npm run db:e2e:reset
npm run test:e2e

# Solo limpiar sin resetear (avanzado)
npm run db:e2e:clean
npm run db:e2e:migrate
NODE_ENV=test npm run seed
npm run test:e2e
```

### Flujo - Crear Nueva Migración

```bash
# 1. Hacer cambios en entidades

# 2. Generar migración
npm run migration:generate -- -n DescripcionDelCambio

# 3. Aplicar en dev
npm run migration:run

# 4. Probar en E2E
npm run db:e2e:reset
npm run test:e2e

# 5. Si todo OK, commit
git add src/database/migrations/
git commit -m "feat: agregar migración DescripcionDelCambio"
```

### Flujo - Migración de Nomenclatura Docker

```bash
# 1. Hacer backup y análisis
bash scripts/migrate-docker-nomenclature.sh

# 2. Actualizar .env con nuevas variables TAROT_*

# 3. Levantar nuevos contenedores
docker-compose down
docker-compose up -d

# 4. Verificar aplicación
npm run start:dev

# 5. Verificar tests
npm run test:e2e

# 6. Si todo OK, limpiar recursos antiguos
bash scripts/cleanup-old-docker-resources.sh
```

### Troubleshooting - DB Corrupta

```bash
# Síntoma: Tests fallan aleatoriamente o DB en mal estado

# Solución para E2E:
npm run db:e2e:reset
npm run test:e2e

# Solución para Dev:
npm run db:dev:reset
npm run start:dev
```

### Troubleshooting - Contenedor No Inicia

```bash
# 1. Ver logs del contenedor
docker logs tarot-postgres-e2e-db

# 2. Verificar que puerto no esté ocupado
netstat -an | grep 5436

# 3. Recrear contenedor
docker-compose down
docker-compose up -d --force-recreate tarot-postgres-e2e

# 4. Resetear DB
npm run db:e2e:reset
```

---

## Resumen de Comandos Rápidos

| Acción                  | Comando Rápido                                     |
| ----------------------- | -------------------------------------------------- |
| **E2E: DB Fresca**      | `npm run test:e2e:fresh`                           |
| **E2E: Solo limpiar**   | `npm run db:e2e:clean`                             |
| **E2E: Reset completo** | `npm run db:e2e:reset`                             |
| **Dev: Reset completo** | `npm run db:dev:reset`                             |
| **Aplicar migraciones** | `npm run migration:run`                            |
| **Generar migración**   | `npm run migration:generate -- -n NombreMigracion` |
| **Ejecutar seeders**    | `npm run seed`                                     |
| **Ver estado Docker**   | `docker-compose ps`                                |
| **Ver logs E2E DB**     | `docker logs tarot-postgres-e2e-db`                |
| **Ver logs Dev DB**     | `docker logs tarot-postgres-db`                    |

---

## Arquitectura de las Bases de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌────────────────────────┐   │
│  │   tarot-postgres-db      │  │ tarot-postgres-e2e-db │   │
│  │                          │  │                        │   │
│  │  Puerto: 5435           │  │  Puerto: 5436         │   │
│  │  DB: tarot_db           │  │  DB: tarot_e2e        │   │
│  │  User: tarot_user       │  │  User: tarot_e2e_user │   │
│  │                          │  │                        │   │
│  │  Uso: Desarrollo        │  │  Uso: Tests E2E       │   │
│  │  Datos: Persistentes    │  │  Datos: Efímeros      │   │
│  │  Scripts: db-dev-*      │  │  Scripts: db-e2e-*    │   │
│  └──────────────────────────┘  └────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Notas Importantes

1. **Nunca** ejecutes scripts de E2E en la DB de desarrollo y viceversa
2. **Siempre** verifica que el contenedor Docker esté corriendo antes de ejecutar scripts
3. Los scripts de PowerShell son equivalentes a los de Bash, usa el apropiado para tu sistema
4. Los **backups** de migración Docker se guardan en `backups/migration-*` y deben conservarse
5. Los scripts de limpieza (`cleanup-*`) son **irreversibles**, úsalos con precaución
6. La DB E2E se resetea automáticamente antes de cada suite de tests (global setup)
7. Puedes ejecutar ambas DBs simultáneamente sin conflictos (diferentes puertos)

---

**Última actualización:** 2026-04-05  
**Versión:** 1.0.0  
**Ver también:** `TESTING_DATABASE.md` para arquitectura y troubleshooting detallado
