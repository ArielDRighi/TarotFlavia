#!/usr/bin/env bash
# Script de gestión de base de datos E2E para tests
# Uso: ./scripts/manage-e2e-db.sh [comando]
# Comandos disponibles: start, stop, restart, reset, status, logs, clean

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="tarot-postgres-e2e"
CONTAINER_NAME="tarot-postgres-e2e-db"
PROFILE="e2e"

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

# Función para verificar si Docker está ejecutándose
check_docker() {
  if ! docker info >/dev/null 2>&1; then
    print_error "Docker no está ejecutándose. Por favor inicia Docker primero."
    exit 1
  fi
}

# Función para verificar estado del contenedor
get_container_status() {
  docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Status}}" 2>/dev/null || echo "not_found"
}

# Función para iniciar la base de datos E2E
start_db() {
  print_info "Iniciando base de datos E2E..."
  
  check_docker
  
  local status
  status=$(get_container_status)
  
  if [[ "$status" == *"Up"* ]]; then
    print_warning "La base de datos E2E ya está ejecutándose"
    return 0
  fi
  
  docker-compose --profile "${PROFILE}" up -d "${SERVICE_NAME}"
  
  print_info "Esperando a que la base de datos esté lista..."
  sleep 5
  
  # Verificar health check
  local max_attempts=30
  local attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if docker exec "${CONTAINER_NAME}" pg_isready -U tarot_e2e_user -d tarot_e2e >/dev/null 2>&1; then
      print_success "Base de datos E2E iniciada correctamente"
      print_info "Puerto: 5436"
      print_info "Usuario: tarot_e2e_user"
      print_info "Base de datos: tarot_e2e"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo -n "."
    sleep 1
  done
  
  print_error "Tiempo de espera agotado. La base de datos no respondió."
  exit 1
}

# Función para detener la base de datos E2E
stop_db() {
  print_info "Deteniendo base de datos E2E..."
  
  check_docker
  
  local status
  status=$(get_container_status)
  
  if [[ "$status" == "not_found" ]] || [[ "$status" == *"Exited"* ]]; then
    print_warning "La base de datos E2E no está ejecutándose"
    return 0
  fi
  
  docker-compose stop "${SERVICE_NAME}"
  print_success "Base de datos E2E detenida"
}

# Función para reiniciar la base de datos E2E
restart_db() {
  print_info "Reiniciando base de datos E2E..."
  stop_db
  sleep 2
  start_db
}

# Función para resetear la base de datos E2E (eliminar datos)
reset_db() {
  print_warning "⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de la base de datos E2E"
  read -p "¿Estás seguro? (escribe 'SI' para confirmar): " confirmation
  
  if [ "$confirmation" != "SI" ]; then
    print_info "Operación cancelada"
    return 0
  fi
  
  print_info "Reseteando base de datos E2E..."
  
  check_docker
  
  # Detener contenedor
  docker-compose stop "${SERVICE_NAME}" 2>/dev/null || true
  
  # Eliminar contenedor
  docker rm "${CONTAINER_NAME}" 2>/dev/null || true
  
  # Eliminar volumen
  docker volume rm tarot-postgres-e2e-data 2>/dev/null || true
  
  print_success "Base de datos E2E reseteada"
  
  print_info "Iniciando base de datos limpia..."
  start_db
}

# Función para limpiar solo los datos (sin eliminar volumen)
clean_db() {
  print_info "Limpiando datos de la base de datos E2E..."
  
  check_docker
  
  local status
  status=$(get_container_status)
  
  if [[ "$status" != *"Up"* ]]; then
    print_error "La base de datos E2E no está ejecutándose. Usa 'start' primero."
    exit 1
  fi
  
  # Ejecutar comando SQL para limpiar datos
  docker exec "${CONTAINER_NAME}" psql -U tarot_e2e_user -d tarot_e2e -c "
    DO \$\$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
      END LOOP;
    END \$\$;
  " >/dev/null
  
  print_success "Datos limpiados correctamente"
}

# Función para mostrar estado
show_status() {
  print_info "Estado de la base de datos E2E:"
  echo ""
  
  check_docker
  
  local status
  status=$(get_container_status)
  
  if [[ "$status" == "not_found" ]]; then
    print_warning "Contenedor: No existe"
    echo ""
    print_info "Para crear e iniciar: ./scripts/manage-e2e-db.sh start"
    return 0
  fi
  
  if [[ "$status" == *"Up"* ]]; then
    print_success "Contenedor: Ejecutándose"
    
    # Verificar conectividad
    if docker exec "${CONTAINER_NAME}" pg_isready -U tarot_e2e_user -d tarot_e2e >/dev/null 2>&1; then
      print_success "Conexión: Disponible"
    else
      print_error "Conexión: No disponible"
    fi
  else
    print_warning "Contenedor: Detenido"
  fi
  
  echo ""
  print_info "Configuración:"
  echo "  Puerto: 5436"
  echo "  Usuario: tarot_e2e_user"
  echo "  Base de datos: tarot_e2e"
  echo ""
  
  # Mostrar info del contenedor
  docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Status}}\t{{.Ports}}"
}

# Función para mostrar logs
show_logs() {
  print_info "Mostrando logs de la base de datos E2E (Ctrl+C para salir)..."
  docker logs -f "${CONTAINER_NAME}" 2>&1 || print_error "No se pudieron obtener los logs"
}

# Función para mostrar ayuda
show_help() {
  echo "Gestión de Base de Datos E2E para Tarot App"
  echo ""
  echo "Uso: ./scripts/manage-e2e-db.sh [comando]"
  echo ""
  echo "Comandos disponibles:"
  echo "  start       Inicia la base de datos E2E"
  echo "  stop        Detiene la base de datos E2E"
  echo "  restart     Reinicia la base de datos E2E"
  echo "  reset       Elimina y recrea la base de datos E2E (DESTRUCTIVO)"
  echo "  clean       Limpia solo los datos (mantiene schema)"
  echo "  status      Muestra el estado actual"
  echo "  logs        Muestra los logs en tiempo real"
  echo "  help        Muestra esta ayuda"
  echo ""
  echo "Ejemplos:"
  echo "  ./scripts/manage-e2e-db.sh start"
  echo "  ./scripts/manage-e2e-db.sh status"
  echo "  ./scripts/manage-e2e-db.sh clean"
}

# Main - procesar comando
case "${1:-help}" in
  start)
    start_db
    ;;
  stop)
    stop_db
    ;;
  restart)
    restart_db
    ;;
  reset)
    reset_db
    ;;
  clean)
    clean_db
    ;;
  status)
    show_status
    ;;
  logs)
    show_logs
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    print_error "Comando desconocido: $1"
    echo ""
    show_help
    exit 1
    ;;
esac
