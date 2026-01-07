#!/bin/bash
# ============================================================================
# Reset ALL User Limits - Easy Execution Script
# ============================================================================
# 
# Description: Elimina TODOS los registros de uso (Anonymous + FREE + PREMIUM)
# 
# Usage:
#   chmod +x scripts/reset-all-limits.sh  # Primera vez
#   ./scripts/reset-all-limits.sh
# 
# ============================================================================

set -e  # Exit on error

# Configuration
CONTAINER_NAME="tarotflavia-postgres-db"
DB_USER="tarotflavia_user"
DB_NAME="tarot_db"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/reset-all-limits.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧹 Resetting ALL User Limits (Anonymous + FREE + PREMIUM)...${NC}"
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
    echo -e "${GREEN}✅ ALL user limits reset successfully!${NC}"
    echo -e "${GREEN}💡 All users can now create readings/daily cards from scratch!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Error executing SQL script${NC}"
    exit 1
fi
