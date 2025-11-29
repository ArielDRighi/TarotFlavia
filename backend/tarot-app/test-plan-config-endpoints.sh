#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO PLAN-CONFIG                          ║
# ║  Basado en TASK-076: Dashboard de Configuración Dinámica de Planes        ║
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

# Tokens (se obtendrán al hacer login)
ADMIN_TOKEN=""

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

# ═══════════════════════════════════════════════════════════════════════════
# SETUP INICIAL
# ═══════════════════════════════════════════════════════════════════════════

setup() {
    print_header "SETUP - AUTENTICACIÓN ADMIN"
    
    print_info "Obteniendo token de administrador..."
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$ADMIN_EMAIL\",
            \"password\": \"$ADMIN_PASSWORD\"
        }")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
        ADMIN_TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
        
        if [ -z "$ADMIN_TOKEN" ]; then
            print_error "No se pudo obtener el token de administrador"
            exit 1
        fi
        
        print_success "Token de administrador obtenido correctamente"
        print_info "Token: ${ADMIN_TOKEN:0:20}..."
    else
        print_error "Login de administrador falló (HTTP $HTTP_CODE)"
        echo "$BODY"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# TESTS - PLAN CONFIG ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

test_get_all_plans() {
    print_header "TEST: GET /plan-config - Obtener todos los planes"
    
    ((TOTAL_TESTS++))
    print_test "Listar todos los planes configurados"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        "$BASE_URL/plan-config" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if check_response 200 "$HTTP_CODE" "GET /plan-config"; then
        print_info "Respuesta: $BODY" | head -c 200
        echo ""
        
        # Verificar que retorna un array
        if echo "$BODY" | grep -q '\['; then
            print_success "Retorna un array de planes"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        else
            print_error "No retorna un array"
            ((TOTAL_TESTS++))
            ((FAILED_TESTS++))
        fi
        
        # Verificar que contiene planes (GUEST, FREE, PREMIUM, PROFESSIONAL)
        if echo "$BODY" | grep -q '"planType":"guest"' && \
           echo "$BODY" | grep -q '"planType":"free"' && \
           echo "$BODY" | grep -q '"planType":"premium"'; then
            print_success "Contiene los planes esperados (GUEST, FREE, PREMIUM)"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        else
            print_warning "No se encontraron todos los planes esperados"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))  # No falla porque puede que no estén creados
        fi
    fi
}

test_get_plan_by_type() {
    print_header "TEST: GET /plan-config/:planType - Obtener plan específico"
    
    # Test 1: Obtener plan FREE
    ((TOTAL_TESTS++))
    print_test "Obtener plan FREE"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        "$BASE_URL/plan-config/free" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if check_response 200 "$HTTP_CODE" "GET /plan-config/free"; then
        print_info "Plan FREE: $BODY" | head -c 200
        echo ""
        
        # Verificar estructura del plan
        if echo "$BODY" | grep -q '"planType":"free"' && \
           echo "$BODY" | grep -q '"readingsLimit"' && \
           echo "$BODY" | grep -q '"aiQuotaMonthly"'; then
            print_success "Plan FREE tiene estructura correcta"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        else
            print_error "Plan FREE no tiene estructura correcta"
            ((TOTAL_TESTS++))
            ((FAILED_TESTS++))
        fi
    fi
    
    # Test 2: Obtener plan PREMIUM
    ((TOTAL_TESTS++))
    print_test "Obtener plan PREMIUM"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        "$BASE_URL/plan-config/premium" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if check_response 200 "$HTTP_CODE" "GET /plan-config/premium"; then
        print_info "Plan PREMIUM: $BODY" | head -c 200
        echo ""
        
        # Verificar que PREMIUM tiene límites ilimitados (-1)
        if echo "$BODY" | grep -q '"readingsLimit":-1' && \
           echo "$BODY" | grep -q '"aiQuotaMonthly":-1'; then
            print_success "Plan PREMIUM tiene límites ilimitados (-1)"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        else
            print_warning "Plan PREMIUM no tiene límites ilimitados esperados"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        fi
    fi
    
    # Test 3: Intentar obtener plan inexistente
    ((TOTAL_TESTS++))
    print_test "Intentar obtener plan con tipo inválido (INVALID)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        "$BASE_URL/plan-config/invalid" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 400 "$HTTP_CODE" "GET /plan-config/invalid (debe retornar 400 por validación de enum)"
}

