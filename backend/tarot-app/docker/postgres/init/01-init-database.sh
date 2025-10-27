#!/bin/bash
# =============================================================================
# TarotFlavia PostgreSQL Initialization Script
# =============================================================================
# This script runs automatically when the PostgreSQL container starts for the
# first time. It sets up the database with proper extensions and settings.
# =============================================================================

set -e

echo "🔮 Initializing TarotFlavia PostgreSQL database..."

# Create extensions if needed
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable UUID generation extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Enable pg_trgm for better text search (useful for tarot card searches)
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Grant necessary permissions
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
    
    -- Log successful initialization
    SELECT 'TarotFlavia database initialized successfully!' as status;
EOSQL

echo "✅ TarotFlavia database initialization completed!"
