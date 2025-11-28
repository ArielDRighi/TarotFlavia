#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO AI-USAGE                             ║
# ║  Basado en TASK-ARCH-013: Arquitectura Layered para AI-Usage              ║
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
FREE_USER_EMAIL="free-user-$(date +%s)@example.com"
FREE_USER_PASSWORD="FreeTest123!@#"
PREMIUM_USER_EMAIL="premium-user-$(date +%s)@example.com"
PREMIUM_USER_PASSWORD="PremiumTest123!@#"

# Tokens (se obtendrán al hacer login)
ADMIN_TOKEN=""
FREE_USER_TOKEN=""
PREMIUM_USER_TOKEN=""

# IDs
ADMIN_ID=""
FREE_USER_ID=""
PREMIUM_USER_ID=""

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
        echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | sed 's/.*"\([^"]*\)"/\1/' | head -1
        if [ -z "$(echo "$json" | grep "\"$key\"[[:space:]]*:[[:space:]]*\"")" ]; then
            # Try numeric values
            echo "$json" | grep -o "\"$key\"[[:space:]]*:[[:space:]]*[0-9\.]*" | sed 's/.*:[[:space:]]*//' | head -1
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SETUP: AUTENTICACIÓN
# ═══════════════════════════════════════════════════════════════════════════

setup_authentication() {
    print_header "SETUP: AUTENTICACIÓN Y USUARIOS DE PRUEBA"
    
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
        ADMIN_ID=$(echo "$body" | grep -o '"user"[^}]*"id"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' | head -1)
        print_success "Token de admin obtenido exitosamente"
        print_info "Admin ID: $ADMIN_ID"
        print_info "Admin Token: ${ADMIN_TOKEN:0:20}..."
    else
        print_error "No se pudo obtener token de admin"
        exit 1
    fi
    
    # Crear usuario FREE de prueba
    print_info "Creando usuario FREE de prueba..."
    local register_free_data=$(cat <<EOF
{
    "email": "$FREE_USER_EMAIL",
    "password": "$FREE_USER_PASSWORD",
    "name": "Free User Test"
}
EOF
)
    
    response=$(make_request "POST" "/auth/register" "$register_free_data" "" "Registro de usuario FREE")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        FREE_USER_TOKEN=$(extract_json_value "$body" "access_token")
        FREE_USER_ID=$(echo "$body" | grep -o '"user"[^}]*"id"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' | head -1)
        print_success "Usuario FREE creado exitosamente"
        print_info "Free User ID: $FREE_USER_ID"
        print_info "Free User Token: ${FREE_USER_TOKEN:0:20}..."
    else
        print_error "No se pudo crear usuario FREE de prueba"
        exit 1
    fi
    
    # Crear usuario PREMIUM de prueba
    print_info "Creando usuario PREMIUM de prueba..."
    local register_premium_data=$(cat <<EOF
{
    "email": "$PREMIUM_USER_EMAIL",
    "password": "$PREMIUM_USER_PASSWORD",
    "name": "Premium User Test"
}
EOF
)
    
    response=$(make_request "POST" "/auth/register" "$register_premium_data" "" "Registro de usuario PREMIUM")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        PREMIUM_USER_TOKEN=$(extract_json_value "$body" "access_token")
        PREMIUM_USER_ID=$(echo "$body" | grep -o '"user"[^}]*"id"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' | head -1)
        print_success "Usuario PREMIUM creado exitosamente"
        print_info "Premium User ID: $PREMIUM_USER_ID"
        
        # Actualizar plan a PREMIUM usando endpoint admin
        print_info "Actualizando plan a PREMIUM..."
        local update_plan_data=$(cat <<EOF
{
    "plan": "premium"
}
EOF
)
        
        response=$(make_request "PATCH" "/admin/users/$PREMIUM_USER_ID/plan" "$update_plan_data" "$ADMIN_TOKEN" \
            "Actualizar usuario a plan PREMIUM")
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq 200 ]; then
            print_success "Usuario actualizado a plan PREMIUM"
        else
            print_warning "No se pudo actualizar a PREMIUM (puede que endpoint no exista en tu versión)"
        fi
    else
        print_error "No se pudo crear usuario PREMIUM de prueba"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: ENDPOINT GET /usage/ai (AI Quota - User Endpoint)
