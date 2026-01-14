# Script para resetear completamente la base de datos de integración (PowerShell)
# Uso: powershell -ExecutionPolicy Bypass -File scripts/db-integration-reset.ps1

Write-Host "🔄 Reseteando base de datos de integración..." -ForegroundColor Cyan

# Variables de entorno
$env:PGPASSWORD = if ($env:TAROT_INTEGRATION_DB_PASSWORD) { $env:TAROT_INTEGRATION_DB_PASSWORD } else { "tarot_integration_password_2024" }
$DB_HOST = if ($env:TAROT_INTEGRATION_DB_HOST) { $env:TAROT_INTEGRATION_DB_HOST } else { "localhost" }
$DB_PORT = if ($env:TAROT_INTEGRATION_DB_PORT) { $env:TAROT_INTEGRATION_DB_PORT } else { "5439" }
$DB_USER = if ($env:TAROT_INTEGRATION_DB_USER) { $env:TAROT_INTEGRATION_DB_USER } else { "tarot_integration_user" }
$DB_NAME = if ($env:TAROT_INTEGRATION_DB_NAME) { $env:TAROT_INTEGRATION_DB_NAME } else { "tarot_integration" }

Write-Host "📊 Verificando conexión a PostgreSQL..." -ForegroundColor Yellow
$checkConnection = docker exec tarot-postgres-integration-db pg_isready -U $DB_USER -d $DB_NAME 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Base de datos de integración no está disponible" -ForegroundColor Red
    Write-Host "   Ejecuta: docker-compose up -d tarot-postgres-integration-db" -ForegroundColor Yellow
    exit 1
}

Write-Host "🗑️  Eliminando todas las tablas..." -ForegroundColor Yellow
$dropScript = @"
DO `$`$ 
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
END `$`$;
"@

docker exec tarot-postgres-integration-db psql -U $DB_USER -d $DB_NAME -c $dropScript

Write-Host "✅ Base de datos limpia" -ForegroundColor Green

Write-Host "🔧 Ejecutando migraciones..." -ForegroundColor Yellow
npm run migration:run -- -d src/config/integration-data-source.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migraciones ejecutadas" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Base de datos de integración reseteada correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ahora puedes ejecutar los tests de integración:" -ForegroundColor Cyan
    Write-Host "  npm run test:integration" -ForegroundColor White
} else {
    Write-Host "❌ Error ejecutando migraciones" -ForegroundColor Red
    exit 1
}
