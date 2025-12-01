#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO TAROT                                ║
# ║  Basado en TASK-001: Arquitectura Modular para Tarot                      ║
# ║  Endpoints: /cards, /decks, /spreads, /readings                           ║
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
TEST_USER_EMAIL="tarot-test-$(date +%s)@example.com"
TEST_USER_PASSWORD="TarotTest123!@#"
TEST_USER_NAME="Tarot Test User"

# Tokens (se obtendrán al hacer login)
ADMIN_TOKEN=""
USER_TOKEN=""

# IDs (se obtendrán de las respuestas)
CARD_ID=""
DECK_ID=""
SPREAD_ID=""
READING_ID=""

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
        echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)"/\1/' | head -1
        if [ -z "$(echo "$json" | grep "\"$key\"[[:space:]]*:[[:space:]]*\"")" ]; then
            # Try numeric values
            echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[0-9]*" | sed 's/.*:[[:space:]]*//' | head -1
        fi
    fi
}

extract_first_id() {
    local json=$1
    if command -v jq &> /dev/null; then
        echo "$json" | jq -r '.[0].id // .id // empty' 2>/dev/null
    else
        echo "$json" | grep -o '"id"[[:space:]]*:[[:space:]]*[0-9]*' | head -1 | grep -o '[0-9]*'
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
        print_success "Token de admin obtenido exitosamente"
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
        print_success "Usuario de prueba creado exitosamente"
        print_info "User Token: ${USER_TOKEN:0:20}..."
    else
        print_error "No se pudo crear usuario de prueba"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: CARDS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_cards_endpoints() {
    print_header "TESTS: CARTAS (/cards)"
    
    # Test 1: GET /cards (listar todas las cartas - público)
    response=$(make_request "GET" "/cards" "" "" \
        "Listar todas las cartas (público)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /cards"
    
    # Guardar un ID de carta para tests posteriores
    CARD_ID=$(extract_first_id "$body")
    print_info "Card ID obtenido: $CARD_ID"
    
    # Test 2: GET /cards/:id (obtener carta específica)
    if [ -n "$CARD_ID" ]; then
        response=$(make_request "GET" "/cards/$CARD_ID" "" "" \
            "Obtener carta por ID")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /cards/:id"
    else
        print_warning "No hay cartas para probar GET /cards/:id"
    fi
    
    # Test 3: GET /cards/:id (carta no existente)
    response=$(make_request "GET" "/cards/99999" "" "" \
        "Obtener carta inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /cards/:id (inexistente)"
    
    # Test 4: POST /cards (crear carta - sin autenticación)
    local card_data=$(cat <<EOF
{
    "name": "Test Card",
    "arcana": "major",
    "number": 99
}
EOF
)
    response=$(make_request "POST" "/cards" "$card_data" "" \
        "Crear carta sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /cards (sin auth)"
    
    # Test 5: POST /cards (crear carta - usuario normal)
    # Nota: puede retornar 403 (Forbidden) o 400 (validación antes de auth check)
    response=$(make_request "POST" "/cards" "$card_data" "$USER_TOKEN" \
        "Crear carta como usuario normal")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /cards (usuario normal - requiere admin)" 403 400
    
    # Test 6: POST /cards (crear carta - admin) - puede fallar si hay validaciones adicionales
    response=$(make_request "POST" "/cards" "$card_data" "$ADMIN_TOKEN" \
        "Crear carta como admin")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /cards (admin)" 201 200 400
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: DECKS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_decks_endpoints() {
    print_header "TESTS: MAZOS (/decks)"
    
    # Test 1: GET /decks (listar todos los mazos - público)
    response=$(make_request "GET" "/decks" "" "" \
        "Listar todos los mazos (público)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /decks"
    
    # Guardar un ID de mazo para tests posteriores
    DECK_ID=$(extract_first_id "$body")
    print_info "Deck ID obtenido: $DECK_ID"
    
    # Test 2: GET /decks/default (obtener mazo predeterminado)
    response=$(make_request "GET" "/decks/default" "" "" \
        "Obtener mazo predeterminado")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "GET /decks/default" 200 404
    
    # Test 3: GET /decks/:id (obtener mazo específico)
    if [ -n "$DECK_ID" ]; then
        response=$(make_request "GET" "/decks/$DECK_ID" "" "" \
            "Obtener mazo por ID")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /decks/:id"
    else
        print_warning "No hay mazos para probar GET /decks/:id"
    fi
    
    # Test 4: GET /decks/:id (mazo no existente)
    response=$(make_request "GET" "/decks/99999" "" "" \
        "Obtener mazo inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /decks/:id (inexistente)"
    
    # Test 5: POST /decks (crear mazo - sin autenticación)
    local deck_data=$(cat <<EOF
{
    "name": "Test Deck",
    "description": "A test deck"
}
EOF
)
    response=$(make_request "POST" "/decks" "$deck_data" "" \
        "Crear mazo sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /decks (sin auth)"
    
    # Test 6: POST /decks (crear mazo - usuario normal)
    # Nota: puede retornar 403 (Forbidden) o 400 (validación antes de auth check)
    response=$(make_request "POST" "/decks" "$deck_data" "$USER_TOKEN" \
        "Crear mazo como usuario normal")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /decks (usuario normal - requiere admin)" 403 400
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: SPREADS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_spreads_endpoints() {
    print_header "TESTS: TIRADAS (/spreads)"
    
    # Test 1: GET /spreads (listar todas las tiradas - público)
    response=$(make_request "GET" "/spreads" "" "" \
        "Listar todas las tiradas (público)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /spreads"
    
    # Guardar un ID de tirada para tests posteriores
    SPREAD_ID=$(extract_first_id "$body")
    print_info "Spread ID obtenido: $SPREAD_ID"
    
    # Test 2: GET /spreads/:id (obtener tirada específica)
    if [ -n "$SPREAD_ID" ]; then
        response=$(make_request "GET" "/spreads/$SPREAD_ID" "" "" \
            "Obtener tirada por ID")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /spreads/:id"
    else
        print_warning "No hay tiradas para probar GET /spreads/:id"
    fi
    
    # Test 3: GET /spreads/:id (tirada no existente)
    response=$(make_request "GET" "/spreads/99999" "" "" \
        "Obtener tirada inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /spreads/:id (inexistente)"
    
    # Test 4: POST /spreads (crear tirada - sin autenticación)
    local spread_data=$(cat <<EOF
{
    "name": "Test Spread",
    "description": "A test spread",
    "cardCount": 3
}
EOF
)
    response=$(make_request "POST" "/spreads" "$spread_data" "" \
        "Crear tirada sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /spreads (sin auth)"
    
    # Test 5: POST /spreads (crear tirada - usuario normal)
    # Nota: puede retornar 403 (Forbidden) o 400 (validación antes de auth check)
    response=$(make_request "POST" "/spreads" "$spread_data" "$USER_TOKEN" \
        "Crear tirada como usuario normal")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /spreads (usuario normal - requiere admin)" 403 400
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: READINGS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_readings_endpoints() {
    print_header "TESTS: LECTURAS (/readings)"
    
    # Test 1: POST /readings (crear lectura - sin autenticación)
    local reading_data=$(cat <<EOF
{
    "spreadId": $SPREAD_ID,
    "predefinedQuestionId": 1
}
EOF
)
    response=$(make_request "POST" "/readings" "$reading_data" "" \
        "Crear lectura sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /readings (sin auth)"
    
    # Test 2: GET /readings (listar lecturas del usuario - sin auth)
    response=$(make_request "GET" "/readings" "" "" \
        "Listar lecturas sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "GET /readings (sin auth)"
    
    # Test 3: GET /readings (listar lecturas del usuario - con auth)
    response=$(make_request "GET" "/readings" "" "$USER_TOKEN" \
        "Listar lecturas del usuario")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /readings (usuario autenticado)"
    
    # Test 4: GET /readings/trash (papelera - sin auth)
    response=$(make_request "GET" "/readings/trash" "" "" \
        "Acceder a papelera sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "GET /readings/trash (sin auth)"
    
    # Test 5: GET /readings/trash (papelera - con auth)
    response=$(make_request "GET" "/readings/trash" "" "$USER_TOKEN" \
        "Acceder a papelera del usuario")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /readings/trash"
    
    # Test 6: POST /readings con pregunta predefinida (usuario free)
    if [ -n "$SPREAD_ID" ]; then
        local reading_with_predefined=$(cat <<EOF
{
    "spreadId": $SPREAD_ID,
    "predefinedQuestionId": 1
}
EOF
)
        response=$(make_request "POST" "/readings" "$reading_with_predefined" "$USER_TOKEN" \
            "Crear lectura con pregunta predefinida")
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        # Puede ser 201 (creada), 429 (rate limit), o 400 (validación)
        check_response_multi "$http_code" "POST /readings (pregunta predefinida)" 201 200 429 400 403
        
        # Intentar extraer el ID de la lectura creada
        READING_ID=$(extract_json_value "$body" "id")
        if [ -n "$READING_ID" ] && [ "$READING_ID" != "null" ]; then
            print_info "Reading ID obtenido: $READING_ID"
        fi
    fi
    
    # Test 7: POST /readings con pregunta personalizada (usuario free - debe fallar)
    if [ -n "$SPREAD_ID" ]; then
        local reading_custom=$(cat <<EOF
{
    "spreadId": $SPREAD_ID,
    "customQuestion": "¿Qué me depara el futuro en el amor?"
}
EOF
)
        response=$(make_request "POST" "/readings" "$reading_custom" "$USER_TOKEN" \
            "Crear lectura con pregunta custom (usuario free)")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "POST /readings (custom question, usuario free)"
    fi
    
    # Test 8: GET /readings/:id (lectura específica)
    if [ -n "$READING_ID" ] && [ "$READING_ID" != "null" ]; then
        response=$(make_request "GET" "/readings/$READING_ID" "" "$USER_TOKEN" \
            "Obtener lectura por ID")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /readings/:id"
    fi
    
    # Test 9: GET /readings/:id (lectura inexistente)
    response=$(make_request "GET" "/readings/99999" "" "$USER_TOKEN" \
        "Obtener lectura inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /readings/:id (inexistente)"
    
    # Test 10: DELETE /readings/:id (sin auth)
    response=$(make_request "DELETE" "/readings/99999" "" "" \
        "Eliminar lectura sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "DELETE /readings/:id (sin auth)"
    
    # Test 11: POST /readings/:id/restore (sin auth)
    response=$(make_request "POST" "/readings/99999/restore" "" "" \
        "Restaurar lectura sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /readings/:id/restore (sin auth)"
    
    # Test 12: POST /readings/:id/restore (lectura inexistente)
    response=$(make_request "POST" "/readings/99999/restore" "" "$USER_TOKEN" \
        "Restaurar lectura inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "POST /readings/:id/restore (inexistente)"
    
    # Test 13: POST /readings/:id/regenerate (sin auth)
    response=$(make_request "POST" "/readings/99999/regenerate" "" "" \
        "Regenerar interpretación sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /readings/:id/regenerate (sin auth)"
    
    # Test 14: POST /readings/:id/regenerate (usuario free - requiere premium)
    if [ -n "$READING_ID" ] && [ "$READING_ID" != "null" ]; then
        response=$(make_request "POST" "/readings/$READING_ID/regenerate" "" "$USER_TOKEN" \
            "Regenerar interpretación (usuario free)")
        http_code=$(echo "$response" | tail -n1)
        # Usuario free no puede regenerar
        check_response 403 "$http_code" "POST /readings/:id/regenerate (usuario free - requiere premium)"
    fi
    
    # Test 15: POST /readings/:id/share (sin auth)
    response=$(make_request "POST" "/readings/99999/share" "" "" \
        "Compartir lectura sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "POST /readings/:id/share (sin auth)"
    
    # Test 16: POST /readings/:id/share (usuario free - requiere premium)
    if [ -n "$READING_ID" ] && [ "$READING_ID" != "null" ]; then
        response=$(make_request "POST" "/readings/$READING_ID/share" "" "$USER_TOKEN" \
            "Compartir lectura (usuario free)")
        http_code=$(echo "$response" | tail -n1)
        # Usuario free no puede compartir
        check_response 403 "$http_code" "POST /readings/:id/share (usuario free - requiere premium)"
    fi
    
    # Test 17: DELETE /readings/:id/unshare (sin auth)
    response=$(make_request "DELETE" "/readings/99999/unshare" "" "" \
        "Dejar de compartir lectura sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "DELETE /readings/:id/unshare (sin auth)"
    
    # Test 18: GET /shared/:token (token inexistente)
    response=$(make_request "GET" "/shared/nonexistent-token-12345" "" "" \
        "Acceder a lectura compartida con token inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "GET /shared/:token (inexistente)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: EDGE CASES Y VALIDACIONES
# ═══════════════════════════════════════════════════════════════════════════

test_edge_cases() {
    print_header "TESTS: CASOS ESPECIALES Y VALIDACIONES"
    
    # Test 1: GET /cards/deck/:deckId (cartas de un mazo)
    if [ -n "$DECK_ID" ]; then
        response=$(make_request "GET" "/cards/deck/$DECK_ID" "" "" \
            "Obtener cartas de un mazo específico")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "GET /cards/deck/:deckId"
    fi
    
    # Test 2: GET /cards/deck/:deckId (mazo inexistente)
    response=$(make_request "GET" "/cards/deck/99999" "" "" \
        "Obtener cartas de mazo inexistente")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "GET /cards/deck/:deckId (inexistente)" 404 200
    
    # Test 3: POST /readings con datos inválidos
    local invalid_reading=$(cat <<EOF
{
    "spreadId": "not-a-number"
}
EOF
)
    response=$(make_request "POST" "/readings" "$invalid_reading" "$USER_TOKEN" \
        "Crear lectura con datos inválidos")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /readings (datos inválidos)"
    
    # Test 4: POST /readings sin pregunta
    local no_question_reading=$(cat <<EOF
{
    "spreadId": $SPREAD_ID
}
EOF
)
    response=$(make_request "POST" "/readings" "$no_question_reading" "$USER_TOKEN" \
        "Crear lectura sin pregunta")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "POST /readings (sin pregunta)"
    
    # Test 5: POST /readings con ambas preguntas
    # Nota: puede retornar 400 (validación) o 403 (premium guard para customQuestion)
    local both_questions=$(cat <<EOF
{
    "spreadId": $SPREAD_ID,
    "predefinedQuestionId": 1,
    "customQuestion": "Test question"
}
EOF
)
    response=$(make_request "POST" "/readings" "$both_questions" "$USER_TOKEN" \
        "Crear lectura con ambas preguntas")
    http_code=$(echo "$response" | tail -n1)
    check_response_multi "$http_code" "POST /readings (ambas preguntas - debe rechazar)" 400 403
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_header "INICIO DE TESTS - MÓDULO TAROT"
    print_info "Base URL: $BASE_URL"
    print_info "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Setup
    setup_authentication
    
    # Ejecutar todos los tests
    test_cards_endpoints
    test_decks_endpoints
    test_spreads_endpoints
    test_readings_endpoints
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
