#!/bin/bash

# Script para refactorizar estructura del proyecto NestJS
# Ejecutar desde: backend/tarot-app/

set -e  # Exit on error

echo "🚀 Iniciando refactorización de estructura..."
echo ""

# 1. Crear estructura de carpetas objetivo
echo "📁 Creando estructura de carpetas..."
mkdir -p src/modules/tarot
mkdir -p src/common/{decorators,filters,guards,interceptors,pipes,utils}
mkdir -p src/database/migrations
mkdir -p src/database/seeds

# 2. Mover módulos de autenticación y usuarios
echo "📦 Moviendo módulos auth y users..."
mv src/auth src/modules/
mv src/users src/modules/

# 3. Mover módulos de tarot
echo "📦 Moviendo módulos de tarot..."
mv src/cards src/modules/tarot/
mv src/decks src/modules/tarot/
mv src/readings src/modules/tarot/
mv src/interpretations src/modules/tarot/
mv src/spreads src/modules/tarot/

# 4. Mover categories
echo "📦 Moviendo módulo categories..."
mv src/categories src/modules/

# 5. Mover migrations a database
echo "📦 Moviendo migrations..."
if [ -d "src/migrations" ]; then
  mv src/migrations/* src/database/migrations/ 2>/dev/null || true
  rmdir src/migrations
fi

# 6. Mover seeders si existen
echo "📦 Organizando seeders..."
if [ -d "src/database/seeders" ]; then
  mv src/database/seeders src/database/seeds
fi

# 7. Actualizar imports en todos los archivos TypeScript
echo "🔄 Actualizando imports..."

# Auth
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../auth/|from '../modules/auth/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/auth/|from 'src/modules/auth/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]@/auth/|from '@/modules/auth/|g" {} +

# Users
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../users/|from '../modules/users/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/users/|from 'src/modules/users/|g" {} +

# Cards
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../cards/|from '../modules/tarot/cards/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/cards/|from 'src/modules/tarot/cards/|g" {} +

# Decks
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../decks/|from '../modules/tarot/decks/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/decks/|from 'src/modules/tarot/decks/|g" {} +

# Readings
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../readings/|from '../modules/tarot/readings/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/readings/|from 'src/modules/tarot/readings/|g" {} +

# Interpretations
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../interpretations/|from '../modules/tarot/interpretations/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/interpretations/|from 'src/modules/tarot/interpretations/|g" {} +

# Spreads
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../spreads/|from '../modules/tarot/spreads/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/spreads/|from 'src/modules/tarot/spreads/|g" {} +

# Categories
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../categories/|from '../modules/categories/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/categories/|from 'src/modules/categories/|g" {} +

# Migrations
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]../migrations/|from '../database/migrations/|g" {} +
find src -type f -name "*.ts" -exec sed -i "s|from ['\"]src/migrations/|from 'src/database/migrations/|g" {} +

echo ""
echo "✅ Estructura refactorizada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecutar: npm run build"
echo "2. Ejecutar: npm run test"
echo "3. Si hay errores de imports, revisar manualmente"
echo "4. Commit: git add -A && git commit -m 'refactor: reorganizar estructura según best practices'"
echo ""
