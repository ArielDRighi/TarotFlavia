#!/bin/bash

# =============================================================================
# TEST SCRIPT: Admin Dashboard, Users Management & Audit Logs Endpoints
# =============================================================================
# Endpoints testeados:
#   DASHBOARD (TASK-027, TASK-029):
#     - GET /admin/dashboard/metrics
#     - GET /admin/dashboard/stats
#     - GET /admin/dashboard/charts
#   USERS MANAGEMENT (TASK-028):
#     - GET /admin/users
#     - GET /admin/users/:id
#     - POST /admin/users/:id/ban
#     - POST /admin/users/:id/unban
#     - PATCH /admin/users/:id/plan
#     - POST /admin/users/:id/roles/tarotist
#     - POST /admin/users/:id/roles/admin
#     - DELETE /admin/users/:id/roles/:role
#     - DELETE /admin/users/:id
#   AUDIT LOGS (TASK-030):
#     - GET /admin/audit-logs
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
TEST_USER_ID=""

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
        print_info "Asegúrate de ejecutar los seeders primero: npm run seed"
    fi
    
    # Crear usuario de prueba para tests de gestión
    print_info "Creando usuario de prueba para tests de gestión..."
    local timestamp=$(date +%s)
    local test_email="admintest${timestamp}@test.com"
    
    curl -s -X POST "${BASE_URL}/auth/register" \
        -H 'Content-Type: application/json' \
        -d "{\"email\": \"$test_email\", \"password\": \"Test123456!\", \"name\": \"Admin Test User\"}"
    
    local user_login=$(curl -s -w '\n%{http_code}' -X POST "${BASE_URL}/auth/login" \
        -H 'Content-Type: application/json' \
        -d "{\"email\": \"$test_email\", \"password\": \"Test123456!\"}")
    
    local user_code=$(echo "$user_login" | tail -1)
    local user_body=$(echo "$user_login" | sed '$d')
    
    if [ "$user_code" == "200" ] || [ "$user_code" == "201" ]; then
        USER_TOKEN=$(extract_json_field "$user_body" "access_token")
        # Extraer el ID del usuario del response
        TEST_USER_ID=$(echo "$user_body" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
        print_success "Usuario de prueba creado (ID: $TEST_USER_ID)"
    fi
    
    if [ -z "$ADMIN_TOKEN" ]; then
        print_failure "No se pudo obtener token de admin. Los tests de admin fallarán."
    fi
}

