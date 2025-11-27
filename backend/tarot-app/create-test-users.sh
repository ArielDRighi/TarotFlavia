#!/bin/bash

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "Creando usuarios de prueba..."

# Crear usuario regular
echo "1. Creando usuario regular (test@example.com)..."
curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "name": "Test User"
  }' | jq '.'

echo ""
echo "2. Creando usuario tarotista Flavia (si no existe)..."
curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "flavia@example.com",
    "password": "Flavia123!@#",
    "name": "Flavia Righi"
  }' | jq '.'

echo ""
echo "✅ Usuarios creados (o ya existían)"
echo ""
echo "Credenciales:"
echo "  Usuario regular: test@example.com / Test123456!"
echo "  Tarotista:       flavia@example.com / Flavia123!@#"
echo "  Admin:           admin@test.com / Test123456!"
