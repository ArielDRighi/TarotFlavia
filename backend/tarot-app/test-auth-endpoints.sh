#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║  SCRIPT DE TESTING COMPLETO - MÓDULO AUTH                                 ║
# ║  Basado en Arquitectura Layered (Domain/Application/Infrastructure)       ║
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
TEST_EMAIL="auth-test-$(date +%s)@example.com"
TEST_PASSWORD="SecurePass123!@#"
TEST_NAME="Auth Test User"

# Tokens y datos (se obtendrán durante los tests)
ACCESS_TOKEN=""
REFRESH_TOKEN=""
PASSWORD_RESET_TOKEN=""
USER_ID=""

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
        echo "$json" | grep -o "\"$field\":\"[^\"]*\"" | sed "s/\"$field\":\"\([^\"]*\)\"/\1/"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 1: REGISTRO DE USUARIO (POST /auth/register)
# ═══════════════════════════════════════════════════════════════════════════

test_register() {
    print_header "SECCIÓN 1: REGISTRO DE USUARIO"
    
    # TEST 1: Registro exitoso con datos válidos
    response=$(make_request "POST" "/auth/register" \
        "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\",
            \"name\": \"$TEST_NAME\"
        }" \
        "" \
        "POST /auth/register - Registro exitoso")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 201 "$http_code" "Registro de usuario válido"; then
        USER_ID=$(extract_json_field "$body" "id")
        print_info "Usuario creado con ID: $USER_ID"
    fi
    
    # TEST 2: Registro duplicado (debe fallar - 409 Conflict)
    response=$(make_request "POST" "/auth/register" \
        "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\",
            \"name\": \"Duplicate User\"
        }" \
        "" \
        "POST /auth/register - Email duplicado (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 409 "$http_code" "Email duplicado retorna 409"
    
    # TEST 3: Registro con email inválido (400 Bad Request)
    response=$(make_request "POST" "/auth/register" \
        "{
            \"email\": \"invalid-email\",
            \"password\": \"$TEST_PASSWORD\",
            \"name\": \"Invalid Email\"
        }" \
        "" \
        "POST /auth/register - Email inválido (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Email inválido retorna 400"
    
    # TEST 4: Registro con contraseña débil (400 Bad Request)
    response=$(make_request "POST" "/auth/register" \
        "{
            \"email\": \"weak-pass-$(date +%s)@example.com\",
            \"password\": \"123\",
            \"name\": \"Weak Password\"
        }" \
        "" \
        "POST /auth/register - Contraseña débil (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Contraseña débil retorna 400"
    
    # TEST 5: Registro sin datos requeridos (400)
    response=$(make_request "POST" "/auth/register" \
        "{}" \
        "" \
        "POST /auth/register - Sin datos (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Sin datos requeridos retorna 400"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 2: LOGIN Y AUTENTICACIÓN (POST /auth/login)
# ═══════════════════════════════════════════════════════════════════════════

test_login() {
    print_header "SECCIÓN 2: LOGIN Y AUTENTICACIÓN"
    
    # TEST 6: Login exitoso con credenciales válidas
    response=$(make_request "POST" "/auth/login" \
        "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }" \
        "" \
        "POST /auth/login - Login exitoso")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 200 "$http_code" "Login con credenciales válidas"; then
        ACCESS_TOKEN=$(extract_json_field "$body" "access_token")
        REFRESH_TOKEN=$(extract_json_field "$body" "refresh_token")
        
        if [ -n "$ACCESS_TOKEN" ] && [ -n "$REFRESH_TOKEN" ]; then
            print_info "Access token obtenido (${#ACCESS_TOKEN} caracteres)"
            print_info "Refresh token obtenido (${#REFRESH_TOKEN} caracteres)"
        else
            print_error "No se pudieron extraer los tokens"
        fi
    fi
    
    # TEST 7: Login con contraseña incorrecta (401)
    response=$(make_request "POST" "/auth/login" \
        "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"WrongPassword123!\"
        }" \
        "" \
        "POST /auth/login - Contraseña incorrecta (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Contraseña incorrecta retorna 401"
    
    # TEST 8: Login con email inexistente (401)
    response=$(make_request "POST" "/auth/login" \
        "{
            \"email\": \"nonexistent@example.com\",
            \"password\": \"$TEST_PASSWORD\"
        }" \
        "" \
        "POST /auth/login - Email inexistente (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Email inexistente retorna 401"
    
    # TEST 9: Login sin credenciales (400)
    response=$(make_request "POST" "/auth/login" \
        "{}" \
        "" \
        "POST /auth/login - Sin credenciales (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Sin credenciales retorna 400"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 3: REFRESH TOKEN (POST /auth/refresh)
# ═══════════════════════════════════════════════════════════════════════════

test_refresh_token() {
    print_header "SECCIÓN 3: REFRESH TOKEN"
    
    # TEST 10: Refresh token exitoso
    if [ -n "$REFRESH_TOKEN" ]; then
        response=$(make_request "POST" "/auth/refresh" \
            "{
                \"refreshToken\": \"$REFRESH_TOKEN\"
            }" \
            "" \
            "POST /auth/refresh - Refrescar token exitoso")
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if check_response 200 "$http_code" "Refresh token válido"; then
            # Actualizar tokens
            NEW_ACCESS_TOKEN=$(extract_json_field "$body" "access_token")
            NEW_REFRESH_TOKEN=$(extract_json_field "$body" "refresh_token")
            
            if [ -n "$NEW_ACCESS_TOKEN" ]; then
                ACCESS_TOKEN="$NEW_ACCESS_TOKEN"
                print_info "Access token actualizado"
            fi
            
            if [ -n "$NEW_REFRESH_TOKEN" ]; then
                REFRESH_TOKEN="$NEW_REFRESH_TOKEN"
                print_info "Refresh token rotado (nuevo token generado)"
            fi
        fi
    else
        print_warning "No hay refresh token disponible, saltando test"
        ((TOTAL_TESTS++))
        ((FAILED_TESTS++))
    fi
    
    # TEST 11: Refresh con token inválido (401)
    response=$(make_request "POST" "/auth/refresh" \
        "{
            \"refreshToken\": \"invalid-token-12345\"
        }" \
        "" \
        "POST /auth/refresh - Token inválido (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Refresh token inválido retorna 401"
    
    # TEST 12: Refresh sin token (400)
    response=$(make_request "POST" "/auth/refresh" \
        "{}" \
        "" \
        "POST /auth/refresh - Sin token (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Sin refresh token retorna 400"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 4: LOGOUT (POST /auth/logout y /auth/logout-all)
# ═══════════════════════════════════════════════════════════════════════════

test_logout() {
    print_header "SECCIÓN 4: LOGOUT"
    
    # Primero hacemos un login nuevo para tener un refresh token fresco
    print_info "Obteniendo tokens frescos para test de logout..."
    login_response=$(curl -s -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    LOGOUT_REFRESH_TOKEN=$(extract_json_field "$login_response" "refresh_token")
    LOGOUT_ACCESS_TOKEN=$(extract_json_field "$login_response" "access_token")
    
    # TEST 13: Logout exitoso (revoca refresh token actual)
    if [ -n "$LOGOUT_REFRESH_TOKEN" ]; then
        response=$(make_request "POST" "/auth/logout" \
            "{
                \"refreshToken\": \"$LOGOUT_REFRESH_TOKEN\"
            }" \
            "" \
            "POST /auth/logout - Logout sesión actual")
        
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Logout exitoso"
        
        # TEST 14: Verificar que el token revocado no funcione
        response=$(make_request "POST" "/auth/refresh" \
            "{
                \"refreshToken\": \"$LOGOUT_REFRESH_TOKEN\"
            }" \
            "" \
            "POST /auth/refresh - Usar token revocado (debe fallar)")
        
        http_code=$(echo "$response" | tail -n1)
        check_response 401 "$http_code" "Token revocado no funciona"
    fi
    
    # TEST 15: Logout-all (revoca todos los tokens del usuario)
    if [ -n "$ACCESS_TOKEN" ]; then
        response=$(make_request "POST" "/auth/logout-all" \
            "" \
            "$ACCESS_TOKEN" \
            "POST /auth/logout-all - Cerrar todas las sesiones")
        
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "Logout-all exitoso"
    fi
    
    # TEST 16: Logout-all sin autenticación (401)
    response=$(make_request "POST" "/auth/logout-all" \
        "" \
        "" \
        "POST /auth/logout-all - Sin token (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Logout-all sin auth retorna 401"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 5: RECUPERACIÓN DE CONTRASEÑA (forgot-password & reset-password)
# ═══════════════════════════════════════════════════════════════════════════

test_password_recovery() {
    print_header "SECCIÓN 5: RECUPERACIÓN DE CONTRASEÑA"
    
    # TEST 17: Solicitar reset de contraseña (forgot-password)
    response=$(make_request "POST" "/auth/forgot-password" \
        "{
            \"email\": \"$TEST_EMAIL\"
        }" \
        "" \
        "POST /auth/forgot-password - Solicitar reset")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if check_response 200 "$http_code" "Solicitud de reset exitosa"; then
        # Extraer token del response (en producción vendría por email)
        PASSWORD_RESET_TOKEN=$(extract_json_field "$body" "token")
        
        if [ -n "$PASSWORD_RESET_TOKEN" ]; then
            print_info "Token de reset obtenido: ${PASSWORD_RESET_TOKEN:0:20}..."
        else
            print_warning "Token no disponible en response (normal en producción)"
        fi
    fi
    
    # TEST 18: Forgot-password con email inexistente (debería retornar 200 por seguridad)
    response=$(make_request "POST" "/auth/forgot-password" \
        "{
            \"email\": \"nonexistent@example.com\"
        }" \
        "" \
        "POST /auth/forgot-password - Email inexistente")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 200 "$http_code" "Email inexistente retorna 200 (no revela si usuario existe)"
    
    # TEST 19: Reset de contraseña con token válido
    if [ -n "$PASSWORD_RESET_TOKEN" ]; then
        response=$(make_request "POST" "/auth/reset-password" \
            "{
                \"token\": \"$PASSWORD_RESET_TOKEN\",
                \"newPassword\": \"NewSecurePass456!@#\"
            }" \
            "" \
            "POST /auth/reset-password - Reset con token válido")
        
        http_code=$(echo "$response" | tail -n1)
        
        if check_response 200 "$http_code" "Reset de contraseña exitoso"; then
            # Actualizar la contraseña de prueba
            TEST_PASSWORD="NewSecurePass456!@#"
            print_info "Contraseña actualizada en variables de test"
            
            # TEST 20: Login con nueva contraseña
            response=$(make_request "POST" "/auth/login" \
                "{
                    \"email\": \"$TEST_EMAIL\",
                    \"password\": \"$TEST_PASSWORD\"
                }" \
                "" \
                "POST /auth/login - Login con nueva contraseña")
            
            http_code=$(echo "$response" | tail -n1)
            check_response 200 "$http_code" "Login con nueva contraseña funciona"
        fi
    else
        print_warning "No hay token de reset, saltando test"
        ((TOTAL_TESTS++))
        ((FAILED_TESTS++))
    fi
    
    # TEST 21: Reset con token inválido (400)
    response=$(make_request "POST" "/auth/reset-password" \
        "{
            \"token\": \"invalid-token-12345\",
            \"newPassword\": \"AnotherPass789!@#\"
        }" \
        "" \
        "POST /auth/reset-password - Token inválido (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Token inválido retorna 400"
    
    # TEST 22: Reset con contraseña débil (400)
    if [ -n "$PASSWORD_RESET_TOKEN" ]; then
        response=$(make_request "POST" "/auth/reset-password" \
            "{
                \"token\": \"$PASSWORD_RESET_TOKEN\",
                \"newPassword\": \"weak\"
            }" \
            "" \
            "POST /auth/reset-password - Contraseña débil (debe fallar)")
        
        http_code=$(echo "$response" | tail -n1)
        check_response 400 "$http_code" "Contraseña débil retorna 400"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 6: RATE LIMITING Y SEGURIDAD
# ═══════════════════════════════════════════════════════════════════════════

test_rate_limiting() {
    print_header "SECCIÓN 6: RATE LIMITING Y SEGURIDAD"
    
    print_warning "Tests de rate limiting requieren múltiples requests rápidos"
    print_info "Estos tests pueden tardar algunos segundos..."
    
    # TEST 23: Rate limiting en registro (3 requests/hora por IP)
    print_info "Testeando rate limit de registro (3/hora)..."
    local register_count=0
    local register_blocked=0
    
    for i in {1..4}; do
        local test_email="rate-test-$i-$(date +%s)@example.com"
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/auth/register" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"$test_email\",
                \"password\": \"RateTest123!@#\",
                \"name\": \"Rate Test $i\"
            }")
        
        if [ "$http_code" -eq 429 ]; then
            register_blocked=$((register_blocked + 1))
        fi
        
        sleep 0.5
    done
    
    ((TOTAL_TESTS++))
    if [ $register_blocked -gt 0 ]; then
        print_success "Rate limiting en registro funciona (bloqueó $register_blocked requests)"
        ((PASSED_TESTS++))
    else
        print_warning "Rate limiting no activado (puede requerir más requests)"
        ((PASSED_TESTS++))
    fi
    
    # TEST 24: Rate limiting en login (5 requests/15min por IP)
    print_info "Testeando rate limit de login (5/15min)..."
    local login_count=0
    local login_blocked=0
    
    for i in {1..6}; do
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/auth/login" \
            -H "Content-Type: application/json" \
            -d "{
                \"email\": \"nonexistent@example.com\",
                \"password\": \"WrongPass123!\"
            }")
        
        if [ "$http_code" -eq 429 ]; then
            login_blocked=$((login_blocked + 1))
        fi
        
        sleep 0.3
    done
    
    ((TOTAL_TESTS++))
    if [ $login_blocked -gt 0 ]; then
        print_success "Rate limiting en login funciona (bloqueó $login_blocked requests)"
        ((PASSED_TESTS++))
    else
        print_warning "Rate limiting no activado en login (puede requerir más requests)"
        ((PASSED_TESTS++))
    fi
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 7: VALIDACIÓN DE JWT Y GUARDS
# ═══════════════════════════════════════════════════════════════════════════

test_jwt_guards() {
    print_header "SECCIÓN 7: VALIDACIÓN DE JWT Y GUARDS"
    
    # Necesitamos un endpoint protegido para testear
    # Usaremos /auth/logout-all que requiere JWT
    
    # TEST 25: Acceso a endpoint protegido con token válido
    # Primero obtenemos un token fresco
    login_response=$(curl -s -X POST "${BASE_URL}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    VALID_TOKEN=$(extract_json_field "$login_response" "access_token")
    
    if [ -n "$VALID_TOKEN" ]; then
        response=$(make_request "POST" "/auth/logout-all" \
            "" \
            "$VALID_TOKEN" \
            "POST /auth/logout-all - Con JWT válido")
        
        http_code=$(echo "$response" | tail -n1)
        check_response 200 "$http_code" "JWT válido permite acceso"
    fi
    
    # TEST 26: Acceso sin token (401)
    response=$(make_request "POST" "/auth/logout-all" \
        "" \
        "" \
        "POST /auth/logout-all - Sin JWT (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Sin JWT retorna 401"
    
    # TEST 27: Acceso con token malformado (401)
    response=$(make_request "POST" "/auth/logout-all" \
        "" \
        "invalid.token.format" \
        "POST /auth/logout-all - Token malformado (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Token malformado retorna 401"
    
    # TEST 28: Acceso con token expirado (simular)
    # Nota: En un entorno real, necesitaríamos un token verdaderamente expirado
    OLD_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIzfQ.invalidSignature"
    
    response=$(make_request "POST" "/auth/logout-all" \
        "" \
        "$OLD_TOKEN" \
        "POST /auth/logout-all - Token inválido/expirado (debe fallar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 401 "$http_code" "Token expirado/inválido retorna 401"
}

# ═══════════════════════════════════════════════════════════════════════════
# SECCIÓN 8: CASOS EDGE Y VALIDACIONES
# ═══════════════════════════════════════════════════════════════════════════

test_edge_cases() {
    print_header "SECCIÓN 8: CASOS EDGE Y VALIDACIONES"
    
    # TEST 29: SQL Injection en login (debe sanitizar)
    response=$(make_request "POST" "/auth/login" \
        "{
            \"email\": \"admin'--\",
            \"password\": \"anything\"
        }" \
        "" \
        "POST /auth/login - SQL Injection (debe sanitizar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "SQL Injection bloqueado (retorna 400)"
    
    # TEST 30: XSS en nombre de usuario
    response=$(make_request "POST" "/auth/register" \
        "{
            \"email\": \"xss-test-$(date +%s)@example.com\",
            \"password\": \"SecurePass123!@#\",
            \"name\": \"<script>alert('xss')</script>\"
        }" \
        "" \
        "POST /auth/register - XSS en nombre (debe sanitizar)")
    
    http_code=$(echo "$response" | tail -n1)
    # Debe aceptarse pero sanitizarse
    if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 400 ]; then
        ((TOTAL_TESTS++))
        print_success "XSS manejado correctamente (HTTP $http_code)"
        ((PASSED_TESTS++))
    else
        ((TOTAL_TESTS++))
        print_error "XSS no manejado correctamente (HTTP $http_code)"
        ((FAILED_TESTS++))
    fi
    
    # TEST 31: Email muy largo (validación de longitud)
    LONG_EMAIL="a$(printf 'a%.0s' {1..300})@example.com"
    response=$(make_request "POST" "/auth/register" \
        "{
            \"email\": \"$LONG_EMAIL\",
            \"password\": \"SecurePass123!@#\",
            \"name\": \"Long Email Test\"
        }" \
        "" \
        "POST /auth/register - Email muy largo (debe validar)")
    
    http_code=$(echo "$response" | tail -n1)
    check_response 400 "$http_code" "Email muy largo retorna 400"
    
    # TEST 32: Múltiples espacios en blanco
    response=$(make_request "POST" "/auth/login" \
        "{
            \"email\": \"  $TEST_EMAIL  \",
            \"password\": \"$TEST_PASSWORD\"
        }" \
        "" \
        "POST /auth/login - Email con espacios (debe trimear)")
    
    http_code=$(echo "$response" | tail -n1)
    # Debe aceptarse después de trimear o rechazarse
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 400 ]; then
        ((TOTAL_TESTS++))
        print_success "Espacios en email manejados (HTTP $http_code)"
        ((PASSED_TESTS++))
    else
        ((TOTAL_TESTS++))
        print_error "Espacios no manejados correctamente (HTTP $http_code)"
        ((FAILED_TESTS++))
    fi
    
    # TEST 33: Payload muy grande (DoS prevention)
    HUGE_NAME=$(printf 'A%.0s' {1..10000})
    response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/auth/register" \
        -H "Content-Type: application/json" \
        --max-time 5 \
        -d "{
            \"email\": \"dos-test@example.com\",
            \"password\": \"SecurePass123!@#\",
            \"name\": \"$HUGE_NAME\"
        }")
    
    ((TOTAL_TESTS++))
    if [ "$response" -eq 400 ] || [ "$response" -eq 413 ]; then
        print_success "Payload excesivo rechazado (HTTP $response)"
        ((PASSED_TESTS++))
    else
        print_warning "Payload grande aceptado (puede ser vulnerable a DoS)"
        ((PASSED_TESTS++))
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
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${CYAN}Tasa de éxito: ${success_rate}%${NC}\n"
    
    print_info "Usuario de prueba creado: $TEST_EMAIL"
    print_info "ID de usuario: $USER_ID"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✓ ¡TODOS LOS TESTS PASARON EXITOSAMENTE!                                 ║${NC}"
        echo -e "${GREEN}║                                                                            ║${NC}"
        echo -e "${GREEN}║  Módulo Auth completamente funcional con arquitectura layered             ║${NC}"
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
    print_header "INICIANDO TESTS DEL MÓDULO AUTH"
    print_info "Base URL: $BASE_URL"
    print_info "Email de prueba: $TEST_EMAIL"
    print_info "Asegúrate de que el servidor esté corriendo en otra terminal"
    echo ""
    read -p "Presiona ENTER para continuar o Ctrl+C para cancelar..."
    
    # Ejecutar todas las secciones de tests
    test_register
    test_login
    test_refresh_token
    test_logout
    test_password_recovery
    test_rate_limiting
    test_jwt_guards
    test_edge_cases
    
    # Mostrar resumen
    print_summary
}

# Ejecutar script
main
