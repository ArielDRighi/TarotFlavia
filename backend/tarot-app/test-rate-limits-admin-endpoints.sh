#!/bin/bash

# =============================================================================
# TEST SCRIPT: Rate Limits Admin Endpoints (TASK-014-a)
# =============================================================================
# Endpoints testeados:
#   - GET /admin/rate-limits/violations
#   - GET /admin/ip-whitelist
#   - POST /admin/ip-whitelist
#   - DELETE /admin/ip-whitelist
# =============================================================================

# NO usar set -e para que los tests continúen aunque falle algo

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

# Función para verificar múltiples códigos válidos
check_response_multi() {
    local actual=$1
    local test_name=$2
    shift 2
    local valid_codes=("$@")
    
    for code in "${valid_codes[@]}"; do
        if [ "$code" == "$actual" ]; then
            print_success "$test_name (HTTP $actual)"
            return 0
        fi
    done
    
    print_failure "$test_name - Got HTTP $actual, expected one of: ${valid_codes[*]}"
    return 1
}

# Función para extraer campo JSON
extract_json_field() {
    local json=$1
    local field=$2
    echo "$json" | grep -o "\"$field\":[^,}]*" | sed 's/.*://' | tr -d '"' | tr -d ' '
}

# =============================================================================
# SECCIÓN 0: SETUP - Obtener tokens de autenticación
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
    
    # Crear/usar usuario normal para tests de autorización
    print_info "Intentando login como usuario normal..."
    local user_login=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/auth/login" \
        -H 'Content-Type: application/json' \
        -d '{"email": "free@test.com", "password": "Test123456!"}')
    
    local user_code=$(echo "$user_login" | tail -1)
    local user_body=$(echo "$user_login" | sed '$d')
    
    if [ "$user_code" == "200" ] || [ "$user_code" == "201" ]; then
        USER_TOKEN=$(extract_json_field "$user_body" "access_token")
        print_success "Login usuario normal exitoso (free@test.com)"
    else
        print_info "Creando usuario normal de prueba..."
        curl -s -X POST "${BASE_URL}/auth/register" \
            -H 'Content-Type: application/json' \
            -d '{"email": "normaluser@test.com", "password": "Test123456!", "name": "Normal User"}'
        
        user_login=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/auth/login" \
            -H 'Content-Type: application/json' \
            -d '{"email": "normaluser@test.com", "password": "Test123456!"}')
        
        user_code=$(echo "$user_login" | tail -1)
        user_body=$(echo "$user_login" | sed '$d')
        
        if [ "$user_code" == "200" ] || [ "$user_code" == "201" ]; then
            USER_TOKEN=$(extract_json_field "$user_body" "access_token")
            print_success "Usuario normal creado y autenticado"
        fi
    fi
    
    if [ -z "$ADMIN_TOKEN" ]; then
        print_failure "No se pudo obtener token de admin. Los tests de admin fallarán."
        print_info "Ejecuta 'npm run seed' para crear usuarios de prueba."
    fi
}

