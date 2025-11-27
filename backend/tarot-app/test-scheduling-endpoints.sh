#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO SCHEDULING                           ║
# ║  Basado en TASK-ARCH-011: Sistema de Agendamiento                         ║
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
USER_EMAIL="test@example.com"
USER_PASSWORD="Test123456!"

# Tokens (se obtendrán al hacer login)
ADMIN_TOKEN=""
TAROTISTA_TOKEN=""
USER_TOKEN=""

# IDs (se obtendrán de las respuestas)
TAROTISTA_ID=1  # Flavia es la tarotista por defecto (ID 1)
USER_ID=""
AVAILABILITY_ID=""
EXCEPTION_ID=""
SESSION_ID=""

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

extract_json_field() {
    local json=$1
    local field=$2
    
    # Intenta con jq primero
    if command -v jq >/dev/null 2>&1; then
        echo "$json" | jq -r ".$field" 2>/dev/null
    else
        # Fallback sin jq usando grep y sed
        echo "$json" | grep -o "\"$field\":[0-9]*" | sed "s/\"$field\":\([0-9]*\)/\1/"
    fi
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
    
    # Login como TAROTISTA
    print_info "Intentando autenticar como Tarotista..."
    response=$(make_request "POST" "/auth/login" \
        "{\"email\":\"$TAROTISTA_EMAIL\",\"password\":\"$TAROTISTA_PASSWORD\"}" \
        "" "Login Tarotista (Flavia)")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        TAROTISTA_TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')
        if [ -n "$TAROTISTA_TOKEN" ]; then
            print_success "Tarotista token obtenido"
        else
            print_warning "No se pudo extraer el token de tarotista"
        fi
    else
        print_warning "Login tarotista falló - Usuario puede no existir aún"
    fi
    
    # Login como USUARIO
    print_info "Intentando autenticar como Usuario..."
    response=$(make_request "POST" "/auth/login" \
        "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}" \
        "" "Login Usuario")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        USER_TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"\([^"]*\)"/\1/')
        if [ -n "$USER_TOKEN" ]; then
            print_success "Usuario token obtenido"
        else
            print_warning "No se pudo extraer el token de usuario"
        fi
    else
        print_warning "Login usuario falló - Usuario puede no existir aún"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 1: GESTIÓN DE DISPONIBILIDAD (TAROTISTA)
# ═══════════════════════════════════════════════════════════════════════════

