-- =============================================================================
-- Script de Verificación de Contenido de Cartas de Tarot
-- =============================================================================
-- Este script verifica que todas las cartas del tarot tengan contenido completo
-- Ejecutar: docker exec -i tarotflavia-postgres-db psql -U tarotflavia_user -d tarot_db < backend/tarot-app/scripts/verify-cards-content.sql
--
-- Criterios de verificación:
-- 1. Todas las cartas deben tener descripción no nula
-- 2. Todas las cartas deben tener significado derecho (meaningUpright)
-- 3. Todas las cartas deben tener significado invertido (meaningReversed)
-- 4. Todas las cartas deben tener al menos 3 keywords
-- 5. Todas las cartas deben tener imageUrl válida
-- =============================================================================

-- Verificación 1: Contar total de cartas
SELECT 
  '1. Total de Cartas' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 78 THEN '✓ CORRECTO (78 cartas esperadas)'
    ELSE '✗ ERROR: Se esperan 78 cartas'
  END as status
FROM tarot_card;

-- Verificación 2: Cartas sin descripción
SELECT 
  '2. Cartas sin descripción' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ TODAS OK'
    ELSE '✗ ERROR: Hay cartas sin descripción'
  END as status
FROM tarot_card 
WHERE description IS NULL OR description = '';

-- Verificación 3: Cartas sin significado derecho
SELECT 
  '3. Cartas sin significado derecho' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ TODAS OK'
    ELSE '✗ ERROR: Hay cartas sin significado derecho'
  END as status
FROM tarot_card 
WHERE "meaningUpright" IS NULL OR "meaningUpright" = '';

-- Verificación 4: Cartas sin significado invertido
SELECT 
  '4. Cartas sin significado invertido' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ TODAS OK'
    ELSE '✗ ERROR: Hay cartas sin significado invertido'
  END as status
FROM tarot_card 
WHERE "meaningReversed" IS NULL OR "meaningReversed" = '';

-- Verificación 5: Cartas sin keywords
SELECT 
  '5. Cartas sin keywords' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ TODAS OK'
    ELSE '✗ ERROR: Hay cartas sin keywords'
  END as status
FROM tarot_card 
WHERE keywords IS NULL OR keywords = '';

-- Verificación 6: Cartas con menos de 3 keywords
SELECT 
  '6. Cartas con menos de 3 keywords' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ TODAS OK'
    ELSE '✗ ERROR: Hay cartas con menos de 3 keywords'
  END as status
FROM tarot_card 
WHERE (LENGTH(keywords) - LENGTH(REPLACE(keywords, ',', '')) + 1) < 3;

-- Verificación 7: Cartas sin imagen
SELECT 
  '7. Cartas sin imagen' as verificacion,
  COUNT(*) as resultado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✓ TODAS OK'
    ELSE '✗ ERROR: Hay cartas sin imagen'
  END as status
FROM tarot_card 
WHERE "imageUrl" IS NULL OR "imageUrl" = '';

-- Verificación 8: Distribución por categoría
SELECT 
  '8. Distribución por categoría' as verificacion,
  category,
  COUNT(*) as cantidad,
  CASE 
    WHEN category = 'arcanos_mayores' AND COUNT(*) = 22 THEN '✓ CORRECTO (22 esperadas)'
    WHEN category IN ('bastos', 'copas', 'espadas', 'oros') AND COUNT(*) = 14 THEN '✓ CORRECTO (14 esperadas)'
    ELSE '✗ ERROR: Cantidad incorrecta'
  END as status
FROM tarot_card 
GROUP BY category
ORDER BY 
  CASE category
    WHEN 'arcanos_mayores' THEN 1
    WHEN 'bastos' THEN 2
    WHEN 'copas' THEN 3
    WHEN 'espadas' THEN 4
    WHEN 'oros' THEN 5
  END;

-- Verificación 9: Resumen de cartas con contenido incompleto (si hay)
SELECT 
  id, 
  name,
  CASE WHEN description IS NULL OR description = '' THEN '✗ SIN_DESC' ELSE '✓ OK' END as desc_status,
  CASE WHEN "meaningUpright" IS NULL OR "meaningUpright" = '' THEN '✗ SIN_UPRIGHT' ELSE '✓ OK' END as upright_status,
  CASE WHEN "meaningReversed" IS NULL OR "meaningReversed" = '' THEN '✗ SIN_REVERSED' ELSE '✓ OK' END as reversed_status,
  CASE WHEN keywords IS NULL OR keywords = '' THEN '✗ SIN_KEYWORDS' ELSE '✓ OK' END as keywords_status,
  CASE WHEN "imageUrl" IS NULL OR "imageUrl" = '' THEN '✗ SIN_IMG' ELSE '✓ OK' END as img_status
FROM tarot_card 
WHERE 
  description IS NULL OR description = '' OR
  "meaningUpright" IS NULL OR "meaningUpright" = '' OR
  "meaningReversed" IS NULL OR "meaningReversed" = '' OR
  keywords IS NULL OR keywords = '' OR
  "imageUrl" IS NULL OR "imageUrl" = '';

-- Verificación 10: Preview de calidad de contenido (primeras 3 cartas de cada categoría)
SELECT 
  '10. Preview de calidad de contenido' as info,
  category,
  name,
  LENGTH(description) as desc_length,
  LENGTH("meaningUpright") as upright_length,
  LENGTH("meaningReversed") as reversed_length,
  (LENGTH(keywords) - LENGTH(REPLACE(keywords, ',', '')) + 1) as keyword_count
FROM tarot_card 
WHERE id IN (
  SELECT MIN(id) FROM tarot_card GROUP BY category
  UNION
  SELECT MIN(id) + 1 FROM tarot_card GROUP BY category
  UNION
  SELECT MIN(id) + 2 FROM tarot_card GROUP BY category
)
ORDER BY category, id;