# =============================================================================
# SECCIÓN 1: RATE LIMITS VIOLATIONS (GET /admin/rate-limits/violations)
# =============================================================================
test_rate_limits_violations() {
    print_header "SECCIÓN 1: RATE LIMITS VIOLATIONS"
    
    # TEST 1: Sin autenticación (401)
    print_subheader "Test 1: Sin autenticación"
    response=$(make_request "GET" "/admin/rate-limits/violations" "" "" \
        "GET /admin/rate-limits/violations - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 2: Usuario normal (403)
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 2: Usuario normal (no admin)"
        response=$(make_request "GET" "/admin/rate-limits/violations" "" "$USER_TOKEN" \
            "GET /admin/rate-limits/violations - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 3: Admin obtiene violations (200)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 3: Admin obtiene violations"
        response=$(make_request "GET" "/admin/rate-limits/violations" "" "$ADMIN_TOKEN" \
            "GET /admin/rate-limits/violations - Admin")
        http_code=$(echo "$response" | tail -1)
        body=$(echo "$response" | sed '$d')
        
        if check_response 200 "$http_code" "Admin puede ver violations"; then
            # Verificar estructura de respuesta
            if echo "$body" | grep -q '"violations"' && echo "$body" | grep -q '"blockedIps"' && echo "$body" | grep -q '"stats"'; then
                print_success "Estructura de respuesta correcta (violations, blockedIps, stats)"
            else
                print_failure "Estructura de respuesta incorrecta"
                print_info "Body: $body"
            fi
        fi
    fi
}

# =============================================================================
# SECCIÓN 2: IP WHITELIST - GET (GET /admin/ip-whitelist)
# =============================================================================
test_ip_whitelist_get() {
    print_header "SECCIÓN 2: IP WHITELIST - GET"
    
    # TEST 4: Sin autenticación (401)
    print_subheader "Test 4: Sin autenticación"
    response=$(make_request "GET" "/admin/ip-whitelist" "" "" \
        "GET /admin/ip-whitelist - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 5: Usuario normal (403)
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 5: Usuario normal (no admin)"
        response=$(make_request "GET" "/admin/ip-whitelist" "" "$USER_TOKEN" \
            "GET /admin/ip-whitelist - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 6: Admin obtiene whitelist (200)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 6: Admin obtiene whitelist"
        response=$(make_request "GET" "/admin/ip-whitelist" "" "$ADMIN_TOKEN" \
            "GET /admin/ip-whitelist - Admin")
        http_code=$(echo "$response" | tail -1)
        body=$(echo "$response" | sed '$d')
        
        if check_response 200 "$http_code" "Admin puede ver whitelist"; then
            # Verificar que contiene IPs por defecto (localhost)
            if echo "$body" | grep -q '"ips"' && echo "$body" | grep -q '"count"'; then
                print_success "Estructura de respuesta correcta (ips, count)"
            else
                print_failure "Estructura de respuesta incorrecta"
            fi
        fi
    fi
}

# =============================================================================
# SECCIÓN 3: IP WHITELIST - POST (POST /admin/ip-whitelist)
# =============================================================================
test_ip_whitelist_post() {
    print_header "SECCIÓN 3: IP WHITELIST - POST"
    
    local TEST_IP="203.0.113.99"
    
    # TEST 7: Sin autenticación (401)
    print_subheader "Test 7: Sin autenticación"
    response=$(make_request "POST" "/admin/ip-whitelist" "{\"ip\": \"$TEST_IP\"}" "" \
        "POST /admin/ip-whitelist - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 8: Usuario normal (403)
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 8: Usuario normal (no admin)"
        response=$(make_request "POST" "/admin/ip-whitelist" "{\"ip\": \"$TEST_IP\"}" "$USER_TOKEN" \
            "POST /admin/ip-whitelist - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 9: Admin agrega IP (201)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 9: Admin agrega IP a whitelist"
        response=$(make_request "POST" "/admin/ip-whitelist" "{\"ip\": \"$TEST_IP\"}" "$ADMIN_TOKEN" \
            "POST /admin/ip-whitelist - Admin agrega IP")
        http_code=$(echo "$response" | tail -1)
        body=$(echo "$response" | sed '$d')
        
        check_response_multi "$http_code" "Admin puede agregar IP" 200 201
        
        # Verificar que la IP fue agregada
        print_subheader "Test 10: Verificar IP agregada"
        response=$(make_request "GET" "/admin/ip-whitelist" "" "$ADMIN_TOKEN" \
            "GET /admin/ip-whitelist - Verificar IP agregada")
        body=$(echo "$response" | sed '$d')
        
        if echo "$body" | grep -q "$TEST_IP"; then
            print_success "IP $TEST_IP encontrada en whitelist"
        else
            print_failure "IP $TEST_IP no encontrada en whitelist"
        fi
    fi
    
    # TEST 11: IP inválida (400)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 11: IP inválida"
        response=$(make_request "POST" "/admin/ip-whitelist" "{\"ip\": \"not-a-valid-ip\"}" "$ADMIN_TOKEN" \
            "POST /admin/ip-whitelist - IP inválida")
        http_code=$(echo "$response" | tail -1)
        check_response 400 "$http_code" "Rechaza IP inválida"
    fi
}

# =============================================================================
# SECCIÓN 4: IP WHITELIST - DELETE (DELETE /admin/ip-whitelist)
# =============================================================================
test_ip_whitelist_delete() {
    print_header "SECCIÓN 4: IP WHITELIST - DELETE"
    
    local TEST_IP="203.0.113.99"
    
    # TEST 12: Sin autenticación (401)
    print_subheader "Test 12: Sin autenticación"
    response=$(make_request "DELETE" "/admin/ip-whitelist" "{\"ip\": \"$TEST_IP\"}" "" \
        "DELETE /admin/ip-whitelist - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 13: Usuario normal (403)
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 13: Usuario normal (no admin)"
        response=$(make_request "DELETE" "/admin/ip-whitelist" "{\"ip\": \"$TEST_IP\"}" "$USER_TOKEN" \
            "DELETE /admin/ip-whitelist - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 14: Admin elimina IP (200)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 14: Admin elimina IP de whitelist"
        response=$(make_request "DELETE" "/admin/ip-whitelist" "{\"ip\": \"$TEST_IP\"}" "$ADMIN_TOKEN" \
            "DELETE /admin/ip-whitelist - Admin elimina IP")
        http_code=$(echo "$response" | tail -1)
        
        check_response 200 "$http_code" "Admin puede eliminar IP"
        
        # Verificar que la IP fue eliminada
        print_subheader "Test 15: Verificar IP eliminada"
        response=$(make_request "GET" "/admin/ip-whitelist" "" "$ADMIN_TOKEN" \
            "GET /admin/ip-whitelist - Verificar IP eliminada")
        body=$(echo "$response" | sed '$d')
        
        if ! echo "$body" | grep -q "\"$TEST_IP\""; then
            print_success "IP $TEST_IP ya no está en whitelist"
        else
            print_failure "IP $TEST_IP todavía está en whitelist"
        fi
    fi
    
    # TEST 16: Eliminar IP que no existe (200 - idempotente)
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 16: Eliminar IP inexistente"
        response=$(make_request "DELETE" "/admin/ip-whitelist" "{\"ip\": \"198.51.100.50\"}" "$ADMIN_TOKEN" \
            "DELETE /admin/ip-whitelist - IP inexistente")
        http_code=$(echo "$response" | tail -1)
        
        # Debería ser 200 (operación idempotente) o 404 (no encontrado)
        check_response_multi "$http_code" "Manejo de IP inexistente" 200 404
    fi
}

# =============================================================================
# SECCIÓN 5: SEGURIDAD ADICIONAL
# =============================================================================
test_security() {
    print_header "SECCIÓN 5: TESTS DE SEGURIDAD"
    
    # TEST 17: Token expirado/inválido (401)
    print_subheader "Test 17: Token inválido"
    response=$(make_request "GET" "/admin/rate-limits/violations" "" "invalid.token.here" \
        "GET /admin/rate-limits/violations - Token inválido")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Rechaza token inválido"
    
    # TEST 18: Sin header Authorization (401)
    print_subheader "Test 18: Sin header Authorization"
    response=$(curl -s -w '\n%{http_code}' -X GET "${BASE_URL}/admin/rate-limits/violations" \
        -H 'Content-Type: application/json')
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Rechaza request sin Authorization"
}

# =============================================================================
# EJECUTAR TODOS LOS TESTS
# =============================================================================
main() {
    print_header "RATE LIMITS ADMIN ENDPOINTS TEST SUITE"
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
    test_rate_limits_violations
    test_ip_whitelist_get
    test_ip_whitelist_post
    test_ip_whitelist_delete
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
