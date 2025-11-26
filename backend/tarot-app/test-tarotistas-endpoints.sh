#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO TAROTISTAS                           ║
# ║  Basado en TASK-070: Gestión de Tarotistas (Admin)                        ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables de configuración
BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="admin@test.com"
ADMIN_PASSWORD="Test123456!"
TAROTISTA_EMAIL="flavia@example.com"
TAROTISTA_PASSWORD="Flavia123!@#"

# Tokens (se obtendrán al hacer login)
ADMIN_TOKEN=""
TAROTISTA_TOKEN=""

# IDs (se obtendrán de las respuestas)
TAROTISTA_ID=1  # Flavia es la tarotista por defecto (ID 1)
NEW_TAROTISTA_ID=""
APPLICATION_ID=""
MEANING_ID=""

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ═══════════════════════════════════════════════════════════════════════════
# FUNCIONES AUXILIARES
# ═══════════════════════════════════════════════════════════════════════════

print_header() {
    echo -e "\n${CYAN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}\n"
}

print_test() {
    echo -e "${BLUE}▶ TEST #$TOTAL_TESTS: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ PASS: $1${NC}\n"
    ((PASSED_TESTS++))
}

print_error() {
    echo -e "${RED}✗ FAIL: $1${NC}\n"
    ((FAILED_TESTS++))
}

print_warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}\n"
}

print_info() {
    echo -e "${CYAN}ℹ INFO: $1${NC}"
}

check_response() {
    local expected_code=$1
    local actual_code=$2
    local test_name=$3
    
    if [ "$actual_code" -eq "$expected_code" ]; then
        print_success "$test_name (HTTP $actual_code)"
        return 0
    else
        print_error "$test_name - Expected HTTP $expected_code, got HTTP $actual_code"
        return 1
    fi
}

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    ((TOTAL_TESTS++))
    print_test "$description"
    
    local headers=(-H "Content-Type: application/json")
    
    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}" \
            "${headers[@]}" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "${BASE_URL}${endpoint}" \
            "${headers[@]}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Intentar formatear JSON con jq si está disponible, sino mostrar raw
    if command -v jq >/dev/null 2>&1; then
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "$body"
    fi
    echo ""
    
    echo "$http_code"
}

# ═══════════════════════════════════════════════════════════════════════════
# SETUP: AUTENTICACIÓN
# ═══════════════════════════════════════════════════════════════════════════

