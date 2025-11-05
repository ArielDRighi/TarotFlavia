# Limpia recursos Docker antiguos (tarotflavia-*) después de migración exitosa

$ErrorActionPreference = "Stop"

Write-Host "🧹 Limpieza de recursos Docker antiguos (tarotflavia-*)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esta operación eliminará permanentemente:" -ForegroundColor Red
Write-Host "   - Contenedores: tarotflavia-postgres-db, tarotflavia-pgadmin" -ForegroundColor Yellow
Write-Host "   - Volúmenes: tarotflavia-postgres-data, tarotflavia-pgadmin-data" -ForegroundColor Yellow
Write-Host "   - Network: tarotflavia-network" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Asegúrate de que:" -ForegroundColor Yellow
Write-Host "   ✓ La aplicación funciona correctamente con los nuevos contenedores" -ForegroundColor Gray
Write-Host "   ✓ Tienes backups recientes" -ForegroundColor Gray
Write-Host "   ✓ Has verificado los datos en el nuevo contenedor" -ForegroundColor Gray
Write-Host ""

$confirmation = Read-Host "¿Deseas continuar con la limpieza? (escribe 'SI' para confirmar)"

if ($confirmation -ne "SI") {
    Write-Host "❌ Limpieza cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🗑️  Iniciando limpieza..." -ForegroundColor Yellow
Write-Host ""

# Detener contenedores si están corriendo
Write-Host "1. Deteniendo contenedores antiguos..." -ForegroundColor Yellow
try {
    docker stop tarotflavia-postgres-db 2>$null
    Write-Host "   ✓ tarotflavia-postgres-db detenido" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-postgres-db no estaba corriendo" -ForegroundColor Gray
}

try {
    docker stop tarotflavia-pgadmin 2>$null
    Write-Host "   ✓ tarotflavia-pgadmin detenido" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-pgadmin no estaba corriendo" -ForegroundColor Gray
}
Write-Host ""

# Eliminar contenedores
Write-Host "2. Eliminando contenedores..." -ForegroundColor Yellow
try {
    docker rm tarotflavia-postgres-db 2>$null
    Write-Host "   ✓ tarotflavia-postgres-db eliminado" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-postgres-db no existe" -ForegroundColor Gray
}

try {
    docker rm tarotflavia-pgadmin 2>$null
    Write-Host "   ✓ tarotflavia-pgadmin eliminado" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-pgadmin no existe" -ForegroundColor Gray
}
Write-Host ""

# Eliminar volúmenes
Write-Host "3. Eliminando volúmenes..." -ForegroundColor Yellow
try {
    docker volume rm tarotflavia-postgres-data 2>$null
    Write-Host "   ✓ tarotflavia-postgres-data eliminado" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-postgres-data no existe" -ForegroundColor Gray
}

try {
    docker volume rm tarotflavia-pgadmin-data 2>$null
    Write-Host "   ✓ tarotflavia-pgadmin-data eliminado" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-pgadmin-data no existe" -ForegroundColor Gray
}
Write-Host ""

# Eliminar network (solo si no está en uso)
Write-Host "4. Eliminando network..." -ForegroundColor Yellow
try {
    docker network rm tarotflavia-network 2>$null
    Write-Host "   ✓ tarotflavia-network eliminado" -ForegroundColor Green
}
catch {
    Write-Host "   ℹ️  tarotflavia-network no existe o está en uso" -ForegroundColor Gray
}
Write-Host ""

# Verificar limpieza
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "5. Verificando limpieza..." -ForegroundColor Yellow
Write-Host ""

$remainingContainers = (docker ps -a --filter "name=tarotflavia" --format "{{.Names}}" 2>$null | Measure-Object).Count
$remainingVolumes = (docker volume ls --filter "name=tarotflavia" --format "{{.Name}}" 2>$null | Measure-Object).Count
$remainingNetworks = (docker network ls --filter "name=tarotflavia" --format "{{.Name}}" 2>$null | Measure-Object).Count

if ($remainingContainers -eq 0 -and $remainingVolumes -eq 0 -and $remainingNetworks -eq 0) {
    Write-Host "✅ Limpieza completada exitosamente" -ForegroundColor Green
    Write-Host "   No quedan recursos tarotflavia-* en Docker" -ForegroundColor Gray
}
else {
    Write-Host "⚠️  Algunos recursos no pudieron eliminarse:" -ForegroundColor Yellow
    if ($remainingContainers -gt 0) { Write-Host "   - Contenedores restantes: $remainingContainers" -ForegroundColor Yellow }
    if ($remainingVolumes -gt 0) { Write-Host "   - Volúmenes restantes: $remainingVolumes" -ForegroundColor Yellow }
    if ($remainingNetworks -gt 0) { Write-Host "   - Networks restantes: $remainingNetworks" -ForegroundColor Yellow }
    Write-Host ""
    Write-Host "   Revisa manualmente con:" -ForegroundColor Gray
    Write-Host "   → docker ps -a --filter 'name=tarotflavia'" -ForegroundColor Gray
    Write-Host "   → docker volume ls --filter 'name=tarotflavia'" -ForegroundColor Gray
    Write-Host "   → docker network ls --filter 'name=tarotflavia'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 IMPORTANTE: Los backups en backups/migration-* se mantienen" -ForegroundColor Cyan
Write-Host "   Puedes eliminarlos manualmente después de confirmar que todo funciona" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
