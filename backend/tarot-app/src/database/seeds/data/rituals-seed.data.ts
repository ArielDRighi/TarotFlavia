/**
 * Rituals Seed Data
 * Datos iniciales de rituales espirituales para poblar la base de datos
 *
 * Incluye rituales de diferentes categorías:
 * - Lunares (Luna Nueva, Luna Llena)
 * - Limpieza energética
 * - Tarot (Consagración de mazo)
 */

import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
} from '../../../modules/rituals/domain/enums';

export interface MaterialSeedData {
  name: string;
  description?: string;
  type: MaterialType;
  alternative?: string;
  quantity?: number;
  unit?: string;
}

export interface StepSeedData {
  stepNumber: number;
  title: string;
  description: string;
  durationSeconds?: number;
  imageUrl?: string;
  mantra?: string;
  visualization?: string;
}

export interface RitualSeedData {
  slug: string;
  title: string;
  description: string;
  category: RitualCategory;
  difficulty: RitualDifficulty;
  durationMinutes: number;
  bestLunarPhase?: LunarPhase;
  bestLunarPhases?: LunarPhase[];
  bestTimeOfDay?: string;
  purpose: string;
  preparation?: string;
  closing?: string;
  tips?: string[];
  imageUrl: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  isFeatured?: boolean;
  materials: MaterialSeedData[];
  steps: StepSeedData[];
}

