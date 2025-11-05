# Script PowerShell para resetear base de datos E2E
# Uso: .\scripts\db-e2e-reset.ps1
# Descripción: Limpia la DB E2E, ejecuta migraciones y seeders

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

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Main
Write-Host ""
Write-Info "🔄 Reseteando base de datos E2E..."
Write-Host ""

# 1. Limpiar base de datos
Write-Info "Paso 1/3: Limpiando base de datos..."
try {
    & "$PSScriptRoot\db-e2e-clean.ps1"
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
    $env:DATABASE_URL = "postgresql://$($env:TAROT_E2E_DB_USER):$($env:TAROT_E2E_DB_PASSWORD)@localhost:$($env:TAROT_E2E_DB_PORT)/$($env:TAROT_E2E_DB_NAME)"
    
    if (-not $env:DATABASE_URL) {
        # Usar defaults si las variables no están definidas
        $dbUser = if ($env:TAROT_E2E_DB_USER) { $env:TAROT_E2E_DB_USER } else { "tarot_e2e_user" }
        $dbPassword = if ($env:TAROT_E2E_DB_PASSWORD) { $env:TAROT_E2E_DB_PASSWORD } else { "tarot_e2e_password_2024" }
        $dbPort = if ($env:TAROT_E2E_DB_PORT) { $env:TAROT_E2E_DB_PORT } else { "5436" }
        $dbName = if ($env:TAROT_E2E_DB_NAME) { $env:TAROT_E2E_DB_NAME } else { "tarot_e2e" }
        
        $env:DATABASE_URL = "postgresql://${dbUser}:${dbPassword}@localhost:${dbPort}/${dbName}"
    }
    
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
    $env:NODE_ENV = "test"
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
Write-Success "✅ Base de datos E2E reseteada completamente"
Write-Host ""