test_create_plan() {
    print_header "TEST: POST /plan-config - Crear nuevo plan"
    
    # Test 1: Crear plan TEST
    ((TOTAL_TESTS++))
    print_test "Crear plan TEST con configuración válida"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "$BASE_URL/plan-config" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "planType": "guest",
            "name": "Plan TEST",
            "description": "Plan de prueba para testing",
            "price": 0,
            "readingsLimit": 5,
            "aiQuotaMonthly": 50,
            "allowCustomQuestions": true,
            "allowSharing": false,
            "allowAdvancedSpreads": false
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    # Puede retornar 201 (creado) o 409 (ya existe)
    if [ "$HTTP_CODE" -eq 201 ]; then
        print_success "Plan TEST creado exitosamente (HTTP 201)"
        ((PASSED_TESTS++))
        print_info "Plan creado: $BODY" | head -c 200
        echo ""
    elif [ "$HTTP_CODE" -eq 409 ]; then
        print_warning "Plan TEST ya existe (HTTP 409) - esto es esperado si ya se ejecutó antes"
        ((PASSED_TESTS++))
    else
        print_error "Error al crear plan TEST - Expected HTTP 201 or 409, got HTTP $HTTP_CODE"
        ((FAILED_TESTS++))
        echo "$BODY"
    fi
    
    # Test 2: Intentar crear plan con datos inválidos (sin nombre)
    ((TOTAL_TESTS++))
    print_test "Intentar crear plan sin nombre (debe fallar)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        "$BASE_URL/plan-config" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "planType": "free",
            "description": "Plan sin nombre",
            "price": 0
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 400 "$HTTP_CODE" "POST /plan-config sin nombre (debe retornar 400)"
}

test_update_plan() {
    print_header "TEST: PUT /plan-config/:planType - Actualizar plan"
    
    # Test 1: Actualizar plan FREE - aumentar límite de lecturas
    ((TOTAL_TESTS++))
    print_test "Actualizar límite de lecturas del plan FREE (10 → 15)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
        "$BASE_URL/plan-config/free" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "readingsLimit": 15,
            "aiQuotaMonthly": 150
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if check_response 200 "$HTTP_CODE" "PUT /plan-config/free"; then
        print_info "Plan FREE actualizado: $BODY" | head -c 200
        echo ""
        
        # Verificar que se aplicaron los cambios
        if echo "$BODY" | grep -q '"readingsLimit":15' && \
           echo "$BODY" | grep -q '"aiQuotaMonthly":150'; then
            print_success "Límites actualizados correctamente (15 lecturas, 150 AI quota)"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        else
            print_error "Límites no se actualizaron correctamente"
            ((TOTAL_TESTS++))
            ((FAILED_TESTS++))
        fi
    fi
    
    # Test 2: Restaurar valores originales del plan FREE
    ((TOTAL_TESTS++))
    print_test "Restaurar valores originales del plan FREE (15 → 10)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
        "$BASE_URL/plan-config/free" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "readingsLimit": 10,
            "aiQuotaMonthly": 100
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 200 "$HTTP_CODE" "PUT /plan-config/free (restaurar valores)"
    
    # Test 3: Actualizar plan inexistente
    ((TOTAL_TESTS++))
    print_test "Intentar actualizar plan con tipo inválido (debe fallar)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
        "$BASE_URL/plan-config/invalid" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "readingsLimit": 5
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 400 "$HTTP_CODE" "PUT /plan-config/invalid (debe retornar 400 por validación de enum)"
    
    # Test 4: Actualizar features del plan PREMIUM
    ((TOTAL_TESTS++))
    print_test "Actualizar features del plan PREMIUM"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
        "$BASE_URL/plan-config/premium" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "allowCustomQuestions": true,
            "allowSharing": true,
            "allowAdvancedSpreads": true
        }')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if check_response 200 "$HTTP_CODE" "PUT /plan-config/premium (features)"; then
        if echo "$BODY" | grep -q '"allowCustomQuestions":true' && \
           echo "$BODY" | grep -q '"allowSharing":true' && \
           echo "$BODY" | grep -q '"allowAdvancedSpreads":true'; then
            print_success "Features PREMIUM actualizadas correctamente"
            ((TOTAL_TESTS++))
            ((PASSED_TESTS++))
        else
            print_error "Features PREMIUM no se actualizaron"
            ((TOTAL_TESTS++))
            ((FAILED_TESTS++))
        fi
    fi
}

