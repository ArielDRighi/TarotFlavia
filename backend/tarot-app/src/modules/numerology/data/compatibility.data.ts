/**
 * Datos de compatibilidad numerológica entre números
 */

export type CompatibilityLevel = 'high' | 'medium' | 'low';

export interface Compatibility {
  numbers: [number, number];
  level: CompatibilityLevel;
  description: string;
  strengths: string[];
  challenges: string[];
}

export const COMPATIBILITY_DATA: Compatibility[] = [
  // === COMPATIBILIDAD DEL NÚMERO 1 ===
  {
    numbers: [1, 1],
    level: 'medium',
    description:
      'Dos líderes fuertes pueden chocar por el control o complementarse mutuamente si respetan el espacio del otro',
    strengths: [
      'Ambición compartida y comprensión mutua',
      'Respeto por la independencia del otro',
      'Energía y determinación conjunta',
    ],
    challenges: [
      'Competencia por el liderazgo',
      'Luchas de poder frecuentes',
      'Dificultad para ceder o comprometerse',
    ],
  },
  {
    numbers: [1, 2],
    level: 'high',
    description:
      'El líder y el diplomático se equilibran perfectamente, creando una asociación armoniosa',
    strengths: [
      'Complementariedad natural',
      'El 2 apoya las iniciativas del 1',
      'Equilibrio entre acción y reflexión',
    ],
    challenges: [
      'El 1 puede dominar demasiado',
      'El 2 puede ceder excesivamente',
      'Desequilibrio de poder si no hay consciencia',
    ],
  },
  {
    numbers: [1, 3],
    level: 'high',
    description:
      'Una combinación dinámica y creativa llena de entusiasmo y energía positiva',
    strengths: [
      'Creatividad e innovación compartidas',
      'Optimismo mutuo',
      'Capacidad de inspirarse mutuamente',
    ],
    challenges: [
      'Falta de practicidad conjunta',
      'Dispersión de energía',
      'Pueden ser demasiado impulsivos juntos',
    ],
  },
  {
    numbers: [1, 5],
    level: 'high',
    description:
      'Ambos aman la libertad y la aventura, creando una relación dinámica y estimulante',
    strengths: [
      'Amor compartido por la independencia',
      'Aventura y exploración mutuas',
      'Respeto por el espacio personal',
    ],
    challenges: [
      'Falta de estabilidad',
      'Dificultad para comprometerse a largo plazo',
      'Pueden ser demasiado independientes',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 2 ===
  {
    numbers: [2, 2],
    level: 'medium',
    description:
      'Dos diplomáticos crean armonía pero pueden carecer de dirección y acción',
    strengths: [
      'Comprensión emocional profunda',
      'Ambiente pacífico y armonioso',
      'Apoyo mutuo constante',
    ],
    challenges: [
      'Indecisión compartida',
      'Falta de liderazgo',
      'Pueden evitar conflictos necesarios',
    ],
  },
  {
    numbers: [2, 6],
    level: 'high',
    description:
      'Una unión natural basada en el cuidado mutuo y el servicio compartido',
    strengths: [
      'Armonía y comprensión mutua',
      'Valores familiares compartidos',
      'Capacidad de nutrir la relación',
    ],
    challenges: [
      'Pueden ser codependientes',
      'Exceso de sacrificio mutuo',
      'Dificultad para establecer límites',
    ],
  },
  {
    numbers: [2, 7],
    level: 'medium',
    description:
      'El diplomático emocional y el pensador analítico pueden complementarse si aprenden a comunicarse',
    strengths: [
      'El 2 aporta calidez al 7',
      'El 7 ofrece profundidad al 2',
      'Crecimiento mutuo',
    ],
    challenges: [
      'Diferencias en expresión emocional',
      'El 7 puede parecer distante',
      'El 2 puede sentirse rechazado',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 3 ===
  {
    numbers: [3, 3],
    level: 'high',
    description:
      'Una pareja llena de alegría, creatividad y diversión, pero puede carecer de practicidad',
    strengths: [
      'Creatividad y alegría compartidas',
      'Comunicación fluida',
      'Optimismo contagioso',
    ],
    challenges: [
      'Falta de seriedad y profundidad',
      'Dificultad para manejar responsabilidades',
      'Dispersión conjunta',
    ],
  },
  {
    numbers: [3, 5],
    level: 'high',
    description:
      'Una combinación vibrante y aventurera que disfruta de la variedad y el cambio',
    strengths: [
      'Energía y entusiasmo compartidos',
      'Amor por la aventura',
      'Adaptabilidad mutua',
    ],
    challenges: [
      'Inestabilidad y falta de compromiso',
      'Dificultad para construir bases sólidas',
      'Impulsividad conjunta',
    ],
  },
  {
    numbers: [3, 9],
    level: 'high',
    description:
      'El comunicador y el humanitario se unen para inspirar y elevar a otros',
    strengths: [
      'Visión compartida de ayudar al mundo',
      'Creatividad con propósito',
      'Comprensión mutua',
    ],
    challenges: [
      'El 3 puede ser demasiado superficial para el 9',
      'El 9 puede ser demasiado serio para el 3',
      'Diferencias en profundidad',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 4 ===
  {
    numbers: [4, 4],
    level: 'high',
    description:
      'Dos constructores crean una base sólida y estable, perfecta para construir juntos',
    strengths: [
      'Estabilidad y seguridad compartidas',
      'Valores de trabajo similares',
      'Construcción sólida de futuro',
    ],
    challenges: [
      'Rigidez compartida',
      'Falta de espontaneidad',
      'Pueden ser demasiado serios',
    ],
  },
  {
    numbers: [4, 8],
    level: 'high',
    description: 'Una poderosa combinación de practicidad y ambición material',
    strengths: [
      'Éxito material compartido',
      'Valores de trabajo similares',
      'Capacidad de construir imperios',
    ],
    challenges: [
      'Materialismo excesivo',
      'Falta de tiempo para la relación',
      'Competencia por el control',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 5 ===
  {
    numbers: [5, 5],
    level: 'medium',
    description:
      'Dos espíritus libres pueden disfrutar juntos pero luchan con el compromiso',
    strengths: [
      'Aventura y libertad compartidas',
      'Comprensión mutua de la necesidad de espacio',
      'Relación estimulante',
    ],
    challenges: [
      'Falta de estabilidad',
      'Dificultad para comprometerse',
      'Pueden ser demasiado independientes',
    ],
  },
  {
    numbers: [5, 9],
    level: 'medium',
    description:
      'El aventurero y el humanitario comparten amor por la experiencia y el servicio',
    strengths: [
      'Amor compartido por la diversidad',
      'Visión global',
      'Adaptabilidad mutua',
    ],
    challenges: [
      'Falta de enfoque conjunto',
      'El 9 busca más profundidad que el 5',
      'Diferentes formas de compromiso',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 6 ===
  {
    numbers: [6, 6],
    level: 'high',
    description:
      'Dos cuidadores crean un hogar amoroso y armonioso centrado en la familia',
    strengths: [
      'Armonía doméstica perfecta',
      'Valores familiares compartidos',
      'Cuidado y nutrición mutuos',
    ],
    challenges: [
      'Pueden descuidar sus propias necesidades',
      'Exceso de responsabilidad compartida',
      'Codependencia',
    ],
  },
  {
    numbers: [6, 9],
    level: 'high',
    description:
      'El cuidador local y el humanitario global se unen en el servicio',
    strengths: [
      'Valores de servicio compartidos',
      'Compasión mutua',
      'Apoyo en el propósito de vida',
    ],
    challenges: [
      'El 6 puede sentir que el 9 descuida el hogar',
      'Diferentes escalas de servicio',
      'Sacrificio excesivo compartido',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 7 ===
  {
    numbers: [7, 7],
    level: 'medium',
    description:
      'Dos buscadores comparten profundidad intelectual pero pueden aislarse juntos',
    strengths: [
      'Profundidad intelectual y espiritual',
      'Respeto por la soledad del otro',
      'Búsqueda compartida de verdad',
    ],
    challenges: [
      'Aislamiento social conjunto',
      'Falta de expresión emocional',
      'Pueden ser demasiado analíticos',
    ],
  },
  {
    numbers: [7, 9],
    level: 'high',
    description:
      'El buscador personal y el sabio universal se complementan espiritualmente',
    strengths: [
      'Profundidad espiritual compartida',
      'Respeto mutuo por la búsqueda',
      'Comprensión intuitiva',
    ],
    challenges: [
      'Pueden ser demasiado idealistas',
      'Falta de practicidad conjunta',
      'Aislamiento del mundo material',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 8 ===
  {
    numbers: [8, 8],
    level: 'medium',
    description:
      'Dos magnates pueden construir imperios juntos o competir destructivamente',
    strengths: [
      'Ambición y poder compartidos',
      'Comprensión de metas materiales',
      'Capacidad de lograr éxito masivo',
    ],
    challenges: [
      'Competencia por el poder',
      'Workaholic compartido',
      'Falta de vulnerabilidad emocional',
    ],
  },

  // === COMPATIBILIDAD DEL NÚMERO 9 ===
  {
    numbers: [9, 9],
    level: 'high',
    description:
      'Dos humanitarios se unen en una visión compartida de servicio al mundo',
    strengths: [
      'Visión compartida de transformación',
      'Compasión mutua profunda',
      'Apoyo en el propósito de vida',
    ],
    challenges: [
      'Idealismo poco práctico conjunto',
      'Pueden descuidar lo personal por lo global',
      'Dificultad para soltar juntos',
    ],
  },

  // === NÚMEROS MAESTROS ===
  {
    numbers: [1, 11],
    level: 'high',
    description:
      'El líder práctico y el visionario espiritual se complementan perfectamente',
    strengths: [
      'Equilibrio entre visión y acción',
      'Liderazgo compartido',
      'Inspiración mutua',
    ],
    challenges: [
      'El 11 puede sentirse incomprendido',
      'Diferentes niveles de sensibilidad',
      'El 1 puede ser demasiado práctico para el 11',
    ],
  },
  {
    numbers: [2, 11],
    level: 'high',
    description:
      'El diplomático y el visionario crean una unión espiritualmente elevada',
    strengths: [
      'Sensibilidad compartida',
      'Conexión intuitiva profunda',
      'Apoyo espiritual mutuo',
    ],
    challenges: [
      'Hipersensibilidad conjunta',
      'Falta de aterrizamiento',
      'Pueden perderse en lo etéreo',
    ],
  },
  {
    numbers: [4, 22],
    level: 'high',
    description:
      'El constructor y el maestro constructor crean manifestaciones poderosas',
    strengths: [
      'Capacidad de manifestar grandes visiones',
      'Practicidad compartida',
      'Construcción de legados duraderos',
    ],
    challenges: [
      'Workaholic extremo',
      'El 22 puede frustrarse con el ritmo del 4',
      'Falta de flexibilidad',
    ],
  },
  {
    numbers: [6, 33],
    level: 'high',
    description:
      'El cuidador y el maestro sanador se unen en el servicio amoroso',
    strengths: [
      'Compasión y cuidado supremos',
      'Valores de servicio compartidos',
      'Capacidad de sanar a otros',
    ],
    challenges: [
      'Sacrificio excesivo conjunto',
      'Agotamiento emocional mutuo',
      'Descuido de necesidades propias',
    ],
  },
  {
    numbers: [11, 11],
    level: 'high',
    description:
      'Dos visionarios crean una conexión espiritualmente intensa y elevada',
    strengths: [
      'Conexión espiritual profunda',
      'Comprensión intuitiva mutua',
      'Inspiración compartida',
    ],
    challenges: [
      'Hipersensibilidad extrema',
      'Ansiedad conjunta',
      'Dificultad para aterrizar ideas',
    ],
  },
  {
    numbers: [11, 22],
    level: 'high',
    description:
      'El visionario y el constructor maestro combinan inspiración con manifestación',
    strengths: [
      'Visión elevada con capacidad de manifestación',
      'Complementariedad entre inspiración y acción',
      'Potencial de impacto masivo',
    ],
    challenges: [
      'Presión autoimpuesta extrema',
      'Expectativas muy altas',
      'Frustración si no se alcanzan metas',
    ],
  },
  {
    numbers: [22, 22],
    level: 'medium',
    description:
      'Dos constructores maestros pueden crear imperios o competir destructivamente',
    strengths: [
      'Capacidad de manifestación suprema',
      'Visión compartida de grandeza',
      'Poder de transformación masiva',
    ],
    challenges: [
      'Competencia por el liderazgo',
      'Workaholic extremo',
      'Expectativas imposibles mutuamente',
    ],
  },
  {
    numbers: [11, 33],
    level: 'high',
    description:
      'El visionario y el maestro sanador crean una unión espiritualmente suprema',
    strengths: [
      'Conexión espiritual máxima',
      'Capacidad de elevar consciencias',
      'Amor y comprensión profundos',
    ],
    challenges: [
      'Hipersensibilidad extrema',
      'Sacrificio excesivo compartido',
      'Dificultad con lo mundano',
    ],
  },
  {
    numbers: [22, 33],
    level: 'high',
    description:
      'El constructor maestro y el maestro sanador unen poder material con amor supremo',
    strengths: [
      'Manifestación con propósito elevado',
      'Capacidad de crear cambio masivo',
      'Equilibrio entre poder y compasión',
    ],
    challenges: [
      'Presión autoimpuesta extrema',
      'Expectativas irrealistas',
      'Agotamiento por responsabilidades percibidas',
    ],
  },
  {
    numbers: [33, 33],
    level: 'high',
    description:
      'Dos maestros sanadores crean una unión de amor y servicio supremos',
    strengths: [
      'Amor incondicional mutuo',
      'Compasión y comprensión máximas',
      'Capacidad de sanar al mundo juntos',
    ],
    challenges: [
      'Sacrificio excesivo extremo',
      'Agotamiento emocional mutuo',
      'Dificultad para poner límites',
    ],
  },
];

/**
 * Obtiene la compatibilidad entre dos números numerológicos
 * @param num1 - Primer número
 * @param num2 - Segundo número
 * @returns Objeto de compatibilidad o null si no existe
 */
export function getCompatibility(
  num1: number,
  num2: number,
): Compatibility | null {
  return (
    COMPATIBILITY_DATA.find(
      (c) =>
        (c.numbers[0] === num1 && c.numbers[1] === num2) ||
        (c.numbers[0] === num2 && c.numbers[1] === num1),
    ) || null
  );
}
