# Script PowerShell para resetear base de datos de desarrollo
# Uso: .\scripts\db-dev-reset.ps1
# Descripción: Limpia la DB de desarrollo, ejecuta migraciones y seeders

param()

$ErrorActionPreference = "Stop"

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

# Main
Write-Host ""
Write-Warning "⚠️  ADVERTENCIA: Esta operación reseteará TODA la base de datos de DESARROLLO"
Write-Host ""
$confirmation = Read-Host "¿Estás seguro? (escribe 'SI' para confirmar)"

if ($confirmation -ne "SI") {
    Write-Info "Operación cancelada"
    exit 0
}

Write-Host ""
Write-Info "🔄 Reseteando base de datos de desarrollo..."
Write-Host ""

# 1. Limpiar base de datos
Write-Info "Paso 1/3: Limpiando base de datos..."
try {
    # Pasar confirmación automática al script de limpieza
    Write-Output "SI" | & "$PSScriptRoot\db-dev-clean.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "Error al limpiar base de datos"
    }
}
catch {
    Write-Error-Custom "Error en paso 1: $_"
    exit 1
}

Write-Host ""

# 2. Ejecutar migraciones
Write-Info "Paso 2/3: Ejecutando migraciones..."
try {
    npm run migration:run 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Error al ejecutar migraciones"
    }
    Write-Success "Migraciones ejecutadas"
}
catch {
    Write-Error-Custom "Error en paso 2: $_"
    exit 1
}

Write-Host ""

# 3. Ejecutar seeders
Write-Info "Paso 3/3: Ejecutando seeders..."
try {
    npm run seed 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "Error al ejecutar seeders"
    }
    Write-Success "Seeders ejecutados"
}
catch {
    Write-Error-Custom "Error en paso 3: $_"
    exit 1
}

Write-Host ""
Write-Success "✅ Base de datos de desarrollo reseteada completamente"
Write-Host ""
