#!/bin/bash

# =====================================================
# TASK-062: Daily Reading (Carta del Día) - Test Script
# =====================================================
# Descripción: Tests de endpoints de lectura diaria
# Endpoints: POST /daily-reading, GET /daily-reading/today,
#            GET /daily-reading/history, POST /daily-reading/regenerate
# =====================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
FREE_EMAIL="free@test.com"
FREE_PASSWORD="Test123456!"
PREMIUM_EMAIL="premium@test.com"
PREMIUM_PASSWORD="Test123456!"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Contadores
TOTAL=0
PASSED=0
FAILED=0

echo -e "${CYAN}========================================"
echo "TASK-062: DAILY READING API TESTS"
echo "========================================${NC}"
echo "Base URL: $BASE_URL"
echo ""

# -----------------------------
# Funciones auxiliares
# -----------------------------
print_test() {
    ((TOTAL++))
    echo -e "${BLUE}▶ TEST #$TOTAL: $1${NC}"
}

print_success() {
    ((PASSED++))
    echo -e "${GREEN}✓ PASS: $1${NC}\n"
}

print_error() {
    ((FAILED++))
    echo -e "${RED}✗ FAIL: $1${NC}\n"
}

# -----------------------------
# Setup: Autenticación
# -----------------------------
echo -e "${CYAN}========================================"
echo "SETUP: Obteniendo tokens"
echo "========================================${NC}"

# Login FREE user
echo "Autenticando usuario FREE..."
FREE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$FREE_EMAIL\", \"password\": \"$FREE_PASSWORD\"}")

FREE_TOKEN=$(echo $FREE_RESPONSE | grep -oP '"access_token"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

if [ -z "$FREE_TOKEN" ]; then
  echo -e "${YELLOW}⚠ No se pudo obtener token FREE - creando usuario...${NC}"
  # Intentar crear usuario
  curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$FREE_EMAIL\", \"password\": \"$FREE_PASSWORD\", \"name\": \"Free User\"}" > /dev/null
  
  FREE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$FREE_EMAIL\", \"password\": \"$FREE_PASSWORD\"}")
  FREE_TOKEN=$(echo $FREE_RESPONSE | grep -oP '"access_token"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")
fi

if [ -n "$FREE_TOKEN" ]; then
  echo -e "${GREEN}✓ Token FREE obtenido${NC}"
else
  echo -e "${RED}✗ Error obteniendo token FREE${NC}"
fi

# Login PREMIUM user  
echo "Autenticando usuario PREMIUM..."
PREMIUM_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$PREMIUM_EMAIL\", \"password\": \"$PREMIUM_PASSWORD\"}")

PREMIUM_TOKEN=$(echo $PREMIUM_RESPONSE | grep -oP '"access_token"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

if [ -n "$PREMIUM_TOKEN" ]; then
  echo -e "${GREEN}✓ Token PREMIUM obtenido${NC}"
else
  echo -e "${YELLOW}⚠ Token PREMIUM no disponible - algunos tests se saltarán${NC}"
fi
echo ""

# -----------------------------
# Test 1: GET /daily-reading/today sin auth
# -----------------------------
print_test "GET /daily-reading/today (sin autenticación)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/daily-reading/today")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" == "401" ]; then
  print_success "Requiere autenticación (HTTP 401)"
else
  print_error "Esperado 401, recibido $HTTP_CODE"
fi

# -----------------------------
# Test 2: GET /daily-reading/today con auth
# -----------------------------
print_test "GET /daily-reading/today (usuario autenticado)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/daily-reading/today" \
  -H "Authorization: Bearer $FREE_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  print_success "Carta del día obtenida (HTTP 200)"
  # Verificar si hay carta o null
  if echo "$BODY" | grep -q '"card"'; then
    echo -e "${CYAN}   ℹ Carta del día ya existe para hoy${NC}"
  else
    echo -e "${CYAN}   ℹ No hay carta del día aún${NC}"
  fi
elif [ "$HTTP_CODE" == "404" ]; then
  print_success "No hay carta del día aún (HTTP 404 esperado)"
else
  print_error "Respuesta inesperada: $HTTP_CODE"
fi

# -----------------------------
# Test 3: POST /daily-reading (generar carta)
# -----------------------------
print_test "POST /daily-reading (generar carta del día)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/daily-reading" \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "201" ]; then
  print_success "Carta generada exitosamente (HTTP 201)"
  CARD_NAME=$(echo "$BODY" | grep -oP '"name"\s*:\s*"\K[^"]+' | head -1)
  echo -e "${CYAN}   ℹ Carta: $CARD_NAME${NC}"
elif [ "$HTTP_CODE" == "409" ]; then
  print_success "Carta ya existe para hoy (HTTP 409 - esperado)"
  echo -e "${CYAN}   ℹ Ya generaste tu carta del día${NC}"
elif [ "$HTTP_CODE" == "429" ]; then
  print_success "Rate limit alcanzado (HTTP 429)"
else
  print_error "Respuesta inesperada: $HTTP_CODE"
  echo "   Body: $BODY"
