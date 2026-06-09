#!/usr/bin/env bash
# Script de migración one-time: convierte los PNG de las cartas de tarot a WebP
# con nombres basados en el slug y los deposita en frontend/public/images/tarot/
#
# Uso: bash scripts/convert-cards-to-webp.sh [ruta/a/Cards-png]
# Si no se pasa argumento, usa el valor por defecto indicado abajo.
# Requiere: ImageMagick (convert)

set -euo pipefail

SRC_DIR="${1:-/home/ariel/Descargas/Cards-png}"
DEST_DIR="$(dirname "$0")/../frontend/public/images/tarot"

mkdir -p "$DEST_DIR"

# Calidad WebP (85 es buen balance calidad/peso para cartas de tarot)
QUALITY=85

# ─── Mapeo PNG → slug ──────────────────────────────────────────────────────────

declare -A MAP

# Arcanos Mayores
MAP["00-TheFool"]="the-fool"
MAP["01-TheMagician"]="the-magician"
MAP["02-TheHighPriestess"]="the-high-priestess"
MAP["03-TheEmpress"]="the-empress"
MAP["04-TheEmperor"]="the-emperor"
MAP["05-TheHierophant"]="the-hierophant"
MAP["06-TheLovers"]="the-lovers"
MAP["07-TheChariot"]="the-chariot"
MAP["08-Strength"]="strength"
MAP["09-TheHermit"]="the-hermit"
MAP["10-WheelOfFortune"]="wheel-of-fortune"
MAP["11-Justice"]="justice"
MAP["12-TheHangedMan"]="the-hanged-man"
MAP["13-Death"]="death"
MAP["14-Temperance"]="temperance"
MAP["15-TheDevil"]="the-devil"
MAP["16-TheTower"]="the-tower"
MAP["17-TheStar"]="the-star"
MAP["18-TheMoon"]="the-moon"
MAP["19-TheSun"]="the-sun"
MAP["20-Judgement"]="judgement"
MAP["21-TheWorld"]="the-world"

# Arcanos Menores — número → palabra
declare -A NUM
NUM["01"]="ace"; NUM["02"]="two"; NUM["03"]="three"; NUM["04"]="four"
NUM["05"]="five"; NUM["06"]="six"; NUM["07"]="seven"; NUM["08"]="eight"
NUM["09"]="nine"; NUM["10"]="ten"; NUM["11"]="page"; NUM["12"]="knight"
NUM["13"]="queen"; NUM["14"]="king"

# Arcanos Menores — palo
for SUIT_EN in Wands Cups Swords Pentacles; do
  SUIT_LC="${SUIT_EN,,}"
  for N in 01 02 03 04 05 06 07 08 09 10 11 12 13 14; do
    KEY="${SUIT_EN}${N}"
    MAP["$KEY"]="${NUM[$N]}-of-${SUIT_LC}"
  done
done

# ─── Conversión ────────────────────────────────────────────────────────────────

CONVERTED=0
SKIPPED=0
ERRORS=0

for PNG_FILE in "$SRC_DIR"/*.png; do
  BASENAME=$(basename "$PNG_FILE" .png)

  if [[ -z "${MAP[$BASENAME]+_}" ]]; then
    echo "⚠️  Sin mapeo para: $BASENAME — omitido"
    (( SKIPPED++ )) || true
    continue
  fi

  SLUG="${MAP[$BASENAME]}"
  DEST_FILE="$DEST_DIR/${SLUG}.webp"

  if [[ -f "$DEST_FILE" ]]; then
    echo "✓  Ya existe: ${SLUG}.webp — omitido"
    (( SKIPPED++ )) || true
    continue
  fi

  echo -n "→  $BASENAME.png → ${SLUG}.webp ... "
  if convert "$PNG_FILE" -quality "$QUALITY" "$DEST_FILE" 2>/dev/null; then
    SIZE=$(du -sh "$DEST_FILE" | cut -f1)
    echo "OK ($SIZE)"
    (( CONVERTED++ )) || true
  else
    echo "ERROR"
    (( ERRORS++ )) || true
  fi
done

echo ""
echo "─────────────────────────────────"
echo "Convertidas: $CONVERTED"
echo "Omitidas:    $SKIPPED"
echo "Errores:     $ERRORS"
echo "Destino:     $DEST_DIR"
