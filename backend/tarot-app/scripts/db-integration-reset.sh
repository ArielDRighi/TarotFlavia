#!/bin/bash

# Script para resetear completamente la base de datos de integración
# Uso: bash scripts/db-integration-reset.sh

set -e

echo "🔄 Reseteando base de datos de integración..."

# Variables de entorno
export PGPASSWORD="${TAROT_INTEGRATION_DB_PASSWORD:-tarot_integration_password_2024}"
DB_HOST="${TAROT_INTEGRATION_DB_HOST:-localhost}"
DB_PORT="${TAROT_INTEGRATION_DB_PORT:-5439}"
DB_USER="${TAROT_INTEGRATION_DB_USER:-tarot_integration_user}"
DB_NAME="${TAROT_INTEGRATION_DB_NAME:-tarot_integration}"

echo "📊 Verificando conexión a PostgreSQL..."
docker exec tarot-postgres-integration-db pg_isready -U "$DB_USER" -d "$DB_NAME" || {
  echo "❌ Error: Base de datos de integración no está disponible"
  echo "   Ejecuta: docker-compose up -d tarot-postgres-integration-db"
  exit 1
}

echo "🗑️  Eliminando todas las tablas..."
docker exec tarot-postgres-integration-db psql -U "$DB_USER" -d "$DB_NAME" -c "
DO \$\$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END \$\$;
"

echo "✅ Base de datos limpia"

echo "🔧 Ejecutando migraciones..."
npm run migration:run -- -d src/config/integration-data-source.ts

echo "✅ Migraciones ejecutadas"

echo ""
echo "🎉 Base de datos de integración reseteada correctamente"
echo ""
echo "Ahora puedes ejecutar los tests de integración:"
echo "  npm run test:integration"