test_availability_management() {
    print_header "SECCIÓN 1: GESTIÓN DE DISPONIBILIDAD (TAROTISTA)"
    
    if [ -z "$TAROTISTA_TOKEN" ]; then
        print_warning "No hay token de tarotista, saltando tests de disponibilidad"
        return
    fi
    
    # TEST 1: Obtener disponibilidad semanal (vacía inicialmente)
    response=$(make_request "GET" "/tarotist/scheduling/availability/weekly" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/availability/weekly - Obtener disponibilidad")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Obtener disponibilidad semanal"
    
    # TEST 2: Establecer disponibilidad para Lunes
    response=$(make_request "POST" "/tarotist/scheduling/availability/weekly" \
        '{
            "dayOfWeek": 1,
            "startTime": "09:00",
            "endTime": "13:00"
        }' \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/weekly - Lunes 09:00-13:00")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 201 "$http_code" "Establecer disponibilidad Lunes"; then
        AVAILABILITY_ID=$(extract_json_field "$body" "id")
        print_info "Disponibilidad creada con ID: $AVAILABILITY_ID"
    fi
    
    # TEST 3: Establecer disponibilidad para Miércoles
    response=$(make_request "POST" "/tarotist/scheduling/availability/weekly" \
        '{
            "dayOfWeek": 3,
            "startTime": "14:00",
            "endTime": "18:00"
        }' \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/weekly - Miércoles 14:00-18:00")
    http_code=$(echo "$response" | tail -n1)
    check_response 201 "$http_code" "Establecer disponibilidad Miércoles"
    
    # TEST 4: Establecer disponibilidad para Viernes
    response=$(make_request "POST" "/tarotist/scheduling/availability/weekly" \
        '{
            "dayOfWeek": 5,
            "startTime": "10:00",
            "endTime": "17:00"
        }' \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/weekly - Viernes 10:00-17:00")
    http_code=$(echo "$response" | tail -n1)
    check_response 201 "$http_code" "Establecer disponibilidad Viernes"
    
    # TEST 5: Intentar crear disponibilidad con horario solapado (409)
    response=$(make_request "POST" "/tarotist/scheduling/availability/weekly" \
        '{
            "dayOfWeek": 1,
            "startTime": "10:00",
            "endTime": "12:00"
        }' \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/weekly - Lunes overlap (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 409 "$http_code" "Horario solapado retorna 409"
    
    # TEST 6: Intentar crear disponibilidad con datos inválidos (400)
    response=$(make_request "POST" "/tarotist/scheduling/availability/weekly" \
        '{
            "dayOfWeek": 8,
            "startTime": "25:00",
            "endTime": "26:00"
        }' \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/weekly - Datos inválidos (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Datos inválidos retorna 400"
    
    # TEST 7: Listar disponibilidad semanal (ahora debe tener registros)
    response=$(make_request "GET" "/tarotist/scheduling/availability/weekly" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/availability/weekly - Listar después de crear")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listar disponibilidad con registros"
    
    # TEST 8: Eliminar disponibilidad
    if [ -n "$AVAILABILITY_ID" ]; then
        response=$(make_request "DELETE" "/tarotist/scheduling/availability/weekly/$AVAILABILITY_ID" "" "$TAROTISTA_TOKEN" \
            "DELETE /tarotist/scheduling/availability/weekly/$AVAILABILITY_ID - Eliminar")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Eliminar disponibilidad"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 2: GESTIÓN DE EXCEPCIONES (TAROTISTA)
# ═══════════════════════════════════════════════════════════════════════════

test_exceptions_management() {
    print_header "SECCIÓN 2: GESTIÓN DE EXCEPCIONES (TAROTISTA)"
    
    if [ -z "$TAROTISTA_TOKEN" ]; then
        print_warning "No hay token de tarotista, saltando tests de excepciones"
        return
    fi
    
    # TEST 9: Listar excepciones (vacía inicialmente)
    response=$(make_request "GET" "/tarotist/scheduling/availability/exceptions" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/availability/exceptions - Listar excepciones")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listar excepciones"
    
    # TEST 10: Agregar excepción de día bloqueado
    FUTURE_DATE=$(date -d "+7 days" +%Y-%m-%d 2>/dev/null || date -v+7d +%Y-%m-%d)
    response=$(make_request "POST" "/tarotist/scheduling/availability/exceptions" \
        "{
            \"date\": \"$FUTURE_DATE\",
            \"isBlocked\": true,
            \"reason\": \"Día personal\"
        }" \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/exceptions - Bloquear día")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 201 "$http_code" "Agregar excepción de bloqueo"; then
        EXCEPTION_ID=$(extract_json_field "$body" "id")
        print_info "Excepción creada con ID: $EXCEPTION_ID"
    fi
    
    # TEST 11: Agregar excepción con horario custom
    FUTURE_DATE2=$(date -d "+14 days" +%Y-%m-%d 2>/dev/null || date -v+14d +%Y-%m-%d)
    response=$(make_request "POST" "/tarotist/scheduling/availability/exceptions" \
        "{
            \"date\": \"$FUTURE_DATE2\",
            \"isBlocked\": false,
            \"customStartTime\": \"15:00\",
            \"customEndTime\": \"17:00\",
            \"reason\": \"Horario especial\"
        }" \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/exceptions - Horario custom")
    http_code=$(echo "$response" | tail -n1)
    check_response 201 "$http_code" "Agregar excepción con horario custom"
    
    # TEST 12: Intentar agregar excepción duplicada (409)
    response=$(make_request "POST" "/tarotist/scheduling/availability/exceptions" \
        "{
            \"date\": \"$FUTURE_DATE\",
            \"isBlocked\": true,
            \"reason\": \"Otro motivo\"
        }" \
        "$TAROTISTA_TOKEN" \
        "POST /tarotist/scheduling/availability/exceptions - Fecha duplicada (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 409 "$http_code" "Excepción duplicada retorna 409"
    
    # TEST 13: Listar excepciones (ahora debe tener registros)
    response=$(make_request "GET" "/tarotist/scheduling/availability/exceptions" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/availability/exceptions - Listar después de crear")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listar excepciones con registros"
    
    # TEST 14: Eliminar excepción
    if [ -n "$EXCEPTION_ID" ]; then
        response=$(make_request "DELETE" "/tarotist/scheduling/availability/exceptions/$EXCEPTION_ID" "" "$TAROTISTA_TOKEN" \
            "DELETE /tarotist/scheduling/availability/exceptions/$EXCEPTION_ID - Eliminar")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Eliminar excepción"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 3: CONSULTA DE SLOTS DISPONIBLES (USUARIO)
# ═══════════════════════════════════════════════════════════════════════════

test_available_slots() {
    print_header "SECCIÓN 3: CONSULTA DE SLOTS DISPONIBLES (USUARIO)"
    
    if [ -z "$USER_TOKEN" ]; then
        print_warning "No hay token de usuario, saltando tests de slots disponibles"
        return
    fi
    
    # Calcular fechas para el rango
    START_DATE=$(date -d "+1 days" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
    END_DATE=$(date -d "+8 days" +%Y-%m-%d 2>/dev/null || date -v+8d +%Y-%m-%d)
    
    # TEST 15: Obtener slots disponibles para sesión de 30 min
    response=$(make_request "GET" "/scheduling/available-slots?tarotistaId=$TAROTISTA_ID&startDate=$START_DATE&endDate=$END_DATE&durationMinutes=30" \
        "" "$USER_TOKEN" \
        "GET /scheduling/available-slots - Slots 30min")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Obtener slots disponibles 30min"
    
    # TEST 16: Obtener slots disponibles para sesión de 60 min
    response=$(make_request "GET" "/scheduling/available-slots?tarotistaId=$TAROTISTA_ID&startDate=$START_DATE&endDate=$END_DATE&durationMinutes=60" \
        "" "$USER_TOKEN" \
        "GET /scheduling/available-slots - Slots 60min")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Obtener slots disponibles 60min"
    
    # TEST 17: Obtener slots disponibles para sesión de 90 min
    response=$(make_request "GET" "/scheduling/available-slots?tarotistaId=$TAROTISTA_ID&startDate=$START_DATE&endDate=$END_DATE&durationMinutes=90" \
        "" "$USER_TOKEN" \
        "GET /scheduling/available-slots - Slots 90min")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Obtener slots disponibles 90min"
    
    # TEST 18: Intentar obtener slots con tarotista inexistente
    response=$(make_request "GET" "/scheduling/available-slots?tarotistaId=99999&startDate=$START_DATE&endDate=$END_DATE&durationMinutes=60" \
        "" "$USER_TOKEN" \
        "GET /scheduling/available-slots - Tarotista inexistente")
    http_code=$(echo "$response" | tail -n1)
    # Puede retornar 200 con array vacío o 404
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
        ((TOTAL_TESTS++))
        print_success "Tarotista inexistente manejado (HTTP $http_code)"
        ((PASSED_TESTS++))
    else
        ((TOTAL_TESTS++))
        print_error "Tarotista inexistente no manejado correctamente (HTTP $http_code)"
        ((FAILED_TESTS++))
    fi
    
    # TEST 19: Intentar obtener slots con duración inválida
    response=$(make_request "GET" "/scheduling/available-slots?tarotistaId=$TAROTISTA_ID&startDate=$START_DATE&endDate=$END_DATE&durationMinutes=45" \
        "" "$USER_TOKEN" \
        "GET /scheduling/available-slots - Duración inválida (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Duración inválida retorna 400"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 4: RESERVA DE SESIONES (USUARIO)
# ═══════════════════════════════════════════════════════════════════════════

test_session_booking() {
    print_header "SECCIÓN 4: RESERVA DE SESIONES (USUARIO)"
    
    if [ -z "$USER_TOKEN" ]; then
        print_warning "No hay token de usuario, saltando tests de reserva"
        return
    fi
    
    # Calcular fecha/hora futura (3 días adelante a las 10:00)
    FUTURE_DATETIME=$(date -d "+3 days 10:00" +%Y-%m-%dT10:00:00 2>/dev/null || date -v+3d +%Y-%m-%dT10:00:00)
    
    # TEST 20: Reservar sesión de 60 minutos
    response=$(make_request "POST" "/scheduling/book" \
        "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"scheduledAt\": \"$FUTURE_DATETIME\",
            \"durationMinutes\": 60,
            \"notes\": \"Primera consulta de tarot\"
        }" \
        "$USER_TOKEN" \
        "POST /scheduling/book - Reservar sesión 60min")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 201 "$http_code" "Reservar sesión"; then
        SESSION_ID=$(extract_json_field "$body" "id")
        print_info "Sesión creada con ID: $SESSION_ID"
    fi
    
    # TEST 21: Intentar reservar en horario ya ocupado (409)
    response=$(make_request "POST" "/scheduling/book" \
        "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"scheduledAt\": \"$FUTURE_DATETIME\",
            \"durationMinutes\": 60,
            \"notes\": \"Segunda consulta\"
        }" \
        "$USER_TOKEN" \
        "POST /scheduling/book - Horario ocupado (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 409 "$http_code" "Horario ocupado retorna 409"
    
    # TEST 22: Intentar reservar con menos de 2 horas de anticipación (400)
    NOW_DATETIME=$(date -d "+1 hour" +%Y-%m-%dT%H:%M:00 2>/dev/null || date -v+1H +%Y-%m-%dT%H:%M:00)
    response=$(make_request "POST" "/scheduling/book" \
        "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"scheduledAt\": \"$NOW_DATETIME\",
            \"durationMinutes\": 30,
            \"notes\": \"Última hora\"
        }" \
        "$USER_TOKEN" \
        "POST /scheduling/book - Menos de 2h anticipación (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Anticipación insuficiente retorna 400"
    
    # TEST 23: Intentar reservar con datos inválidos (400)
    response=$(make_request "POST" "/scheduling/book" \
        "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"scheduledAt\": \"invalid-date\",
            \"durationMinutes\": 120
        }" \
        "$USER_TOKEN" \
        "POST /scheduling/book - Datos inválidos (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Datos inválidos retorna 400"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 5: GESTIÓN DE SESIONES (USUARIO)
# ═══════════════════════════════════════════════════════════════════════════

test_user_sessions() {
    print_header "SECCIÓN 5: GESTIÓN DE SESIONES (USUARIO)"
    
    if [ -z "$USER_TOKEN" ]; then
        print_warning "No hay token de usuario, saltando tests de sesiones"
        return
    fi
    
    # TEST 24: Listar mis sesiones
    response=$(make_request "GET" "/scheduling/my-sessions" "" "$USER_TOKEN" \
        "GET /scheduling/my-sessions - Listar todas mis sesiones")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listar sesiones de usuario"
    
    # TEST 25: Listar mis sesiones filtradas por estado (pending)
    response=$(make_request "GET" "/scheduling/my-sessions?status=pending" "" "$USER_TOKEN" \
        "GET /scheduling/my-sessions?status=pending - Filtrar pendientes")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Filtrar sesiones pendientes"
    
    # TEST 26: Listar mis sesiones filtradas por estado (confirmed)
    response=$(make_request "GET" "/scheduling/my-sessions?status=confirmed" "" "$USER_TOKEN" \
        "GET /scheduling/my-sessions?status=confirmed - Filtrar confirmadas")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Filtrar sesiones confirmadas"
    
    # TEST 27: Obtener detalle de sesión específica
    if [ -n "$SESSION_ID" ]; then
        response=$(make_request "GET" "/scheduling/my-sessions/$SESSION_ID" "" "$USER_TOKEN" \
            "GET /scheduling/my-sessions/$SESSION_ID - Detalle de sesión")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Obtener detalle de sesión"
    fi
    
    # TEST 28: Obtener sesión inexistente (404)
    response=$(make_request "GET" "/scheduling/my-sessions/99999" "" "$USER_TOKEN" \
        "GET /scheduling/my-sessions/99999 - Sesión inexistente (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 404 "$http_code" "Sesión inexistente retorna 404"
    
    # TEST 29: Cancelar sesión
    if [ -n "$SESSION_ID" ]; then
        response=$(make_request "POST" "/scheduling/my-sessions/$SESSION_ID/cancel" \
            "{
                \"reason\": \"No podré asistir\"
            }" \
            "$USER_TOKEN" \
            "POST /scheduling/my-sessions/$SESSION_ID/cancel - Cancelar sesión")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Cancelar sesión de usuario"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 6: GESTIÓN DE SESIONES (TAROTISTA)
# ═══════════════════════════════════════════════════════════════════════════

test_tarotist_sessions() {
    print_header "SECCIÓN 6: GESTIÓN DE SESIONES (TAROTISTA)"
    
    if [ -z "$TAROTISTA_TOKEN" ]; then
        print_warning "No hay token de tarotista, saltando tests de sesiones tarotista"
        return
    fi
    
    # TEST 30: Listar sesiones del tarotista
    response=$(make_request "GET" "/tarotist/scheduling/sessions" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/sessions - Listar sesiones")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Listar sesiones de tarotista"
    
    # TEST 31: Filtrar sesiones por estado
    response=$(make_request "GET" "/tarotist/scheduling/sessions?status=pending" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/sessions?status=pending - Filtrar pendientes")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Filtrar sesiones por estado"
    
    # TEST 32: Filtrar sesiones por fecha
    TODAY=$(date +%Y-%m-%d)
    response=$(make_request "GET" "/tarotist/scheduling/sessions?date=$TODAY" "" "$TAROTISTA_TOKEN" \
        "GET /tarotist/scheduling/sessions?date=$TODAY - Filtrar por fecha")
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Filtrar sesiones por fecha"
    
    # Crear una nueva sesión para los tests de confirmación/completar
    FUTURE_DATETIME2=$(date -d "+5 days 14:00" +%Y-%m-%dT14:00:00 2>/dev/null || date -v+5d +%Y-%m-%dT14:00:00)
    book_response=$(curl -s -X POST "${BASE_URL}/scheduling/book" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"scheduledAt\": \"$FUTURE_DATETIME2\",
            \"durationMinutes\": 60,
            \"notes\": \"Test session for tarotist\"
        }")
    
    TEST_SESSION_ID=$(extract_json_field "$book_response" "id")
    
    # TEST 33: Confirmar sesión pendiente
    if [ -n "$TEST_SESSION_ID" ]; then
        response=$(make_request "POST" "/tarotist/scheduling/sessions/$TEST_SESSION_ID/confirm" \
            "{
                \"confirmationNotes\": \"Sesión confirmada\"
            }" \
            "$TAROTISTA_TOKEN" \
            "POST /tarotist/scheduling/sessions/$TEST_SESSION_ID/confirm - Confirmar sesión")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Confirmar sesión pendiente"
    fi
    
    # TEST 34: Completar sesión confirmada
    if [ -n "$TEST_SESSION_ID" ]; then
        response=$(make_request "POST" "/tarotist/scheduling/sessions/$TEST_SESSION_ID/complete" \
            "{
                \"completionNotes\": \"Sesión realizada con éxito\"
            }" \
            "$TAROTISTA_TOKEN" \
            "POST /tarotist/scheduling/sessions/$TEST_SESSION_ID/complete - Completar sesión")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Completar sesión confirmada"
    fi
    
    # Crear otra sesión para test de cancelación
    FUTURE_DATETIME3=$(date -d "+6 days 15:00" +%Y-%m-%dT15:00:00 2>/dev/null || date -v+6d +%Y-%m-%dT15:00:00)
    book_response2=$(curl -s -X POST "${BASE_URL}/scheduling/book" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $USER_TOKEN" \
        -d "{
            \"tarotistaId\": $TAROTISTA_ID,
            \"scheduledAt\": \"$FUTURE_DATETIME3\",
            \"durationMinutes\": 30,
            \"notes\": \"Test cancel session\"
        }")
    
    CANCEL_SESSION_ID=$(extract_json_field "$book_response2" "id")
    
    # TEST 35: Cancelar sesión (por tarotista)
    if [ -n "$CANCEL_SESSION_ID" ]; then
        response=$(make_request "POST" "/tarotist/scheduling/sessions/$CANCEL_SESSION_ID/cancel" \
            "{
                \"reason\": \"Emergencia personal\"
            }" \
            "$TAROTISTA_TOKEN" \
            "POST /tarotist/scheduling/sessions/$CANCEL_SESSION_ID/cancel - Cancelar por tarotista")
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Cancelar sesión por tarotista"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 7: SEGURIDAD Y AUTORIZACIÓN
# ═══════════════════════════════════════════════════════════════════════════

test_security() {
    print_header "SECCIÓN 7: SEGURIDAD Y AUTORIZACIÓN"
    
    # TEST 36: Acceso a endpoint de tarotista sin token (401)
    response=$(make_request "GET" "/tarotist/scheduling/availability/weekly" "" "" \
        "GET /tarotist/scheduling/availability/weekly - Sin token (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Endpoint tarotista sin token retorna 401"
    
    # TEST 37: Acceso a endpoint de usuario sin token (401)
    response=$(make_request "GET" "/scheduling/my-sessions" "" "" \
        "GET /scheduling/my-sessions - Sin token (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Endpoint usuario sin token retorna 401"
    
    # TEST 38: Usuario regular intentando acceder a endpoint de tarotista (403)
    if [ -n "$USER_TOKEN" ]; then
        response=$(make_request "GET" "/tarotist/scheduling/availability/weekly" "" "$USER_TOKEN" \
            "GET /tarotist/scheduling/availability/weekly - Con token usuario (debe fallar)")
        http_code=$(echo "$response" | tail -n1)
        check_response 403 "$http_code" "Usuario regular en endpoint tarotista retorna 403"
    fi
    
    # TEST 39: Token inválido/malformado (401)
    response=$(make_request "GET" "/scheduling/my-sessions" "" "invalid.token.format" \
        "GET /scheduling/my-sessions - Token inválido (debe fallar)")
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Token inválido retorna 401"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 8: CASOS EDGE Y VALIDACIONES
# ═══════════════════════════════════════════════════════════════════════════

test_edge_cases() {
    print_header "SECCIÓN 8: CASOS EDGE Y VALIDACIONES"
    
    # TEST 40: Crear disponibilidad con hora de fin antes que hora de inicio (400)
    if [ -n "$TAROTISTA_TOKEN" ]; then
        response=$(make_request "POST" "/tarotist/scheduling/availability/weekly" \
            '{
                "dayOfWeek": 2,
                "startTime": "18:00",
                "endTime": "09:00"
            }' \
            "$TAROTISTA_TOKEN" \
            "POST /tarotist/scheduling/availability/weekly - Fin antes de inicio (debe fallar)")
        http_code=$(echo "$response" | tail -n1)
        check_response 400 "$http_code" "Hora fin < hora inicio retorna 400"
    fi
    
    # TEST 41: Crear excepción para fecha pasada (400)
    if [ -n "$TAROTISTA_TOKEN" ]; then
        PAST_DATE=$(date -d "-1 days" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)
        response=$(make_request "POST" "/tarotist/scheduling/availability/exceptions" \
            "{
                \"date\": \"$PAST_DATE\",
                \"isBlocked\": true,
                \"reason\": \"Fecha pasada\"
            }" \
            "$TAROTISTA_TOKEN" \
            "POST /tarotist/scheduling/availability/exceptions - Fecha pasada (debe fallar)")
        http_code=$(echo "$response" | tail -n1)
        check_response 400 "$http_code" "Fecha pasada retorna 400"
    fi
    
    # TEST 42: Reservar sin especificar tarotista (400)
    if [ -n "$USER_TOKEN" ]; then
        FUTURE_DT=$(date -d "+4 days 11:00" +%Y-%m-%dT11:00:00 2>/dev/null || date -v+4d +%Y-%m-%dT11:00:00)
        response=$(make_request "POST" "/scheduling/book" \
            "{
                \"scheduledAt\": \"$FUTURE_DT\",
                \"durationMinutes\": 60
            }" \
            "$USER_TOKEN" \
            "POST /scheduling/book - Sin tarotista (debe fallar)")
        http_code=$(echo "$response" | tail -n1)
        check_response 400 "$http_code" "Sin tarotista retorna 400"
    fi
    
    # TEST 43: Consultar slots con rango de fechas invertido (400)
    if [ -n "$USER_TOKEN" ]; then
        START=$(date -d "+8 days" +%Y-%m-%d 2>/dev/null || date -v+8d +%Y-%m-%d)
        END=$(date -d "+1 days" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
        response=$(make_request "GET" "/scheduling/available-slots?tarotistaId=$TAROTISTA_ID&startDate=$START&endDate=$END&durationMinutes=60" \
            "" "$USER_TOKEN" \
            "GET /scheduling/available-slots - Fechas invertidas (debe fallar)")
        http_code=$(echo "$response" | tail -n1)
        check_response 400 "$http_code" "Rango invertido retorna 400"
    fi
    
    # TEST 44: Cancelar sesión sin motivo (puede ser opcional)
    if [ -n "$USER_TOKEN" ] && [ -n "$SESSION_ID" ]; then
        response=$(make_request "POST" "/scheduling/my-sessions/$SESSION_ID/cancel" \
            '{}' \
            "$USER_TOKEN" \
            "POST /scheduling/my-sessions/$SESSION_ID/cancel - Sin motivo")
        http_code=$(echo "$response" | tail -n1)
        # Puede ser 200 si es opcional o 400 si es requerido
        if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 400 ]; then
            ((TOTAL_TESTS++))
            print_success "Cancelación sin motivo manejada (HTTP $http_code)"
            ((PASSED_TESTS++))
        else
            ((TOTAL_TESTS++))
            print_error "Cancelación sin motivo no manejada (HTTP $http_code)"
            ((FAILED_TESTS++))
        fi
    fi
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
    
    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    echo -e "${CYAN}Tasa de éxito: ${success_rate}%${NC}\n"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ ¡TODOS LOS TESTS PASARON EXITOSAMENTE!                                 ║${NC}"
        echo -e "${GREEN}║                                                                            ║${NC}"
        echo -e "${GREEN}║  Módulo Scheduling completamente funcional con arquitectura layered       ║${NC}"
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
    print_header "INICIANDO TESTS DEL MÓDULO SCHEDULING"
    print_info "Base URL: $BASE_URL"
    print_info "Asegúrate de que el servidor esté corriendo en otra terminal"
    echo ""
    read -p "Presiona ENTER para continuar o Ctrl+C para cancelar..."
    
    # Setup
    setup_auth
    
    # Ejecutar todas las secciones de tests
    test_availability_management
    test_exceptions_management
    test_available_slots
    test_session_booking
    test_user_sessions
    test_tarotist_sessions
    test_security
    test_edge_cases
    
    # Mostrar resumen
    print_summary
}

# Ejecutar script
main
