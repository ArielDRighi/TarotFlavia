/**
 * Marketplace-related constants
 */

/**
 * Tailwind CSS classes for specialty badges
 * Ensures consistent styling across all marketplace components
 */
export const SPECIALTY_COLORS: Record<string, string> = {
  Amor: 'bg-pink-100 text-pink-700',
  Dinero: 'bg-green-100 text-green-700',
  Carrera: 'bg-blue-100 text-blue-700',
  Salud: 'bg-orange-100 text-orange-700',
  Espiritual: 'bg-purple-100 text-purple-700',
};

/**
 * Default color for unknown specialties
 */
export const DEFAULT_SPECIALTY_COLOR = 'bg-gray-100 text-gray-700';

/**
 * Etiqueta **visible** de cada especialidad.
 *
 * El valor que viaja a la API y vive en `tarotistas.especialidades` no cambia
 * —renombrarlo exigiría migrar la base—, pero la palabra "Salud" no se muestra:
 * un sitio de tarot que ofrece lecturas *de salud* se lee como consejo médico
 * (territorio YMYL), y es de lo primero que mira un revisor de AdSense.
 * Ver T-SEO-013.
 */
const SPECIALTY_LABELS: Record<string, string> = {
  Salud: 'Energía y Bienestar',
};

/** Traduce el valor guardado a la etiqueta que ve el visitante. */
export function specialtyLabel(specialty: string): string {
  return SPECIALTY_LABELS[specialty] ?? specialty;
}
