#!/usr/bin/env bash
# Script para limpiar base de datos E2E
# Uso: ./scripts/db-e2e-clean.sh
# Descripción: Elimina todos los datos de la DB E2E manteniendo el schema

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CONTAINER_NAME="tarot-postgres-e2e-db"
DB_USER="${TAROT_E2E_DB_USER:-tarot_e2e_user}"
DB_NAME="${TAROT_E2E_DB_NAME:-tarot_e2e}"

# Función para imprimir mensajes con color
print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker está ejecutándose
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    print_error "Docker no está ejecutándose. Por favor inicia Docker primero."
    exit 1
  fi
}

# Verificar estado del contenedor
get_container_status() {
  docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Status}}" 2>/dev/null || echo "not_found"
}

# Main
echo ""
print_info "🧹 Limpiando base de datos E2E..."
echo ""

check_docker

# Verificar que el contenedor existe y está corriendo
status=$(get_container_status)

if [ "$status" == "not_found" ]; then
  print_error "Contenedor '$CONTAINER_NAME' no encontrado."
  print_info "Ejecuta: docker-compose --profile e2e up -d tarot-postgres-e2e"
  exit 1
fi

if [[ "$status" != *"Up"* ]]; then
  print_error "Contenedor '$CONTAINER_NAME' no está ejecutándose."
  print_info "Ejecuta: docker-compose --profile e2e start tarot-postgres-e2e"
  exit 1
fi

# Limpiar base de datos (DROP SCHEMA + CREATE SCHEMA)
print_info "Eliminando datos de la base de datos E2E..."

docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}" -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO ${DB_USER};
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
" >/dev/null 2>&1

print_success "Base de datos E2E limpiada exitosamente"
echo ""
print_info "📝 Próximos pasos:"
print_info "   1. Ejecutar migraciones: npm run db:e2e:migrate"
print_info "   2. Ejecutar seeders: npm run seed (con NODE_ENV=test)"
echo ""