fi

# -----------------------------
# Test 4: POST /daily-reading (segunda vez - debe fallar)
# -----------------------------
print_test "POST /daily-reading (segunda vez mismo día)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/daily-reading" \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" == "409" ]; then
  print_success "Rechazado correctamente (HTTP 409 Conflict)"
elif [ "$HTTP_CODE" == "429" ]; then
  print_success "Rate limit (HTTP 429)"
else
  print_error "Esperado 409, recibido $HTTP_CODE"
fi

# -----------------------------
# Test 5: GET /daily-reading/history
# -----------------------------
print_test "GET /daily-reading/history (historial)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/daily-reading/history?page=1&limit=10" \
  -H "Authorization: Bearer $FREE_TOKEN")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  print_success "Historial obtenido (HTTP 200)"
  # Intentar obtener total
  TOTAL_ITEMS=$(echo "$BODY" | grep -oP '"total"\s*:\s*\K[0-9]+' || echo "?")
  echo -e "${CYAN}   ℹ Total en historial: $TOTAL_ITEMS${NC}"
else
  print_error "Esperado 200, recibido $HTTP_CODE"
fi

# -----------------------------
# Test 6: GET /daily-reading/history sin auth
# -----------------------------
print_test "GET /daily-reading/history (sin autenticación)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/daily-reading/history")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" == "401" ]; then
  print_success "Requiere autenticación (HTTP 401)"
else
  print_error "Esperado 401, recibido $HTTP_CODE"
fi

# -----------------------------
# Test 7: POST /daily-reading/regenerate (FREE - debe fallar)
# -----------------------------
print_test "POST /daily-reading/regenerate (usuario FREE)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/daily-reading/regenerate" \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" == "403" ]; then
  print_success "Rechazado para FREE (HTTP 403 Forbidden)"
elif [ "$HTTP_CODE" == "404" ]; then
  print_success "No hay carta para regenerar (HTTP 404)"
elif [ "$HTTP_CODE" == "429" ]; then
  print_success "Rate limit (HTTP 429)"
else
  print_error "Esperado 403, recibido $HTTP_CODE"
fi

# -----------------------------
# Test 8: POST /daily-reading/regenerate (PREMIUM)
# -----------------------------
if [ -n "$PREMIUM_TOKEN" ]; then
  print_test "POST /daily-reading/regenerate (usuario PREMIUM)"
  
  # Primero asegurar que tiene carta del día
  curl -s -X POST "$BASE_URL/daily-reading" \
    -H "Authorization: Bearer $PREMIUM_TOKEN" \
    -H "Content-Type: application/json" > /dev/null
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/daily-reading/regenerate" \
    -H "Authorization: Bearer $PREMIUM_TOKEN" \
    -H "Content-Type: application/json")
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    print_success "Regeneración exitosa para PREMIUM (HTTP $HTTP_CODE)"
  elif [ "$HTTP_CODE" == "404" ]; then
    print_success "No hay carta para regenerar (HTTP 404)"
  elif [ "$HTTP_CODE" == "429" ]; then
    print_success "Rate limit o límite de regeneración (HTTP 429)"
  else
    print_error "Respuesta inesperada: $HTTP_CODE"
  fi
else
  echo -e "${YELLOW}⚠ Test PREMIUM saltado (no hay token)${NC}"
  ((TOTAL++))
fi

# -----------------------------
# Test 9: Validación de estructura de respuesta
# -----------------------------
print_test "Validar estructura de respuesta de carta del día"
RESPONSE=$(curl -s -X GET "$BASE_URL/daily-reading/today" \
  -H "Authorization: Bearer $FREE_TOKEN")

if echo "$RESPONSE" | grep -q '"id"' && echo "$RESPONSE" | grep -q '"readingDate"'; then
  print_success "Estructura de respuesta válida"
  echo -e "${CYAN}   ℹ Campos presentes: id, readingDate${NC}"
else
  # Puede ser null si no hay carta
  if echo "$RESPONSE" | grep -q "null" || echo "$RESPONSE" | grep -q "{}"; then
    print_success "Respuesta null válida (no hay carta)"
  else
    print_error "Estructura de respuesta incompleta"
  fi
fi

# -----------------------------
# Resumen
# -----------------------------
echo ""
echo -e "${CYAN}========================================"
echo "RESUMEN DE TESTS"
echo "========================================${NC}"
echo -e "Total:   ${BLUE}$TOTAL${NC}"
echo -e "Passed:  ${GREEN}$PASSED${NC}"
echo -e "Failed:  ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ TODOS LOS TESTS PASARON${NC}"
else
  echo -e "${RED}✗ HAY TESTS FALLIDOS${NC}"
fi
echo ""

echo "Endpoints de Daily Reading:"
echo "  POST /daily-reading          - Generar carta del día"
echo "  GET  /daily-reading/today    - Obtener carta de hoy"
echo "  GET  /daily-reading/history  - Historial paginado"
echo "  POST /daily-reading/regenerate - Regenerar (solo premium)"
echo ""
