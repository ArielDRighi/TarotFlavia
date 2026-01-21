/**
 * Interpretaciones numerológicas para cada número (1-9 y maestros 11, 22, 33)
 */

export interface NumberInterpretation {
  number: number;
  name: string;
  keywords: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  careers: string[];
  isMaster: boolean;
}

export interface LifePathInterpretation extends NumberInterpretation {
  lifePurpose: string;
  lessonsToLearn: string[];
}

export const LIFE_PATH_INTERPRETATIONS: Record<number, LifePathInterpretation> =
  {
    1: {
      number: 1,
      name: 'El Líder',
      keywords: ['Independencia', 'Originalidad', 'Ambición'],
      description:
        'El número 1 representa el liderazgo y la individualidad. Las personas con este camino de vida son pioneras naturales, con una fuerte voluntad y determinación para alcanzar sus objetivos. Son innovadoras, independientes y tienen una gran capacidad para iniciar proyectos y abrir nuevos caminos.',
      strengths: [
        'Determinación y voluntad fuerte',
        'Capacidad de innovación y creatividad',
        'Independencia y autosuficiencia',
        'Liderazgo natural',
        'Valentía para tomar riesgos',
      ],
      challenges: [
        'Tendencia al egoísmo y el individualismo excesivo',
        'Dificultad para trabajar en equipo',
        'Impaciencia con los demás',
        'Necesidad de controlar situaciones',
        'Puede ser dominante o autoritario',
      ],
      careers: [
        'Empresario',
        'Director ejecutivo',
        'Inventor',
        'Freelancer',
        'Consultor independiente',
        'Líder de proyectos',
      ],
      lifePurpose:
        'Desarrollar la individualidad y liderar con el ejemplo, aprendiendo a equilibrar la ambición personal con la consideración hacia los demás',
      lessonsToLearn: [
        'Humildad y reconocimiento del valor de otros',
        'Colaboración y trabajo en equipo',
        'Paciencia con el ritmo de los demás',
      ],
      isMaster: false,
    },
    2: {
      number: 2,
      name: 'El Diplomático',
      keywords: ['Cooperación', 'Equilibrio', 'Sensibilidad'],
      description:
        'El número 2 representa la dualidad y la asociación. Las personas con este camino de vida son mediadoras naturales, con una gran sensibilidad emocional y capacidad para entender diferentes perspectivas. Son pacificadoras que buscan la armonía en todas las relaciones.',
      strengths: [
        'Excelente mediador y pacificador',
        'Intuición desarrollada y empatía',
        'Capacidad de escucha activa',
        'Diplomacia en situaciones conflictivas',
        'Habilidad para colaborar',
      ],
      challenges: [
        'Indecisión y falta de asertividad',
        'Dependencia emocional de otros',
        'Evitar conflictos excesivamente',
        'Tendencia a sobre-adaptarse',
        'Dificultad para establecer límites',
      ],
      careers: [
        'Mediador',
        'Consejero o terapeuta',
        'Artista',
        'Trabajador social',
        'Diplomático',
        'Recursos humanos',
      ],
      lifePurpose:
        'Crear armonía y servir de puente entre personas, aprendiendo a mantener el equilibrio sin perderse a sí mismo',
      lessonsToLearn: [
        'Asertividad y defensa de sus propias necesidades',
        'Independencia emocional',
        'Autoconfianza en la toma de decisiones',
      ],
      isMaster: false,
    },
    3: {
      number: 3,
      name: 'El Comunicador',
      keywords: ['Creatividad', 'Expresión', 'Alegría'],
      description:
        'El número 3 representa la creatividad y la autoexpresión. Las personas con este camino de vida son comunicadoras naturales, con un don para las artes, la palabra y la capacidad de inspirar a otros. Son optimistas, sociables y traen alegría a su entorno.',
      strengths: [
        'Gran creatividad y talento artístico',
        'Excelentes habilidades comunicativas',
        'Optimismo y actitud positiva',
        'Capacidad de inspirar y motivar',
        'Versatilidad y adaptabilidad',
      ],
      challenges: [
        'Dispersión y falta de enfoque',
        'Tendencia a la superficialidad',
        'Dificultad para terminar proyectos',
        'Exceso de optimismo poco realista',
        'Crítica hacia sí mismos',
      ],
      careers: [
        'Escritor',
        'Actor o artista',
        'Comunicador',
        'Diseñador',
        'Maestro',
        'Marketing y publicidad',
      ],
      lifePurpose:
        'Expresar su creatividad y alegría para inspirar y elevar a otros, aprendiendo a canalizar su energía de manera productiva',
      lessonsToLearn: [
        'Disciplina y constancia',
        'Profundidad en lugar de superficialidad',
        'Completar lo que empiezan',
      ],
      isMaster: false,
    },
    4: {
      number: 4,
      name: 'El Constructor',
      keywords: ['Estabilidad', 'Organización', 'Practicidad'],
      description:
        'El número 4 representa la estructura y la estabilidad. Las personas con este camino de vida son trabajadoras incansables, con una gran capacidad para construir bases sólidas y crear sistemas funcionales. Son confiables, metódicas y valoran la seguridad.',
      strengths: [
        'Gran capacidad de trabajo y dedicación',
        'Organización y planificación excelentes',
        'Confiabilidad y responsabilidad',
        'Practicidad y realismo',
        'Atención al detalle',
      ],
      challenges: [
        'Rigidez y resistencia al cambio',
        'Tendencia al workaholic',
        'Dificultad para expresar emociones',
        'Exceso de cautela',
        'Pueden ser tercos o inflexibles',
      ],
      careers: [
        'Arquitecto',
        'Ingeniero',
        'Contador',
        'Administrador',
        'Constructor',
        'Analista de sistemas',
      ],
      lifePurpose:
        'Crear estructuras y sistemas que proporcionen estabilidad, aprendiendo a equilibrar el trabajo con la flexibilidad y la vida personal',
      lessonsToLearn: [
        'Flexibilidad ante el cambio',
        'Equilibrio entre trabajo y vida personal',
        'Expresión emocional',
      ],
      isMaster: false,
    },
    5: {
      number: 5,
      name: 'El Aventurero',
      keywords: ['Libertad', 'Cambio', 'Versatilidad'],
      description:
        'El número 5 representa la libertad y la aventura. Las personas con este camino de vida son espíritus libres, con una sed insaciable de experiencias nuevas y diversas. Son versátiles, adaptables y prosperan en el cambio y la variedad.',
      strengths: [
        'Adaptabilidad excepcional',
        'Curiosidad y amor por el aprendizaje',
        'Versatilidad en múltiples áreas',
        'Valentía para el cambio',
        'Espíritu aventurero',
      ],
      challenges: [
        'Inquietud e incapacidad para comprometerse',
        'Tendencia a la impulsividad',
        'Dificultad para mantener rutinas',
        'Dispersión de energía',
        'Pueden ser irresponsables',
      ],
      careers: [
        'Viajero profesional',
        'Periodista',
        'Vendedor',
        'Consultor',
        'Emprendedor',
        'Agente de cambio',
      ],
      lifePurpose:
        'Experimentar la vida en toda su diversidad y promover el cambio positivo, aprendiendo a equilibrar la libertad con la responsabilidad',
      lessonsToLearn: [
        'Compromiso y perseverancia',
        'Responsabilidad con sus elecciones',
        'Enfoque en lugar de dispersión',
      ],
      isMaster: false,
    },
    6: {
      number: 6,
      name: 'El Cuidador',
      keywords: ['Responsabilidad', 'Armonía', 'Servicio'],
      description:
        'El número 6 representa el servicio y la responsabilidad familiar. Las personas con este camino de vida son cuidadoras naturales, con un fuerte sentido del deber hacia sus seres queridos y comunidad. Buscan crear armonía y belleza en su entorno.',
      strengths: [
        'Gran capacidad de cuidado y nutrición',
        'Sentido de responsabilidad desarrollado',
        'Habilidad para crear armonía',
        'Lealtad inquebrantable',
        'Amor por la belleza y el arte',
      ],
      challenges: [
        'Tendencia a sacrificarse excesivamente',
        'Interferencia en la vida de otros',
        'Dificultad para decir no',
        'Preocupación excesiva',
        'Perfeccionismo',
      ],
      careers: [
        'Maestro',
        'Enfermero',
        'Consejero familiar',
        'Diseñador de interiores',
        'Chef',
        'Trabajador comunitario',
      ],
      lifePurpose:
        'Servir y cuidar a otros creando armonía, aprendiendo a equilibrar sus necesidades con las de los demás',
      lessonsToLearn: [
        'Establecer límites saludables',
        'Autocuidado sin culpa',
        'Permitir que otros resuelvan sus propios problemas',
      ],
      isMaster: false,
    },
    7: {
      number: 7,
      name: 'El Buscador',
      keywords: ['Análisis', 'Introspección', 'Sabiduría'],
      description:
        'El número 7 representa la búsqueda espiritual y el conocimiento. Las personas con este camino de vida son pensadoras profundas, con una necesidad innata de entender los misterios de la vida. Son analíticas, intuitivas y valoran la soledad para la reflexión.',
      strengths: [
        'Capacidad analítica excepcional',
        'Intuición espiritual desarrollada',
        'Profundidad de pensamiento',
        'Amor por la sabiduría',
        'Habilidad investigadora',
      ],
      challenges: [
        'Aislamiento social excesivo',
        'Tendencia al escepticismo',
        'Dificultad para expresar emociones',
        'Perfeccionismo intelectual',
        'Pueden ser distantes o fríos',
      ],
      careers: [
        'Investigador',
        'Científico',
        'Filósofo',
        'Analista',
        'Escritor',
        'Guía espiritual',
      ],
      lifePurpose:
        'Buscar la verdad y compartir sabiduría, aprendiendo a equilibrar la vida intelectual con las conexiones humanas',
      lessonsToLearn: [
        'Conexión emocional con otros',
        'Confiar en la intuición además de la lógica',
        'Apertura en lugar de aislamiento',
      ],
      isMaster: false,
    },
    8: {
      number: 8,
      name: 'El Magnate',
      keywords: ['Poder', 'Abundancia', 'Autoridad'],
      description:
        'El número 8 representa el poder material y la autoridad. Las personas con este camino de vida tienen una gran capacidad para manifestar abundancia y éxito material. Son ambiciosas, con habilidades ejecutivas y un fuerte sentido de justicia.',
      strengths: [
        'Gran habilidad para los negocios',
        'Liderazgo ejecutivo',
        'Capacidad de manifestación material',
        'Sentido de justicia y equidad',
        'Confianza y autoridad natural',
      ],
      challenges: [
        'Materialismo excesivo',
        'Tendencia a ser controladores',
        'Workaholic',
        'Dificultad para mostrar vulnerabilidad',
        'Pueden ser dominantes',
      ],
      careers: [
        'CEO o ejecutivo',
        'Banquero',
        'Empresario',
        'Inversionista',
        'Abogado',
        'Político',
      ],
      lifePurpose:
        'Alcanzar el éxito material y usar el poder con integridad para crear abundancia que beneficie a otros',
      lessonsToLearn: [
        'Equilibrio entre lo material y lo espiritual',
        'Generosidad sin esperar retorno',
        'Vulnerabilidad y apertura emocional',
      ],
      isMaster: false,
    },
    9: {
      number: 9,
      name: 'El Humanitario',
      keywords: ['Compasión', 'Finalización', 'Universalidad'],
      description:
        'El número 9 representa la culminación y el servicio humanitario. Las personas con este camino de vida son almas compasivas, con una visión global y el deseo de contribuir al bienestar de la humanidad. Son idealistas, generosas y tienen una perspectiva amplia.',
      strengths: [
        'Compasión universal',
        'Visión amplia y global',
        'Generosidad desinteresada',
        'Capacidad de inspirar cambio social',
        'Sabiduría y madurez',
      ],
      challenges: [
        'Idealismo poco práctico',
        'Dificultad para establecer límites',
        'Tendencia al martirio',
        'Desilusión con la humanidad',
        'Dificultad para soltar el pasado',
      ],
      careers: [
        'Activista social',
        'Filántropo',
        'Artista',
        'Sanador',
        'Maestro',
        'Trabajador humanitario',
      ],
      lifePurpose:
        'Servir a la humanidad con compasión y ayudar en la transformación colectiva, aprendiendo a soltar y permitir finales necesarios',
      lessonsToLearn: [
        'Practicidad en el idealismo',
        'Autocuidado junto al servicio',
        'Soltar lo que ya cumplió su ciclo',
      ],
      isMaster: false,
    },
    11: {
      number: 11,
      name: 'El Visionario',
      keywords: ['Intuición', 'Iluminación', 'Inspiración'],
      description:
        'El 11 es un número maestro de alta vibración espiritual. Las personas con este camino de vida son iluminadoras naturales, con una intuición extraordinaria y la capacidad de inspirar a otros. Son visionarias que pueden ver más allá de lo ordinario y conectar con dimensiones superiores de consciencia.',
      strengths: [
        'Intuición extraordinaria y dones psíquicos',
        'Capacidad de inspirar y elevar a otros',
        'Conexión espiritual profunda',
        'Visión innovadora del futuro',
        'Sensibilidad refinada',
      ],
      challenges: [
        'Nerviosismo y ansiedad frecuentes',
        'Expectativas muy altas de sí mismos',
        'Dificultad para materializar ideas',
        'Hipersensibilidad emocional',
        'Pueden sentirse incomprendidos',
      ],
      careers: [
        'Líder espiritual',
        'Artista visionario',
        'Inventor',
        'Sanador energético',
        'Motivador',
        'Consejero espiritual',
      ],
      lifePurpose:
        'Iluminar y elevar la consciencia colectiva, sirviendo como canal de inspiración y sabiduría superior',
      lessonsToLearn: [
        'Practicidad y aterrizamiento',
        'Paciencia con el proceso de manifestación',
        'Autocontrol emocional',
      ],
      isMaster: true,
    },
    22: {
      number: 22,
      name: 'El Constructor Maestro',
      keywords: ['Manifestación', 'Visión', 'Poder'],
      description:
        'El 22 combina la visión del 11 con la practicidad del 4, siendo el más poderoso de todos los números. Las personas con este camino de vida tienen la capacidad de materializar grandes visiones y crear estructuras duraderas que beneficien a la humanidad. Son arquitectos del mundo material con propósito espiritual.',
      strengths: [
        'Capacidad de materializar grandes visiones',
        'Liderazgo natural y carismático',
        'Pensamiento a gran escala',
        'Habilidad para construir legados',
        'Combinación de practicidad y espiritualidad',
      ],
      challenges: [
        'Presión autoimpuesta extrema',
        'Tendencia al workaholic',
        'Frustración cuando no se alcanzan metas elevadas',
        'Dificultad para pedir ayuda',
        'Pueden ser dictatoriales',
      ],
      careers: [
        'Arquitecto de proyectos masivos',
        'Político transformador',
        'CEO visionario',
        'Filántropo',
        'Constructor de movimientos sociales',
        'Emprendedor social',
      ],
      lifePurpose:
        'Construir legados duraderos que beneficien a la humanidad, materializando visiones elevadas en estructuras concretas',
      lessonsToLearn: [
        'Equilibrio entre ambición y bienestar personal',
        'Delegación y trabajo en equipo',
        'Paciencia con los tiempos de manifestación',
      ],
      isMaster: true,
    },
    33: {
      number: 33,
      name: 'El Maestro Sanador',
      keywords: ['Compasión', 'Servicio', 'Amor incondicional'],
      description:
        'El 33 es el más elevado de los números maestros, representando el amor y la compasión en su máxima expresión. Las personas con este camino de vida son sanadores del mundo, con una capacidad extraordinaria para nutrir, enseñar y elevar a otros a través del amor incondicional. Combinan las cualidades del 11 y el 22 con un propósito de servicio puro.',
      strengths: [
        'Compasión ilimitada y amor incondicional',
        'Capacidad extraordinaria de sanar',
        'Devoción total al servicio',
        'Maestros naturales y guías',
        'Sacrificio inspirador',
      ],
      challenges: [
        'Sacrificio excesivo de sí mismos',
        'Agotamiento emocional y físico',
        'Descuidar sus propias necesidades',
        'Expectativas irrealistas de sí mismos',
        'Desilusión cuando otros no corresponden',
      ],
      careers: [
        'Sanador holístico',
        'Maestro espiritual',
        'Humanitario',
        'Artista que eleva consciencias',
        'Líder de movimientos de paz',
        'Consejero',
      ],
      lifePurpose:
        'Elevar a la humanidad a través del amor incondicional, enseñando y sanando con compasión suprema',
      lessonsToLearn: [
        'Autocuidado como prioridad',
        'Establecer límites saludables',
        'Equilibrio entre dar y recibir',
      ],
      isMaster: true,
    },
  };
