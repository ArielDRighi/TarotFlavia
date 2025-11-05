#!/usr/bin/env bash
# Script para resetear completamente base de datos E2E
# Uso: ./scripts/db-e2e-reset.sh
# Descripción: Limpia, ejecuta migraciones y seeders en DB E2E

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
print_warning "🔄 RESETEO COMPLETO DE BASE DE DATOS E2E"
print_warning "Esta operación eliminará TODOS los datos de la base de datos E2E."
echo ""

# Prompt de confirmación
read -p "¿Estás seguro que deseas continuar? (escribe 'SI' para confirmar): " confirm

if [ "$confirm" != "SI" ]; then
  print_info "Operación cancelada."
  exit 0
fi

echo ""

# Paso 1: Limpiar base de datos
print_info "📍 Paso 1/3: Limpiando base de datos E2E..."
if bash "$(dirname "$0")/db-e2e-clean.sh"; then
  print_success "Base de datos E2E limpiada"
else
  print_error "Error al limpiar base de datos E2E"
  exit 1
fi

echo ""

# Paso 2: Ejecutar migraciones
print_info "📍 Paso 2/3: Ejecutando migraciones..."
if npm run db:e2e:migrate; then
  print_success "Migraciones aplicadas"
else
  print_error "Error al ejecutar migraciones"
  exit 1
fi

echo ""

# Paso 3: Ejecutar seeders
print_info "📍 Paso 3/3: Ejecutando seeders..."
if NODE_ENV=test npm run seed; then
  print_success "Seeders aplicados"
else
  print_error "Error al ejecutar seeders"
  exit 1
fi

echo ""
print_success "🎉 Base de datos E2E reseteada exitosamente"
print_info "La base de datos E2E está lista para testing con datos frescos."
echo ""
