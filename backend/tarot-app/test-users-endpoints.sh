#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO USERS                                ║
# ║  Basado en TASK-ARCH-012: Arquitectura Layered para Users                 ║
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
TEST_USER_EMAIL="user-test-$(date +%s)@example.com"
TEST_USER_PASSWORD="UserTest123!@#"
TEST_USER_NAME="Test User"

# Tokens (se obtendrán al hacer login)
ADMIN_TOKEN=""
USER_TOKEN=""

# IDs (se obtendrán de las respuestas)
USER_ID=""
ADMIN_ID=""

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

check_response_multi() {
    local actual_code=$1
    local test_name=$2
    shift 2
    local expected_codes=("$@")
    
    for code in "${expected_codes[@]}"; do
        if [ "$actual_code" -eq "$code" ]; then
            print_success "$test_name (HTTP $actual_code)"
            return 0
        fi
    done
    
    print_error "$test_name - Expected HTTP ${expected_codes[*]}, got HTTP $actual_code"
    return 1
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
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${headers[@]}" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            "${headers[@]}" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Try jq if available, otherwise just echo body
    if command -v jq &> /dev/null; then
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        echo "$body"
    fi
    
    echo "$http_code"
}

extract_json_value() {
    local json=$1
    local key=$2
    
    # Try jq first if available
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r ".$key" 2>/dev/null
    else
        # Fallback: simple grep/sed for basic extraction
        # This works for simple keys like "access_token", "id", etc.
        echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)"/\1/' | head -1
        if [ -z "$(echo "$json" | grep "\"$key\"[[:space:]]*:[[:space:]]*\"")" ]; then
            # Try numeric values
            echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[0-9]*" | sed 's/.*:[[:space:]]*//' | head -1
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SETUP: AUTENTICACIÓN
# ═══════════════════════════════════════════════════════════════════════════

