#!/bin/bash

# =============================================================================
# TEST SCRIPT: Cache Admin Endpoints (TASK-020)
# =============================================================================
# Endpoints testeados:
#   - DELETE /interpretations/admin/cache
#   - GET /interpretations/admin/cache/stats
# =============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="${API_URL:-http://localhost:3000}"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Tokens de autenticación
ADMIN_TOKEN=""
USER_TOKEN=""

# Función para imprimir headers
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_subheader() {
    echo ""
    echo -e "${CYAN}--- $1 ---${NC}"
}

print_success() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_failure() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_info() {
    echo -e "${YELLOW}ℹ INFO:${NC} $1"
}

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    local description=$5
    
    print_info "Testing: $description"
    
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method '${BASE_URL}${endpoint}'"
    curl_cmd+=" -H 'Content-Type: application/json'"
    
    if [ -n "$auth_header" ]; then
        curl_cmd+=" -H 'Authorization: Bearer $auth_header'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd+=" -d '$data'"
    fi
    
    eval $curl_cmd
}

# Función para verificar respuesta
check_response() {
    local expected=$1
    local actual=$2
    local test_name=$3
    
    if [ "$expected" == "$actual" ]; then
        print_success "$test_name (HTTP $actual)"
        return 0
    else
        print_failure "$test_name - Expected HTTP $expected, got HTTP $actual"
        return 1
    fi
}

# Función para extraer campo JSON
extract_json_field() {
    local json=$1
    local field=$2
    echo "$json" | grep -o "\"$field\":[^,}]*" | sed 's/.*://' | tr -d '"' | tr -d ' '
}

# =============================================================================
# SETUP: Obtener tokens de autenticación
# =============================================================================
setup_tokens() {
    print_header "SETUP: Obteniendo tokens de autenticación"
    
    # Usar admin seeded (admin@test.com con Test123456!)
    print_info "Login como admin seeded (admin@test.com)..."
    local admin_login=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/auth/login" \
        -H 'Content-Type: application/json' \
        -d '{"email": "admin@test.com", "password": "Test123456!"}')
    
    local admin_code=$(echo "$admin_login" | tail -1)
    local admin_body=$(echo "$admin_login" | sed '$d')
    
    if [ "$admin_code" == "200" ] || [ "$admin_code" == "201" ]; then
        ADMIN_TOKEN=$(extract_json_field "$admin_body" "access_token")
        print_success "Login admin exitoso (admin@test.com)"
    else
        print_failure "No se pudo autenticar como admin seeded"
        print_info "Respuesta: $admin_body"
        print_info "Asegúrate de ejecutar los seeders primero: npm run seed"
    fi
    
    # Usar usuario free seeded
    print_info "Login como usuario free (free@test.com)..."
    local user_login=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/auth/login" \
        -H 'Content-Type: application/json' \
        -d '{"email": "free@test.com", "password": "Test123456!"}')
    
    local user_code=$(echo "$user_login" | tail -1)
    local user_body=$(echo "$user_login" | sed '$d')
    
    if [ "$user_code" == "200" ] || [ "$user_code" == "201" ]; then
        USER_TOKEN=$(extract_json_field "$user_body" "access_token")
        print_success "Login usuario free exitoso (free@test.com)"
    else
        print_info "Creando usuario de prueba..."
        curl -s -X POST "${BASE_URL}/auth/register" \
            -H 'Content-Type: application/json' \
            -d '{"email": "cachetest@test.com", "password": "Test123456!", "name": "Cache Test User"}'
        
        user_login=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/auth/login" \
            -H 'Content-Type: application/json' \
            -d '{"email": "cachetest@test.com", "password": "Test123456!"}')
        
        user_code=$(echo "$user_login" | tail -1)
        user_body=$(echo "$user_login" | sed '$d')
        
        if [ "$user_code" == "200" ] || [ "$user_code" == "201" ]; then
            USER_TOKEN=$(extract_json_field "$user_body" "access_token")
            print_success "Usuario de prueba creado y autenticado"
        fi
    fi
    
    if [ -z "$ADMIN_TOKEN" ]; then
        print_failure "No se pudo obtener token de admin. Los tests de admin fallarán."
        print_info "Ejecuta 'npm run seed' para crear usuarios de prueba."
    fi
}

