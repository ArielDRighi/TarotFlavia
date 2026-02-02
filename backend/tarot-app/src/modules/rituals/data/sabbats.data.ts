import { Sabbat, RitualCategory } from '../domain/enums';

/**
 * Información completa de cada Sabbat
 * Incluye descripción, energías y categorías de rituales sugeridas
 */
export interface SabbatInfo {
  name: string;
  energy: string;
  description: string;
  suggestedCategories: RitualCategory[];
}

/**
 * Datos completos de todos los Sabbats de la Rueda del Año
 */
export const SABBAT_INFO: Record<Sabbat, SabbatInfo> = {
  [Sabbat.SAMHAIN]: {
    name: 'Samhain',
    energy: 'Muerte y Ancestros',
    description:
      'El velo entre mundos se adelgaza. Honra a tus ancestros y cierra ciclos.',
    suggestedCategories: [RitualCategory.MEDITATION, RitualCategory.CLEANSING],
  },
  [Sabbat.YULE]: {
    name: 'Yule - Solsticio de Invierno',
    energy: 'Renacimiento',
    description:
      'La noche más larga. El sol renace. Momento de esperanza y luz interior.',
    suggestedCategories: [RitualCategory.MEDITATION, RitualCategory.HEALING],
  },
  [Sabbat.IMBOLC]: {
    name: 'Imbolc',
    energy: 'Purificación',
    description:
      'Primeras señales de vida. Limpieza del hogar e inicio de proyectos.',
    suggestedCategories: [RitualCategory.CLEANSING, RitualCategory.PROTECTION],
  },
  [Sabbat.OSTARA]: {
    name: 'Ostara - Equinoccio de Primavera',
    energy: 'Equilibrio y Fertilidad',
    description: 'Día y noche en equilibrio. Nuevos comienzos y florecimiento.',
    suggestedCategories: [RitualCategory.ABUNDANCE, RitualCategory.LOVE],
  },
  [Sabbat.BELTANE]: {
    name: 'Beltane',
    energy: 'Pasión y Unión',
    description: 'Fiesta del fuego y el amor. Fertilidad máxima.',
    suggestedCategories: [RitualCategory.LOVE, RitualCategory.ABUNDANCE],
  },
  [Sabbat.LITHA]: {
    name: 'Litha - Solsticio de Verano',
    energy: 'Poder y Éxito',
    description: 'El día más largo. Abundancia y fuerza solar máxima.',
    suggestedCategories: [RitualCategory.ABUNDANCE, RitualCategory.PROTECTION],
  },
  [Sabbat.LAMMAS]: {
    name: 'Lammas (Lughnasadh)',
    energy: 'Cosecha y Gratitud',
    description: 'Primera cosecha. Agradecer lo recibido.',
    suggestedCategories: [RitualCategory.ABUNDANCE, RitualCategory.MEDITATION],
  },
  [Sabbat.MABON]: {
    name: 'Mabon - Equinoccio de Otoño',
    energy: 'Soltar y Balance',
    description: 'Segunda cosecha. Prepararse para la oscuridad, reflexión.',
    suggestedCategories: [RitualCategory.CLEANSING, RitualCategory.MEDITATION],
  },
};
