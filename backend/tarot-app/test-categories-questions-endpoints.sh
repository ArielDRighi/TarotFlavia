#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING - MÓDULO CATEGORÍAS Y PREGUNTAS PREDEFINIDAS           ║
# ║  Basado en TASK-007, TASK-008, TASK-009, TASK-010                          ║
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
TEST_USER_EMAIL="cattest-$(date +%s)@example.com"
TEST_USER_PASSWORD="CatTest123!@#"

# Tokens
ADMIN_TOKEN=""
USER_TOKEN=""

# IDs para tests
CATEGORY_ID=""
QUESTION_ID=""

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
    
    ((TOTAL_TESTS++))
    
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
    
    ((TOTAL_TESTS++))
    
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
    
    print_info "$description"
    
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
    
    echo "$response"
}

extract_json_value() {
    local json=$1
    local key=$2
    
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r ".$key" 2>/dev/null
    else
        echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)"/\1/' | head -1
        if [ -z "$(echo "$json" | grep "\"$key\"[[:space:]]*:[[:space:]]*\"")" ]; then
            echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[0-9]*" | sed 's/.*:[[:space:]]*//' | head -1
        fi
    fi
}

extract_first_id() {
    local json=$1
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r '.[0].id // .id // empty' 2>/dev/null
    else
        echo "$json" | grep -o '"id"[[:space:]]*:[[:space:]]*[0-9]*' | head -1 | sed 's/.*:[[:space:]]*//'
    fi
}

