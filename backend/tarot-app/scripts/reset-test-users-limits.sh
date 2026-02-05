#!/bin/bash
# ============================================================================
# Reset Test Users Limits - Easy Execution Script
# ============================================================================
# 
# Description: Resetea los límites de uso de los 3 usuarios de prueba:
#              - free@test.com (Plan FREE)
#              - premium@test.com (Plan PREMIUM)
#              - admin@test.com (Plan PREMIUM + ADMIN)
# 
# Usage:
#   chmod +x scripts/reset-test-users-limits.sh  # Primera vez
#   ./scripts/reset-test-users-limits.sh
# 
# Features reset:
#   ✓ Lecturas de tarot (daily_card, tarot_reading)
#   ✓ Consultas de péndulo (pendulum_query)
#   ✓ Consultas de oráculo (oracle_query)
#   ✓ Cartas del día (daily_readings)
#   ✓ Regeneración de interpretaciones
# 
# ============================================================================

set -e  # Exit on error

# Configuration
CONTAINER_NAME="tarot-postgres-db"
DB_USER="tarotflavia_user"
DB_NAME="tarot_db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/reset-test-users-limits.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🧹 Reset Test Users Limits                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Target users:${NC}"
echo "   • free@test.com    (FREE plan)"
echo "   • premium@test.com (PREMIUM plan)"
echo "   • admin@test.com   (PREMIUM + ADMIN)"
echo ""

# Check if container is running
echo -e "${YELLOW}🔍 Checking Docker container...${NC}"
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: Container '${CONTAINER_NAME}' is not running${NC}"
    echo "   Start it with: docker compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ Container is running${NC}"
echo ""

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: SQL file not found: ${SQL_FILE}${NC}"
    exit 1
fi

# Execute SQL script
echo -e "${YELLOW}📝 Executing SQL script...${NC}"
echo ""
if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Test users limits reset successfully!                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}💡 Next steps:${NC}"
    echo "   1. Login as any test user"
    echo "   2. Test features according to their plan:"
    echo ""
    echo -e "${YELLOW}   FREE user (free@test.com):${NC}"
    echo "      • 1 carta del día/día"
    echo "      • 1 tirada de tarot/día"
    echo "      • Sin interpretación IA"
    echo ""
    echo -e "${YELLOW}   PREMIUM users (premium@test.com, admin@test.com):${NC}"
    echo "      • 1 carta del día/día"
    echo "      • 3 tiradas de tarot/día"
    echo "      • Interpretación IA incluida"
    echo "      • Preguntas personalizadas"
    echo "      • Tiradas avanzadas"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}❌ Error executing SQL script${NC}"
    exit 1
fi