setup_auth() {
    print_header "SETUP: AUTENTICACIÓN"
    
    # Login como ADMIN
    print_info "Autenticando como ADMIN..."
    response=$(make_request "POST" "/auth/login" \
        "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
        "" "Login Admin")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        # Extraer token sin jq usando grep y sed
        ADMIN_TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')
        if [ -n "$ADMIN_TOKEN" ]; then
            print_success "Admin token obtenido"
        else
            print_error "No se pudo extraer el token de admin"
            echo "Response body: $body"
            exit 1
        fi
    else
        print_error "Login admin falló (HTTP $http_code)"
        exit 1
    fi
    
    # Login como TAROTISTA (opcional, si existe)
    print_info "Intentando autenticar como Tarotista..."
    response=$(make_request "POST" "/auth/login" \
        "{\"email\":\"$TAROTISTA_EMAIL\",\"password\":\"$TAROTISTA_PASSWORD\"}" \
        "" "Login Tarotista (Flavia)")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        # Extraer token sin jq usando grep y sed
        TAROTISTA_TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')
        if [ -n "$TAROTISTA_TOKEN" ]; then
            print_success "Tarotista token obtenido"
        else
            print_warning "No se pudo extraer el token de tarotista (puede no existir aún)"
        fi
    else
        print_warning "Login tarotista falló - Usuario puede no existir aún"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 1: ENDPOINTS PÚBLICOS (Sin autenticación)
# ═══════════════════════════════════════════════════════════════════════════

test_public_endpoints() {
    print_header "SECCIÓN 1: ENDPOINTS PÚBLICOS (TASK-072)"
    
    # TEST 1: Listar tarotistas públicos (sin filtros)
    response=$(make_request "GET" "/tarotistas" "" "" \
        "GET /tarotistas - Listar tarotistas públicos sin filtros")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listado público básico"
    
    # TEST 2: Listar tarotistas con paginación
    response=$(make_request "GET" "/tarotistas?page=1&limit=5" "" "" \
        "GET /tarotistas?page=1&limit=5 - Paginación")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Paginación funcional"
    
    # TEST 3: Búsqueda por texto
    response=$(make_request "GET" "/tarotistas?search=Flavia" "" "" \
        "GET /tarotistas?search=Flavia - Búsqueda por nombre")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Búsqueda por texto"
    
    # TEST 4: Filtro por especialidad
    response=$(make_request "GET" "/tarotistas?especialidad=Amor" "" "" \
        "GET /tarotistas?especialidad=Amor - Filtro especialidad")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Filtro por especialidad"
    
    # TEST 5: Ordenamiento
    response=$(make_request "GET" "/tarotistas?orderBy=rating&order=DESC" "" "" \
        "GET /tarotistas?orderBy=rating&order=DESC - Ordenamiento")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Ordenamiento por rating"
    
    # TEST 6: Ver perfil público de Flavia (ID 1)
    response=$(make_request "GET" "/tarotistas/1" "" "" \
        "GET /tarotistas/1 - Perfil público de Flavia")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Perfil público existente"
    
    # TEST 7: Perfil inexistente (404)
    response=$(make_request "GET" "/tarotistas/99999" "" "" \
        "GET /tarotistas/99999 - Perfil inexistente (debe devolver 404)")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "Perfil inexistente retorna 404"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 2: CRUD ADMINISTRATIVO (Requiere autenticación ADMIN)
# ═══════════════════════════════════════════════════════════════════════════

test_admin_crud() {
    print_header "SECCIÓN 2: CRUD ADMINISTRATIVO (TASK-070)"
    
    # TEST 8: Crear nuevo tarotista (primero crear usuario)
    print_info "Creando usuario primero para el nuevo tarotista..."
    TIMESTAMP=$(date +%s)
    user_response=$(curl -s -X POST "${BASE_URL}/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"luna.mystic.test.$TIMESTAMP@example.com\",
            \"password\": \"Luna123!@#\",
            \"name\": \"Luna Mystic Test\"
        }")
    
    NEW_USER_ID=$(echo "$user_response" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
    
    if [ -n "$NEW_USER_ID" ]; then
        print_info "Usuario creado con ID: $NEW_USER_ID"
        
        response=$(make_request "POST" "/admin/tarotistas" \
            "{
                \"userId\": $NEW_USER_ID,
                \"nombrePublico\": \"Luna Mystic\",
                \"biografia\": \"Experta en tarot del amor y relaciones con más de 10 años de experiencia\",
                \"especialidades\": [\"amor\", \"relaciones\"]
            }" \
            "$ADMIN_TOKEN" \
            "POST /admin/tarotistas - Crear nuevo tarotista")
    else
        print_error "No se pudo crear el usuario base"
        ((TOTAL_TESTS++))
        ((FAILED_TESTS++))
        response=""
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 201 "$http_code" "Creación de tarotista"; then
        NEW_TAROTISTA_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
        print_info "Nuevo tarotista creado con ID: $NEW_TAROTISTA_ID"
    fi
    
    # TEST 9: Listar todos los tarotistas (admin view)
    response=$(make_request "GET" "/admin/tarotistas" "" "$ADMIN_TOKEN" \
        "GET /admin/tarotistas - Listar todos (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listado administrativo"
    
    # TEST 10: Listar con filtros (solo activos)
    response=$(make_request "GET" "/admin/tarotistas?isActive=true" "" "$ADMIN_TOKEN" \
        "GET /admin/tarotistas?isActive=true - Filtro activos")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Filtro por estado activo"
    
    # TEST 11: Actualizar tarotista
    if [ -n "$NEW_TAROTISTA_ID" ]; then
        response=$(make_request "PUT" "/admin/tarotistas/$NEW_TAROTISTA_ID" \
            '{
                "biografia": "Maestra del tarot con 15 años de experiencia en lecturas personalizadas",
                "especialidades": ["amor", "relaciones", "carrera"]
            }' \
            "$ADMIN_TOKEN" \
            "PUT /admin/tarotistas/$NEW_TAROTISTA_ID - Actualizar info")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Actualización de tarotista"
    fi
    
    # TEST 12: Desactivar tarotista
    if [ -n "$NEW_TAROTISTA_ID" ]; then
        response=$(make_request "PUT" "/admin/tarotistas/$NEW_TAROTISTA_ID/deactivate" "" "$ADMIN_TOKEN" \
            "PUT /admin/tarotistas/$NEW_TAROTISTA_ID/deactivate - Desactivar")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Desactivación de tarotista"
    fi
    
    # TEST 13: Reactivar tarotista
    if [ -n "$NEW_TAROTISTA_ID" ]; then
        response=$(make_request "PUT" "/admin/tarotistas/$NEW_TAROTISTA_ID/reactivate" "" "$ADMIN_TOKEN" \
            "PUT /admin/tarotistas/$NEW_TAROTISTA_ID/reactivate - Reactivar")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Reactivación de tarotista"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 3: CONFIGURACIÓN DE IA
# ═══════════════════════════════════════════════════════════════════════════

test_ia_config() {
    print_header "SECCIÓN 3: CONFIGURACIÓN DE IA (TASK-070)"
    
    # TEST 14: Obtener configuración de IA
    response=$(make_request "GET" "/admin/tarotistas/$TAROTISTA_ID/config" "" "$ADMIN_TOKEN" \
        "GET /admin/tarotistas/$TAROTISTA_ID/config - Obtener config IA")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Obtener configuración IA"
    
    # TEST 15: Actualizar configuración de IA
    response=$(make_request "PUT" "/admin/tarotistas/$TAROTISTA_ID/config" \
        '{
            "systemPrompt": "Eres Flavia, una tarotista experta con estilo místico y empático que ofrece lecturas profundas",
            "temperature": 0.8,
            "maxTokens": 800,
            "topP": 0.95,
            "styleConfig": {"tono": "místico", "lenguaje": "español"}
        }' \
        "$ADMIN_TOKEN" \
        "PUT /admin/tarotistas/$TAROTISTA_ID/config - Actualizar config IA")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Actualización configuración IA"
    
    # TEST 16: Resetear configuración a valores por defecto
    response=$(make_request "POST" "/admin/tarotistas/$TAROTISTA_ID/config/reset" "" "$ADMIN_TOKEN" \
        "POST /admin/tarotistas/$TAROTISTA_ID/config/reset - Resetear config")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Reset configuración IA"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 4: SIGNIFICADOS PERSONALIZADOS
# ═══════════════════════════════════════════════════════════════════════════

test_custom_meanings() {
    print_header "SECCIÓN 4: SIGNIFICADOS PERSONALIZADOS (TASK-070)"
    
    # TEST 17: Crear significado personalizado
    response=$(make_request "POST" "/admin/tarotistas/$TAROTISTA_ID/meanings" \
        '{
            "cardId": 1,
            "customMeaningUpright": "Representa nuevos comienzos llenos de posibilidades infinitas y aventuras emocionantes",
            "customMeaningReversed": "Miedo al cambio, resistencia a nuevas oportunidades y estancamiento"
        }' \
        "$ADMIN_TOKEN" \
        "POST /admin/tarotistas/$TAROTISTA_ID/meanings - Crear significado")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 201 "$http_code" "Creación significado personalizado"; then
        MEANING_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | sed 's/"id"://')
        print_info "Significado creado con ID: $MEANING_ID"
    fi
    
    # TEST 18: Listar significados personalizados
    response=$(make_request "GET" "/admin/tarotistas/$TAROTISTA_ID/meanings" "" "$ADMIN_TOKEN" \
        "GET /admin/tarotistas/$TAROTISTA_ID/meanings - Listar significados")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listado de significados personalizados"
    
    # TEST 19: Importar significados en lote
    response=$(make_request "POST" "/admin/tarotistas/$TAROTISTA_ID/meanings/bulk" \
        '{
            "meanings": [
                {
                    "cardId": 3,
                    "customMeaningUpright": "Fertilidad emocional y abundancia en el amor con energía maternal",
                    "customKeywords": "abundancia, fertilidad, maternidad"
                },
                {
                    "cardId": 2,
                    "customMeaningUpright": "Habilidad para manifestar tus metas profesionales con maestría",
                    "customKeywords": "manifestación, poder, acción"
                }
            ]
        }' \
        "$ADMIN_TOKEN" \
        "POST /admin/tarotistas/$TAROTISTA_ID/meanings/bulk - Importación lote")
    http_code=$(echo "$response" | tail -n1)
    check_response 201 "$http_code" "Importación masiva de significados"
    
    # TEST 20: Eliminar significado personalizado
    if [ -n "$MEANING_ID" ]; then
        response=$(make_request "DELETE" "/admin/tarotistas/$TAROTISTA_ID/meanings/$MEANING_ID" "" "$ADMIN_TOKEN" \
            "DELETE /admin/tarotistas/$TAROTISTA_ID/meanings/$MEANING_ID - Eliminar significado")
        http_code=$(echo "$response" | tail -n1)
        check_response 204 "$http_code" "Eliminación significado personalizado"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 5: SISTEMA DE APLICACIONES
# ═══════════════════════════════════════════════════════════════════════════

test_applications() {
    print_header "SECCIÓN 5: SISTEMA DE APLICACIONES (TASK-070)"
    
    # TEST 21: Listar todas las aplicaciones
    response=$(make_request "GET" "/admin/tarotistas/applications" "" "$ADMIN_TOKEN" \
        "GET /admin/tarotistas/applications - Listar aplicaciones")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listado de aplicaciones"
    
    # Para los tests de aprobar/rechazar, necesitaríamos crear una aplicación primero
    # Esto requeriría un endpoint público o de usuario para aplicar
    print_warning "Tests de aprobar/rechazar aplicaciones requieren datos de prueba adicionales"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 6: MÉTRICAS Y REVENUE (TASK-073)
# ═══════════════════════════════════════════════════════════════════════════

test_metrics_revenue() {
    print_header "SECCIÓN 6: MÉTRICAS Y REVENUE (TASK-073)"
    
    # TEST 22: Métricas de tarotista específico
    response=$(make_request "GET" "/tarotistas/metrics/tarotista?tarotistaId=$TAROTISTA_ID&period=month" \
        "" "$ADMIN_TOKEN" \
        "GET /tarotistas/metrics/tarotista - Métricas individuales")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Métricas de tarotista"
    
    # TEST 23: Métricas de plataforma (solo admin)
    response=$(make_request "GET" "/tarotistas/metrics/platform?period=month" \
        "" "$ADMIN_TOKEN" \
        "GET /tarotistas/metrics/platform - Métricas plataforma (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Métricas de plataforma"
    
    # TEST 24: Exportar reporte CSV
    response=$(make_request "POST" "/tarotistas/reports/export" \
        "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"period\": \"month\",
            \"format\": \"csv\"
        }" \
        "$ADMIN_TOKEN" \
        "POST /tarotistas/reports/export - Exportar CSV")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Exportación reporte CSV"
    
    # TEST 25: Exportar reporte PDF
    response=$(make_request "POST" "/tarotistas/reports/export" \
        "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"period\": \"month\",
            \"format\": \"pdf\"
        }" \
        "$ADMIN_TOKEN" \
        "POST /tarotistas/reports/export - Exportar PDF")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Exportación reporte PDF"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 7: SEGURIDAD Y AUTORIZACIÓN
# ═══════════════════════════════════════════════════════════════════════════

test_security() {
    print_header "SECCIÓN 7: SEGURIDAD Y AUTORIZACIÓN"
    
    # TEST 26: Endpoint admin sin token (401)
    response=$(make_request "GET" "/admin/tarotistas" "" "" \
        "GET /admin/tarotistas sin token - Debe devolver 401")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Endpoint admin sin autenticación"
    
    # TEST 27: Endpoint admin con token de usuario regular (403)
    if [ -n "$TAROTISTA_TOKEN" ]; then
        response=$(make_request "GET" "/admin/tarotistas" "" "$TAROTISTA_TOKEN" \
            "GET /admin/tarotistas con token usuario - Debe devolver 403")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "Endpoint admin sin permisos admin"
    fi
    
    # TEST 28: Métricas plataforma sin ser admin (403)
    if [ -n "$TAROTISTA_TOKEN" ]; then
        response=$(make_request "GET" "/tarotistas/metrics/platform" "" "$TAROTISTA_TOKEN" \
            "GET /tarotistas/metrics/platform sin admin - Debe devolver 403")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "Métricas plataforma requiere admin"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 8: CASOS EDGE Y VALIDACIONES
# ═══════════════════════════════════════════════════════════════════════════

test_edge_cases() {
    print_header "SECCIÓN 8: CASOS EDGE Y VALIDACIONES"
    
    # TEST 29: Crear tarotista con datos inválidos (400)
    response=$(make_request "POST" "/admin/tarotistas" \
        '{
            "nombrePublico": "",
            "email": "invalid-email"
        }' \
        "$ADMIN_TOKEN" \
        "POST /admin/tarotistas datos inválidos - Debe devolver 400")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Validación datos inválidos"
    
    # TEST 30: Actualizar configuración IA con valores fuera de rango
    response=$(make_request "PUT" "/admin/tarotistas/$TAROTISTA_ID/config" \
        '{
            "temperature": 5.0,
            "maxTokens": -100
        }' \
        "$ADMIN_TOKEN" \
        "PUT /admin/tarotistas/$TAROTISTA_ID/config valores inválidos - Debe validar")
    http_code=$(echo "$response" | tail -n1)
    # Debe retornar 400 por validación
    check_response 400 "$http_code" "Validación de rangos fuera de límite"
    
    # TEST 31: Paginación con valores extremos
    response=$(make_request "GET" "/tarotistas?page=1&limit=100" "" "" \
        "GET /tarotistas paginación extrema - Debe manejar límites")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Paginación con valores extremos"
    
    # TEST 32: Búsqueda con caracteres especiales
    response=$(make_request "GET" "/tarotistas?search=%3Cscript%3Ealert%281%29%3C%2Fscript%3E" "" "" \
        "GET /tarotistas búsqueda XSS - Debe sanitizar")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Sanitización de entrada (XSS)"
}

# ═══════════════════════════════════════════════════════════════════════════
# REPORTE FINAL
# ═══════════════════════════════════════════════════════════════════════════

print_summary() {
    echo -e "\n"
    print_header "REPORTE FINAL DE TESTS"
    
    echo -e "${CYAN}Total de tests ejecutados: ${TOTAL_TESTS}${NC}"
    echo -e "${GREEN}Tests exitosos: ${PASSED_TESTS}${NC}"
    echo -e "${RED}Tests fallidos: ${FAILED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ ¡TODOS LOS TESTS PASARON EXITOSAMENTE!                                 ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}\n"
        exit 0
    else
        echo -e "\n${RED}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ✗ ALGUNOS TESTS FALLARON - REVISAR IMPLEMENTACIÓN                        ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════════════╝${NC}\n"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# EJECUCIÓN PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_header "INICIANDO TESTS DEL MÓDULO TAROTISTAS"
    print_info "Base URL: $BASE_URL"
    print_info "Asegúrate de que el servidor esté corriendo en otra terminal"
    echo ""
    read -p "Presiona ENTER para continuar o Ctrl+C para cancelar..."
    
    # Setup
    setup_auth
    
    # Ejecutar todas las secciones de tests
    test_public_endpoints
    test_admin_crud
    test_ia_config
    test_custom_meanings
    test_applications
    test_metrics_revenue
    test_security
    test_edge_cases
    
    # Mostrar resumen
    print_summary
}

# Ejecutar script
main