export const RITUALS_SEED_DATA: RitualSeedData[] = [
  // ==================
  // RITUALES LUNARES
  // ==================
  {
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description:
      'Ceremonia para establecer intenciones y sembrar semillas de nuevos proyectos aprovechando la energía de la luna nueva.',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    bestTimeOfDay: 'Noche',
    purpose:
      'La luna nueva representa el inicio de un nuevo ciclo. Es el momento perfecto para plantar semillas de intención, comenzar proyectos y establecer metas para el mes lunar.',
    preparation:
      'Busca un espacio tranquilo donde no serás interrumpido. Apaga dispositivos electrónicos. Toma un baño o ducha para limpiar tu energía.',
    closing:
      'Agradece a la luna y al universo por escuchar tus intenciones. Guarda tu lista de intenciones en un lugar seguro para revisarla en luna llena.',
    tips: [
      'Escribe tus intenciones en presente, como si ya fueran realidad',
      'Sé específico pero flexible',
      'No establezcas más de 3-5 intenciones principales',
      'Revisa tus intenciones anteriores antes de crear nuevas',
    ],
    imageUrl: '/images/rituals/luna-nueva.jpg',
    thumbnailUrl: '/images/rituals/thumbs/luna-nueva.jpg',
    isFeatured: true,
    materials: [
      {
        name: 'Vela blanca o plateada',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Papel y bolígrafo',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Incienso de salvia o palo santo',
        type: MaterialType.OPTIONAL,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Cristal de cuarzo claro',
        type: MaterialType.OPTIONAL,
        alternative: 'Piedra de luna',
        quantity: 1,
        unit: 'unidad',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Preparar el espacio',
        description:
          'Limpia y ordena tu espacio sagrado. Enciende el incienso y permite que el humo purifique el área. Coloca tus materiales frente a ti.',
        durationSeconds: 180,
      },
      {
        stepNumber: 2,
        title: 'Encender la vela',
        description:
          'Enciende la vela blanca con intención. Mientras lo haces, di: "Enciendo esta luz para iluminar mi camino en este nuevo ciclo".',
        durationSeconds: 60,
      },
      {
        stepNumber: 3,
        title: 'Centrar la energía',
        description:
          'Cierra los ojos y realiza tres respiraciones profundas. Visualiza raíces creciendo desde tus pies hacia la tierra y luz blanca entrando por tu coronilla.',
        durationSeconds: 180,
        visualization:
          'Imagina una luz plateada de luna envolviendo todo tu ser, limpiando y renovando tu energía.',
      },
      {
        stepNumber: 4,
        title: 'Reflexionar',
        description:
          'Piensa en lo que deseas manifestar en este ciclo lunar. ¿Qué proyectos quieres iniciar? ¿Qué hábitos quieres desarrollar? ¿Qué metas quieres alcanzar?',
        durationSeconds: 300,
      },
      {
        stepNumber: 5,
        title: 'Escribir intenciones',
        description:
          'Escribe tus intenciones en el papel. Usa frases positivas y en tiempo presente. Por ejemplo: "Atraigo abundancia a mi vida" en lugar de "Quiero tener dinero".',
        durationSeconds: 420,
      },
      {
        stepNumber: 6,
        title: 'Activar las intenciones',
        description:
          'Sostén el papel cerca de tu corazón. Lee cada intención en voz alta con convicción. Siente como si ya fueran realidad.',
        durationSeconds: 240,
        mantra:
          'Bajo esta luna nueva, planto las semillas de mis deseos. Confío en que el universo conspira a mi favor.',
      },
      {
        stepNumber: 7,
        title: 'Sellar el ritual',
        description:
          'Dobla el papel y colócalo bajo la vela o junto al cristal. Deja que la vela se consuma de forma segura o apágala con gratitud.',
        durationSeconds: 120,
      },
    ],
  },

  {
    slug: 'ritual-luna-llena',
    title: 'Ritual de Luna Llena',
    description:
      'Ceremonia de liberación y gratitud para soltar lo que ya no te sirve y celebrar tus logros bajo la luna llena.',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 35,
    bestLunarPhase: LunarPhase.FULL_MOON,
    bestTimeOfDay: 'Noche, idealmente con la luna visible',
    purpose:
      'La luna llena es el momento de máxima energía del ciclo. Es perfecta para soltar lo que ya no necesitas, celebrar logros y cargar objetos con energía lunar.',
    preparation:
      'Revisa tus intenciones de luna nueva. Prepara una lista de lo que deseas soltar.',
    closing:
      'Agradece a la luna por su luz y guía. Si es posible, deja tus cristales bajo la luz de la luna para cargarlos.',
    tips: [
      'La energía de luna llena dura 3 días: el día anterior, el día de y el día después',
      'Evita tomar decisiones importantes bajo luna llena, las emociones están intensificadas',
      'Es buen momento para terminar proyectos',
    ],
    imageUrl: '/images/rituals/luna-llena.jpg',
    thumbnailUrl: '/images/rituals/thumbs/luna-llena.jpg',
    isFeatured: true,
    materials: [
      {
        name: 'Vela blanca',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Papel y bolígrafo',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Recipiente resistente al fuego',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Agua en un bowl',
        description: 'Para cargar con energía lunar',
        type: MaterialType.OPTIONAL,
        quantity: 1,
        unit: 'bowl',
      },
      {
        name: 'Cristales para cargar',
        type: MaterialType.OPTIONAL,
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Preparar el espacio',
        description:
          'Ubícate donde puedas ver la luna si es posible. Prepara tu altar con los materiales.',
        durationSeconds: 180,
      },
      {
        stepNumber: 2,
        title: 'Conectar con la luna',
        description:
          'Mira hacia la luna (o imagínala). Siente su luz bañándote. Respira profundamente tres veces.',
        durationSeconds: 120,
        visualization:
          'Imagina la luz plateada de la luna entrando por tu coronilla y llenando todo tu cuerpo de luz.',
      },
      {
        stepNumber: 3,
        title: 'Gratitud',
        description:
          'Piensa en todo lo que has logrado desde la última luna nueva. Agradece cada pequeño y gran logro en voz alta.',
        durationSeconds: 300,
      },
      {
        stepNumber: 4,
        title: 'Escribir lo que sueltas',
        description:
          'En el papel, escribe todo lo que deseas soltar: miedos, malos hábitos, relaciones tóxicas, creencias limitantes.',
        durationSeconds: 300,
      },
      {
        stepNumber: 5,
        title: 'Ritual de liberación',
        description:
          'Lee en voz alta lo que sueltas. Luego, con cuidado y de forma segura, quema el papel en el recipiente.',
        durationSeconds: 240,
        mantra:
          'Bajo esta luna llena, libero lo que ya no me sirve. Hago espacio para nuevas bendiciones.',
      },
      {
        stepNumber: 6,
        title: 'Cargar objetos',
        description:
          'Si tienes cristales o agua, colócalos bajo la luz de la luna. Pide que se carguen con energía lunar.',
        durationSeconds: 120,
      },
      {
        stepNumber: 7,
        title: 'Cierre con gratitud',
        description:
          'Agradece a la luna y apaga la vela. Permanece unos minutos en silencio, sintiendo la paz de la liberación.',
        durationSeconds: 180,
      },
    ],
  },

  // ==================
  // RITUALES DE LIMPIEZA
  // ==================
  {
    slug: 'limpieza-energetica-hogar',
    title: 'Limpieza Energética del Hogar',
    description:
      'Ritual para purificar y renovar la energía de tu espacio vital, eliminando energías estancadas y negativas.',
    category: RitualCategory.CLEANSING,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 45,
    bestLunarPhases: [
      LunarPhase.WANING_GIBBOUS,
      LunarPhase.LAST_QUARTER,
      LunarPhase.WANING_CRESCENT,
    ],
    bestTimeOfDay: 'Mañana, con luz natural',
    purpose:
      'Eliminar energías estancadas, negativas o de visitantes. Renovar la vibración del hogar. Ideal después de discusiones, enfermedades o simplemente para mantenimiento energético.',
    preparation:
      'Limpia físicamente tu hogar primero. Abre ventanas para permitir el flujo de energía. Desecha objetos rotos.',
    closing:
      'Cierra las ventanas después de 10 minutos. Coloca protecciones en las entradas (sal, plantas).',
    tips: [
      'Realiza este ritual al menos una vez al mes',
      'Presta especial atención a esquinas y detrás de puertas',
      'Los espejos acumulan mucha energía, limpia su superficie mientras humeas',
    ],
    imageUrl: '/images/rituals/limpieza-hogar.jpg',
    thumbnailUrl: '/images/rituals/thumbs/limpieza-hogar.jpg',
    materials: [
      {
        name: 'Salvia blanca o palo santo',
        type: MaterialType.REQUIRED,
        alternative: 'Incienso de sándalo',
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Recipiente para cenizas',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Sal gruesa',
        type: MaterialType.OPTIONAL,
        quantity: 100,
        unit: 'gramos',
      },
      {
        name: 'Campana o cuenco tibetano',
        type: MaterialType.OPTIONAL,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Spray de agua florida',
        type: MaterialType.OPTIONAL,
        quantity: 1,
        unit: 'unidad',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Preparación',
        description:
          'Abre todas las ventanas de la casa. Enciende tu salvia o palo santo de forma segura.',
        durationSeconds: 180,
      },
      {
        stepNumber: 2,
        title: 'Establecer intención',
        description:
          'Antes de comenzar, establece tu intención en voz alta: "Limpio este espacio de toda energía que no me pertenece o no me beneficia".',
        durationSeconds: 60,
        mantra:
          'Limpio y purifico este espacio. Solo la luz y el amor pueden permanecer aquí.',
      },
      {
        stepNumber: 3,
        title: 'Comenzar por la entrada',
        description:
          'Empieza por la puerta principal. Mueve el humo en círculos, prestando atención al marco de la puerta.',
        durationSeconds: 120,
      },
      {
        stepNumber: 4,
        title: 'Recorrer cada habitación',
        description:
          'Camina por cada habitación en sentido horario. Enfócate en esquinas, detrás de puertas y cerca de ventanas donde la energía se estanca.',
        durationSeconds: 900,
      },
      {
        stepNumber: 5,
        title: 'Prestar atención especial',
        description:
          'En el dormitorio, pasa el humo alrededor de la cama. En la cocina, alrededor de la estufa. En el baño, especialmente el espejo.',
        durationSeconds: 300,
      },
      {
        stepNumber: 6,
        title: 'Sellar con sonido',
        description:
          'Si tienes campana o cuenco, hazlo sonar en cada habitación. El sonido rompe patrones energéticos estancados.',
        durationSeconds: 180,
      },
      {
        stepNumber: 7,
        title: 'Proteger entradas',
        description:
          'Coloca una línea de sal en las entradas principales (puerta y ventanas). Esto crea una barrera protectora.',
        durationSeconds: 180,
      },
      {
        stepNumber: 8,
        title: 'Cierre',
        description:
          'Regresa a la entrada principal. Agradece y declara tu espacio limpio y protegido. Cierra las ventanas después de 10 minutos.',
        durationSeconds: 120,
      },
    ],
  },

  // ==================
  // RITUALES DE TAROT
  // ==================
  {
    slug: 'consagracion-mazo-tarot',
    title: 'Consagración de Mazo de Tarot',
    description:
      'Ritual para conectar energéticamente con un nuevo mazo de tarot y prepararlo para lecturas.',
    category: RitualCategory.TAROT,
    difficulty: RitualDifficulty.INTERMEDIATE,
    durationMinutes: 40,
    bestLunarPhase: LunarPhase.NEW_MOON,
    bestTimeOfDay: 'Noche tranquila',
    purpose:
      'Crear un vínculo energético entre tú y tu nuevo mazo. Limpiar energías de fabricación y transporte. Activar las cartas para lecturas precisas.',
    preparation:
      'Ten tu mazo nuevo sin abrir o recién abierto. Asegúrate de tener privacidad.',
    closing:
      'Guarda tu mazo en una bolsa de tela o caja especial. Duerme con él bajo tu almohada la primera noche.',
    tips: [
      'No permitas que otros toquen tu mazo personal',
      'Puedes repetir este ritual si sientes que el mazo necesita reconexión',
      'Algunos tarotistas tienen mazos para uso personal y otros para clientes',
    ],
    imageUrl: '/images/rituals/consagracion-tarot.jpg',
    thumbnailUrl: '/images/rituals/thumbs/consagracion-tarot.jpg',
    materials: [
      {
        name: 'Mazo de tarot nuevo',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Vela blanca',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Incienso',
        description: 'Preferiblemente sándalo',
        type: MaterialType.REQUIRED,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Tela de seda o terciopelo',
        type: MaterialType.OPTIONAL,
        quantity: 1,
        unit: 'unidad',
      },
      {
        name: 'Cristal de cuarzo claro',
        type: MaterialType.OPTIONAL,
        quantity: 1,
        unit: 'unidad',
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Crear espacio sagrado',
        description:
          'Limpia tu área de trabajo. Enciende la vela y el incienso. Coloca la tela como base para trabajar.',
        durationSeconds: 180,
      },
      {
        stepNumber: 2,
        title: 'Desempacar con intención',
        description:
          'Abre tu mazo con reverencia. Si viene envuelto, hazlo conscientemente, como si abrieras un regalo sagrado.',
        durationSeconds: 120,
      },
      {
        stepNumber: 3,
        title: 'Primera conexión',
        description:
          'Sostén el mazo completo entre tus manos. Cierra los ojos y respira profundamente. Siente la energía del mazo.',
        durationSeconds: 180,
        visualization:
          'Imagina una luz dorada fluyendo de tus manos hacia el mazo, y del mazo hacia tus manos, creando un circuito.',
      },
      {
        stepNumber: 4,
        title: 'Limpiar con humo',
        description:
          'Pasa cada carta a través del humo del incienso, o pasa el incienso alrededor del mazo completo.',
        durationSeconds: 300,
      },
      {
        stepNumber: 5,
        title: 'Conocer las cartas',
        description:
          'Revisa carta por carta, mirando la imagen de cada una. No intentes memorizarlas, solo observa y siente.',
        durationSeconds: 600,
      },
      {
        stepNumber: 6,
        title: 'Declaración de intención',
        description:
          'Sostén el mazo y declara tu intención para su uso. Por ejemplo: "Este mazo me servirá como puente hacia la sabiduría interior".',
        durationSeconds: 120,
        mantra:
          'Consagro este mazo a la búsqueda de verdad y guía. Que sus mensajes sean claros y para el mayor bien.',
      },
      {
        stepNumber: 7,
        title: 'Primera tirada',
        description:
          'Mezcla las cartas con tu energía. Saca una carta preguntando: "¿Qué mensaje tienes para mí?". Reflexiona sobre su significado.',
        durationSeconds: 300,
      },
      {
        stepNumber: 8,
        title: 'Cierre y almacenamiento',
        description:
          'Agradece al mazo. Envuélvelo en la tela y guárdalo en un lugar especial. Apaga la vela con gratitud.',
        durationSeconds: 120,
      },
    ],
  },
];
