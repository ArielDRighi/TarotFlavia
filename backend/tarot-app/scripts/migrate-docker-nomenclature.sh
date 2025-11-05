#!/bin/bash
# Migra datos de contenedores antiguos (tarotflavia-*) a nuevos (tarot-*)
# Y proporciona herramientas para limpieza controlada

set -e

echo "🔄 Migración de nomenclatura Docker: tarotflavia-* → tarot-*"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Variables
OLD_CONTAINER="tarotflavia-postgres-db"
OLD_PGADMIN="tarotflavia-pgadmin"
OLD_VOLUME_DB="tarotflavia-postgres-data"
OLD_VOLUME_PGADMIN="tarotflavia-pgadmin-data"
OLD_NETWORK="tarotflavia-network"

NEW_CONTAINER="tarot-postgres-db"
BACKUP_DIR="backups/migration-$(date +%Y%m%d_%H%M%S)"

# Función para verificar si un contenedor existe
container_exists() {
  docker ps -a --format '{{.Names}}' | grep -q "^$1$"
}

# Función para verificar si un volumen existe
volume_exists() {
  docker volume ls --format '{{.Name}}' | grep -q "^$1$"
}

# FASE 1: BACKUP
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 1: BACKUP DE DATOS EXISTENTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if container_exists "$OLD_CONTAINER"; then
  echo "📦 Contenedor antiguo encontrado: $OLD_CONTAINER"
  
  # Verificar si el contenedor está corriendo
  if docker ps --format '{{.Names}}' | grep -q "^$OLD_CONTAINER$"; then
    echo "✓ Contenedor está corriendo"
    
    # Crear backup
    echo "💾 Creando backup de base de datos..."
    mkdir -p "$BACKUP_DIR"
    
    docker exec $OLD_CONTAINER pg_dump -U tarotflavia_user tarotflavia_db \
      > "$BACKUP_DIR/tarotflavia_db.sql"
    
    # Verificar tamaño del backup
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/tarotflavia_db.sql" | cut -f1)
    echo "✅ Backup creado exitosamente: $BACKUP_SIZE"
    echo "   Ubicación: $BACKUP_DIR/tarotflavia_db.sql"
  else
    echo "⚠️  Contenedor existe pero no está corriendo"
    echo "   Iniciando contenedor para backup..."
    docker start $OLD_CONTAINER
    sleep 5
    
    mkdir -p "$BACKUP_DIR"
    docker exec $OLD_CONTAINER pg_dump -U tarotflavia_user tarotflavia_db \
      > "$BACKUP_DIR/tarotflavia_db.sql"
    
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/tarotflavia_db.sql" | cut -f1)
    echo "✅ Backup creado: $BACKUP_SIZE"
  fi
  
  # Backup de configuración de pgAdmin (si existe)
  if container_exists "$OLD_PGADMIN"; then
    echo "💾 Backup de configuración pgAdmin..."
    docker cp $OLD_PGADMIN:/var/lib/pgadmin "$BACKUP_DIR/pgadmin-config" 2>/dev/null || true
    echo "✓ Configuración pgAdmin respaldada"
  fi
  
  echo ""
else
  echo "ℹ️  No se encontraron contenedores antiguos (tarotflavia-*)"
  echo "   Esta es una instalación nueva o ya se migró anteriormente."
  echo ""
fi

# FASE 2: INFORMACIÓN PRE-MIGRACIÓN
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 2: ESTADO ACTUAL DE RECURSOS DOCKER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Contenedores tarotflavia-*:"
docker ps -a --filter "name=tarotflavia" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "   (ninguno)"
echo ""

echo "📊 Volúmenes tarotflavia-*:"
docker volume ls --filter "name=tarotflavia" --format "table {{.Name}}\t{{.Driver}}" || echo "   (ninguno)"
echo ""

echo "📊 Networks tarotflavia-*:"
docker network ls --filter "name=tarotflavia" --format "table {{.Name}}\t{{.Driver}}" || echo "   (ninguno)"
echo ""

# FASE 3: INSTRUCCIONES
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FASE 3: PRÓXIMOS PASOS PARA COMPLETAR LA MIGRACIÓN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣  ACTUALIZAR CONFIGURACIÓN:"
echo "   → Actualizar archivo .env con nuevas variables TAROT_*"
echo "   → Revisar docker-compose.yml actualizado"
echo ""

echo "2️⃣  LEVANTAR NUEVOS SERVICIOS:"
echo "   → docker-compose up -d tarot-postgres"
echo "   → docker-compose --profile tools up -d  # (si usas pgAdmin)"
echo ""

if [ -f "$BACKUP_DIR/tarotflavia_db.sql" ]; then
  echo "3️⃣  RESTAURAR DATOS (si es necesario):"
  echo "   → cat $BACKUP_DIR/tarotflavia_db.sql | docker exec -i tarot-postgres-db psql -U tarot_user -d tarot_db"
  echo ""
fi

echo "4️⃣  VERIFICAR APLICACIÓN:"
echo "   → npm run start:dev"
echo "   → npm run test:e2e"
echo "   → Verificar que todo funciona correctamente"
echo ""

echo "5️⃣  LIMPIEZA DE RECURSOS ANTIGUOS (después de verificar):"
echo "   → bash scripts/cleanup-old-docker-resources.sh"
echo "   → O manualmente (ver script de limpieza)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Script de migración completado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
