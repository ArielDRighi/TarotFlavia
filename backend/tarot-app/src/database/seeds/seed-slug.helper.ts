/**
 * Shared slug helpers for seed files.
 *
 * Centralises the card-name → slug conversion so that all seeders
 * use exactly the same normalisation rules and divergence is impossible.
 */

/**
 * Converts a tarot card name to the slug used in seed data files.
 *
 * Rules:
 *  - Lowercase
 *  - Normalize accent marks (NFD → strip combining characters)
 *  - Remove parentheses
 *  - Collapse whitespace/hyphens into single hyphens
 *  - Trim leading/trailing hyphens
 *
 * Examples:
 *   'El Loco'                  → 'el-loco'
 *   'La Sacerdotisa'           → 'la-sacerdotisa'
 *   'El Papa (El Hierofante)'  → 'el-papa-el-hierofante'
 *   'La Rueda de la Fortuna'   → 'la-rueda-de-la-fortuna'
 *   'El Ermitaño'              → 'el-ermitano'
 */
export function buildCardSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[()]/g, '') // remove parentheses
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}
