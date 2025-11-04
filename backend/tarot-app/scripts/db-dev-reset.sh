#!/usr/bin/env bash
# Script para resetear base de datos de desarrollo
# Uso: ./scripts/db-dev-reset.sh
# Descripción: Limpia la DB de desarrollo, ejecuta migraciones y seeders

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Main
echo ""
print_warning "⚠️  ADVERTENCIA: Esta operación reseteará TODA la base de datos de DESARROLLO"
echo ""
read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirmation

if [ "$confirmation" != "SI" ]; then
  print_info "Operación cancelada"
  exit 0
fi

echo ""
print_info "🔄 Reseteando base de datos de desarrollo..."
echo ""

# 1. Limpiar base de datos
print_info "Paso 1/3: Limpiando base de datos..."
echo "SI" | bash "$(dirname "$0")/db-dev-clean.sh"

echo ""

# 2. Ejecutar migraciones
print_info "Paso 2/3: Ejecutando migraciones..."
npm run migration:run
print_success "Migraciones ejecutadas"

echo ""

# 3. Ejecutar seeders
print_info "Paso 3/3: Ejecutando seeders..."
npm run seed
print_success "Seeders ejecutados"

echo ""
print_success "✅ Base de datos de desarrollo reseteada completamente"
echo ""