# =============================================================================
# SECCIÓN 1: CACHE STATS (GET /interpretations/admin/cache/stats)
# =============================================================================
test_cache_stats() {
    print_header "SECCIÓN 1: CACHE STATS"
    
    # TEST 1: Sin autenticación (401)
    print_subheader "Test 1: Sin autenticación"
    response=$(make_request "GET" "/interpretations/admin/cache/stats" "" "" \
        "GET /interpretations/admin/cache/stats - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 2: Usuario normal (403)
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 2: Usuario normal (no admin)"
        response=$(make_request "GET" "/interpretations/admin/cache/stats" "" "$USER_TOKEN" \
            "GET /interpretations/admin/cache/stats - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 3: Admin obtiene stats (200)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 3: Admin obtiene cache stats"
        response=$(make_request "GET" "/interpretations/admin/cache/stats" "" "$ADMIN_TOKEN" \
            "GET /interpretations/admin/cache/stats - Admin")
        http_code=$(echo "$response" | tail -1)
        body=$(echo "$response" | sed '$d')
        
        if check_response 200 "$http_code" "Admin puede ver cache stats"; then
            # Verificar estructura de respuesta
            if echo "$body" | grep -q '"database"' && echo "$body" | grep -q '"hitRate"' && echo "$body" | grep -q '"timestamp"'; then
                print_success "Estructura de respuesta correcta (database, hitRate, timestamp)"
            else
                print_failure "Estructura de respuesta incorrecta"
                print_info "Body: $body"
            fi
        fi
    fi
}

# =============================================================================
# SECCIÓN 2: CLEAR CACHE (DELETE /interpretations/admin/cache)
# =============================================================================
test_clear_cache() {
    print_header "SECCIÓN 2: CLEAR CACHE"
    
    # TEST 4: Sin autenticación (401)
    print_subheader "Test 4: Sin autenticación"
    response=$(make_request "DELETE" "/interpretations/admin/cache" "" "" \
        "DELETE /interpretations/admin/cache - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 5: Usuario normal (403)
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 5: Usuario normal (no admin)"
        response=$(make_request "DELETE" "/interpretations/admin/cache" "" "$USER_TOKEN" \
            "DELETE /interpretations/admin/cache - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 6: Admin limpia caché (200)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 6: Admin limpia caché"
        response=$(make_request "DELETE" "/interpretations/admin/cache" "" "$ADMIN_TOKEN" \
            "DELETE /interpretations/admin/cache - Admin")
        http_code=$(echo "$response" | tail -1)
        body=$(echo "$response" | sed '$d')
        
        if check_response 200 "$http_code" "Admin puede limpiar caché"; then
            # Verificar estructura de respuesta
            if echo "$body" | grep -q '"message"' && echo "$body" | grep -q '"timestamp"'; then
                print_success "Estructura de respuesta correcta (message, timestamp)"
            else
                print_failure "Estructura de respuesta incorrecta"
                print_info "Body: $body"
            fi
        fi
    fi
}

# =============================================================================
# SECCIÓN 3: SEGURIDAD ADICIONAL
# =============================================================================
test_security() {
    print_header "SECCIÓN 3: TESTS DE SEGURIDAD"
    
    # TEST 7: Token inválido (401)
    print_subheader "Test 7: Token inválido"
    response=$(make_request "GET" "/interpretations/admin/cache/stats" "" "invalid.token.here" \
        "GET /interpretations/admin/cache/stats - Token inválido")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Rechaza token inválido"
    
    # TEST 8: Método no permitido (405 o 404)
    print_subheader "Test 8: Método no permitido (POST en lugar de GET)"
    response=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/interpretations/admin/cache/stats" \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    http_code=$(echo "$response" | tail -1)
    
    # 404 o 405 son válidos para método incorrecto
    if [ "$http_code" == "404" ] || [ "$http_code" == "405" ]; then
        print_success "Método no permitido rechazado (HTTP $http_code)"
    else
        print_failure "Esperaba 404 o 405, got HTTP $http_code"
    fi
}

# =============================================================================
# EJECUTAR TODOS LOS TESTS
# =============================================================================
main() {
    print_header "CACHE ADMIN ENDPOINTS TEST SUITE"
    print_info "Base URL: $BASE_URL"
    print_info "Fecha: $(date)"
    
    # Verificar que el servidor está corriendo
    if ! curl -s "${BASE_URL}/health" > /dev/null 2>&1; then
        echo -e "${RED}ERROR: El servidor no está disponible en $BASE_URL${NC}"
        echo "Por favor, inicia el servidor con: npm run start:dev"
        exit 1
    fi
    
    print_success "Servidor disponible"
    
    # Ejecutar tests
    setup_tokens
    test_cache_stats
    test_clear_cache
    test_security
    
    # Resumen final
    print_header "RESUMEN DE TESTS"
    echo -e "Total:   ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed:  ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed:  ${FAILED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓ TODOS LOS TESTS PASARON${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}✗ ALGUNOS TESTS FALLARON${NC}"
        exit 1
    fi
}

# Ejecutar
main "$@"
