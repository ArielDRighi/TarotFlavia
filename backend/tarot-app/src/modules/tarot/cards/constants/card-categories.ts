/**
 * Categoría de los Arcanos Mayores, tal como se almacena en la columna
 * `category` de `tarot_card`.
 *
 * Centralizada para que el filtro del pool de reparto (usuarios FREE/anónimo) y
 * la barrera defensiva `validateDeckAccess` comparen exactamente el mismo valor:
 * un drift entre ambos abriría un hueco de seguridad (que un usuario FREE
 * recibiera Arcanos Menores). No usar el literal suelto en lógica de comparación.
 */
export const ARCANOS_MAYORES_CATEGORY = 'arcanos_mayores';
