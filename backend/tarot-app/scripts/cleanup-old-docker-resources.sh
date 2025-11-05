#!/bin/bash
# Limpia recursos Docker antiguos (tarotflavia-*) después de migración exitosa

set -e

echo "🧹 Limpieza de recursos Docker antiguos (tarotflavia-*)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  ADVERTENCIA: Esta operación eliminará permanentemente:"
echo "   - Contenedores: tarotflavia-postgres-db, tarotflavia-pgadmin"
echo "   - Volúmenes: tarotflavia-postgres-data, tarotflavia-pgadmin-data"
echo "   - Network: tarotflavia-network"
echo ""
echo "   Asegúrate de que:"
echo "   ✓ La aplicación funciona correctamente con los nuevos contenedores"
echo "   ✓ Tienes backups recientes"
echo "   ✓ Has verificado los datos en el nuevo contenedor"
echo ""

read -p "¿Deseas continuar con la limpieza? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
  echo "❌ Limpieza cancelada"
  exit 0
fi

echo ""
echo "🗑️  Iniciando limpieza..."
echo ""

# Detener contenedores si están corriendo
echo "1. Deteniendo contenedores antiguos..."
docker stop tarotflavia-postgres-db 2>/dev/null && echo "   ✓ tarotflavia-postgres-db detenido" || echo "   ℹ️  tarotflavia-postgres-db no estaba corriendo"
docker stop tarotflavia-pgadmin 2>/dev/null && echo "   ✓ tarotflavia-pgadmin detenido" || echo "   ℹ️  tarotflavia-pgadmin no estaba corriendo"
echo ""

# Eliminar contenedores
echo "2. Eliminando contenedores..."
docker rm tarotflavia-postgres-db 2>/dev/null && echo "   ✓ tarotflavia-postgres-db eliminado" || echo "   ℹ️  tarotflavia-postgres-db no existe"
docker rm tarotflavia-pgadmin 2>/dev/null && echo "   ✓ tarotflavia-pgadmin eliminado" || echo "   ℹ️  tarotflavia-pgadmin no existe"
echo ""

# Eliminar volúmenes
echo "3. Eliminando volúmenes..."
docker volume rm tarotflavia-postgres-data 2>/dev/null && echo "   ✓ tarotflavia-postgres-data eliminado" || echo "   ℹ️  tarotflavia-postgres-data no existe"
docker volume rm tarotflavia-pgadmin-data 2>/dev/null && echo "   ✓ tarotflavia-pgadmin-data eliminado" || echo "   ℹ️  tarotflavia-pgadmin-data no existe"
echo ""

# Eliminar network (solo si no está en uso)
echo "4. Eliminando network..."
docker network rm tarotflavia-network 2>/dev/null && echo "   ✓ tarotflavia-network eliminado" || echo "   ℹ️  tarotflavia-network no existe o está en uso"
echo ""

# Verificar limpieza
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Verificando limpieza..."
echo ""

REMAINING_CONTAINERS=$(docker ps -a --filter "name=tarotflavia" --format "{{.Names}}" | wc -l)
REMAINING_VOLUMES=$(docker volume ls --filter "name=tarotflavia" --format "{{.Name}}" | wc -l)
REMAINING_NETWORKS=$(docker network ls --filter "name=tarotflavia" --format "{{.Name}}" | wc -l)

if [ "$REMAINING_CONTAINERS" -eq 0 ] && [ "$REMAINING_VOLUMES" -eq 0 ] && [ "$REMAINING_NETWORKS" -eq 0 ]; then
  echo "✅ Limpieza completada exitosamente"
  echo "   No quedan recursos tarotflavia-* en Docker"
else
  echo "⚠️  Algunos recursos no pudieron eliminarse:"
  [ "$REMAINING_CONTAINERS" -gt 0 ] && echo "   - Contenedores restantes: $REMAINING_CONTAINERS"
  [ "$REMAINING_VOLUMES" -gt 0 ] && echo "   - Volúmenes restantes: $REMAINING_VOLUMES"
  [ "$REMAINING_NETWORKS" -gt 0 ] && echo "   - Networks restantes: $REMAINING_NETWORKS"
  echo ""
  echo "   Revisa manualmente con:"
  echo "   → docker ps -a --filter 'name=tarotflavia'"
  echo "   → docker volume ls --filter 'name=tarotflavia'"
  echo "   → docker network ls --filter 'name=tarotflavia'"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 IMPORTANTE: Los backups en backups/migration-* se mantienen"
echo "   Puedes eliminarlos manualmente después de confirmar que todo funciona"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
