# Script PowerShell para limpiar base de datos E2E
# Uso: .\scripts\db-e2e-clean.ps1
# Descripción: Elimina todos los datos de la DB E2E manteniendo el schema

param()

$ErrorActionPreference = "Stop"

# Variables de configuración
$ContainerName = "tarot-postgres-e2e-db"
$DbUser = if ($env:TAROT_E2E_DB_USER) { $env:TAROT_E2E_DB_USER } else { "tarot_e2e_user" }
$DbName = if ($env:TAROT_E2E_DB_NAME) { $env:TAROT_E2E_DB_NAME } else { "tarot_e2e" }

# Función para imprimir mensajes con color
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Verificar que Docker está ejecutándose
function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Verificar estado del contenedor
function Get-ContainerStatus {
    try {
        $status = docker ps -a --filter "name=$ContainerName" --format "{{.Status}}" 2>$null
        return $status
    }
    catch {
        return "not_found"
    }
}

# Main
Write-Host ""
Write-Info "🧹 Limpiando base de datos E2E..."
Write-Host ""

# Verificar Docker
if (-not (Test-DockerRunning)) {
    Write-Error-Custom "Docker no está ejecutándose. Por favor inicia Docker primero."
    exit 1
}

# Verificar que el contenedor existe y está corriendo
$status = Get-ContainerStatus

if ($status -eq "not_found") {
    Write-Error-Custom "Contenedor '$ContainerName' no encontrado."
    Write-Info "Ejecuta: docker-compose --profile e2e up -d tarot-postgres-e2e"
    exit 1
}

if ($status -notlike "*Up*") {
    Write-Error-Custom "Contenedor '$ContainerName' no está ejecutándose."
    Write-Info "Ejecuta: docker-compose --profile e2e start tarot-postgres-e2e"
    exit 1
}

# Limpiar base de datos (DROP SCHEMA + CREATE SCHEMA)
Write-Info "Eliminando datos de la base de datos E2E..."

try {
    $sqlCommand = @"
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO $DbUser;
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
"@

    docker exec -i $ContainerName psql -U $DbUser -d $DbName -c $sqlCommand 2>&1 | Out-Null
    
    Write-Success "Base de datos E2E limpiada exitosamente"
    Write-Host ""
    Write-Info "📝 Próximos pasos:"
    Write-Info "   1. Ejecutar migraciones: npm run db:e2e:migrate"
    Write-Info "   2. Ejecutar seeders: npm run seed (con NODE_ENV=test)"
    Write-Host ""
}
catch {
    Write-Error-Custom "Error al limpiar la base de datos: $_"
    exit 1
}
