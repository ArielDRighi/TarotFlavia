#!/bin/bash

# ============================================
# Script de Testeo de Endpoints Admin Tarotistas
# Módulo: tarotistas (Clean Architecture)
# Tarea: TASK-ARCH-008 Post-Refactorización
# Fecha: 2025-01-27
# ============================================

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@tarotflavia.com"
ADMIN_PASSWORD="Admin123!"
TOKEN=""

# Función para imprimir headers
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Función para imprimir success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Función para imprimir error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para imprimir warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Función para imprimir info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para hacer request y mostrar respuesta
make_request() {
    local METHOD=$1
    local ENDPOINT=$2
    local DATA=$3
    local DESCRIPTION=$4
    
    echo -e "${YELLOW}Test: ${DESCRIPTION}${NC}"
    echo -e "${BLUE}${METHOD} ${ENDPOINT}${NC}"
    
    if [ -z "$DATA" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X ${METHOD} \
            "${BASE_URL}${ENDPOINT}" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X ${METHOD} \
            "${BASE_URL}${ENDPOINT}" \
            -H "Authorization: Bearer ${TOKEN}" \
            -H "Content-Type: application/json" \
            -d "${DATA}")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [[ $HTTP_CODE -ge 200 && $HTTP_CODE -lt 300 ]]; then
        print_success "Status: ${HTTP_CODE}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        print_error "Status: ${HTTP_CODE}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    fi
    
    echo ""
}

# ============================================
# 1. AUTENTICACIÓN
# ============================================
print_header "1. AUTENTICACIÓN"

print_info "Autenticando como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    print_error "No se pudo obtener el token de autenticación"
    print_info "Respuesta: $LOGIN_RESPONSE"
    exit 1
fi

print_success "Token obtenido: ${TOKEN:0:20}..."

# ============================================
# 2. CRUD TAROTISTAS
# ============================================
print_header "2. CRUD TAROTISTAS"

# 2.1 Crear Tarotista
make_request "POST" "/admin/tarotistas" \
    '{
        "userId": 1,
        "nombrePublico": "Test Tarotista API",
        "biografia": "Tarotista creado via curl para testing de arquitectura limpia",
        "especialidades": ["amor", "trabajo"],
        "fotoPerfil": "https://example.com/avatar.jpg"
    }' \
    "Crear nuevo tarotista"

# Guardar ID del tarotista creado (asumiendo que es el último en la respuesta)
TAROTISTA_ID=2  # Ajustar según respuesta real

# 2.2 Listar Tarotistas
make_request "GET" "/admin/tarotistas?page=1&pageSize=10" "" \
    "Listar todos los tarotistas (paginado)"

# 2.3 Listar con filtros
make_request "GET" "/admin/tarotistas?estado=ACTIVO&isActive=true" "" \
    "Listar tarotistas activos"

# 2.4 Actualizar Tarotista
make_request "PUT" "/admin/tarotistas/${TAROTISTA_ID}" \
    '{
        "nombrePublico": "Test Tarotista ACTUALIZADO",
        "biografia": "Bio actualizada desde curl",
        "especialidades": ["amor", "trabajo", "espiritual"]
    }' \
    "Actualizar perfil de tarotista"

# ============================================
# 3. GESTIÓN DE ESTADO
# ============================================
print_header "3. GESTIÓN DE ESTADO"

# 3.1 Desactivar Tarotista
make_request "PUT" "/admin/tarotistas/${TAROTISTA_ID}/deactivate" "" \
    "Desactivar tarotista (soft delete)"

# 3.2 Reactivar Tarotista
make_request "PUT" "/admin/tarotistas/${TAROTISTA_ID}/reactivate" "" \
    "Reactivar tarotista"

# ============================================
# 4. CONFIGURACIÓN DE IA
# ============================================
print_header "4. CONFIGURACIÓN DE IA"

# 4.1 Obtener Configuración
make_request "GET" "/admin/tarotistas/${TAROTISTA_ID}/config" "" \
    "Obtener configuración de IA actual"

# 4.2 Actualizar Configuración
make_request "PUT" "/admin/tarotistas/${TAROTISTA_ID}/config" \
    '{
        "systemPromptIdentity": "Soy un tarotista de prueba modificado via API",
        "systemPromptGuidelines": "Usar lenguaje amigable y positivo durante tests",
        "temperature": 0.8,
        "maxTokens": 1000
    }' \
    "Actualizar configuración de IA"

