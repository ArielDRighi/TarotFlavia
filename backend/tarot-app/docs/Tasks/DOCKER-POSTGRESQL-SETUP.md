# Configurar PostgreSQL con Docker para Desarrollo

> **TASK-000** | Estado: ✅ COMPLETADO | Branch: `feature/TASK-000-docker-postgresql-setup`

## 📋 Resumen

Configuración de Docker Compose para levantar PostgreSQL localmente, facilitando el desarrollo sin instalaciones manuales.

## ✅ Verificación de Implementación

| Requisito                          | Estado | Implementación                                    |
| ---------------------------------- | ------ | ------------------------------------------------- |
| PostgreSQL 16-alpine               | ✅     | `image: postgres:16-alpine` en docker-compose.yml |
| Puerto 5435 (evitar conflictos)    | ✅     | `${TAROT_DB_PORT:-5435}:5432`                     |
| Volumen persistente                | ✅     | `tarot-postgres-data`                             |
| Healthcheck configurado            | ✅     | Cada 10s con `pg_isready`                         |
| Labels para identificación         | ✅     | `com.tarot.project: "tarot"`                      |
| Red dedicada                       | ✅     | `tarot-network`                                   |
| Variables de entorno configurables | ✅     | `.env.example` con todas las variables            |
| pgAdmin con profile 'tools'        | ✅     | `profiles: [tools]`                               |
| Extensión uuid-ossp                | ✅     | `01-init-database.sh`                             |
| Extensión pg_trgm                  | ✅     | `01-init-database.sh`                             |
| README-DOCKER.md documentado       | ✅     | 762 líneas de documentación                       |
| .gitignore actualizado             | ✅     | Excluye .env, postgres-data, pgadmin-data         |

### ✨ Mejoras sobre Consigna Original

El proyecto evolucionó con mejoras sobre la consigna inicial:

| Original           | Implementado           | Razón                                 |
| ------------------ | ---------------------- | ------------------------------------- |
| `tarotflavia_db`   | `tarot_db`             | Nomenclatura más limpia y consistente |
| `TAROTFLAVIA_*`    | `TAROT_*`              | Prefijo más corto, mismo propósito    |
| Solo BD desarrollo | + BD E2E (puerto 5436) | Tests aislados sin afectar desarrollo |

Estas mejoras están documentadas en README-DOCKER.md con script de migración.

## 📁 Archivos Implementados

```
backend/tarot-app/
├── docker-compose.yml                    # Configuración Docker (132 líneas)
├── docker/postgres/init/
│   └── 01-init-database.sh              # Script inicialización BD
├── docs/README-DOCKER.md                 # Documentación completa
└── .env.example                          # Variables de entorno ejemplo
```

## 🚀 Comandos de Uso

```bash
# Desarrollo
docker-compose up -d tarot-postgres

# Con pgAdmin
docker-compose --profile tools up -d

# E2E Testing (aislado)
docker-compose --profile e2e up -d
```

## 🧪 Tests de Integración

### Estado Actual

Esta tarea es de **infraestructura** - no tiene endpoints API para testear.

### Tests Manuales Necesarios

| Test                | Comando                                                                                               | Criterio           |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ |
| Container corriendo | `docker ps \| grep tarot-postgres`                                                                    | Container visible  |
| Healthcheck OK      | `docker inspect --format='{{.State.Health.Status}}' tarot-postgres-db`                                | "healthy"          |
| Extensión uuid-ossp | `docker exec tarot-postgres-db psql -U tarot_user -d tarot_db -c "SELECT extname FROM pg_extension;"` | uuid-ossp en lista |
| Extensión pg_trgm   | (mismo comando)                                                                                       | pg_trgm en lista   |
| Persistencia        | Reiniciar container y verificar datos                                                                 | Datos persisten    |
| Conexión NestJS     | `curl localhost:3000/health`                                                                          | App conecta a BD   |

### Tests de Integración Faltantes (Automatizables)

```typescript
// Sugerencia: test/infrastructure/docker-postgres.e2e-spec.ts
describe('Docker PostgreSQL Infrastructure', () => {
  it('should connect to database');
  it('should have uuid-ossp extension installed');
  it('should have pg_trgm extension installed');
  it('should persist data across container restarts');
});
```

**Prioridad:** BAJA - La infraestructura se verifica implícitamente cuando los tests E2E corren.

## 🔗 Referencias

- [README-DOCKER.md](../README-DOCKER.md) - Documentación completa
- [docker-compose.yml](../../docker-compose.yml) - Configuración Docker
