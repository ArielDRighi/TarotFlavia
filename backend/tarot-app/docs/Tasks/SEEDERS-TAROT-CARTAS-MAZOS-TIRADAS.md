# Seeders del Sistema de Tarot (Cartas, Mazos, Tiradas)

> **TASK-005, TASK-005-a, TASK-006** | Estado: ✅ COMPLETADOS

## 📋 Resumen

Sistema completo de seeders para poblar la base de datos con:

- 78 cartas del Tarot Rider-Waite
- Mazo predeterminado con metadata histórica
- 4 tipos de tiradas predefinidas

## ✅ Verificación de Implementación

### TASK-005: Seeders 78 Cartas

| Requisito          | Estado | Implementación                              |
| ------------------ | ------ | ------------------------------------------- |
| 22 Arcanos Mayores | ✅     | El Loco a El Mundo                          |
| 56 Arcanos Menores | ✅     | 4 palos × 14 cartas                         |
| Campos completos   | ✅     | nombre, significados, keywords, descripción |
| Seeder idempotente | ✅     | Verifica si existen antes de crear          |
| Tests unitarios    | ✅     | 15 tests en spec.ts                         |

### TASK-005-a: Seeder Mazo Rider-Waite

| Requisito                 | Estado | Implementación               |
| ------------------------- | ------ | ---------------------------- |
| Mazo Rider-Waite          | ✅     | Con `isDefault: true`        |
| Metadata histórica        | ✅     | Artista, año 1909, tradición |
| Endpoint `/decks/default` | ✅     | GET público                  |
| Idempotente               | ✅     | Verifica si existe           |
| Tests unitarios           | ✅     | 12 tests en spec.ts          |

### TASK-006: Seeders Tiradas (Spreads)

| Requisito              | Estado | Implementación                        |
| ---------------------- | ------ | ------------------------------------- |
| Tirada 1 carta         | ✅     | Respuesta rápida/del día              |
| Tirada 3 cartas        | ✅     | Pasado-Presente-Futuro                |
| Tirada 5 cartas        | ✅     | Análisis profundo                     |
| Cruz Céltica 10 cartas | ✅     | Lectura completa                      |
| Campo `positions` JSON | ✅     | Con nombre y descripción por posición |
| Campo `difficulty`     | ✅     | beginner/intermediate/advanced        |
| `isBeginnerFriendly`   | ✅     | Boolean por spread                    |
| Tests unitarios        | ✅     | En spec.ts                            |

## 📁 Archivos Implementados

```
src/database/seeds/
├── data/
│   ├── tarot-cards.data.ts      # 78 cartas (1104 líneas)
│   ├── tarot-decks.data.ts      # Mazo Rider-Waite (106 líneas)
│   └── tarot-spreads.data.ts    # 4 tiradas predefinidas
├── tarot-cards.seeder.ts        # Seeder cartas (97 líneas)
├── tarot-cards.seeder.spec.ts   # 15 tests
├── tarot-decks.seeder.ts        # Seeder mazos (58 líneas)
├── tarot-decks.seeder.spec.ts   # 12 tests
├── tarot-spreads.seeder.ts      # Seeder tiradas (60 líneas)
└── tarot-spreads.seeder.spec.ts # Tests

docs/
└── cards.md                     # Documentación 78 cartas (857 líneas)
```

## 🃏 Datos Sembrados

### Mazo Rider-Waite

```typescript
{
  name: "Rider-Waite",
  artist: "Pamela Colman Smith",
  yearCreated: 1909,
  tradition: "Hermética / Orden del Amanecer Dorado",
  publisher: "Rider & Company",
  cardCount: 78,
  isDefault: true
}
```

### Cartas (78 total)

- **Arcanos Mayores (22):** El Loco (0) a El Mundo (XXI)
- **Arcanos Menores (56):**
  - ♥ Copas: As a Rey (14)
  - ⚔ Espadas: As a Rey (14)
  - 🌿 Bastos: As a Rey (14)
  - 🪙 Oros: As a Rey (14)

### Tiradas (4 tipos)

| Nombre       | Cartas | Dificultad   | Para Principiantes |
| ------------ | ------ | ------------ | ------------------ |
| Una Carta    | 1      | beginner     | ✅                 |
| Tres Cartas  | 3      | beginner     | ✅                 |
| Cinco Cartas | 5      | intermediate | ❌                 |
| Cruz Céltica | 10     | advanced     | ❌                 |

## 🚀 Comandos de Uso

```bash
# Ejecutar todos los seeders
npm run seed

# Los seeders se ejecutan en orden:
# 1. Decks (mazo)
# 2. Cards (cartas vinculadas al mazo)
# 3. Spreads (tiradas)
```

## 🧪 Tests de Integración

### Tests Unitarios Existentes

| Archivo                      | Tests | Estado |
| ---------------------------- | ----- | ------ |
| tarot-cards.seeder.spec.ts   | 15    | ✅     |
| tarot-decks.seeder.spec.ts   | 12    | ✅     |
| tarot-spreads.seeder.spec.ts | ✅    | ✅     |

### Tests E2E Faltantes

| Test                     | Estado | Descripción         |
| ------------------------ | ------ | ------------------- |
| GET /decks devuelve mazo | ⚠️     | Endpoint público    |
| GET /decks/default       | ⚠️     | Retorna Rider-Waite |
| GET /cards devuelve 78   | ⚠️     | Todas las cartas    |
| GET /spreads devuelve 4  | ⚠️     | Las 4 tiradas       |

### Script de Test Recomendado

```bash
#!/bin/bash
# test-tarot-data-endpoints.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "🃏 Verificando datos de Tarot..."

# Verificar mazo
deck=$(curl -s "$BASE_URL/decks/default")
echo "$deck" | jq -e '.name == "Rider-Waite"' && echo "✅ Mazo default OK"

# Verificar cartas
cards_count=$(curl -s "$BASE_URL/cards" | jq 'length')
[ "$cards_count" -eq 78 ] && echo "✅ 78 cartas OK" || echo "❌ Cartas: $cards_count"

# Verificar spreads
spreads_count=$(curl -s "$BASE_URL/spreads" | jq 'length')
[ "$spreads_count" -ge 4 ] && echo "✅ Spreads OK ($spreads_count)"

echo "🃏 Verificación completada"
```

## 🔗 Referencias

- [cards.md](../cards.md) - Documentación completa de las 78 cartas
- [SEEDERS_GUIDE.md](../SEEDERS_GUIDE.md) - Guía de seeders (si existe)
