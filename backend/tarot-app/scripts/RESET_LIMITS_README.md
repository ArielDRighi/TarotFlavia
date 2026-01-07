# 🧹 Reset Usage Limits Scripts

Scripts para resetear límites de uso durante testing y desarrollo.

## 📋 Scripts Disponibles

| Script                      | Descripción                          | Usuarios Afectados                  |
| --------------------------- | ------------------------------------ | ----------------------------------- |
| `reset-limits-anonymous.sh` | Resetea límites de usuarios anónimos | Visitantes sin registro             |
| `reset-limits-free.sh`      | Resetea límites de usuarios FREE     | free@test.com, etc (2 lecturas/día) |
| `reset-limits-premium.sh`   | Resetea límites de usuarios PREMIUM  | premium@test.com, etc               |
| `reset-all-limits.sh`       | Resetea TODOS los límites            | Todos los usuarios                  |

## 🚀 Uso Rápido

### Primera vez (dar permisos de ejecución):

```bash
cd backend/tarot-app
chmod +x scripts/reset-limits-*.sh
```

### Ejecutar scripts:

```bash
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
# Ver uso de FREE users
docker exec tarotflavia-postgres-db psql -U tarotflavia_user -d tarot_db -c "
  SELECT u.email, ul.feature, ul.count, ul.date
  FROM usage_limit ul
  INNER JOIN \"user\" u ON ul.user_id = u.id
  WHERE u.plan = 'free' AND ul.date = CURRENT_DATE;"

# Ver uso de PREMIUM users
docker exec tarotflavia-postgres-db psql -U tarotflavia_user -d tarot_db -c "
  SELECT u.email, ul.feature, ul.count, ul.date
  FROM usage_limit ul
  INNER JOIN \"user\" u ON ul.user_id = u.id
  WHERE u.plan = 'premium' AND ul.date = CURRENT_DATE;"

# Ver cartas del día anónimas
docker exec tarotflavia-postgres-db psql -U tarotflavia_user -d tarot_db -c "
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
CONTAINER_NAME="tarotflavia-postgres-db"
DB_USER="tarotflavia_user"
DB_NAME="tarot_db"
```

## 📝 Workflow de Testing

**Escenario típico:**

1. Estás testeando el flujo FREE user
2. El usuario `free@test.com` alcanza su límite (2 lecturas)
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

**Última actualización:** Enero 2026
