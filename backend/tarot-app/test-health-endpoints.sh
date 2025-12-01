#!/bin/bash

# =====================================================
# TASK-051: Health Checks - Test Script
# =====================================================
# Descripción: Tests de endpoints de health checks
# Endpoints públicos para monitoring/K8s
# =====================================================

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "========================================"
echo "TASK-051: HEALTH CHECKS API TESTS"
echo "========================================"
echo "Base URL: $BASE_URL"
echo ""

# -----------------------------
# Test 1: Health check general
# -----------------------------
echo "💚 Test 1: GET /health (general)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Aplicación saludable"
  echo "Response: $BODY"
else
  echo "⚠️ WARNING - Estado no óptimo"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 2: Readiness check
# -----------------------------
echo "💚 Test 2: GET /health/ready (readiness)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health/ready")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Servicios listos"
else
  echo "⚠️ WARNING - Servicios no listos"
fi
echo "Response: $BODY"
echo ""

# -----------------------------
# Test 3: Liveness check
# -----------------------------
echo "💚 Test 3: GET /health/live (liveness)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health/live")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Aplicación viva"
else
  echo "❌ FAILED - Aplicación no responde"
fi
echo "Response: $BODY"
echo ""

# -----------------------------
# Test 4: Health details
# -----------------------------
echo "📋 Test 4: GET /health/details (detalles)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health/details")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - Detalles obtenidos"
  # Intentar parsear componentes
  echo ""
  echo "Componentes verificados:"
  echo "$BODY" | grep -oP '"[a-zA-Z]+"\s*:\s*\{\s*"status"\s*:\s*"[^"]+' | head -10
else
  echo "❌ FAILED - No se pudieron obtener detalles"
fi
echo ""

# -----------------------------
# Test 5: AI Health check
# -----------------------------
echo "🤖 Test 5: GET /health/ai (estado de IA)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health/ai")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Code: $HTTP_CODE"
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS - AI providers funcionando"
  echo "Response: $BODY"
elif [ "$HTTP_CODE" == "404" ]; then
  echo "ℹ️  Endpoint /health/ai no disponible"
else
  echo "⚠️ WARNING - AI providers con problemas"
  echo "Response: $BODY"
fi
echo ""

# -----------------------------
# Test 6: Database health
# -----------------------------
echo "🗄️ Test 6: Verificar conectividad de base de datos"
# El endpoint /health/details debería incluir estado de DB
RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$RESPONSE" | grep -qi "database"; then
  echo "✅ Database status incluido en health check"
  DB_STATUS=$(echo "$RESPONSE" | grep -oP '"database"\s*:\s*\{\s*"status"\s*:\s*"\K[^"]+' || echo "unknown")
  echo "   Estado: $DB_STATUS"
else
  echo "ℹ️  Estado de database no visible en response público"
fi
echo ""

# -----------------------------
# Resumen
# -----------------------------
echo "========================================"
echo "RESUMEN DE TESTS"
echo "========================================"
echo ""
echo "Endpoints de Health Check disponibles:"
echo "  GET /health         - Check general (monitoring)"
echo "  GET /health/ready   - Readiness probe (K8s)"
echo "  GET /health/live    - Liveness probe (K8s)"
echo "  GET /health/details - Detalles completos"
echo "  GET /health/ai      - Estado de providers IA"
echo ""
echo "Componentes verificados:"
echo "  - Database (PostgreSQL)"
echo "  - AI Providers (Groq/DeepSeek/OpenAI)"
echo "  - Disk space"
echo "  - Memory usage"
echo ""
echo "Uso típico:"
echo "  Kubernetes liveness:  /health/live"
echo "  Kubernetes readiness: /health/ready"
echo "  Load balancer:        /health"
echo "  Admin dashboard:      /health/details"
echo ""