setup_authentication() {
    print_header "SETUP: AUTENTICACIÓN"
    
    # Login como Admin
    print_info "Obteniendo token de administrador..."
    local login_data=$(cat <<EOF
{
    "email": "$ADMIN_EMAIL",
    "password": "$ADMIN_PASSWORD"
}
EOF
)
    
    response=$(make_request "POST" "/auth/login" "$login_data" "" "Login como Admin")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        ADMIN_TOKEN=$(extract_json_value "$body" "access_token")
        # Extract user.id from nested object
        ADMIN_ID=$(echo "$body" | grep -o '"user"[^}]*"id"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' | head -1)
        print_success "Token de admin obtenido exitosamente"
        print_info "Admin ID: $ADMIN_ID"
        print_info "Admin Token: ${ADMIN_TOKEN:0:20}..."
    else
        print_error "No se pudo obtener token de admin"
        exit 1
    fi
    
    # Crear usuario de prueba
    print_info "Creando usuario de prueba..."
    local register_data=$(cat <<EOF
{
    "email": "$TEST_USER_EMAIL",
    "password": "$TEST_USER_PASSWORD",
    "name": "$TEST_USER_NAME"
}
EOF
)
    
    response=$(make_request "POST" "/auth/register" "$register_data" "" "Registro de usuario de prueba")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        USER_TOKEN=$(extract_json_value "$body" "access_token")
        # Extract user.id from nested object
        USER_ID=$(echo "$body" | grep -o '"user"[^}]*"id"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' | head -1)
        print_success "Usuario de prueba creado exitosamente"
        print_info "User ID: $USER_ID"
        print_info "User Token: ${USER_TOKEN:0:20}..."
    else
        print_error "No se pudo crear usuario de prueba"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: PROFILE ENDPOINTS (User Self-Management)
# ═══════════════════════════════════════════════════════════════════════════

test_profile_endpoints() {
    print_header "TESTS: GESTIÓN DE PERFIL (Self-Management)"
    
    # Test 1: GET /users/profile (usuario autenticado)
    response=$(make_request "GET" "/users/profile" "" "$USER_TOKEN" \
        "Obtener perfil propio")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /users/profile"
    
    # Test 2: GET /users/profile (sin token - debe fallar)
    response=$(make_request "GET" "/users/profile" "" "" \
        "Obtener perfil sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "GET /users/profile (sin token)"
    
    # Test 3: PATCH /users/profile (actualizar nombre)
    local update_data=$(cat <<EOF
{
    "name": "Updated Test User"
}
EOF
)
    response=$(make_request "PATCH" "/users/profile" "$update_data" "$USER_TOKEN" \
        "Actualizar perfil (nombre)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "PATCH /users/profile (nombre)"
    
    # Test 4: PATCH /users/profile (actualizar email)
    local new_email="updated-$TEST_USER_EMAIL"
    local update_email_data=$(cat <<EOF
{
    "email": "$new_email"
}
EOF
)
    response=$(make_request "PATCH" "/users/profile" "$update_email_data" "$USER_TOKEN" \
        "Actualizar perfil (email)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "PATCH /users/profile (email)"
    
    # Test 5: PATCH /users/profile (actualizar contraseña)
    local update_password_data=$(cat <<EOF
{
    "password": "NewSecurePass123!@#"
}
EOF
)
    response=$(make_request "PATCH" "/users/profile" "$update_password_data" "$USER_TOKEN" \
        "Actualizar perfil (contraseña)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "PATCH /users/profile (password)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: USER MANAGEMENT (Admin)
# ═══════════════════════════════════════════════════════════════════════════

test_user_management_admin() {
    print_header "TESTS: GESTIÓN DE USUARIOS (Admin)"
    
    # Test 6: GET /users (listar todos los usuarios - solo admin)
    response=$(make_request "GET" "/users" "" "$ADMIN_TOKEN" \
        "Listar todos los usuarios (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /users (admin)"
    
    # Test 7: GET /users (listar usuarios - usuario normal, debe fallar)
    response=$(make_request "GET" "/users" "" "$USER_TOKEN" \
        "Listar todos los usuarios (usuario normal)")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "GET /users (usuario normal - forbidden)"
    
    # Test 8: GET /users/:id (obtener usuario por ID - propio usuario)
    response=$(make_request "GET" "/users/$USER_ID" "" "$USER_TOKEN" \
        "Obtener usuario por ID (propio usuario)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /users/:id (self)"
    
    # Test 9: GET /users/:id (obtener usuario por ID - admin puede ver cualquiera)
    response=$(make_request "GET" "/users/$USER_ID" "" "$ADMIN_TOKEN" \
        "Obtener usuario por ID (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /users/:id (admin)"
    
    # Test 10: GET /users/:id (usuario normal intenta ver otro usuario - debe fallar)
    response=$(make_request "GET" "/users/$ADMIN_ID" "" "$USER_TOKEN" \
        "Obtener usuario por ID (otro usuario - forbidden)")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "GET /users/:id (forbidden)"
    
    # Test 11: GET /users/:id (usuario inexistente)
    response=$(make_request "GET" "/users/999999" "" "$ADMIN_TOKEN" \
        "Obtener usuario inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /users/:id (not found)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: PLAN MANAGEMENT (Admin)
# ═══════════════════════════════════════════════════════════════════════════

test_plan_management() {
    print_header "TESTS: GESTIÓN DE PLANES (Admin)"
    
    # Test 12: PATCH /users/:id/plan (actualizar plan a PREMIUM - admin)
    local update_plan_data=$(cat <<EOF
{
    "plan": "premium"
}
EOF
)
    response=$(make_request "PATCH" "/users/$USER_ID/plan" "$update_plan_data" "$ADMIN_TOKEN" \
        "Actualizar plan a PREMIUM (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "PATCH /users/:id/plan (PREMIUM)"
    
    # Test 13: PATCH /users/:id/plan (actualizar plan - usuario normal, debe fallar)
    response=$(make_request "PATCH" "/users/$USER_ID/plan" "$update_plan_data" "$USER_TOKEN" \
        "Actualizar plan (usuario normal - forbidden)")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "PATCH /users/:id/plan (forbidden)"
    
    # Test 14: PATCH /users/:id/plan (actualizar plan a PROFESSIONAL)
    local update_plan_professional=$(cat <<EOF
{
    "plan": "professional"
}
EOF
)
    response=$(make_request "PATCH" "/users/$USER_ID/plan" "$update_plan_professional" "$ADMIN_TOKEN" \
        "Actualizar plan a PROFESSIONAL (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "PATCH /users/:id/plan (PROFESSIONAL)"
    
    # Test 15: PATCH /users/:id/plan (volver a FREE)
    local update_plan_free=$(cat <<EOF
{
    "plan": "free"
}
EOF
)
    response=$(make_request "PATCH" "/users/$USER_ID/plan" "$update_plan_free" "$ADMIN_TOKEN" \
        "Actualizar plan a FREE (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "PATCH /users/:id/plan (FREE)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: ROLE MANAGEMENT (Admin)
# ═══════════════════════════════════════════════════════════════════════════

test_role_management() {
    print_header "TESTS: GESTIÓN DE ROLES (Admin)"
    
    # Test 16: POST /users/:id/roles/tarotist (agregar rol TAROTIST)
    response=$(make_request "POST" "/users/$USER_ID/roles/tarotist" "" "$ADMIN_TOKEN" \
        "Agregar rol TAROTIST (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /users/:id/roles/tarotist" 200 201
    
    # Test 17: POST /users/:id/roles/tarotist (intentar agregar rol TAROTIST nuevamente - debe fallar)
    response=$(make_request "POST" "/users/$USER_ID/roles/tarotist" "" "$ADMIN_TOKEN" \
        "Agregar rol TAROTIST duplicado")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /users/:id/roles/tarotist (duplicado)"
    
    # Test 18: POST /users/:id/roles/tarotist (usuario normal intenta agregar rol - forbidden)
    response=$(make_request "POST" "/users/$USER_ID/roles/tarotist" "" "$USER_TOKEN" \
        "Agregar rol TAROTIST (usuario normal - forbidden)")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "POST /users/:id/roles/tarotist (forbidden)"
    
    # Test 19: POST /users/:id/roles/admin (agregar rol ADMIN)
    response=$(make_request "POST" "/users/$USER_ID/roles/admin" "" "$ADMIN_TOKEN" \
        "Agregar rol ADMIN (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /users/:id/roles/admin" 200 201
    
    # Test 20: POST /users/:id/roles/admin (intentar agregar rol ADMIN nuevamente - debe fallar)
    response=$(make_request "POST" "/users/$USER_ID/roles/admin" "" "$ADMIN_TOKEN" \
        "Agregar rol ADMIN duplicado")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /users/:id/roles/admin (duplicado)"
    
    # Test 21: DELETE /users/:id/roles/tarotist (eliminar rol TAROTIST)
    response=$(make_request "DELETE" "/users/$USER_ID/roles/tarotist" "" "$ADMIN_TOKEN" \
        "Eliminar rol TAROTIST (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "DELETE /users/:id/roles/tarotist"
    
    # Test 22: DELETE /users/:id/roles/tarotist (intentar eliminar rol que no tiene - debe fallar)
    response=$(make_request "DELETE" "/users/$USER_ID/roles/tarotist" "" "$ADMIN_TOKEN" \
        "Eliminar rol TAROTIST que no existe")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "DELETE /users/:id/roles/tarotist (no existe)"
    
    # Test 23: DELETE /users/:id/roles/admin (eliminar rol ADMIN)
    response=$(make_request "DELETE" "/users/$USER_ID/roles/admin" "" "$ADMIN_TOKEN" \
        "Eliminar rol ADMIN (admin)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "DELETE /users/:id/roles/admin"
    
    # Test 24: DELETE /users/:id/roles/invalid (intentar eliminar rol inválido - debe fallar)
    response=$(make_request "DELETE" "/users/$USER_ID/roles/invalid" "" "$ADMIN_TOKEN" \
        "Eliminar rol inválido")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "DELETE /users/:id/roles/invalid (bad request)"
    
    # Test 25: DELETE /users/:id/roles/consumer (intentar eliminar rol CONSUMER - debe fallar)
    response=$(make_request "DELETE" "/users/$USER_ID/roles/consumer" "" "$ADMIN_TOKEN" \
        "Eliminar rol CONSUMER (no permitido)")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "DELETE /users/:id/roles/consumer (forbidden)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: USER DELETION
# ═══════════════════════════════════════════════════════════════════════════

test_user_deletion() {
    print_header "TESTS: ELIMINACIÓN DE USUARIOS"
    
    # Test 26: DELETE /users/:id (usuario elimina su propia cuenta)
    response=$(make_request "DELETE" "/users/$USER_ID" "" "$USER_TOKEN" \
        "Eliminar propia cuenta (usuario)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "DELETE /users/:id (self)"
    
    # Test 27: DELETE /users/:id (intentar eliminar cuenta ya eliminada - debe fallar)
    response=$(make_request "DELETE" "/users/$USER_ID" "" "$ADMIN_TOKEN" \
        "Eliminar cuenta ya eliminada")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "DELETE /users/:id (not found)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: EDGE CASES Y VALIDACIONES
# ═══════════════════════════════════════════════════════════════════════════

test_edge_cases() {
    print_header "TESTS: CASOS ESPECIALES Y VALIDACIONES"
    
    # Crear un nuevo usuario para tests de edge cases
    print_info "Creando usuario adicional para edge cases..."
    local edge_user_email="edge-user-$(date +%s)@example.com"
    local edge_register_data=$(cat <<EOF
{
    "email": "$edge_user_email",
    "password": "EdgeUser123!@#",
    "name": "Edge Case User"
}
EOF
)
    
    response=$(make_request "POST" "/auth/register" "$edge_register_data" "" \
        "Crear usuario para edge cases")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        local EDGE_USER_ID=$(echo "$body" | grep -o '"user"[^}]*"id"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' | head -1)
        local EDGE_USER_TOKEN=$(extract_json_value "$body" "access_token")
        print_success "Usuario edge case creado (ID: $EDGE_USER_ID)"
        
        # Test 28: Actualizar email a uno que ya existe (conflicto)
        local conflicting_email_data=$(cat <<EOF
{
    "email": "$ADMIN_EMAIL"
}
EOF
)
        response=$(make_request "PATCH" "/users/profile" "$conflicting_email_data" "$EDGE_USER_TOKEN" \
            "Actualizar email a uno existente (conflicto)")
        http_code=$(echo "$response" | tail -n1)
        check_response 409 "$http_code" "PATCH /users/profile (email conflict)"
        
        # Test 29: Intentar eliminar cuenta de otro usuario (forbidden)
        response=$(make_request "DELETE" "/users/$ADMIN_ID" "" "$EDGE_USER_TOKEN" \
            "Eliminar cuenta de otro usuario (forbidden)")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "DELETE /users/:id (forbidden)"
        
        # Cleanup: Eliminar usuario de edge cases
        response=$(make_request "DELETE" "/users/$EDGE_USER_ID" "" "$ADMIN_TOKEN" \
            "Cleanup: eliminar usuario edge case")
        http_code=$(echo "$response" | tail -n1)
        if [ "$http_code" -eq 200 ]; then
            print_success "Usuario edge case eliminado correctamente"
        fi
    else
        print_warning "No se pudo crear usuario para edge cases - tests omitidos"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN: EJECUTAR TODOS LOS TESTS
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_header "INICIO DE TESTS - MÓDULO USERS"
    print_info "Base URL: $BASE_URL"
    print_info "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Setup
    setup_authentication
    
    # Ejecutar todos los tests
    test_profile_endpoints
    test_user_management_admin
    test_plan_management
    test_role_management
    test_user_deletion
    test_edge_cases
    
    # Resumen final
    print_header "RESUMEN DE TESTS"
    echo -e "${CYAN}Total de tests ejecutados: ${TOTAL_TESTS}${NC}"
    echo -e "${GREEN}Tests exitosos: ${PASSED_TESTS}${NC}"
    echo -e "${RED}Tests fallidos: ${FAILED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ TODOS LOS TESTS PASARON EXITOSAMENTE                                  ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════╝${NC}\n"
        exit 0
    else
        echo -e "\n${RED}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  ✗ ALGUNOS TESTS FALLARON                                                 ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════════════╝${NC}\n"
        exit 1
    fi
}

# Ejecutar
main
