# 🧹 Reset Usage Limits Scripts

Scripts para resetear límites de uso durante testing y desarrollo.

## 📋 Scripts Disponibles

| Script                        | Descripción                                    | Usuarios Afectados                  |
| ----------------------------- | ---------------------------------------------- | ----------------------------------- |
| `reset-test-users-limits.sh`  | 🎯 **Resetea los 3 usuarios de prueba** (RECOMENDADO) | free@test.com, premium@test.com, admin@test.com |
| `reset-limits-anonymous.sh`   | Resetea límites de usuarios anónimos           | Visitantes sin registro             |
| `reset-limits-free.sh`        | Resetea límites de usuarios FREE               | Todos con plan FREE                 |
| `reset-limits-premium.sh`     | Resetea límites de usuarios PREMIUM            | Todos con plan PREMIUM              |
| `reset-all-limits.sh`         | Resetea TODOS los límites                      | Todos los usuarios                  |

## 🚀 Uso Rápido

### Primera vez (dar permisos de ejecución):

```bash
cd backend/tarot-app
chmod +x scripts/reset-limits-*.sh
```

### Ejecutar scripts:

```bash
# ⭐ RECOMENDADO: Resetear solo los 3 usuarios de prueba
./scripts/reset-test-users-limits.sh

# Resetear usuarios anónimos
./scripts/reset-limits-anonymous.sh

# Resetear usuarios FREE
./scripts/reset-limits-free.sh

# Resetear usuarios PREMIUM
./scripts/reset-limits-premium.sh

# Resetear TODOS
./scripts/reset-all-limits.sh
```

## 📊 Qué hace cada script

### 🎯 reset-test-users-limits.sh (RECOMENDADO)

- **Usuarios específicos:** `free@test.com`, `premium@test.com`, `admin@test.com`
- **Borra:** Registros de `usage_limit` de estos 3 usuarios
- **Borra:** Cartas del día de estos 3 usuarios en `daily_readings`
- **Resultado:** Los 3 usuarios de prueba principales pueden volver a usar todas las features
- **Ventaja:** No afecta a otros usuarios de prueba ni datos adicionales

### 1. reset-limits-anonymous.sh

- **Borra:** Registros de `anonymous_usage` (lecturas, oráculos)
- **Borra:** Cartas del día de usuarios anónimos en `daily_readings`
- **Resultado:** Los usuarios anónimos pueden volver a generar su carta del día

### 2. reset-limits-free.sh

- **Borra:** Registros de `usage_limit` para usuarios con `plan = 'free'`
- **Borra:** Cartas del día de usuarios FREE en `daily_readings`
- **Usuarios típicos:** `free@test.com`, `martincho@mail.com`
- **Resultado:** Usuarios FREE pueden crear 2 lecturas y su carta del día de nuevo

### 3. reset-limits-premium.sh

- **Borra:** Registros de `usage_limit` para usuarios con `plan = 'premium'`
- **Borra:** Cartas del día de usuarios PREMIUM en `daily_readings`
- **Usuarios típicos:** `premium@test.com`, `admin@test.com`
- **Resultado:** Limpia data de prueba de usuarios PREMIUM

### 4. reset-all-limits.sh

- **Borra:** Todos los registros de uso de todos los tipos de usuarios
- **Borra:** TODAS las cartas del día (anónimos + autenticados)
- **Resultado:** Reset completo del sistema de límites

## 🔍 Ver estado actual

Para ver el estado actual de los límites:

```bash
# ⭐ Ver uso de los 3 usuarios de prueba
docker exec tarot-postgres-db psql -U tarotflavia_user -d tarot_db -c "
  SELECT u.email, u.plan, ul.feature, ul.count, ul.date
  FROM usage_limit ul
  INNER JOIN \"user\" u ON ul.user_id = u.id
  WHERE u.email IN ('free@test.com', 'premium@test.com', 'admin@test.com')
    AND ul.date = CURRENT_DATE
  ORDER BY u.email, ul.feature;"

# Ver uso de FREE users
docker exec tarot-postgres-db psql -U tarotflavia_user -d tarot_db -c "
  SELECT u.email, ul.feature, ul.count, ul.date
  FROM usage_limit ul
  INNER JOIN \"user\" u ON ul.user_id = u.id
  WHERE u.plan = 'free' AND ul.date = CURRENT_DATE;"

# Ver uso de PREMIUM users
docker exec tarot-postgres-db psql -U tarotflavia_user -d tarot_db -c "
  SELECT u.email, ul.feature, ul.count, ul.date
  FROM usage_limit ul
  INNER JOIN \"user\" u ON ul.user_id = u.id
  WHERE u.plan = 'premium' AND ul.date = CURRENT_DATE;"

# Ver cartas del día anónimas
docker exec tarot-postgres-db psql -U tarotflavia_user -d tarot_db -c "
  SELECT COUNT(*) as total, COUNT(DISTINCT anonymous_fingerprint) as unique_users
  FROM daily_readings
  WHERE anonymous_fingerprint IS NOT NULL;"
```

## 🛡️ Seguridad

- ✅ Los scripts solo funcionan si el contenedor de PostgreSQL está corriendo
- ✅ Verifican que los archivos SQL existan antes de ejecutar
- ✅ Muestran mensajes de error claros si algo falla
- ✅ Utilizan `set -e` para salir ante cualquier error

## 🔧 Configuración

Si necesitas cambiar la configuración (nombre del contenedor, DB, usuario), edita las variables al inicio de cada script `.sh`:

```bash
CONTAINER_NAME="tarot-postgres-db"  # Actualizado de tarotflavia-postgres-db
DB_USER="tarotflavia_user"
DB_NAME="tarot_db"
```

> **Nota:** El nombre del contenedor ha sido actualizado de `tarotflavia-postgres-db` a `tarot-postgres-db` en todos los scripts nuevos.

## 📝 Workflow de Testing

**Escenario típico (RECOMENDADO):**

1. Estás testeando con los usuarios de prueba principales
2. Los usuarios `free@test.com` / `premium@test.com` / `admin@test.com` alcanzan sus límites
3. Ejecutas: `./scripts/reset-test-users-limits.sh`
4. Continúas testeando con límites reseteados
5. **Ventaja:** No afecta a otros datos de prueba

**Escenario alternativo (por tipo de plan):**

1. Estás testeando el flujo FREE user
2. El usuario `free@test.com` alcanza su límite (1 carta del día + 1 tirada)
3. Ejecutas: `./scripts/reset-limits-free.sh`
4. Continúas testeando con límites reseteados

**Para tests E2E:**

```bash
# Antes de cada suite de tests
./scripts/reset-all-limits.sh

# Ejecutar tests
npm run test:e2e

# Limpiar después
./scripts/reset-all-limits.sh
```

## 🚨 Advertencias

⚠️ **Estos scripts son SOLO para desarrollo/testing**

⚠️ **NO ejecutar en producción**

⚠️ **Borran permanentemente los registros de uso**

---

**Última actualización:** Febrero 2026