count_array_items() {
    local json=$1
    if command -v jq &> /dev/null; then
        echo "$json" | jq 'length' 2>/dev/null
    else
        echo "$json" | grep -o '"id"' | wc -l
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
    
    response=$(make_request "POST" "/auth/login" "$login_data" "" \
        "Login como Admin")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        ADMIN_TOKEN=$(extract_json_value "$body" "access_token")
        if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
            print_success "Token de admin obtenido exitosamente"
            print_info "Admin Token: ${ADMIN_TOKEN:0:20}..."
        else
            print_error "No se pudo extraer el token de admin"
            exit 1
        fi
    else
        print_error "Login de admin falló con HTTP $http_code"
        exit 1
    fi
    
    # Crear usuario de prueba
    print_info "Creando usuario de prueba..."
    local register_data=$(cat <<EOF
{
    "email": "$TEST_USER_EMAIL",
    "password": "$TEST_USER_PASSWORD",
    "name": "Category Test User"
}
EOF
)
    
    response=$(make_request "POST" "/auth/register" "$register_data" "" \
        "Registrar usuario de prueba")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 200 ]; then
        USER_TOKEN=$(extract_json_value "$body" "access_token")
        if [ -n "$USER_TOKEN" ] && [ "$USER_TOKEN" != "null" ]; then
            print_success "Usuario de prueba creado exitosamente"
            print_info "User Token: ${USER_TOKEN:0:20}..."
        else
            print_error "No se pudo extraer el token del usuario"
            exit 1
        fi
    else
        print_error "Registro de usuario falló con HTTP $http_code"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: CATEGORIES ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_categories_endpoints() {
    print_header "TESTS: CATEGORÍAS (/categories)"
    
    # Test 1: GET /categories (listar todas - público)
    response=$(make_request "GET" "/categories" "" "" \
        "Listar todas las categorías (público)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /categories"
    
    # Guardar un ID de categoría para tests posteriores
    CATEGORY_ID=$(extract_first_id "$body")
    local category_count=$(count_array_items "$body")
    print_info "Categorías encontradas: $category_count"
    print_info "Category ID obtenido: $CATEGORY_ID"
    
    # Test 2: Verificar que hay al menos 6 categorías (TASK-008)
    if [ "$category_count" -ge 6 ]; then
        ((TOTAL_TESTS++))
        print_success "Existen al menos 6 categorías sembradas (encontradas: $category_count)"
    else
        ((TOTAL_TESTS++))
        print_error "Se esperaban al menos 6 categorías, encontradas: $category_count"
    fi
    
    # Test 3: GET /categories/:id (categoría específica)
    if [ -n "$CATEGORY_ID" ]; then
        response=$(make_request "GET" "/categories/$CATEGORY_ID" "" "" \
            "Obtener categoría por ID")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /categories/:id"
    else
        print_warning "No hay categorías para probar GET /categories/:id"
    fi
    
    # Test 4: GET /categories/:id (categoría inexistente)
    response=$(make_request "GET" "/categories/99999" "" "" \
        "Obtener categoría inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /categories/:id (inexistente)"
    
    # Test 5: POST /categories (sin autenticación)
    local category_data=$(cat <<EOF
{
    "name": "Test Category",
    "slug": "test-category",
    "description": "A test category",
    "icon": "🧪",
    "color": "#FF0000",
    "order": 99
}
EOF
)
    response=$(make_request "POST" "/categories" "$category_data" "" \
        "Crear categoría sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /categories (sin auth)"
    
    # Test 6: POST /categories (usuario normal - debe rechazar)
    response=$(make_request "POST" "/categories" "$category_data" "$USER_TOKEN" \
        "Crear categoría como usuario normal")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "POST /categories (usuario normal - requiere admin)"
    
    # Test 7: POST /categories (admin - debe crear)
    response=$(make_request "POST" "/categories" "$category_data" "$ADMIN_TOKEN" \
        "Crear categoría como admin")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 201 "$http_code" "POST /categories (admin)"
    
    # Guardar ID de categoría creada para cleanup
    local new_category_id=$(extract_json_value "$body" "id")
    print_info "Nueva categoría creada con ID: $new_category_id"
    
    # Test 8: PATCH /categories/:id (usuario normal - debe rechazar)
    if [ -n "$new_category_id" ] && [ "$new_category_id" != "null" ]; then
        local update_data='{"name": "Updated Category"}'
        response=$(make_request "PATCH" "/categories/$new_category_id" "$update_data" "$USER_TOKEN" \
            "Actualizar categoría como usuario normal")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "PATCH /categories/:id (usuario normal)"
        
        # Test 9: PATCH /categories/:id (admin)
        response=$(make_request "PATCH" "/categories/$new_category_id" "$update_data" "$ADMIN_TOKEN" \
            "Actualizar categoría como admin")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "PATCH /categories/:id (admin)"
        
        # Test 10: DELETE /categories/:id (usuario normal - debe rechazar)
        response=$(make_request "DELETE" "/categories/$new_category_id" "" "$USER_TOKEN" \
            "Eliminar categoría como usuario normal")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "DELETE /categories/:id (usuario normal)"
        
        # Test 11: DELETE /categories/:id (admin)
        response=$(make_request "DELETE" "/categories/$new_category_id" "" "$ADMIN_TOKEN" \
            "Eliminar categoría como admin")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "DELETE /categories/:id (admin)"
    fi
    
    # Test 12: GET /categories?activeOnly=true
    response=$(make_request "GET" "/categories?activeOnly=true" "" "" \
        "Listar solo categorías activas")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /categories?activeOnly=true"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: PREDEFINED QUESTIONS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_predefined_questions_endpoints() {
    print_header "TESTS: PREGUNTAS PREDEFINIDAS (/predefined-questions)"
    
    # Test 1: GET /predefined-questions (listar todas)
    response=$(make_request "GET" "/predefined-questions" "" "" \
        "Listar todas las preguntas predefinidas")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /predefined-questions"
    
    # Guardar un ID de pregunta para tests posteriores
    QUESTION_ID=$(extract_first_id "$body")
    local question_count=$(count_array_items "$body")
    print_info "Preguntas encontradas: $question_count"
    print_info "Question ID obtenido: $QUESTION_ID"
    
    # Test 2: Verificar que hay al menos 30 preguntas (TASK-010 requiere mínimo 30)
    if [ "$question_count" -ge 30 ]; then
        ((TOTAL_TESTS++))
        print_success "Existen al menos 30 preguntas predefinidas (encontradas: $question_count)"
    else
        ((TOTAL_TESTS++))
        print_error "Se esperaban al menos 30 preguntas, encontradas: $question_count"
    fi
    
    # Test 3: GET /predefined-questions?categoryId=X (filtro por categoría)
    if [ -n "$CATEGORY_ID" ]; then
        response=$(make_request "GET" "/predefined-questions?categoryId=$CATEGORY_ID" "" "" \
            "Listar preguntas por categoría")
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        check_response 200 "$http_code" "GET /predefined-questions?categoryId=$CATEGORY_ID"
        
        local filtered_count=$(count_array_items "$body")
        print_info "Preguntas en categoría $CATEGORY_ID: $filtered_count"
    fi
    
    # Test 4: GET /predefined-questions/:id (pregunta específica)
    if [ -n "$QUESTION_ID" ]; then
        response=$(make_request "GET" "/predefined-questions/$QUESTION_ID" "" "" \
            "Obtener pregunta por ID")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /predefined-questions/:id"
    else
        print_warning "No hay preguntas para probar GET /predefined-questions/:id"
    fi
    
    # Test 5: GET /predefined-questions/:id (pregunta inexistente)
    response=$(make_request "GET" "/predefined-questions/99999" "" "" \
        "Obtener pregunta inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /predefined-questions/:id (inexistente)"
    
    # Test 6: POST /predefined-questions (sin autenticación)
    local question_data=$(cat <<EOF
{
    "questionText": "¿Esta es una pregunta de prueba?",
    "categoryId": $CATEGORY_ID,
    "order": 99
}
EOF
)
    response=$(make_request "POST" "/predefined-questions" "$question_data" "" \
        "Crear pregunta sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /predefined-questions (sin auth)"
    
    # Test 7: POST /predefined-questions (usuario normal - debe rechazar)
    response=$(make_request "POST" "/predefined-questions" "$question_data" "$USER_TOKEN" \
        "Crear pregunta como usuario normal")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "POST /predefined-questions (usuario normal)"
    
    # Test 8: POST /predefined-questions (admin - debe crear)
    response=$(make_request "POST" "/predefined-questions" "$question_data" "$ADMIN_TOKEN" \
        "Crear pregunta como admin")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 201 "$http_code" "POST /predefined-questions (admin)"
    
    # Guardar ID de pregunta creada para cleanup
    local new_question_id=$(extract_json_value "$body" "id")
    print_info "Nueva pregunta creada con ID: $new_question_id"
    
    # Test 9: PATCH /predefined-questions/:id (usuario normal - debe rechazar)
    if [ -n "$new_question_id" ] && [ "$new_question_id" != "null" ]; then
        local update_data='{"questionText": "¿Pregunta actualizada?"}'
        response=$(make_request "PATCH" "/predefined-questions/$new_question_id" "$update_data" "$USER_TOKEN" \
            "Actualizar pregunta como usuario normal")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "PATCH /predefined-questions/:id (usuario normal)"
        
        # Test 10: PATCH /predefined-questions/:id (admin)
        response=$(make_request "PATCH" "/predefined-questions/$new_question_id" "$update_data" "$ADMIN_TOKEN" \
            "Actualizar pregunta como admin")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "PATCH /predefined-questions/:id (admin)"
        
        # Test 11: DELETE /predefined-questions/:id (usuario normal - debe rechazar)
        response=$(make_request "DELETE" "/predefined-questions/$new_question_id" "" "$USER_TOKEN" \
            "Eliminar pregunta como usuario normal")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "DELETE /predefined-questions/:id (usuario normal)"
        
        # Test 12: DELETE /predefined-questions/:id (admin - soft delete)
        response=$(make_request "DELETE" "/predefined-questions/$new_question_id" "" "$ADMIN_TOKEN" \
            "Eliminar pregunta como admin (soft delete)")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "DELETE /predefined-questions/:id (admin)"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: VALIDACIONES ADICIONALES
# ═══════════════════════════════════════════════════════════════════════════

test_validations() {
    print_header "TESTS: VALIDACIONES ADICIONALES"
    
    # Test 1: POST /categories con slug inválido
    local invalid_category=$(cat <<EOF
{
    "name": "Test Category",
    "slug": "INVALID SLUG WITH SPACES",
    "description": "A test category",
    "icon": "🧪",
    "color": "#FF0000",
    "order": 99
}
EOF
)
    response=$(make_request "POST" "/categories" "$invalid_category" "$ADMIN_TOKEN" \
        "Crear categoría con slug inválido")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /categories (slug inválido)"
    
    # Test 2: POST /categories con color inválido
    local invalid_color_category=$(cat <<EOF
{
    "name": "Test Category",
    "slug": "test-category-color",
    "description": "A test category",
    "icon": "🧪",
    "color": "not-a-hex-color",
    "order": 99
}
EOF
)
    response=$(make_request "POST" "/categories" "$invalid_color_category" "$ADMIN_TOKEN" \
        "Crear categoría con color inválido")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /categories (color inválido)"
    
    # Test 3: POST /predefined-questions con texto muy largo
    local long_text=$(printf 'a%.0s' {1..250})
    local long_question=$(cat <<EOF
{
    "questionText": "$long_text",
    "categoryId": $CATEGORY_ID,
    "order": 99
}
EOF
)
    response=$(make_request "POST" "/predefined-questions" "$long_question" "$ADMIN_TOKEN" \
        "Crear pregunta con texto muy largo (>200 chars)")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /predefined-questions (texto muy largo)"
    
    # Test 4: POST /predefined-questions con categoryId inexistente
    local invalid_category_question=$(cat <<EOF
{
    "questionText": "¿Pregunta con categoría inexistente?",
    "categoryId": 99999,
    "order": 99
}
EOF
)
    response=$(make_request "POST" "/predefined-questions" "$invalid_category_question" "$ADMIN_TOKEN" \
        "Crear pregunta con categoría inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /predefined-questions (categoría inexistente)"
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_header "INICIO DE TESTS - CATEGORÍAS Y PREGUNTAS PREDEFINIDAS"
    print_info "Base URL: $BASE_URL"
    print_info "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Setup
    setup_authentication
    
    # Ejecutar todos los tests
    test_categories_endpoints
    test_predefined_questions_endpoints
    test_validations
    
    # Resumen
    print_header "RESUMEN DE TESTS"
    echo -e "Total de tests ejecutados: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "Tests exitosos: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Tests fallidos: ${RED}$FAILED_TESTS${NC}"
    
    if [ "$FAILED_TESTS" -eq 0 ]; then
        print_header "✓ TODOS LOS TESTS PASARON EXITOSAMENTE"
        exit 0
    else
        print_header "✗ ALGUNOS TESTS FALLARON"
        exit 1
    fi
}

# Ejecutar main
main "$@"
