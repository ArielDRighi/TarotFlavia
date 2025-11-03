#!/bin/bash

# Limpiar solo lecturas (mantener usuarios seeded)
echo "��� Limpiando lecturas anteriores..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  port: 5435,
  user: 'tarotflavia_user',
  password: 'tarotflavia_secure_password_2024',
  database: 'tarotflavia_db',
});
(async () => {
  await pool.query('DELETE FROM tarot_reading');
  await pool.query('DELETE FROM usage_limit');
  console.log('✅ Limpio');
  await pool.end();
})();
" && sleep 2

# Payloads
READING_PAYLOAD='{
  "deckId": 41,
  "spreadId": 1,
  "predefinedQuestionId": 1,
  "cardIds": [1, 2, 3],
  "cardPositions": [
    {"cardId": 1, "position": "past", "isReversed": false},
    {"cardId": 2, "position": "present", "isReversed": false},
    {"cardId": 3, "position": "future", "isReversed": true}
  ]
}'

CUSTOM_READING='{
  "deckId": 41,
  "spreadId": 1,
  "customQuestion": "¿Cuál es mi camino espiritual?",
  "cardIds": [1, 2, 3],
  "cardPositions": [
    {"cardId": 1, "position": "past", "isReversed": false},
    {"cardId": 2, "position": "present", "isReversed": false},
    {"cardId": 3, "position": "future", "isReversed": true}
  ]
}'

echo ""
echo "============================================"
echo "   MVP E2E TEST - 14 ESCENARIOS"
echo "============================================"
echo ""

# 1. Health
echo "1️⃣  Health Check"
curl -s http://localhost:3000/health/ai | grep -q '"status":"ok"' && echo "✅ PASS" || echo "❌ FAIL"
sleep 2

# 2-3. FREE user login
echo "2️⃣  Login FREE user (seeded)"
FREE_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"free@test.com","password":"Test123456!"}' \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
[ ! -z "$FREE_TOKEN" ] && echo "✅ PASS" || echo "❌ FAIL"
sleep 2

# 3. Categories
echo "3️⃣  Get Categories"
CAT_COUNT=$(curl -s http://localhost:3000/categories -H "Authorization: Bearer $FREE_TOKEN" | grep -o '"id":' | wc -l)
[ "$CAT_COUNT" -ge 6 ] && echo "✅ PASS ($CAT_COUNT found)" || echo "❌ FAIL"
sleep 2

# 4. Questions
echo "4️⃣  Get Questions"
Q_COUNT=$(curl -s "http://localhost:3000/predefined-questions?categoryId=1" -H "Authorization: Bearer $FREE_TOKEN" | grep -o '"id":' | wc -l)
[ "$Q_COUNT" -ge 1 ] && echo "✅ PASS ($Q_COUNT found)" || echo "❌ FAIL"
sleep 2

# 5. Reading 1/3
echo "5️⃣  FREE - Reading 1/3"
R1=$(curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$READING_PAYLOAD")
echo "$R1" | grep -q '"interpretation"' && echo "✅ PASS" || echo "❌ FAIL"
sleep 3

# 6. Custom question (blocked)
echo "6️⃣  FREE - Custom Question (expect 403)"
CUSTOM=$(curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CUSTOM_READING")
echo "$CUSTOM" | grep -q '"statusCode":403' && echo "✅ PASS (blocked)" || echo "❌ FAIL"
sleep 3

# 7-8. Readings 2-3
echo "7️⃣  FREE - Reading 2/3"
curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$READING_PAYLOAD" | grep -q '"interpretation"' && echo "✅ PASS" || echo "❌ FAIL"
sleep 3

echo "8️⃣  FREE - Reading 3/3"
curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$READING_PAYLOAD" | grep -q '"interpretation"' && echo "✅ PASS" || echo "❌ FAIL"
sleep 3

# 9. Reading 4 (blocked)
echo "9️⃣  FREE - Reading 4 (expect blocked)"
R4=$(curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $FREE_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$READING_PAYLOAD")
echo "$R4" | grep -Eq '"statusCode":(403|429)' && echo "✅ PASS (blocked)" || echo "❌ FAIL"
sleep 3

# 10-11. PREMIUM user
echo "��� Login PREMIUM user (seeded)"
PREM_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"premium@test.com","password":"Test123456!"}' \
  | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')
[ ! -z "$PREM_TOKEN" ] && echo "✅ PASS" || echo "❌ FAIL"
sleep 2

# 12. PREMIUM custom question
echo "1️⃣1️⃣  PREMIUM - Custom Question"
curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $PREM_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CUSTOM_READING" | grep -q '"interpretation"' && echo "✅ PASS" || echo "❌ FAIL"
sleep 3

# 13. PREMIUM multiple readings
echo "1️⃣2️⃣  PREMIUM - Multiple readings (unlimited)"
curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $PREM_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$READING_PAYLOAD" | grep -q '"interpretation"' && echo "✅ PASS (1/unlimited)" || echo "❌ FAIL"
sleep 3

curl -s -X POST http://localhost:3000/readings \
  -H "Authorization: Bearer $PREM_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$READING_PAYLOAD" | grep -q '"interpretation"' && echo "✅ PASS (2/unlimited)" || echo "❌ FAIL"
sleep 3

# 14. History
echo "1️⃣3️⃣  FREE - Reading History"
H_COUNT=$(curl -s "http://localhost:3000/readings?page=1&limit=10" -H "Authorization: Bearer $FREE_TOKEN" | grep -o '"id":' | wc -l)
[ "$H_COUNT" -eq 3 ] && echo "✅ PASS ($H_COUNT readings)" || echo "⚠️  PARTIAL ($H_COUNT readings, expected 3)"

echo ""
echo "1️⃣4️⃣  PREMIUM - Reading History"
HP_COUNT=$(curl -s "http://localhost:3000/readings?page=1&limit=10" -H "Authorization: Bearer $PREM_TOKEN" | grep -o '"id":' | wc -l)
[ "$HP_COUNT" -eq 3 ] && echo "✅ PASS ($HP_COUNT readings)" || echo "⚠️  PARTIAL ($HP_COUNT readings, expected 3)"

echo ""
echo "============================================"
echo "   ✅ COMPLETADO - MVP E2E TEST"
echo "============================================"