# 4.3 Resetear Configuración
make_request "POST" "/admin/tarotistas/${TAROTISTA_ID}/config/reset" "" \
    "Resetear configuración a valores por defecto"

# ============================================
# 5. SIGNIFICADOS PERSONALIZADOS
# ============================================
print_header "5. SIGNIFICADOS PERSONALIZADOS"

# 5.1 Crear Significado Personalizado
make_request "POST" "/admin/tarotistas/${TAROTISTA_ID}/meanings" \
    '{
        "cardId": 1,
        "isReversed": false,
        "meaning": "Significado personalizado de El Loco para testing",
        "keywords": ["libertad", "testing", "curl"]
    }' \
    "Crear significado personalizado"

# Guardar ID del significado creado
MEANING_ID=1  # Ajustar según respuesta real

# 5.2 Listar Significados Personalizados
make_request "GET" "/admin/tarotistas/${TAROTISTA_ID}/meanings" "" \
    "Listar todos los significados personalizados"

# 5.3 Importación en Lote
make_request "POST" "/admin/tarotistas/${TAROTISTA_ID}/meanings/bulk" \
    '{
        "meanings": [
            {
                "cardId": 2,
                "isReversed": false,
                "meaning": "La Sacerdotisa - Significado custom bulk",
                "keywords": ["intuición", "misterio", "bulk"]
            },
            {
                "cardId": 3,
                "isReversed": false,
                "meaning": "La Emperatriz - Significado custom bulk",
                "keywords": ["abundancia", "fertilidad", "bulk"]
            }
        ]
    }' \
    "Importar significados en lote"

# 5.4 Eliminar Significado Personalizado
make_request "DELETE" "/admin/tarotistas/${TAROTISTA_ID}/meanings/${MEANING_ID}" "" \
    "Eliminar significado personalizado"

# ============================================
# 6. APLICACIONES
# ============================================
print_header "6. APLICACIONES DE TAROTISTAS"

# 6.1 Listar Aplicaciones
make_request "GET" "/admin/tarotistas/applications?estado=PENDIENTE" "" \
    "Listar aplicaciones pendientes"

# Nota: Para aprobar/rechazar, necesitamos un ID real de aplicación
# Estos tests solo se ejecutan si hay aplicaciones en DB

print_warning "Tests de aprobación/rechazo requieren IDs reales de aplicaciones"
print_info "Endpoints disponibles:"
print_info "  POST /admin/tarotistas/applications/:id/approve"
print_info "  POST /admin/tarotistas/applications/:id/reject"

# Ejemplo comentado (descomentar si hay aplicaciones):
# APPLICATION_ID=1
# make_request "POST" "/admin/tarotistas/applications/${APPLICATION_ID}/approve" \
#     '{
#         "adminNotes": "Aplicación aprobada desde curl testing"
#     }' \
#     "Aprobar aplicación de tarotista"

# ============================================
# RESUMEN FINAL
# ============================================
print_header "RESUMEN DE TESTING"

echo -e "${BLUE}Endpoints Testeados:${NC}"
echo "✅ POST   /admin/tarotistas - Crear tarotista"
echo "✅ GET    /admin/tarotistas - Listar tarotistas"
echo "✅ PUT    /admin/tarotistas/:id - Actualizar tarotista"
echo "✅ PUT    /admin/tarotistas/:id/deactivate - Desactivar"
echo "✅ PUT    /admin/tarotistas/:id/reactivate - Reactivar"
echo "✅ GET    /admin/tarotistas/:id/config - Obtener config IA"
echo "✅ PUT    /admin/tarotistas/:id/config - Actualizar config IA"
echo "✅ POST   /admin/tarotistas/:id/config/reset - Reset config"
echo "✅ POST   /admin/tarotistas/:id/meanings - Crear significado"
echo "✅ GET    /admin/tarotistas/:id/meanings - Listar significados"
echo "✅ DELETE /admin/tarotistas/:id/meanings/:id - Eliminar significado"
echo "✅ POST   /admin/tarotistas/:id/meanings/bulk - Bulk import"
echo "✅ GET    /admin/tarotistas/applications - Listar aplicaciones"
echo "⚠️  POST   /admin/tarotistas/applications/:id/approve - (requiere ID real)"
echo "⚠️  POST   /admin/tarotistas/applications/:id/reject - (requiere ID real)"

echo -e "\n${GREEN}Total: 13/15 endpoints testeados${NC}"
echo -e "${YELLOW}2 endpoints requieren datos previos en BD${NC}\n"

print_success "Testing completado!"
print_info "Revisar resultados arriba para validar funcionamiento"