# =============================================================================
# SECCIÓN 1: DASHBOARD METRICS
# =============================================================================
test_dashboard_metrics() {
    print_header "SECCIÓN 1: DASHBOARD METRICS"
    
    # TEST 1: GET /admin/dashboard/metrics sin auth
    print_subheader "Test 1: Metrics sin autenticación"
    response=$(make_request "GET" "/admin/dashboard/metrics" "" "" \
        "GET /admin/dashboard/metrics - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 2: GET /admin/dashboard/metrics con usuario normal
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 2: Metrics con usuario normal"
        response=$(make_request "GET" "/admin/dashboard/metrics" "" "$USER_TOKEN" \
            "GET /admin/dashboard/metrics - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 3: GET /admin/dashboard/metrics con admin
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 3: Metrics con admin"
        response=$(make_request "GET" "/admin/dashboard/metrics" "" "$ADMIN_TOKEN" \
            "GET /admin/dashboard/metrics - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede ver metrics"
    fi
}

# =============================================================================
# SECCIÓN 2: DASHBOARD STATS
# =============================================================================
test_dashboard_stats() {
    print_header "SECCIÓN 2: DASHBOARD STATS"
    
    # TEST 4: GET /admin/dashboard/stats sin auth
    print_subheader "Test 4: Stats sin autenticación"
    response=$(make_request "GET" "/admin/dashboard/stats" "" "" \
        "GET /admin/dashboard/stats - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 5: GET /admin/dashboard/stats con admin
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 5: Stats con admin"
        response=$(make_request "GET" "/admin/dashboard/stats" "" "$ADMIN_TOKEN" \
            "GET /admin/dashboard/stats - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede ver stats"
    fi
}

# =============================================================================
# SECCIÓN 3: DASHBOARD CHARTS
# =============================================================================
test_dashboard_charts() {
    print_header "SECCIÓN 3: DASHBOARD CHARTS"
    
    # TEST 6: GET /admin/dashboard/charts sin auth
    print_subheader "Test 6: Charts sin autenticación"
    response=$(make_request "GET" "/admin/dashboard/charts" "" "" \
        "GET /admin/dashboard/charts - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 7: GET /admin/dashboard/charts con admin
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 7: Charts con admin"
        response=$(make_request "GET" "/admin/dashboard/charts" "" "$ADMIN_TOKEN" \
            "GET /admin/dashboard/charts - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede ver charts"
    fi
}

# =============================================================================
# SECCIÓN 4: ADMIN USERS - LIST & GET
# =============================================================================
test_admin_users_list() {
    print_header "SECCIÓN 4: ADMIN USERS - LIST & GET"
    
    # TEST 8: GET /admin/users sin auth
    print_subheader "Test 8: Listar usuarios sin auth"
    response=$(make_request "GET" "/admin/users" "" "" \
        "GET /admin/users - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 9: GET /admin/users con usuario normal
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 9: Listar usuarios con usuario normal"
        response=$(make_request "GET" "/admin/users" "" "$USER_TOKEN" \
            "GET /admin/users - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 10: GET /admin/users con admin
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 10: Listar usuarios con admin"
        response=$(make_request "GET" "/admin/users" "" "$ADMIN_TOKEN" \
            "GET /admin/users - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede listar usuarios"
    fi
    
    # TEST 11: GET /admin/users con paginación
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 11: Listar usuarios con paginación"
        response=$(make_request "GET" "/admin/users?page=1&limit=5" "" "$ADMIN_TOKEN" \
            "GET /admin/users?page=1&limit=5 - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede listar usuarios paginados"
    fi
    
    # TEST 12: GET /admin/users/:id
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 12: Obtener usuario por ID"
        response=$(make_request "GET" "/admin/users/$TEST_USER_ID" "" "$ADMIN_TOKEN" \
            "GET /admin/users/:id - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede ver usuario específico"
    fi
    
    # TEST 13: GET /admin/users/:id inexistente
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 13: Usuario inexistente"
        response=$(make_request "GET" "/admin/users/99999" "" "$ADMIN_TOKEN" \
            "GET /admin/users/99999 - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 404 "$http_code" "Usuario inexistente retorna 404"
    fi
}

# =============================================================================
# SECCIÓN 5: ADMIN USERS - BAN/UNBAN
# =============================================================================
test_admin_users_ban() {
    print_header "SECCIÓN 5: ADMIN USERS - BAN/UNBAN"
    
    # TEST 14: POST /admin/users/:id/ban sin auth
    print_subheader "Test 14: Ban sin autenticación"
    response=$(make_request "POST" "/admin/users/99999/ban" '{"reason": "test"}' "" \
        "POST /admin/users/:id/ban - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 15: POST /admin/users/:id/ban con admin
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 15: Ban usuario con admin"
        response=$(make_request "POST" "/admin/users/$TEST_USER_ID/ban" '{"reason": "Test ban reason"}' "$ADMIN_TOKEN" \
            "POST /admin/users/:id/ban - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede banear usuario"
    fi
    
    # TEST 16: POST /admin/users/:id/unban con admin
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 16: Unban usuario con admin"
        response=$(make_request "POST" "/admin/users/$TEST_USER_ID/unban" "" "$ADMIN_TOKEN" \
            "POST /admin/users/:id/unban - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede desbanear usuario"
    fi
}

# =============================================================================
# SECCIÓN 6: ADMIN USERS - PLAN CHANGE
# =============================================================================
test_admin_users_plan() {
    print_header "SECCIÓN 6: ADMIN USERS - PLAN CHANGE"
    
    # TEST 17: PATCH /admin/users/:id/plan sin auth
    print_subheader "Test 17: Cambiar plan sin auth"
    response=$(make_request "PATCH" "/admin/users/99999/plan" '{"plan": "premium"}' "" \
        "PATCH /admin/users/:id/plan - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 18: PATCH /admin/users/:id/plan con admin
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 18: Cambiar plan a premium"
        response=$(make_request "PATCH" "/admin/users/$TEST_USER_ID/plan" '{"plan": "premium"}' "$ADMIN_TOKEN" \
            "PATCH /admin/users/:id/plan - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede cambiar plan a premium"
    fi
    
    # TEST 19: PATCH /admin/users/:id/plan volver a free
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 19: Cambiar plan a free"
        response=$(make_request "PATCH" "/admin/users/$TEST_USER_ID/plan" '{"plan": "free"}' "$ADMIN_TOKEN" \
            "PATCH /admin/users/:id/plan - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede cambiar plan a free"
    fi
}

# =============================================================================
# SECCIÓN 7: ADMIN USERS - ROLES
# =============================================================================
test_admin_users_roles() {
    print_header "SECCIÓN 7: ADMIN USERS - ROLES"
    
    # TEST 20: POST /admin/users/:id/roles/tarotist sin auth
    print_subheader "Test 20: Agregar rol tarotist sin auth"
    response=$(make_request "POST" "/admin/users/99999/roles/tarotist" "" "" \
        "POST /admin/users/:id/roles/tarotist - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 21: POST /admin/users/:id/roles/tarotist con admin
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 21: Agregar rol tarotist"
        response=$(make_request "POST" "/admin/users/$TEST_USER_ID/roles/tarotist" "" "$ADMIN_TOKEN" \
            "POST /admin/users/:id/roles/tarotist - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response_multi "$http_code" "Admin puede agregar rol tarotist" 200 201
    fi
    
    # TEST 22: DELETE /admin/users/:id/roles/tarotist con admin
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 22: Quitar rol tarotist"
        response=$(make_request "DELETE" "/admin/users/$TEST_USER_ID/roles/tarotist" "" "$ADMIN_TOKEN" \
            "DELETE /admin/users/:id/roles/tarotist - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede quitar rol tarotist"
    fi
}

# =============================================================================
# SECCIÓN 8: ADMIN USERS - DELETE
# =============================================================================
test_admin_users_delete() {
    print_header "SECCIÓN 8: ADMIN USERS - DELETE"
    
    # TEST 23: DELETE /admin/users/:id sin auth
    print_subheader "Test 23: Eliminar usuario sin auth"
    response=$(make_request "DELETE" "/admin/users/99999" "" "" \
        "DELETE /admin/users/:id - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 24: DELETE /admin/users/:id con usuario normal
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 24: Eliminar usuario con usuario normal"
        response=$(make_request "DELETE" "/admin/users/99999" "" "$USER_TOKEN" \
            "DELETE /admin/users/:id - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 25: DELETE /admin/users/:id inexistente
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 25: Eliminar usuario inexistente"
        response=$(make_request "DELETE" "/admin/users/99999" "" "$ADMIN_TOKEN" \
            "DELETE /admin/users/99999 - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 404 "$http_code" "Usuario inexistente retorna 404"
    fi
    
    # TEST 26: DELETE /admin/users/:id con admin (eliminar usuario de prueba)
    if [ -n "$ADMIN_TOKEN" ] && [ -n "$TEST_USER_ID" ]; then
        print_subheader "Test 26: Eliminar usuario de prueba"
        response=$(make_request "DELETE" "/admin/users/$TEST_USER_ID" "" "$ADMIN_TOKEN" \
            "DELETE /admin/users/:id - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede eliminar usuario"
    fi
}

# =============================================================================
# SECCIÓN 9: AUDIT LOGS
# =============================================================================
test_audit_logs() {
    print_header "SECCIÓN 9: AUDIT LOGS (TASK-030)"
    
    # TEST 27: GET /admin/audit-logs sin auth
    print_subheader "Test 27: Audit logs sin autenticación"
    response=$(make_request "GET" "/admin/audit-logs" "" "" \
        "GET /admin/audit-logs - Sin auth")
    http_code=$(echo "$response" | tail -1)
    check_response 401 "$http_code" "Requiere autenticación"
    
    # TEST 28: GET /admin/audit-logs con usuario normal
    if [ -n "$USER_TOKEN" ]; then
        print_subheader "Test 28: Audit logs con usuario normal"
        response=$(make_request "GET" "/admin/audit-logs" "" "$USER_TOKEN" \
            "GET /admin/audit-logs - Usuario no admin")
        http_code=$(echo "$response" | tail -1)
        check_response 403 "$http_code" "Requiere rol admin"
    fi
    
    # TEST 29: GET /admin/audit-logs con admin
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 29: Audit logs con admin"
        response=$(make_request "GET" "/admin/audit-logs" "" "$ADMIN_TOKEN" \
            "GET /admin/audit-logs - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede ver audit logs"
    fi
    
    # TEST 30: GET /admin/audit-logs con paginación
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 30: Audit logs con paginación"
        response=$(make_request "GET" "/admin/audit-logs?page=1&limit=10" "" "$ADMIN_TOKEN" \
            "GET /admin/audit-logs?page=1&limit=10 - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede paginar audit logs"
    fi
    
    # TEST 31: GET /admin/audit-logs filtrado por acción
    if [ -n "$ADMIN_TOKEN" ]; then
        print_subheader "Test 31: Audit logs filtrado por acción"
        response=$(make_request "GET" "/admin/audit-logs?action=LOGIN" "" "$ADMIN_TOKEN" \
            "GET /admin/audit-logs?action=LOGIN - Admin")
        http_code=$(echo "$response" | tail -1)
        check_response 200 "$http_code" "Admin puede filtrar audit logs por acción"
    fi
}

# =============================================================================
# EJECUTAR TODOS LOS TESTS
# =============================================================================
main() {
    print_header "ADMIN DASHBOARD & USERS MANAGEMENT TEST SUITE"
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
    test_dashboard_metrics
    test_dashboard_stats
    test_dashboard_charts
    test_admin_users_list
    test_admin_users_ban
    test_admin_users_plan
    test_admin_users_roles
    test_admin_users_delete
    test_audit_logs
    
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
