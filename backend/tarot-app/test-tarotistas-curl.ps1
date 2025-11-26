# ============================================
# Script de Testeo de Endpoints Admin Tarotistas
# Módulo: tarotistas (Clean Architecture)
# Tarea: TASK-ARCH-008 Post-Refactorización
# Fecha: 2025-01-27
# ============================================

# Configuración
$BASE_URL = "http://localhost:3000"
$ADMIN_EMAIL = "admin@tarotflavia.com"
$ADMIN_PASSWORD = "Admin123!"
$TOKEN = ""

# Función para imprimir headers
function Print-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

# Función para hacer request
function Make-Request {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data,
        [string]$Description
    )
    
    Write-Host "Test: $Description" -ForegroundColor Yellow
    Write-Host "$Method $Endpoint" -ForegroundColor Blue
    
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    
    try {
        if ($Data) {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -Body $Data
        } else {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers
        }
        
        Write-Host "✅ Success" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 10
    }
    catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host $_.Exception.Response
    }
    
    Write-Host ""
}

# ============================================
# 1. AUTENTICACIÓN
# ============================================
Print-Header "1. AUTENTICACIÓN"

Write-Host "Autenticando como admin..." -ForegroundColor Cyan

$loginData = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $TOKEN = $loginResponse.accessToken
    
    if ($TOKEN) {
        Write-Host "✅ Token obtenido: $($TOKEN.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "❌ No se pudo obtener el token" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. CRUD TAROTISTAS
# ============================================
Print-Header "2. CRUD TAROTISTAS"

# 2.1 Crear Tarotista
$createData = @{
    userId = 1
    nombrePublico = "Test Tarotista API"
    biografia = "Tarotista creado via PowerShell para testing de arquitectura limpia"
    especialidades = @("amor", "trabajo")
    fotoPerfil = "https://example.com/avatar.jpg"
} | ConvertTo-Json

Make-Request -Method "POST" -Endpoint "/admin/tarotistas" -Data $createData -Description "Crear nuevo tarotista"

$TAROTISTA_ID = 2  # Ajustar según respuesta real

# 2.2 Listar Tarotistas
Make-Request -Method "GET" -Endpoint "/admin/tarotistas?page=1&pageSize=10" -Description "Listar todos los tarotistas (paginado)"

# 2.3 Listar con filtros
Make-Request -Method "GET" -Endpoint "/admin/tarotistas?estado=ACTIVO&isActive=true" -Description "Listar tarotistas activos"

# 2.4 Actualizar Tarotista
$updateData = @{
    nombrePublico = "Test Tarotista ACTUALIZADO"
    biografia = "Bio actualizada desde PowerShell"
    especialidades = @("amor", "trabajo", "espiritual")
} | ConvertTo-Json

Make-Request -Method "PUT" -Endpoint "/admin/tarotistas/$TAROTISTA_ID" -Data $updateData -Description "Actualizar perfil de tarotista"

# ============================================
# 3. GESTIÓN DE ESTADO
# ============================================
Print-Header "3. GESTIÓN DE ESTADO"

Make-Request -Method "PUT" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/deactivate" -Description "Desactivar tarotista (soft delete)"
Make-Request -Method "PUT" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/reactivate" -Description "Reactivar tarotista"

# ============================================
# 4. CONFIGURACIÓN DE IA
# ============================================
Print-Header "4. CONFIGURACIÓN DE IA"

Make-Request -Method "GET" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/config" -Description "Obtener configuración de IA actual"

$configData = @{
    systemPromptIdentity = "Soy un tarotista de prueba modificado via API"
    systemPromptGuidelines = "Usar lenguaje amigable y positivo durante tests"
    temperature = 0.8
    maxTokens = 1000
} | ConvertTo-Json

Make-Request -Method "PUT" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/config" -Data $configData -Description "Actualizar configuración de IA"
Make-Request -Method "POST" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/config/reset" -Description "Resetear configuración a valores por defecto"

# ============================================
# 5. SIGNIFICADOS PERSONALIZADOS
# ============================================
Print-Header "5. SIGNIFICADOS PERSONALIZADOS"

$meaningData = @{
    cardId = 1
    isReversed = $false
    meaning = "Significado personalizado de El Loco para testing"
    keywords = @("libertad", "testing", "powershell")
} | ConvertTo-Json

Make-Request -Method "POST" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/meanings" -Data $meaningData -Description "Crear significado personalizado"

$MEANING_ID = 1  # Ajustar según respuesta real

Make-Request -Method "GET" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/meanings" -Description "Listar todos los significados personalizados"

$bulkData = @{
    meanings = @(
        @{
            cardId = 2
            isReversed = $false
            meaning = "La Sacerdotisa - Significado custom bulk"
            keywords = @("intuición", "misterio", "bulk")
        },
        @{
            cardId = 3
            isReversed = $false
            meaning = "La Emperatriz - Significado custom bulk"
            keywords = @("abundancia", "fertilidad", "bulk")
        }
    )
} | ConvertTo-Json -Depth 10

Make-Request -Method "POST" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/meanings/bulk" -Data $bulkData -Description "Importar significados en lote"
Make-Request -Method "DELETE" -Endpoint "/admin/tarotistas/$TAROTISTA_ID/meanings/$MEANING_ID" -Description "Eliminar significado personalizado"

# ============================================
# 6. APLICACIONES
# ============================================
Print-Header "6. APLICACIONES DE TAROTISTAS"

Make-Request -Method "GET" -Endpoint "/admin/tarotistas/applications?estado=PENDIENTE" -Description "Listar aplicaciones pendientes"

Write-Host "⚠️  Tests de aprobación/rechazo requieren IDs reales de aplicaciones" -ForegroundColor Yellow
Write-Host "ℹ️  Endpoints disponibles:" -ForegroundColor Cyan
Write-Host "  POST /admin/tarotistas/applications/:id/approve"
Write-Host "  POST /admin/tarotistas/applications/:id/reject"

# ============================================
# RESUMEN FINAL
# ============================================
Print-Header "RESUMEN DE TESTING"

Write-Host "Endpoints Testeados:" -ForegroundColor Blue
Write-Host "✅ POST   /admin/tarotistas - Crear tarotista"
Write-Host "✅ GET    /admin/tarotistas - Listar tarotistas"
Write-Host "✅ PUT    /admin/tarotistas/:id - Actualizar tarotista"
Write-Host "✅ PUT    /admin/tarotistas/:id/deactivate - Desactivar"
Write-Host "✅ PUT    /admin/tarotistas/:id/reactivate - Reactivar"
Write-Host "✅ GET    /admin/tarotistas/:id/config - Obtener config IA"
Write-Host "✅ PUT    /admin/tarotistas/:id/config - Actualizar config IA"
Write-Host "✅ POST   /admin/tarotistas/:id/config/reset - Reset config"
Write-Host "✅ POST   /admin/tarotistas/:id/meanings - Crear significado"
Write-Host "✅ GET    /admin/tarotistas/:id/meanings - Listar significados"
Write-Host "✅ DELETE /admin/tarotistas/:id/meanings/:id - Eliminar significado"
Write-Host "✅ POST   /admin/tarotistas/:id/meanings/bulk - Bulk import"
Write-Host "✅ GET    /admin/tarotistas/applications - Listar aplicaciones"
Write-Host "⚠️  POST   /admin/tarotistas/applications/:id/approve - (requiere ID real)"
Write-Host "⚠️  POST   /admin/tarotistas/applications/:id/reject - (requiere ID real)"

Write-Host "`n✅ Total: 13/15 endpoints testeados" -ForegroundColor Green
Write-Host "⚠️  2 endpoints requieren datos previos en BD`n" -ForegroundColor Yellow

Write-Host "✅ Testing completado!" -ForegroundColor Green
Write-Host "ℹ️  Revisar resultados arriba para validar funcionamiento" -ForegroundColor Cyan
