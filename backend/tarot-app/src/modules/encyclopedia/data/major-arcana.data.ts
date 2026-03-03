import {
  ArcanaType,
  Element,
  Planet,
  ZodiacAssociation,
} from '../enums/tarot.enums';
import { CardSeedData } from './cards-seed.data';

/**
 * Datos de los 22 Arcanos Mayores del Tarot
 * Numerados del 0 (El Loco) al 21 (El Mundo)
 */
export const MAJOR_ARCANA_DATA: CardSeedData[] = [
  {
    slug: 'the-fool',
    nameEn: 'The Fool',
    nameEs: 'El Loco',
    arcanaType: ArcanaType.MAJOR,
    number: 0,
    romanNumeral: '0',
    element: Element.AIR,
    planet: Planet.URANUS,
    meaningUpright:
      'Nuevos comienzos, inocencia, espontaneidad, aventura y espíritu libre. El Loco representa el inicio de un viaje sin miedo al futuro, confiando en el universo.',
    meaningReversed:
      'Imprudencia, irresponsabilidad, ingenuidad excesiva y tomar riesgos sin considerar las consecuencias. Necesidad de reflexión antes de actuar.',
    description:
      'El Loco es la carta número 0 del Tarot, el alma en su estado más puro antes de comenzar el viaje de la vida. Representa la inocencia, la libertad y el potencial ilimitado. Un joven camina hacia el borde de un precipicio mirando al cielo, con un pequeño bolso al hombro, simbolizando que lo lleva todo consigo sin cargar con el pasado.',
    keywords: {
      upright: [
        'nuevos comienzos',
        'inocencia',
        'aventura',
        'libertad',
        'espontaneidad',
        'fe',
      ],
      reversed: [
        'imprudencia',
        'irresponsabilidad',
        'ingenuidad',
        'falta de dirección',
        'riesgo excesivo',
      ],
    },
    imageUrl: '/images/tarot/major/00-the-fool.jpg',
  },
  {
    slug: 'the-magician',
    nameEn: 'The Magician',
    nameEs: 'El Mago',
    arcanaType: ArcanaType.MAJOR,
    number: 1,
    romanNumeral: 'I',
    element: Element.AIR,
    planet: Planet.MERCURY,
    meaningUpright:
      'Manifestación, poder personal, habilidad, concentración y voluntad. El Mago tiene todas las herramientas necesarias para crear su realidad y actuar con determinación.',
    meaningReversed:
      'Manipulación, ilusión, talentos desperdiciados y falta de claridad de propósito. Cuidado con el engaño propio o ajeno.',
    description:
      'El Mago está de pie ante una mesa con los cuatro símbolos de los palos del tarot: una copa, una espada, una vara y un pentáculo. Con una mano señala al cielo y con la otra a la tierra, canalizando la energía del universo. Representa el poder de la voluntad consciente para transformar la realidad.',
    keywords: {
      upright: [
        'manifestación',
        'poder',
        'habilidad',
        'voluntad',
        'concentración',
        'creatividad',
      ],
      reversed: [
        'manipulación',
        'engaño',
        'talentos sin usar',
        'falta de energía',
        'ilusión',
      ],
    },
    imageUrl: '/images/tarot/major/01-the-magician.jpg',
  },
  {
    slug: 'the-high-priestess',
    nameEn: 'The High Priestess',
    nameEs: 'La Suma Sacerdotisa',
    arcanaType: ArcanaType.MAJOR,
    number: 2,
    romanNumeral: 'II',
    element: Element.WATER,
    planet: Planet.MOON,
    meaningUpright:
      'Intuición, sabiduría interior, misterio, subconsciente y conocimiento espiritual. La Suma Sacerdotisa invita a confiar en la voz interior y los sueños.',
    meaningReversed:
      'Secretos ocultos, desconexión de la intuición, información retenida y confusión interior. Se ignoran las señales intuitivas.',
    description:
      'La Suma Sacerdotisa está sentada entre dos columnas, Boaz y Jakin, guardando el velo del Templo. Sostiene un pergamino parcialmente oculto y lleva una corona con una luna creciente a sus pies. Representa el conocimiento oculto, la sabiduría femenina y el acceso a los misterios del subconsciente.',
    keywords: {
      upright: [
        'intuición',
        'sabiduría',
        'misterio',
        'subconsciente',
        'espiritualidad',
        'paciencia',
      ],
      reversed: [
        'secretos',
        'confusión',
        'falta de intuición',
        'información oculta',
        'desconexión espiritual',
      ],
    },
    imageUrl: '/images/tarot/major/02-the-high-priestess.jpg',
  },
  {
    slug: 'the-empress',
    nameEn: 'The Empress',
    nameEs: 'La Emperatriz',
    arcanaType: ArcanaType.MAJOR,
    number: 3,
    romanNumeral: 'III',
    element: Element.EARTH,
    planet: Planet.VENUS,
    meaningUpright:
      'Feminidad, fertilidad, abundancia, naturaleza y nurtura. La Emperatriz representa la creación, la sensualidad y la conexión con la madre tierra.',
    meaningReversed:
      'Dependencia, sofocación, bloqueo creativo y descuido de uno mismo. Desequilibrio en la relación con la naturaleza y el cuerpo.',
    description:
      'La Emperatriz está sentada en un trono rodeada de exuberante vegetación, con una corona de doce estrellas y un cetro. Representa la fertilidad, la abundancia y el poder creativo de la naturaleza. Es la madre del Tarot, la fuente de toda vida y prosperidad material.',
    keywords: {
      upright: [
        'fertilidad',
        'abundancia',
        'feminidad',
        'naturaleza',
        'creatividad',
        'nurtura',
      ],
      reversed: [
        'bloqueo creativo',
        'dependencia',
        'descuido',
        'sofocación',
        'infertilidad',
      ],
    },
    imageUrl: '/images/tarot/major/03-the-empress.jpg',
  },
  {
    slug: 'the-emperor',
    nameEn: 'The Emperor',
    nameEs: 'El Emperador',
    arcanaType: ArcanaType.MAJOR,
    number: 4,
    romanNumeral: 'IV',
    element: Element.FIRE,
    zodiacSign: ZodiacAssociation.ARIES,
    meaningUpright:
      'Autoridad, estructura, estabilidad, disciplina y liderazgo. El Emperador representa el poder paternal, el orden establecido y la capacidad de gobernar con sabiduría.',
    meaningReversed:
      'Tiranía, rigidez excesiva, abuso de autoridad y falta de flexibilidad. Control excesivo que sofoca el crecimiento.',
    description:
      'El Emperador está sentado en un trono de granito adornado con cabezas de carnero, sosteniendo un cetro y un orbe. Viste armadura bajo su manto rojo, simbolizando que está preparado para defender su reino. Representa el poder masculino, la autoridad establecida y la capacidad de crear estructuras duraderas.',
    keywords: {
      upright: [
        'autoridad',
        'estructura',
        'estabilidad',
        'liderazgo',
        'disciplina',
        'protección',
      ],
      reversed: [
        'tiranía',
        'rigidez',
        'abuso de poder',
        'falta de disciplina',
        'control excesivo',
      ],
    },
    imageUrl: '/images/tarot/major/04-the-emperor.jpg',
  },
  {
    slug: 'the-hierophant',
    nameEn: 'The Hierophant',
    nameEs: 'El Hierofante',
    arcanaType: ArcanaType.MAJOR,
    number: 5,
    romanNumeral: 'V',
    element: Element.EARTH,
    zodiacSign: ZodiacAssociation.TAURUS,
    meaningUpright:
      'Tradición, instituciones, conformidad, espiritualidad formal y sabiduría transmitida. El Hierofante guía a través del conocimiento espiritual establecido.',
    meaningReversed:
      'Dogmatismo, rebeldía ante las normas, cuestionamiento de la tradición y búsqueda de un camino espiritual propio fuera de las instituciones.',
    description:
      'El Hierofante está sentado en un trono entre dos pilares, bendiciendo a dos monjes arrodillados ante él. Lleva una triple corona y sostiene un cetro papal. Representa la tradición religiosa, la sabiduría institucional y el papel del maestro espiritual en la transmisión del conocimiento sagrado.',
    keywords: {
      upright: [
        'tradición',
        'espiritualidad',
        'institución',
        'conformidad',
        'sabiduría',
        'guía espiritual',
      ],
      reversed: [
        'dogmatismo',
        'rebeldía',
        'heterodoxia',
        'cuestionamiento',
        'rechazo a la tradición',
      ],
    },
    imageUrl: '/images/tarot/major/05-the-hierophant.jpg',
  },
  {
    slug: 'the-lovers',
    nameEn: 'The Lovers',
    nameEs: 'Los Enamorados',
    arcanaType: ArcanaType.MAJOR,
    number: 6,
    romanNumeral: 'VI',
    element: Element.AIR,
    zodiacSign: ZodiacAssociation.GEMINI,
    meaningUpright:
      'Amor, armonía, relaciones, valores y elecciones importantes. Los Enamorados representan la unión, la alineación con los valores personales y las decisiones del corazón.',
    meaningReversed:
      'Desalineación de valores, relaciones desequilibradas, decisiones apresuradas y conflictos internos sobre lo que realmente se desea.',
    description:
      'Una pareja está desnuda bajo la bendición de un ángel, con el Árbol del Conocimiento detrás de la mujer y el Árbol de la Vida detrás del hombre. Representa la unión armoniosa, las elecciones de vida importantes y el amor que trasciende lo físico para convertirse en un encuentro de almas.',
    keywords: {
      upright: [
        'amor',
        'armonía',
        'relaciones',
        'elecciones',
        'valores',
        'conexión',
      ],
      reversed: [
        'desalineación',
        'desequilibrio',
        'conflicto interno',
        'mala decisión',
        'relación tóxica',
      ],
    },
    imageUrl: '/images/tarot/major/06-the-lovers.jpg',
  },
  {
    slug: 'the-chariot',
    nameEn: 'The Chariot',
    nameEs: 'El Carro',
    arcanaType: ArcanaType.MAJOR,
    number: 7,
    romanNumeral: 'VII',
    element: Element.WATER,
    zodiacSign: ZodiacAssociation.CANCER,
    meaningUpright:
      'Control, voluntad, victoria, determinación y confianza. El Carro representa el triunfo a través de la disciplina y el control de las fuerzas opuestas.',
    meaningReversed:
      'Falta de control, agresión, dispersión de energía y viaje bloqueado. Las fuerzas internas en conflicto impiden el avance.',
    description:
      'Un guerrero victorioso conduce un carro tirado por dos esfinges, una negra y una blanca, representando las fuerzas opuestas que debe controlar. Lleva una corona de estrellas y sostiene un cetro. Representa el triunfo de la voluntad sobre los obstáculos mediante la disciplina y el enfoque mental.',
    keywords: {
      upright: [
        'victoria',
        'control',
        'determinación',
        'voluntad',
        'disciplina',
        'éxito',
      ],
      reversed: [
        'falta de control',
        'agresión',
        'bloqueo',
        'dispersión',
        'derrota',
      ],
    },
    imageUrl: '/images/tarot/major/07-the-chariot.jpg',
  },
  {
    slug: 'strength',
    nameEn: 'Strength',
    nameEs: 'La Fuerza',
    arcanaType: ArcanaType.MAJOR,
    number: 8,
    romanNumeral: 'VIII',
    element: Element.FIRE,
    zodiacSign: ZodiacAssociation.LEO,
    meaningUpright:
      'Fortaleza interior, coraje, paciencia, compasión y control sobre los impulsos. La Fuerza muestra que el verdadero poder viene de la gentileza y la perseverancia.',
    meaningReversed:
      'Inseguridad, debilidad, falta de autocontrol y dudas sobre la propia capacidad. Los miedos internos obstaculizan el crecimiento.',
    description:
      'Una mujer con suavidad cierra las fauces de un león, mostrando que lo domina con amor y no con fuerza bruta. Sobre su cabeza flota el símbolo del infinito. Representa el poder interior, la valentía tranquila y la capacidad de transformar la bestia que llevamos dentro mediante la compasión y la paciencia.',
    keywords: {
      upright: [
        'fortaleza',
        'coraje',
        'paciencia',
        'compasión',
        'autocontrol',
        'perseverancia',
      ],
      reversed: [
        'inseguridad',
        'debilidad',
        'falta de autocontrol',
        'cobardía',
        'impulsividad',
      ],
    },
    imageUrl: '/images/tarot/major/08-strength.jpg',
  },
  {
    slug: 'the-hermit',
    nameEn: 'The Hermit',
    nameEs: 'El Ermitaño',
    arcanaType: ArcanaType.MAJOR,
    number: 9,
    romanNumeral: 'IX',
    element: Element.EARTH,
    zodiacSign: ZodiacAssociation.VIRGO,
    meaningUpright:
      'Introspección, soledad, orientación interior, búsqueda de la verdad y sabiduría. El Ermitaño invita a retirarse del mundo para encontrar respuestas dentro de uno mismo.',
    meaningReversed:
      'Aislamiento excesivo, soledad no deseada, rechazo de la ayuda y perderse en el camino espiritual sin guía.',
    description:
      'Un anciano de larga barba blanca está de pie en la cima de una montaña nevada, sosteniendo un farol que ilumina el camino y un bastón. Representa la búsqueda de la verdad interior, el retiro consciente para la reflexión profunda y la iluminación que proviene del autoconocimiento.',
    keywords: {
      upright: [
        'introspección',
        'soledad',
        'sabiduría',
        'orientación',
        'contemplación',
        'búsqueda interior',
      ],
      reversed: [
        'aislamiento',
        'soledad excesiva',
        'reclusión',
        'pérdida de dirección',
        'rechazo',
      ],
    },
    imageUrl: '/images/tarot/major/09-the-hermit.jpg',
  },
  {
    slug: 'wheel-of-fortune',
    nameEn: 'Wheel of Fortune',
    nameEs: 'La Rueda de la Fortuna',
    arcanaType: ArcanaType.MAJOR,
    number: 10,
    romanNumeral: 'X',
    element: Element.FIRE,
    planet: Planet.JUPITER,
    meaningUpright:
      'Ciclos, destino, buena suerte, cambio de circunstancias y punto de inflexión. La Rueda gira siempre y los cambios son parte natural de la existencia.',
    meaningReversed:
      'Mala suerte, resistencia al cambio, rupturas de ciclos negativos y falta de control sobre los acontecimientos externos.',
    description:
      'Una gran rueda gira en el centro de la carta, con figuras ascendiendo y descendiendo. En las esquinas están los cuatro seres vivientes del Apocalipsis. La rueda tiene inscripciones esotéricas y representa los ciclos de la vida, la fortuna cambiante y las fuerzas del destino que mueven la existencia.',
    keywords: {
      upright: [
        'ciclos',
        'destino',
        'suerte',
        'cambio',
        'punto de inflexión',
        'oportunidad',
      ],
      reversed: [
        'mala suerte',
        'resistencia',
        'stagnación',
        'ciclos negativos',
        'falta de control',
      ],
    },
    imageUrl: '/images/tarot/major/10-wheel-of-fortune.jpg',
  },
  {
    slug: 'justice',
    nameEn: 'Justice',
    nameEs: 'La Justicia',
    arcanaType: ArcanaType.MAJOR,
    number: 11,
    romanNumeral: 'XI',
    element: Element.AIR,
    zodiacSign: ZodiacAssociation.LIBRA,
    meaningUpright:
      'Justicia, verdad, imparcialidad, causa y efecto, ley y equilibrio. La Justicia representa las consecuencias de las acciones y la necesidad de actuar con integridad.',
    meaningReversed:
      'Injusticia, deshonestidad, falta de responsabilidad y evitar las consecuencias de los propios actos.',
    description:
      'Una figura de justicia está sentada en un trono entre dos columnas, sosteniendo una espada en la mano derecha y una balanza en la izquierda. Representa la imparcialidad, la verdad objetiva y la ley del karma: que toda acción tiene consecuencias proporcionales.',
    keywords: {
      upright: [
        'justicia',
        'verdad',
        'imparcialidad',
        'causa y efecto',
        'integridad',
        'ley',
      ],
      reversed: [
        'injusticia',
        'deshonestidad',
        'falta de responsabilidad',
        'sesgo',
        'evasión',
      ],
    },
    imageUrl: '/images/tarot/major/11-justice.jpg',
  },
  {
    slug: 'the-hanged-man',
    nameEn: 'The Hanged Man',
    nameEs: 'El Colgado',
    arcanaType: ArcanaType.MAJOR,
    number: 12,
    romanNumeral: 'XII',
    element: Element.WATER,
    planet: Planet.NEPTUNE,
    meaningUpright:
      'Pausa, rendición, perspectiva nueva, sacrificio voluntario e iluminación. El Colgado elige detenerse para ganar claridad desde un punto de vista diferente.',
    meaningReversed:
      'Demora, resistencia al sacrificio necesario, martirio y apego excesivo que impide el progreso.',
    description:
      'Un hombre cuelga boca abajo de un árbol vivo por un pie, con el otro pie cruzado formando una cruz. Su expresión es serena y tiene un halo de luz alrededor de la cabeza. Representa la voluntad de rendirse, cambiar la perspectiva y encontrar iluminación a través del sacrificio consciente.',
    keywords: {
      upright: [
        'pausa',
        'rendición',
        'nueva perspectiva',
        'sacrificio',
        'iluminación',
        'reflexión',
      ],
      reversed: ['demora', 'resistencia', 'martirio', 'apego', 'indecisión'],
    },
    imageUrl: '/images/tarot/major/12-the-hanged-man.jpg',
  },
  {
    slug: 'death',
    nameEn: 'Death',
    nameEs: 'La Muerte',
    arcanaType: ArcanaType.MAJOR,
    number: 13,
    romanNumeral: 'XIII',
    element: Element.WATER,
    zodiacSign: ZodiacAssociation.SCORPIO,
    meaningUpright:
      'Transformación, finales, transición, cambio inevitable y renovación. La Muerte rara vez significa muerte física; representa el cierre de un ciclo para que comience uno nuevo.',
    meaningReversed:
      'Resistencia al cambio, incapacidad de soltar el pasado y aferrarse a lo que ya terminó impidiendo la transformación necesaria.',
    description:
      'Un esqueleto con armadura negra montado en un caballo blanco avanza mientras figuras de todos los estratos sociales caen ante él. Lleva una bandera con una rosa blanca. Detrás, el sol sale entre dos torres. Representa el cambio inevitable, los finales necesarios y la promesa de renovación tras cada cierre.',
    keywords: {
      upright: [
        'transformación',
        'fin de ciclo',
        'transición',
        'cambio',
        'renovación',
        'liberación',
      ],
      reversed: [
        'resistencia al cambio',
        'apego al pasado',
        'estancamiento',
        'miedo a lo nuevo',
        'negación',
      ],
    },
    imageUrl: '/images/tarot/major/13-death.jpg',
  },
  {
    slug: 'temperance',
    nameEn: 'Temperance',
    nameEs: 'La Templanza',
    arcanaType: ArcanaType.MAJOR,
    number: 14,
    romanNumeral: 'XIV',
    element: Element.FIRE,
    zodiacSign: ZodiacAssociation.SAGITTARIUS,
    meaningUpright:
      'Equilibrio, moderación, paciencia, propósito y flujo. La Templanza representa la integración armoniosa de opuestos y la búsqueda del camino del medio.',
    meaningReversed:
      'Desequilibrio, excesos, falta de moderación, impaciencia y conflicto entre aspectos de la vida que no se integran bien.',
    description:
      'Un ángel andrógino está de pie con un pie en el agua y otro en tierra, transfiriendo agua entre dos copas doradas. Tiene un triángulo dentro de un cuadrado en el pecho y un halo solar. Representa la alquimia personal, la moderación, el equilibrio entre lo espiritual y lo material, y la paciencia del tiempo.',
    keywords: {
      upright: [
        'equilibrio',
        'moderación',
        'paciencia',
        'armonía',
        'propósito',
        'integración',
      ],
      reversed: [
        'desequilibrio',
        'exceso',
        'impaciencia',
        'conflicto',
        'falta de moderación',
      ],
    },
    imageUrl: '/images/tarot/major/14-temperance.jpg',
  },
  {
    slug: 'the-devil',
    nameEn: 'The Devil',
    nameEs: 'El Diablo',
    arcanaType: ArcanaType.MAJOR,
    number: 15,
    romanNumeral: 'XV',
    element: Element.EARTH,
    zodiacSign: ZodiacAssociation.CAPRICORN,
    meaningUpright:
      'Sombra, apego, adicciones, materialismo y restricciones autoimpuestas. El Diablo representa las cadenas con las que nos atamos a nosotros mismos por miedo o deseo.',
    meaningReversed:
      'Liberación de ataduras, ruptura de cadenas, recuperación de poder personal y confrontación con las propias sombras.',
    description:
      'Una figura demoníaca con alas de murciélago y patas de cabra está sentada en un pedestal al que están encadenados un hombre y una mujer. Sin embargo, las cadenas son lo suficientemente amplias para quitárselas. Representa los vínculos que nosotros mismos creamos, las adicciones, los miedos y las ilusiones que nos mantienen prisioneros.',
    keywords: {
      upright: [
        'sombra',
        'ataduras',
        'adicción',
        'materialismo',
        'restricción',
        'obsesión',
      ],
      reversed: [
        'liberación',
        'ruptura de cadenas',
        'recuperación',
        'confrontación',
        'desapego',
      ],
    },
    imageUrl: '/images/tarot/major/15-the-devil.jpg',
  },
  {
    slug: 'the-tower',
    nameEn: 'The Tower',
    nameEs: 'La Torre',
    arcanaType: ArcanaType.MAJOR,
    number: 16,
    romanNumeral: 'XVI',
    element: Element.FIRE,
    planet: Planet.MARS,
    meaningUpright:
      'Caos repentino, destrucción de lo construido sobre bases falsas, revelación súbita y colapso inevitable. La Torre destruye lo que no sirve para permitir una reconstrucción más sólida.',
    meaningReversed:
      'Evitar el colapso necesario, resistirse a la transformación urgente o vivir con miedo constante a un desastre inminente.',
    description:
      'Un rayo impacta la cima de una torre, derribando su corona dorada mientras figuras caen al vacío desde sus ventanas. Llamas salen por las aberturas. Representa los cambios abruptos e inevitables, la destrucción de las estructuras falsas o caducas y la liberación violenta que precede a una nueva y más auténtica construcción.',
    keywords: {
      upright: [
        'caos',
        'destrucción',
        'revelación',
        'colapso',
        'cambio repentino',
        'liberación violenta',
      ],
      reversed: [
        'evitar el colapso',
        'resistencia',
        'miedo',
        'desastre postergado',
        'negación',
      ],
    },
    imageUrl: '/images/tarot/major/16-the-tower.jpg',
  },
  {
    slug: 'the-star',
    nameEn: 'The Star',
    nameEs: 'La Estrella',
    arcanaType: ArcanaType.MAJOR,
    number: 17,
    romanNumeral: 'XVII',
    element: Element.AIR,
    zodiacSign: ZodiacAssociation.AQUARIUS,
    meaningUpright:
      'Esperanza, renovación, fe, inspiración y serenidad. La Estrella trae luz después de la oscuridad, recordándonos que siempre hay esperanza y que el universo nos cuida.',
    meaningReversed:
      'Desesperanza, falta de fe, desconexión espiritual y pérdida del sentido de propósito y dirección.',
    description:
      'Una figura femenina desnuda vierte agua de dos jarras, una en tierra y otra en el lago, bajo el cielo estrellado. Una gran estrella de ocho puntas brilla en el centro, rodeada de siete estrellas más pequeñas. Representa la renovación espiritual, la esperanza que persiste tras la tormenta y la conexión con el universo.',
    keywords: {
      upright: [
        'esperanza',
        'renovación',
        'fe',
        'inspiración',
        'serenidad',
        'guía',
      ],
      reversed: [
        'desesperanza',
        'desconexión',
        'pérdida de fe',
        'pesimismo',
        'falta de propósito',
      ],
    },
    imageUrl: '/images/tarot/major/17-the-star.jpg',
  },
  {
    slug: 'the-moon',
    nameEn: 'The Moon',
    nameEs: 'La Luna',
    arcanaType: ArcanaType.MAJOR,
    number: 18,
    romanNumeral: 'XVIII',
    element: Element.WATER,
    zodiacSign: ZodiacAssociation.PISCES,
    meaningUpright:
      'Ilusión, miedo, subconsciente, sueños y confusión. La Luna ilumina el camino tenuemente, mostrando que no todo es lo que parece y que debemos navegar el territorio de lo desconocido con intuición.',
    meaningReversed:
      'Claridad después de la confusión, liberación de los miedos, verdad revelada y superación de ilusiones o engaños.',
    description:
      'La luna llena brilla entre dos torres mientras un cangrejo emerge del agua, un perro y un lobo aúllan a la luna. Un largo camino se pierde en la distancia. Representa el reino del subconsciente, los miedos irracionales, las ilusiones y la necesidad de confiar en la intuición para navegar la incertidumbre.',
    keywords: {
      upright: [
        'ilusión',
        'miedo',
        'subconsciente',
        'sueños',
        'confusión',
        'intuición',
      ],
      reversed: [
        'claridad',
        'verdad revelada',
        'superación del miedo',
        'liberación',
        'realidad',
      ],
    },
    imageUrl: '/images/tarot/major/18-the-moon.jpg',
  },
  {
    slug: 'the-sun',
    nameEn: 'The Sun',
    nameEs: 'El Sol',
    arcanaType: ArcanaType.MAJOR,
    number: 19,
    romanNumeral: 'XIX',
    element: Element.FIRE,
    planet: Planet.SUN,
    meaningUpright:
      'Alegría, éxito, vitalidad, positividad y claridad. El Sol es una de las cartas más positivas del Tarot, radiando energía, felicidad y la certeza de que todo saldrá bien.',
    meaningReversed:
      'Optimismo excesivo, egocentrismo, energía bloqueada o dificultad para ver el lado positivo de las situaciones.',
    description:
      'Un niño desnudo cabalga un caballo blanco bajo un sol radiante que brilla en un cielo despejado. Girasoles florecen detrás de una pared. El niño lleva una bandera roja y tiene una corona de flores. Representa la alegría pura, el éxito, la vitalidad y la claridad con que la consciencia ve el mundo cuando está en armonía.',
    keywords: {
      upright: [
        'alegría',
        'éxito',
        'vitalidad',
        'positividad',
        'claridad',
        'abundancia',
      ],
      reversed: [
        'optimismo excesivo',
        'egocentrismo',
        'energía bloqueada',
        'tristeza',
        'falta de claridad',
      ],
    },
    imageUrl: '/images/tarot/major/19-the-sun.jpg',
  },
  {
    slug: 'judgement',
    nameEn: 'Judgement',
    nameEs: 'El Juicio',
    arcanaType: ArcanaType.MAJOR,
    number: 20,
    romanNumeral: 'XX',
    element: Element.FIRE,
    planet: Planet.PLUTO,
    meaningUpright:
      'Renacimiento, llamado interior, absolución, transformación profunda y despertar espiritual. El Juicio invita a responder al llamado del alma y trascender el pasado.',
    meaningReversed:
      'Autodudas, incapacidad de perdonarse a uno mismo, ignorar el llamado interior y resistirse al despertar espiritual necesario.',
    description:
      'El arcángel Gabriel toca su trompeta desde las nubes mientras figuras emergen de sus ataúdes en respuesta al llamado. Montañas cubiertas de hielo enmarcan la escena. Representa el despertar espiritual, el llamado a responder al propósito del alma, la redención y la posibilidad de renacer liberado del pasado.',
    keywords: {
      upright: [
        'renacimiento',
        'llamado interior',
        'absolución',
        'despertar',
        'transformación',
        'redención',
      ],
      reversed: [
        'autoduda',
        'incapacidad de perdonarse',
        'ignorar el llamado',
        'estancamiento espiritual',
        'resistencia',
      ],
    },
    imageUrl: '/images/tarot/major/20-judgement.jpg',
  },
  {
    slug: 'the-world',
    nameEn: 'The World',
    nameEs: 'El Mundo',
    arcanaType: ArcanaType.MAJOR,
    number: 21,
    romanNumeral: 'XXI',
    element: Element.EARTH,
    planet: Planet.SATURN,
    meaningUpright:
      'Completud, integración, logro, plenitud y viaje culminado. El Mundo representa el final exitoso de un ciclo, la realización plena y la armonía entre todos los aspectos del ser.',
    meaningReversed:
      'Incompletud, objetivos sin terminar, falta de cierre y resistencia al final de un ciclo importante.',
    description:
      'Una figura andrógina danzante está rodeada por una corona de laurel en forma de elipse, sosteniendo dos varitas. En las cuatro esquinas están los cuatro seres vivientes: el toro, el león, el águila y el ángel. Representa la culminación del viaje del alma, la integración de todos los aprendizajes y la danza de la plenitud.',
    keywords: {
      upright: [
        'completud',
        'integración',
        'logro',
        'plenitud',
        'realización',
        'armonía',
      ],
      reversed: [
        'incompletud',
        'objetivos sin terminar',
        'falta de cierre',
        'resistencia',
        'estancamiento',
      ],
    },
    imageUrl: '/images/tarot/major/21-the-world.jpg',
  },
];
