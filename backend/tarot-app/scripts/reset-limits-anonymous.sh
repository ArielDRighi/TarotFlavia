#!/bin/bash
# ============================================================================
# Reset Anonymous User Limits - Easy Execution Script
# ============================================================================
# 
# Description: Elimina todos los registros de uso de usuarios anónimos
# 
# Usage:
#   chmod +x scripts/reset-limits-anonymous.sh  # Primera vez
#   ./scripts/reset-limits-anonymous.sh
# 
# ============================================================================

set -e  # Exit on error

# Configuration
CONTAINER_NAME="tarotflavia-postgres-db"
DB_USER="tarotflavia_user"
DB_NAME="tarot_db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/reset-limits-anonymous.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧹 Resetting Anonymous User Limits...${NC}"
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Error: Container '${CONTAINER_NAME}' is not running${NC}"
    echo "   Start it with: docker compose up -d"
    exit 1
fi

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: SQL file not found: ${SQL_FILE}${NC}"
    exit 1
fi

# Execute SQL script
echo -e "${YELLOW}📝 Executing SQL script...${NC}"
if docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Anonymous user limits reset successfully!${NC}"
    echo -e "${GREEN}💡 Anonymous users can now create readings/daily cards again.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Error executing SQL script${NC}"
    exit 1
fi
