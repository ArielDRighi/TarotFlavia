/**
 * Enum de las 12 casas astrológicas
 * Representa las áreas de experiencia de vida en una carta natal
 */
export enum House {
  FIRST = 1,
  SECOND = 2,
  THIRD = 3,
  FOURTH = 4,
  FIFTH = 5,
  SIXTH = 6,
  SEVENTH = 7,
  EIGHTH = 8,
  NINTH = 9,
  TENTH = 10,
  ELEVENTH = 11,
  TWELFTH = 12,
}

/**
 * Metadata para cada casa astrológica
 * Incluye nombre en español, tema principal y palabras clave
 */
export const HouseMetadata: Record<
  House,
  {
    name: string;
    theme: string;
    keywords: string[];
  }
> = {
  [House.FIRST]: {
    name: 'Casa I',
    theme: 'Identidad y Apariencia',
    keywords: ['yo', 'personalidad', 'apariencia física', 'iniciativa'],
  },
  [House.SECOND]: {
    name: 'Casa II',
    theme: 'Recursos y Valores',
    keywords: ['dinero', 'posesiones', 'valores', 'seguridad material'],
  },
  [House.THIRD]: {
    name: 'Casa III',
    theme: 'Comunicación y Aprendizaje',
    keywords: ['comunicación', 'hermanos', 'estudios', 'vecindario'],
  },
  [House.FOURTH]: {
    name: 'Casa IV',
    theme: 'Hogar y Raíces',
    keywords: ['familia', 'hogar', 'raíces', 'infancia'],
  },
  [House.FIFTH]: {
    name: 'Casa V',
    theme: 'Creatividad y Placer',
    keywords: ['creatividad', 'romance', 'hijos', 'diversión'],
  },
  [House.SIXTH]: {
    name: 'Casa VI',
    theme: 'Trabajo y Salud',
    keywords: ['trabajo', 'salud', 'rutina', 'servicio'],
  },
  [House.SEVENTH]: {
    name: 'Casa VII',
    theme: 'Relaciones y Asociaciones',
    keywords: ['matrimonio', 'socios', 'contratos', 'otros'],
  },
  [House.EIGHTH]: {
    name: 'Casa VIII',
    theme: 'Transformación y Recursos Compartidos',
    keywords: ['transformación', 'muerte', 'herencias', 'intimidad'],
  },
  [House.NINTH]: {
    name: 'Casa IX',
    theme: 'Filosofía y Expansión',
    keywords: [
      'filosofía',
      'viajes largos',
      'educación superior',
      'espiritualidad',
    ],
  },
  [House.TENTH]: {
    name: 'Casa X',
    theme: 'Carrera y Reputación',
    keywords: ['carrera', 'estatus', 'reputación', 'logros'],
  },
  [House.ELEVENTH]: {
    name: 'Casa XI',
    theme: 'Amistades y Aspiraciones',
    keywords: ['amigos', 'grupos', 'ideales', 'aspiraciones'],
  },
  [House.TWELFTH]: {
    name: 'Casa XII',
    theme: 'Subconsciente y Trascendencia',
    keywords: ['subconsciente', 'karma', 'retiro', 'espiritualidad'],
  },
};