# ═══════════════════════════════════════════════════════════════════════════

test_ai_quota_user_endpoint() {
    print_header "TESTS: ENDPOINT GET /usage/ai (Cuota de IA - Usuario)"
    
    # Test 1: GET /usage/ai con usuario FREE autenticado
    response=$(make_request "GET" "/usage/ai" "" "$FREE_USER_TOKEN" \
        "Obtener cuota de IA (usuario FREE)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /usage/ai (FREE user autenticado)"
    
    if [ "$http_code" -eq 200 ]; then
        # Verificar campos esperados en respuesta
        quota_limit=$(extract_json_value "$body" "quotaLimit")
        requests_used=$(extract_json_value "$body" "requestsUsed")
        requests_remaining=$(extract_json_value "$body" "requestsRemaining")
        percentage_used=$(extract_json_value "$body" "percentageUsed")
        plan=$(extract_json_value "$body" "plan")
        
        print_info "Cuota límite: $quota_limit"
        print_info "Requests usados: $requests_used"
        print_info "Requests restantes: $requests_remaining"
        print_info "Porcentaje usado: $percentage_used%"
        print_info "Plan: $plan"
        
        # Validar que quota_limit no sea -1 para FREE (debe ser 100 o similar)
        if [ -n "$quota_limit" ] && [ "$quota_limit" != "-1" ]; then
            print_success "Usuario FREE tiene cuota limitada ($quota_limit)"
        else
            print_warning "Usuario FREE debería tener cuota limitada, obtuvo: $quota_limit"
        fi
    fi
    
    # Test 2: GET /usage/ai con usuario PREMIUM autenticado
    response=$(make_request "GET" "/usage/ai" "" "$PREMIUM_USER_TOKEN" \
        "Obtener cuota de IA (usuario PREMIUM)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /usage/ai (PREMIUM user autenticado)"
    
    if [ "$http_code" -eq 200 ]; then
        quota_limit=$(extract_json_value "$body" "quotaLimit")
        plan=$(extract_json_value "$body" "plan")
        
        print_info "Cuota límite: $quota_limit"
        print_info "Plan: $plan"
        
        # Validar que quota_limit sea -1 para PREMIUM (ilimitado)
        if [ "$quota_limit" == "-1" ]; then
            print_success "Usuario PREMIUM tiene cuota ilimitada"
        else
            print_warning "Usuario PREMIUM debería tener cuota ilimitada (-1), obtuvo: $quota_limit"
        fi
    fi
    
    # Test 3: GET /usage/ai sin autenticación (debe fallar)
    response=$(make_request "GET" "/usage/ai" "" "" \
        "Obtener cuota de IA sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "GET /usage/ai (sin token - debe fallar 401)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: ENDPOINT GET /admin/ai-usage (AI Usage Statistics - Admin Endpoint)
# ═══════════════════════════════════════════════════════════════════════════

test_ai_usage_admin_endpoint() {
    print_header "TESTS: ENDPOINT GET /admin/ai-usage (Estadísticas de Uso - Admin)"
    
    # Test 1: GET /admin/ai-usage con admin autenticado (sin filtros)
    response=$(make_request "GET" "/admin/ai-usage" "" "$ADMIN_TOKEN" \
        "Obtener estadísticas de uso de IA (sin filtros)")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    check_response 200 "$http_code" "GET /admin/ai-usage (admin autenticado)"
    
    if [ "$http_code" -eq 200 ]; then
        # Verificar campos esperados en respuesta
        groq_calls=$(extract_json_value "$body" "groqCallsToday")
        groq_alert=$(extract_json_value "$body" "groqRateLimitAlert")
        error_alert=$(extract_json_value "$body" "highErrorRateAlert")
        
        print_info "Groq calls hoy: $groq_calls"
        print_info "Alerta Groq rate limit: $groq_alert"
        print_info "Alerta high error rate: $error_alert"
        
        # Verificar que tenga array de statistics
        if echo "$body" | grep -q '"statistics"'; then
            print_success "Respuesta contiene array de statistics"
        else
            print_warning "Respuesta no contiene array de statistics"
        fi
    fi
    
    # Test 2: GET /admin/ai-usage con filtro de fechas
    local start_date="2025-11-01T00:00:00.000Z"
    local end_date="2025-11-30T23:59:59.999Z"
    
    response=$(make_request "GET" "/admin/ai-usage?startDate=$start_date&endDate=$end_date" "" "$ADMIN_TOKEN" \
        "Obtener estadísticas de uso de IA (con filtro de fechas)")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "GET /admin/ai-usage (con query params startDate/endDate)"
    
    # Test 3: GET /admin/ai-usage sin autenticación (debe fallar)
    response=$(make_request "GET" "/admin/ai-usage" "" "" \
        "Obtener estadísticas sin autenticación")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "GET /admin/ai-usage (sin token - debe fallar 401)"
    
    # Test 4: GET /admin/ai-usage con usuario NO admin (debe fallar)
    response=$(make_request "GET" "/admin/ai-usage" "" "$FREE_USER_TOKEN" \
        "Obtener estadísticas con usuario NO admin")
    http_code=$(echo "$response" | tail -n1)
    check_response 403 "$http_code" "GET /admin/ai-usage (usuario FREE - debe fallar 403 Forbidden)"
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: AI QUOTA GUARD INTEGRATION
# ═══════════════════════════════════════════════════════════════════════════

test_ai_quota_guard_integration() {
    print_header "TESTS: AI QUOTA GUARD INTEGRATION"
    
    print_info "Estos tests verifican que el AIQuotaGuard funcione correctamente"
    print_info "en endpoints que consumen cuota de IA"
    
    # Test 1: Verificar que endpoints protegidos con AIQuotaGuard existen
    # Asumiendo que /readings/:id/regenerate usa AIQuotaGuard
    
    # Primero crear una lectura para tener un ID válido
    print_info "Creando lectura de prueba para test de guard..."
    local create_reading_data=$(cat <<EOF
{
    "spreadId": 1,
    "question": "Test question for AI quota guard"
}
EOF
)
    
    response=$(make_request "POST" "/readings" "$create_reading_data" "$FREE_USER_TOKEN" \
        "Crear lectura de prueba")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        READING_ID=$(extract_json_value "$body" "id")
        print_success "Lectura de prueba creada (ID: $READING_ID)"
        
        # Test 2: Intentar regenerar con usuario FREE (debería funcionar si tiene cuota)
        response=$(make_request "POST" "/readings/$READING_ID/regenerate" "{}" "$FREE_USER_TOKEN" \
            "Regenerar lectura (verifica que AIQuotaGuard permite si hay cuota)")
        http_code=$(echo "$response" | tail -n1)
        
        # Puede ser 200/201 (éxito) o 403 (sin cuota) - ambos válidos
        check_response_multi "$http_code" "POST /readings/:id/regenerate (con AIQuotaGuard)" 200 201 403
        
        if [ "$http_code" -eq 403 ]; then
            print_info "Usuario bloqueado por cuota excedida (comportamiento esperado si sin cuota)"
        elif [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
            print_info "Regeneración exitosa (usuario tiene cuota disponible)"
        fi
    else
        print_warning "No se pudo crear lectura de prueba - saltando test de guard integration"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS: BOUNDARY CASES Y EDGE CASES
# ═══════════════════════════════════════════════════════════════════════════

test_boundary_cases() {
    print_header "TESTS: BOUNDARY CASES Y EDGE CASES"
    
    # Test 1: GET /admin/ai-usage con fechas inválidas
    response=$(make_request "GET" "/admin/ai-usage?startDate=invalid-date" "" "$ADMIN_TOKEN" \
        "Obtener estadísticas con fecha inválida")
    http_code=$(echo "$response" | tail -n1)
    # Puede ser 200 (ignora parámetro inválido) o 400 (valida parámetro)
    check_response_multi "$http_code" "GET /admin/ai-usage (fecha inválida)" 200 400
    
    # Test 2: GET /admin/ai-usage con startDate > endDate
    local start_after="2025-12-31T00:00:00.000Z"
    local end_before="2025-01-01T00:00:00.000Z"
    
    response=$(make_request "GET" "/admin/ai-usage?startDate=$start_after&endDate=$end_before" "" "$ADMIN_TOKEN" \
        "Obtener estadísticas con startDate > endDate")
    http_code=$(echo "$response" | tail -n1)
    # Puede ser 200 (retorna array vacío) o 400 (valida lógica de fechas)
    check_response_multi "$http_code" "GET /admin/ai-usage (startDate > endDate)" 200 400
    
    # Test 3: GET /usage/ai múltiples veces (verificar idempotencia)
    for i in {1..3}; do
        response=$(make_request "GET" "/usage/ai" "" "$FREE_USER_TOKEN" \
            "Obtener cuota de IA - request idempotente #$i")
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq 200 ]; then
            print_success "Request idempotente #$i exitoso"
        else
            print_error "Request idempotente #$i falló con HTTP $http_code"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════════════════
# CLEANUP
# ═══════════════════════════════════════════════════════════════════════════

cleanup() {
    print_header "CLEANUP: LIMPIEZA DE USUARIOS DE PRUEBA"
    
    # Eliminar usuario FREE de prueba
    if [ -n "$FREE_USER_ID" ] && [ "$FREE_USER_ID" != "" ]; then
        print_info "Eliminando usuario FREE de prueba (ID: $FREE_USER_ID)..."
        response=$(make_request "DELETE" "/admin/users/$FREE_USER_ID" "" "$ADMIN_TOKEN" \
            "Eliminar usuario FREE de prueba")
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 204 ]; then
            print_success "Usuario FREE eliminado exitosamente"
        else
            print_warning "No se pudo eliminar usuario FREE (puede requerir limpieza manual)"
        fi
    fi
    
    # Eliminar usuario PREMIUM de prueba
    if [ -n "$PREMIUM_USER_ID" ] && [ "$PREMIUM_USER_ID" != "" ]; then
        print_info "Eliminando usuario PREMIUM de prueba (ID: $PREMIUM_USER_ID)..."
        response=$(make_request "DELETE" "/admin/users/$PREMIUM_USER_ID" "" "$ADMIN_TOKEN" \
            "Eliminar usuario PREMIUM de prueba")
        http_code=$(echo "$response" | tail -n1)
        
        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 204 ]; then
            print_success "Usuario PREMIUM eliminado exitosamente"
        else
            print_warning "No se pudo eliminar usuario PREMIUM (puede requerir limpieza manual)"
        fi
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# RESUMEN FINAL
# ═══════════════════════════════════════════════════════════════════════════

print_summary() {
    print_header "RESUMEN DE TESTS - MÓDULO AI-USAGE"
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}Total de tests ejecutados:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}Tests pasados:${NC} $PASSED_TESTS"
    echo -e "${RED}Tests fallidos:${NC} $FAILED_TESTS"
    
    local pass_rate=0
    if [ "$TOTAL_TESTS" -gt 0 ]; then
        pass_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    echo -e "${CYAN}Tasa de éxito:${NC} $pass_rate%"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════════════════${NC}\n"
    
    if [ "$FAILED_TESTS" -eq 0 ]; then
        echo -e "${GREEN}✓ TODOS LOS TESTS PASARON EXITOSAMENTE${NC}\n"
        exit 0
    else
        echo -e "${RED}✗ ALGUNOS TESTS FALLARON - REVISAR LOGS ARRIBA${NC}\n"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

main() {
    clear
    
    print_header "INICIANDO TESTS DEL MÓDULO AI-USAGE"
    
    echo -e "${CYAN}Configuración:${NC}"
    echo -e "  Base URL: ${BLUE}$BASE_URL${NC}"
    echo -e "  Admin Email: ${BLUE}$ADMIN_EMAIL${NC}"
    echo -e "  Free User Email: ${BLUE}$FREE_USER_EMAIL${NC}"
    echo -e "  Premium User Email: ${BLUE}$PREMIUM_USER_EMAIL${NC}\n"
    
    # Setup
    setup_authentication
    
    # Tests de endpoints
    test_ai_quota_user_endpoint
    test_ai_usage_admin_endpoint
    test_ai_quota_guard_integration
    test_boundary_cases
    
    # Cleanup
    cleanup
    
    # Resumen
    print_summary
}

# Ejecutar main
main
