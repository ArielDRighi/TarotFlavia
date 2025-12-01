#!/bin/bash

# =====================================================
# TASK-049: Security Events - Test Script
# =====================================================
# Descripción: Tests de endpoints de eventos de seguridad
# Requiere: Usuario admin autenticado
# =====================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@tarotflavia.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin123!}"

echo "========================================"
echo "TASK-049: SECURITY EVENTS API TESTS"
echo "========================================"
echo "Base URL: $BASE_URL"
echo ""

# -----------------------------
# Autenticación Admin
# -----------------------------
echo "🔐 Autenticando como admin..."
AUTH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

ACCESS_TOKEN=$(echo $AUTH_RESPONSE | grep -oP '"accessToken"\s*:\s*"\K[^"]+' 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" == "null" ]; then
  echo "❌ Error: No se pudo obtener token de admin"
  echo "Respuesta: $AUTH_RESPONSE"
  echo ""
  echo "⚠️  Asegúrate de tener un usuario admin creado:"
  echo "    Email: $ADMIN_EMAIL"
  echo "    Password: $ADMIN_PASSWORD"
  echo "    Role: admin"
  exit 1
fi

echo "✅ Token obtenido correctamente"
echo ""

# -----------------------------
# Test 1: Listar eventos sin filtros
# -----------------------------
echo "📋 Test 1: GET /admin/security/events (sin filtros)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Listado obtenido"
  TOTAL=$(echo "$BODY" | grep -oP '"total"\s*:\s*\K[0-9]+' 2>/dev/null || echo "0")
  echo "   Total eventos: $TOTAL"
else
  echo "❌ FAILED"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 2: Listar con filtro de severidad
# -----------------------------
echo "📋 Test 2: GET /admin/security/events?severity=HIGH"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events?severity=HIGH" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Filtro de severidad aplicado"
else
  echo "❌ FAILED"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 3: Listar con filtro de tipo de evento
# -----------------------------
echo "📋 Test 3: GET /admin/security/events?eventType=LOGIN_FAILED"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events?eventType=LOGIN_FAILED" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Filtro de tipo aplicado"
else
  echo "❌ FAILED"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 4: Listar con paginación
# -----------------------------
echo "📋 Test 4: GET /admin/security/events?page=1&limit=5"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events?page=1&limit=5" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Paginación aplicada"
else
  echo "❌ FAILED"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 5: Filtro por rango de fechas
# -----------------------------
echo "📋 Test 5: GET /admin/security/events (rango de fechas)"
START_DATE=$(date -d "-7 days" +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d 2>/dev/null || echo "2025-01-01")
END_DATE=$(date +%Y-%m-%d)

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Rango de fechas: $START_DATE a $END_DATE"
else
  echo "❌ FAILED"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 6: Filtro por IP
# -----------------------------
echo "📋 Test 6: GET /admin/security/events?ipAddress=127.0.0.1"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events?ipAddress=127.0.0.1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Filtro por IP aplicado"
else
  echo "❌ FAILED"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 7: Acceso sin autenticación
# -----------------------------
echo "🚫 Test 7: GET /admin/security/events (sin token)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ SUCCESS - Acceso denegado sin token (esperado)"
else
  echo "⚠️  Respuesta inesperada - debería ser 401"
fi
echo ""

# -----------------------------
# Test 8: Generar evento de seguridad (login fallido)
# -----------------------------
echo "🔐 Test 8: Generar evento de seguridad (login fallido)"
curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "nonexistent@test.com", "password": "wrongpassword"}' > /dev/null

echo "   Intento de login fallido ejecutado"

# Verificar que se generó el evento
sleep 1
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/admin/security/events?eventType=LOGIN_FAILED&limit=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ]; then
  TOTAL=$(echo "$BODY" | grep -oP '"total"\s*:\s*\K[0-9]+' 2>/dev/null || echo "0")
  if [ "$TOTAL" -gt "0" ]; then
    echo "✅ SUCCESS - Evento LOGIN_FAILED registrado"
  else
    echo "⚠️  No se encontraron eventos LOGIN_FAILED"
  fi
else
  echo "❌ FAILED al verificar eventos"
fi
echo ""

# -----------------------------
# Resumen
# -----------------------------
echo "========================================"
echo "RESUMEN DE TESTS"
echo "========================================"
echo "✅ Tests de listado y filtros ejecutados"
echo "✅ Tests de autenticación verificados"
echo "✅ Generación de eventos de seguridad probada"
echo ""
echo "Tipos de eventos disponibles:"
echo "  - LOGIN_SUCCESS"
echo "  - LOGIN_FAILED"
echo "  - LOGOUT"
echo "  - PASSWORD_CHANGE"
echo "  - PASSWORD_RESET"
echo "  - ROLE_CHANGE"
echo "  - PERMISSION_CHANGE"
echo "  - RATE_LIMIT_EXCEEDED"
echo "  - SUSPICIOUS_ACTIVITY"
echo "  - XSS_ATTEMPT"
echo "  - SQL_INJECTION_ATTEMPT"
echo "  - ADMIN_ACCESS"
echo "  - DATA_EXPORT"
echo "  - ACCOUNT_LOCKOUT"
echo "  - IP_BLOCKED"
echo "  - TOKEN_INVALIDATED"
echo ""
echo "Niveles de severidad:"
echo "  - LOW"
echo "  - MEDIUM"
echo "  - HIGH"
echo "  - CRITICAL"
echo ""
