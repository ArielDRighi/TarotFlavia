# Migra datos de contenedores antiguos (tarotflavia-*) a nuevos (tarot-*)
# Y proporciona herramientas para limpieza controlada

$ErrorActionPreference = "Stop"

Write-Host "🔄 Migración de nomenclatura Docker: tarotflavia-* → tarot-*" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Variables
$OLD_CONTAINER = "tarotflavia-postgres-db"
$OLD_PGADMIN = "tarotflavia-pgadmin"
$OLD_VOLUME_DB = "tarotflavia-postgres-data"
$OLD_VOLUME_PGADMIN = "tarotflavia-pgadmin-data"
$OLD_NETWORK = "tarotflavia-network"

$NEW_CONTAINER = "tarot-postgres-db"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_DIR = "backups/migration-$TIMESTAMP"

# Función para verificar si un contenedor existe
function Test-ContainerExists {
    param([string]$containerName)
    $containers = docker ps -a --format '{{.Names}}' 2>$null
    return $containers -contains $containerName
}

# Función para verificar si un volumen existe
function Test-VolumeExists {
    param([string]$volumeName)
    $volumes = docker volume ls --format '{{.Name}}' 2>$null
    return $volumes -contains $volumeName
}

# FASE 1: BACKUP
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "FASE 1: BACKUP DE DATOS EXISTENTES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if (Test-ContainerExists $OLD_CONTAINER) {
    Write-Host "📦 Contenedor antiguo encontrado: $OLD_CONTAINER" -ForegroundColor Green
    
    # Verificar si el contenedor está corriendo
    $runningContainers = docker ps --format '{{.Names}}' 2>$null
    if ($runningContainers -contains $OLD_CONTAINER) {
        Write-Host "✓ Contenedor está corriendo" -ForegroundColor Green
        
        # Crear backup
        Write-Host "💾 Creando backup de base de datos..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
        
        docker exec $OLD_CONTAINER pg_dump -U tarotflavia_user tarotflavia_db > "$BACKUP_DIR/tarotflavia_db.sql"
        
        # Verificar tamaño del backup
        $backupFile = Get-Item "$BACKUP_DIR/tarotflavia_db.sql"
        $backupSize = "{0:N2} MB" -f ($backupFile.Length / 1MB)
        Write-Host "✅ Backup creado exitosamente: $backupSize" -ForegroundColor Green
        Write-Host "   Ubicación: $BACKUP_DIR/tarotflavia_db.sql" -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️  Contenedor existe pero no está corriendo" -ForegroundColor Yellow
        Write-Host "   Iniciando contenedor para backup..." -ForegroundColor Gray
        docker start $OLD_CONTAINER | Out-Null
        Start-Sleep -Seconds 5
        
        New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
        docker exec $OLD_CONTAINER pg_dump -U tarotflavia_user tarotflavia_db > "$BACKUP_DIR/tarotflavia_db.sql"
        
        $backupFile = Get-Item "$BACKUP_DIR/tarotflavia_db.sql"
        $backupSize = "{0:N2} MB" -f ($backupFile.Length / 1MB)
        Write-Host "✅ Backup creado: $backupSize" -ForegroundColor Green
    }
    
    # Backup de configuración de pgAdmin (si existe)
    if (Test-ContainerExists $OLD_PGADMIN) {
        Write-Host "💾 Backup de configuración pgAdmin..." -ForegroundColor Yellow
        docker cp "${OLD_PGADMIN}:/var/lib/pgadmin" "$BACKUP_DIR/pgadmin-config" 2>$null
        Write-Host "✓ Configuración pgAdmin respaldada" -ForegroundColor Green
    }
    
    Write-Host ""
}
else {
    Write-Host "ℹ️  No se encontraron contenedores antiguos (tarotflavia-*)" -ForegroundColor Cyan
    Write-Host "   Esta es una instalación nueva o ya se migró anteriormente." -ForegroundColor Gray
    Write-Host ""
}

# FASE 2: INFORMACIÓN PRE-MIGRACIÓN
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "FASE 2: ESTADO ACTUAL DE RECURSOS DOCKER" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Contenedores tarotflavia-*:" -ForegroundColor Yellow
docker ps -a --filter "name=tarotflavia" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "   (ninguno)" -ForegroundColor Gray }
Write-Host ""

Write-Host "📊 Volúmenes tarotflavia-*:" -ForegroundColor Yellow
docker volume ls --filter "name=tarotflavia" --format "table {{.Name}}\t{{.Driver}}" 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "   (ninguno)" -ForegroundColor Gray }
Write-Host ""

Write-Host "📊 Networks tarotflavia-*:" -ForegroundColor Yellow
docker network ls --filter "name=tarotflavia" --format "table {{.Name}}\t{{.Driver}}" 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "   (ninguno)" -ForegroundColor Gray }
Write-Host ""

# FASE 3: INSTRUCCIONES
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "FASE 3: PRÓXIMOS PASOS PARA COMPLETAR LA MIGRACIÓN" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  ACTUALIZAR CONFIGURACIÓN:" -ForegroundColor Yellow
Write-Host "   → Actualizar archivo .env con nuevas variables TAROT_*" -ForegroundColor Gray
Write-Host "   → Revisar docker-compose.yml actualizado" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  LEVANTAR NUEVOS SERVICIOS:" -ForegroundColor Yellow
Write-Host "   → docker-compose up -d tarot-postgres" -ForegroundColor Gray
Write-Host "   → docker-compose --profile tools up -d  # (si usas pgAdmin)" -ForegroundColor Gray
Write-Host ""

if (Test-Path "$BACKUP_DIR/tarotflavia_db.sql") {
    Write-Host "3️⃣  RESTAURAR DATOS (si es necesario):" -ForegroundColor Yellow
    Write-Host "   → Get-Content $BACKUP_DIR/tarotflavia_db.sql | docker exec -i tarot-postgres-db psql -U tarot_user -d tarot_db" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "4️⃣  VERIFICAR APLICACIÓN:" -ForegroundColor Yellow
Write-Host "   → npm run start:dev" -ForegroundColor Gray
Write-Host "   → npm run test:e2e" -ForegroundColor Gray
Write-Host "   → Verificar que todo funciona correctamente" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣  LIMPIEZA DE RECURSOS ANTIGUOS (después de verificar):" -ForegroundColor Yellow
Write-Host "   → .\scripts\cleanup-old-docker-resources.ps1" -ForegroundColor Gray
Write-Host "   → O manualmente (ver script de limpieza)" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Script de migración completado" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
