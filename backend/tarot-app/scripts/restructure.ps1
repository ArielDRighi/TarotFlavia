# Script para refactorizar estructura del proyecto NestJS
# Ejecutar desde: backend/tarot-app/
# Comando: .\scripts\restructure.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando refactorización de estructura..." -ForegroundColor Cyan
Write-Host ""

# 1. Crear estructura de carpetas objetivo
Write-Host "📁 Creando estructura de carpetas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src/modules/tarot" | Out-Null
New-Item -ItemType Directory -Force -Path "src/common/decorators" | Out-Null
New-Item -ItemType Directory -Force -Path "src/common/filters" | Out-Null
New-Item -ItemType Directory -Force -Path "src/common/guards" | Out-Null
New-Item -ItemType Directory -Force -Path "src/common/interceptors" | Out-Null
New-Item -ItemType Directory -Force -Path "src/common/pipes" | Out-Null
New-Item -ItemType Directory -Force -Path "src/common/utils" | Out-Null
New-Item -ItemType Directory -Force -Path "src/database/migrations" | Out-Null
New-Item -ItemType Directory -Force -Path "src/database/seeds" | Out-Null

# 2. Mover módulos de autenticación y usuarios
Write-Host "📦 Moviendo módulos auth y users..." -ForegroundColor Yellow
Move-Item -Path "src/auth" -Destination "src/modules/" -Force
Move-Item -Path "src/users" -Destination "src/modules/" -Force

# 3. Mover módulos de tarot
Write-Host "📦 Moviendo módulos de tarot..." -ForegroundColor Yellow
Move-Item -Path "src/cards" -Destination "src/modules/tarot/" -Force
Move-Item -Path "src/decks" -Destination "src/modules/tarot/" -Force
Move-Item -Path "src/readings" -Destination "src/modules/tarot/" -Force
Move-Item -Path "src/interpretations" -Destination "src/modules/tarot/" -Force
Move-Item -Path "src/spreads" -Destination "src/modules/tarot/" -Force

# 4. Mover categories
Write-Host "📦 Moviendo módulo categories..." -ForegroundColor Yellow
Move-Item -Path "src/categories" -Destination "src/modules/" -Force

# 5. Mover migrations a database
Write-Host "📦 Moviendo migrations..." -ForegroundColor Yellow
if (Test-Path "src/migrations") {
    Get-ChildItem -Path "src/migrations" | Move-Item -Destination "src/database/migrations/" -Force
    Remove-Item -Path "src/migrations" -Force
}

# 6. Función para actualizar imports en un archivo
function Update-Imports {
    param(
        [string]$FilePath
    )
    
    $content = Get-Content $FilePath -Raw
    
    # Auth
    $content = $content -replace "from ['\`"]\.\.\/auth\/", "from '../modules/auth/"
    $content = $content -replace "from ['\`"]src\/auth\/", "from 'src/modules/auth/"
    
    # Users
    $content = $content -replace "from ['\`"]\.\.\/users\/", "from '../modules/users/"
    $content = $content -replace "from ['\`"]src\/users\/", "from 'src/modules/users/"
    
    # Cards
    $content = $content -replace "from ['\`"]\.\.\/cards\/", "from '../modules/tarot/cards/"
    $content = $content -replace "from ['\`"]src\/cards\/", "from 'src/modules/tarot/cards/"
    
    # Decks
    $content = $content -replace "from ['\`"]\.\.\/decks\/", "from '../modules/tarot/decks/"
    $content = $content -replace "from ['\`"]src\/decks\/", "from 'src/modules/tarot/decks/"
    
    # Readings
    $content = $content -replace "from ['\`"]\.\.\/readings\/", "from '../modules/tarot/readings/"
    $content = $content -replace "from ['\`"]src\/readings\/", "from 'src/modules/tarot/readings/"
    
    # Interpretations
    $content = $content -replace "from ['\`"]\.\.\/interpretations\/", "from '../modules/tarot/interpretations/"
    $content = $content -replace "from ['\`"]src\/interpretations\/", "from 'src/modules/tarot/interpretations/"
    
    # Spreads
    $content = $content -replace "from ['\`"]\.\.\/spreads\/", "from '../modules/tarot/spreads/"
    $content = $content -replace "from ['\`"]src\/spreads\/", "from 'src/modules/tarot/spreads/"
    
    # Categories
    $content = $content -replace "from ['\`"]\.\.\/categories\/", "from '../modules/categories/"
    $content = $content -replace "from ['\`"]src\/categories\/", "from 'src/modules/categories/"
    
    # Migrations
    $content = $content -replace "from ['\`"]\.\.\/migrations\/", "from '../database/migrations/"
    $content = $content -replace "from ['\`"]src\/migrations\/", "from 'src/database/migrations/"
    
    Set-Content -Path $FilePath -Value $content -NoNewline
}

# 7. Actualizar imports en todos los archivos TypeScript
Write-Host "🔄 Actualizando imports..." -ForegroundColor Yellow
$tsFiles = Get-ChildItem -Path "src" -Filter "*.ts" -Recurse
$total = $tsFiles.Count
$current = 0

foreach ($file in $tsFiles) {
    $current++
    Write-Progress -Activity "Actualizando imports" -Status "$current de $total" -PercentComplete (($current / $total) * 100)
    Update-Imports -FilePath $file.FullName
}

Write-Progress -Activity "Actualizando imports" -Completed

Write-Host ""
Write-Host "✅ Estructura refactorizada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ejecutar: npm run build" -ForegroundColor White
Write-Host "2. Ejecutar: npm run test" -ForegroundColor White
Write-Host "3. Si hay errores de imports, revisar manualmente" -ForegroundColor White
Write-Host "4. Commit: git add -A && git commit -m 'refactor: reorganizar estructura según best practices'" -ForegroundColor White
Write-Host ""