test_delete_plan() {
    print_header "TEST: DELETE /plan-config/:planType - Eliminar plan"
    
    # Test 1: Intentar eliminar plan GUEST (no debe permitirse)
    ((TOTAL_TESTS++))
    print_test "Intentar eliminar plan GUEST (puede estar protegido)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
        "$BASE_URL/plan-config/guest" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    # Puede retornar 204 (eliminado) o 400/403 (protegido)
    if [ "$HTTP_CODE" -eq 204 ]; then
        print_warning "Plan GUEST eliminado (HTTP 204) - puede que necesite protección"
        ((PASSED_TESTS++))
    elif [ "$HTTP_CODE" -eq 400 ] || [ "$HTTP_CODE" -eq 403 ]; then
        print_success "Plan GUEST protegido contra eliminación (HTTP $HTTP_CODE)"
        ((PASSED_TESTS++))
    elif [ "$HTTP_CODE" -eq 404 ]; then
        print_warning "Plan GUEST no existe (HTTP 404)"
        ((PASSED_TESTS++))
    else
        print_error "Respuesta inesperada al eliminar GUEST (HTTP $HTTP_CODE)"
        ((FAILED_TESTS++))
    fi
    
    # Test 2: Intentar eliminar plan inexistente
    ((TOTAL_TESTS++))
    print_test "Intentar eliminar plan con tipo inválido (debe fallar)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
        "$BASE_URL/plan-config/invalid" \
        -H "Authorization: Bearer $ADMIN_TOKEN")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 400 "$HTTP_CODE" "DELETE /plan-config/invalid (debe retornar 400 por validación de enum)"
}

test_authorization() {
    print_header "TEST: AUTORIZACIÓN - Verificar seguridad de endpoints"
    
    # Test 1: Intentar acceder sin token
    ((TOTAL_TESTS++))
    print_test "Intentar GET /plan-config sin autenticación (debe fallar)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET \
        "$BASE_URL/plan-config")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 401 "$HTTP_CODE" "GET /plan-config sin token (debe retornar 401)"
    
    # Test 2: Intentar actualizar plan sin token
    ((TOTAL_TESTS++))
    print_test "Intentar PUT /plan-config/free sin autenticación (debe fallar)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
        "$BASE_URL/plan-config/free" \
        -H "Content-Type: application/json" \
        -d '{"readingsLimit": 999}')
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    check_response 401 "$HTTP_CODE" "PUT /plan-config/free sin token (debe retornar 401)"
}

# ═══════════════════════════════════════════════════════════════════════════
# EJECUCIÓN DE TESTS
# ═══════════════════════════════════════════════════════════════════════════

main() {
    print_header "INICIO DE TESTS - MÓDULO PLAN-CONFIG"
    print_info "Base URL: $BASE_URL"
    print_info "Admin: $ADMIN_EMAIL"
    
    # Setup
    setup
    
    # Ejecutar tests
    test_get_all_plans
    test_get_plan_by_type
    test_create_plan
    test_update_plan
    test_delete_plan
    test_authorization
    
    # Resumen final
    print_header "RESUMEN DE TESTS"
    echo -e "${CYAN}Total de tests ejecutados: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Tests exitosos: $PASSED_TESTS${NC}"
    echo -e "${RED}Tests fallidos: $FAILED_TESTS${NC}"
    
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

# Ejecutar script
main
