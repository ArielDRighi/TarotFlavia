import { ArticleCategory } from '../enums/article.enums';
import { ArticleSeedData } from './zodiac-signs.data';

/**
 * 10 Planetas astrológicos — datos seed para la Enciclopedia Mística
 *
 * Orden: Sol (1) → Plutón (10) — 7 clásicos + 3 modernos
 * Categoría: ArticleCategory.PLANET
 */
export const PLANETS: ArticleSeedData[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. SOL
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'sol',
    nameEs: 'Sol',
    nameEn: 'Sun',
    category: ArticleCategory.PLANET,
    snippet:
      'El Sol es el astro rey de la astrología, símbolo del yo consciente, la identidad y la vitalidad. Representa el propósito de vida, la voluntad creativa y la fuerza que nos impulsa a brillar con luz propia en el mundo.',
    content: `# El Sol

**Símbolo:** ☉
**Tipo:** Luminaria
**Ciclo zodiacal:** ~30 días por signo (1 año completo)
**Signo domicilio:** Leo
**Signo exaltación:** Aries

## Significado Astrológico

El Sol es el centro del sistema solar y el eje de la carta natal. En astrología, representa el yo consciente, la identidad fundamental y el propósito de vida. Donde está el Sol en la carta natal indica la forma en que la persona busca brillar, expresarse y dejar su huella en el mundo.

El Sol es la fuente de la vitalidad física, la voluntad y la capacidad creativa. Su posición por signo describe la naturaleza del ego; por casa, el área de vida donde más se expresa; y sus aspectos revelan cómo fluye o se bloquea esa energía vital.

## Palabras Clave

- Identidad y ego
- Vitalidad y energía vital
- Voluntad y propósito
- Creatividad y autoexpresión
- Paternidad y figuras de autoridad
- El "yo" consciente

## El Sol en los Signos

El Sol cambia de signo aproximadamente cada 30 días, completando el ciclo zodiacal en un año. El signo solar en la carta natal es el signo del horóscopo popular y describe la esencia fundamental de la personalidad.

## Aspectos Importantes del Sol

- **Sol-Luna:** Equilibrio entre el yo consciente e inconsciente
- **Sol-Saturno:** Disciplina, responsabilidad y limitaciones del ego
- **Sol-Júpiter:** Expansión, confianza y abundancia de energía vital
- **Sol-Marte:** Iniciativa, asertividad y potencial de conflicto

## Mitología

En la mitología griega, el Sol corresponde a Helios (o Apolo), el dios de la luz, la música y la profecía. Conduce su carro dorado por los cielos, iluminando el mundo con su presencia.

## El Sol y el Tarot

El arcano mayor asociado al Sol es **El Sol (XIX)**, símbolo de alegría, claridad, éxito y la luz de la consciencia que disipa las sombras.
`,
    metadata: {
      symbol: '☉',
      type: 'luminaria',
      domicile: 'leo',
      exaltation: 'aries',
      cycle: '1 año',
    },
    relatedTarotCards: null,
    sortOrder: 1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. LUNA
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'luna',
    nameEs: 'Luna',
    nameEn: 'Moon',
    category: ArticleCategory.PLANET,
    snippet:
      'La Luna rige el mundo emocional, el inconsciente y los instintos más profundos. En astrología representa los patrones emocionales, los recuerdos del pasado, la relación con la madre y la necesidad innata de seguridad y pertenencia.',
    content: `# La Luna

**Símbolo:** ☽
**Tipo:** Luminaria
**Ciclo zodiacal:** ~2,5 días por signo (28 días completo)
**Signo domicilio:** Cáncer
**Signo exaltación:** Tauro

## Significado Astrológico

La Luna es la luminaria más cercana a la Tierra y la de mayor influencia en la vida cotidiana. En astrología, rige el mundo emocional, el inconsciente, los hábitos instintivos y la relación con el pasado y la madre.

Su posición en la carta natal revela cómo reaccionamos emocionalmente, qué necesitamos para sentirnos seguros y cómo procesamos nuestras experiencias a nivel profundo. La Luna es el puente entre el mundo interior y el exterior.

## Palabras Clave

- Emociones e instintos
- Inconsciente y sueños
- Memoria y pasado
- Necesidades de seguridad
- Relación con la madre
- Fertilidad y ciclos

## La Luna en los Signos

La Luna cambia de signo cada 2,5 días aproximadamente. Su signo natal describe el estilo emocional de la persona, sus reacciones instintivas y lo que necesita para sentirse emocionalmente nutrida.

## Fases Lunares en Astrología

- **Luna Nueva:** Inicio de ciclos, intenciones nuevas
- **Cuarto Creciente:** Acción, superación de obstáculos
- **Luna Llena:** Culminación, revelaciones, plenitud
- **Cuarto Menguante:** Revisión, liberación, integración

## Mitología

La Luna corresponde a Selene, Artemisa o Hécate en la mitología griega. Rige los ciclos naturales, la fertilidad y los misterios del mundo nocturno y subterráneo.

## La Luna y el Tarot

El arcano mayor asociado a la Luna es **La Luna (XVIII)**, símbolo del inconsciente profundo, los miedos, las ilusiones y el viaje entre mundos.
`,
    metadata: {
      symbol: '☽',
      type: 'luminaria',
      domicile: 'cancer',
      exaltation: 'taurus',
      cycle: '28 días',
    },
    relatedTarotCards: null,
    sortOrder: 2,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. MERCURIO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mercurio',
    nameEs: 'Mercurio',
    nameEn: 'Mercury',
    category: ArticleCategory.PLANET,
    snippet:
      'Mercurio rige la mente, la comunicación y el pensamiento racional. Es el mensajero del zodíaco y gobierna el lenguaje, el aprendizaje, los viajes cortos y la capacidad de procesar, analizar e intercambiar información con el entorno.',
    content: `# Mercurio

**Símbolo:** ☿
**Tipo:** Planeta personal
**Ciclo zodiacal:** ~14-30 días por signo (~88 días completo)
**Signos domicilio:** Géminis y Virgo
**Signo exaltación:** Virgo

## Significado Astrológico

Mercurio es el planeta más cercano al Sol y el más veloz del sistema solar. En astrología, representa la mente racional, la comunicación, el aprendizaje y todos los procesos mentales: pensar, hablar, escribir, leer y comprender.

Su posición natal describe el estilo mental y comunicativo de la persona: cómo piensa, cómo expresa sus ideas y cómo procesa la información del entorno. También rige los contratos, los viajes cortos y el comercio.

## Palabras Clave

- Pensamiento y razonamiento
- Comunicación y lenguaje
- Aprendizaje y educación
- Viajes cortos y desplazamientos
- Contratos y comercio
- Agilidad mental

## Mercurio Retrógrado

Mercurio entra en retrógrado 3-4 veces al año durante aproximadamente 3 semanas. Durante este período se recomienda revisar (en vez de iniciar) proyectos, evitar firmar contratos importantes y prestar atención extra a la comunicación.

## Mercurio en los Signos

Mercurio siempre está cerca del Sol, máximo a 28° de distancia. Su signo natal (generalmente el mismo o adjacent al Sol) describe el estilo intelectual y comunicativo dominante.

## Mitología

Mercurio es el equivalente romano de Hermes, el mensajero de los dioses. Porta las alas en los talones y el caduceo, guiando las almas entre mundos y llevando mensajes entre dioses y mortales.

## Mercurio y el Tarot

El arcano mayor asociado a Mercurio es **El Mago (I)**, símbolo del dominio del lenguaje, la voluntad de manifestar y la capacidad de transformar ideas en realidad.
`,
    metadata: {
      symbol: '☿',
      type: 'personal',
      domicile: 'gemini, virgo',
      exaltation: 'virgo',
      cycle: '88 días',
    },
    relatedTarotCards: null,
    sortOrder: 3,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. VENUS
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'venus',
    nameEs: 'Venus',
    nameEn: 'Venus',
    category: ArticleCategory.PLANET,
    snippet:
      'Venus es la diosa del amor y la belleza en astrología. Rige las relaciones afectivas, el placer estético, los valores personales y la capacidad de atraer lo que amamos. Su posición natal revela cómo amamos y qué encontramos hermoso y deseable.',
    content: `# Venus

**Símbolo:** ♀
**Tipo:** Planeta personal
**Ciclo zodiacal:** ~23-60 días por signo (~225 días completo)
**Signos domicilio:** Tauro y Libra
**Signo exaltación:** Piscis

## Significado Astrológico

Venus es el segundo planeta más cercano al Sol y el más brillante del cielo nocturno. En astrología, representa el amor, la belleza, los placeres, los valores y la capacidad de dar y recibir afecto.

Su posición natal describe el estilo amoroso, qué tipo de personas atraemos, nuestro sentido estético y lo que valoramos en la vida. También rige el dinero, el arte y todo lo que nos hace sentir placer.

## Palabras Clave

- Amor y atracción
- Belleza y estética
- Valores y placeres
- Relaciones y armonía
- Arte y creatividad
- Abundancia material

## Venus en las Relaciones

La posición de Venus indica:
- **Por signo:** El estilo de amar y el tipo de pareja que atrae
- **Por casa:** El área de vida donde se expresa el amor y la belleza
- **Por aspectos:** La facilidad o los desafíos en las relaciones

## Venus Retrógrado

Venus entra en retrógrado cada 18 meses durante ~40 días. Es un período para revisar relaciones, valores y patrones en el amor, no para iniciar relaciones nuevas o grandes compras.

## Mitología

Venus es la diosa romana del amor y la belleza, equivalente a Afrodita griega. Nació de la espuma del mar y representa el principio del deseo, la atracción y la unión.

## Venus y el Tarot

Los arcanos mayores asociados a Venus son **La Emperatriz (III)** (Tauro) y **La Justicia (VIII/XI)** (Libra).
`,
    metadata: {
      symbol: '♀',
      type: 'personal',
      domicile: 'taurus, libra',
      exaltation: 'pisces',
      cycle: '225 días',
    },
    relatedTarotCards: null,
    sortOrder: 4,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. MARTE
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'marte',
    nameEs: 'Marte',
    nameEn: 'Mars',
    category: ArticleCategory.PLANET,
    snippet:
      'Marte es el planeta de la acción, el deseo y la voluntad. Rige la energía física, la asertividad, el valor para actuar y la sexualidad instintiva. Su posición natal revela cómo actuamos, competimos y canalizamos nuestra agresividad y pasión.',
    content: `# Marte

**Símbolo:** ♂
**Tipo:** Planeta personal
**Ciclo zodiacal:** ~6-7 semanas por signo (~687 días completo)
**Signos domicilio:** Aries y Escorpio (co-regente)
**Signo exaltación:** Capricornio

## Significado Astrológico

Marte es el cuarto planeta del sistema solar y el primero más allá de la Tierra. En astrología, representa la energía de acción: el impulso de actuar, luchar, desear y conquistar. Es el principio del yang, la fuerza activa y asertiva.

Su posición natal describe cómo canalizamos la energía física y el deseo, cómo reaccionamos ante la competencia o el conflicto y qué nos impulsa a actuar con determinación.

## Palabras Clave

- Acción e iniciativa
- Energía y fuerza física
- Deseo y pasión
- Valentía y asertividad
- Competencia y conflicto
- Sexualidad instintiva

## Marte en los Signos

La posición de Marte natal describe el estilo de acción y el tipo de energía con que la persona afronta los desafíos. Marte en fuego es apasionado e impulsivo; en tierra, perseverante y práctico; en aire, mental y estratégico; en agua, emocional e intenso.

## Aspectos de Marte

- **Marte-Sol:** Virilidad, iniciativa y confianza en uno mismo
- **Marte-Saturno:** Disciplina, frustración o energía controlada
- **Marte-Plutón:** Poder, intensidad y potencial transformador extremo

## Mitología

Marte es el dios romano de la guerra, equivalente a Ares griego. Representa la guerra no solo como destrucción, sino como la fuerza necesaria para defender lo que amamos y avanzar hacia nuestros objetivos.

## Marte y el Tarot

El arcano mayor asociado a Marte es **La Torre (XVI)**, símbolo del cambio abrupto, la destrucción de estructuras caducas y la energía que rompe con lo establecido.
`,
    metadata: {
      symbol: '♂',
      type: 'personal',
      domicile: 'aries, scorpio',
      exaltation: 'capricorn',
      cycle: '687 días',
    },
    relatedTarotCards: null,
    sortOrder: 5,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. JÚPITER
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'jupiter',
    nameEs: 'Júpiter',
    nameEn: 'Jupiter',
    category: ArticleCategory.PLANET,
    snippet:
      'Júpiter es el gran benefactor del zodíaco, planeta de la expansión, la abundancia y la sabiduría. Rige la suerte, la filosofía, los viajes largos y el crecimiento espiritual. Su posición natal señala dónde fluye la abundancia y el optimismo en nuestra vida.',
    content: `# Júpiter

**Símbolo:** ♃
**Tipo:** Planeta social
**Ciclo zodiacal:** ~12-13 meses por signo (~12 años completo)
**Signos domicilio:** Sagitario y Piscis (co-regente)
**Signo exaltación:** Cáncer

## Significado Astrológico

Júpiter es el planeta más grande del sistema solar. En astrología, es el gran benefactor y el principio de expansión. Donde Júpiter toca en la carta natal, hay crecimiento, abundancia y oportunidades.

Su posición describe el área de vida donde la persona busca crecer, expandirse y encontrar significado. También rige la filosofía, la religión, los estudios superiores, los viajes largos y la suerte.

## Palabras Clave

- Expansión y crecimiento
- Abundancia y suerte
- Sabiduría y filosofía
- Optimismo y fe
- Viajes y culturas extranjeras
- Educación superior y espiritualidad

## Júpiter en los Signos

Júpiter permanece aproximadamente un año en cada signo. Su tránsito marca períodos de crecimiento y oportunidades en las áreas regidas por la casa que transita en la carta natal.

## El Retorno de Júpiter

Cada 12 años, Júpiter vuelve a la posición que tenía en el nacimiento (retorno de Júpiter). Esto marca períodos importantes de crecimiento personal, nuevas oportunidades y expansión de horizontes.

## Mitología

Júpiter es el rey de los dioses romanos, equivalente a Zeus griego. Es el señor del rayo, la justicia y el orden cósmico. Su energía es magnánima, generosa y expansiva.

## Júpiter y el Tarot

El arcano mayor asociado a Júpiter es **La Rueda de la Fortuna (X)**, símbolo del ciclo del destino, los cambios de suerte y el principio de expansión y oportunidad.
`,
    metadata: {
      symbol: '♃',
      type: 'social',
      domicile: 'sagittarius, pisces',
      exaltation: 'cancer',
      cycle: '12 años',
    },
    relatedTarotCards: null,
    sortOrder: 6,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. SATURNO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'saturno',
    nameEs: 'Saturno',
    nameEn: 'Saturn',
    category: ArticleCategory.PLANET,
    snippet:
      'Saturno es el maestro de la disciplina y el karma en astrología. Rige las limitaciones, la responsabilidad y las lecciones de vida. Su posición natal muestra los retos que debemos superar y las estructuras que, con esfuerzo y perseverancia, nos llevan a la maestría.',
    content: `# Saturno

**Símbolo:** ♄
**Tipo:** Planeta social
**Ciclo zodiacal:** ~2,5 años por signo (~29,5 años completo)
**Signos domicilio:** Capricornio y Acuario (co-regente)
**Signo exaltación:** Libra

## Significado Astrológico

Saturno es el sexto planeta del sistema solar, conocido por sus anillos. En astrología, es el gran maestro y el cronómetro del karma. Representa el principio de la realidad, las limitaciones, la disciplina y la responsabilidad.

Su posición natal indica las áreas de vida donde enfrentamos los mayores desafíos y donde, precisamente por eso, podemos alcanzar la mayor maestría. Saturno enseña a través del esfuerzo y la perseverancia.

## Palabras Clave

- Disciplina y responsabilidad
- Limitaciones y estructuras
- Karma y lecciones de vida
- Tiempo y paciencia
- Maestría a través del esfuerzo
- Autoridad y tradición

## El Retorno de Saturno

Cada 29,5 años, Saturno vuelve a su posición natal (retorno de Saturno). Esto ocurre alrededor de los 29-30 años y los 58-60 años, marcando profundas transiciones de vida y momentos de evaluación y restructuración.

## Saturno Retrógrado

Saturno entra en retrógrado aproximadamente 5 meses al año. Es un período para revisar las estructuras de vida, asumir responsabilidades pendientes y trabajar en las lecciones kármicas.

## Mitología

Saturno es el dios romano del tiempo y la agricultura, equivalente a Cronos griego. Es el señor del tiempo, quien devora a sus propios hijos temiendo ser destronado — símbolo del poder del tiempo y la inevitabilidad del cambio.

## Saturno y el Tarot

El arcano mayor asociado a Saturno es **El Mundo (XXI)**, símbolo de la maestría alcanzada tras superar todas las pruebas del camino.
`,
    metadata: {
      symbol: '♄',
      type: 'social',
      domicile: 'capricorn, aquarius',
      exaltation: 'libra',
      cycle: '29,5 años',
    },
    relatedTarotCards: null,
    sortOrder: 7,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. URANO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'urano',
    nameEs: 'Urano',
    nameEn: 'Uranus',
    category: ArticleCategory.PLANET,
    snippet:
      'Urano es el planeta de la revolución, la innovación y los cambios repentinos. Rige la originalidad, la libertad individual y los avances tecnológicos. Su influencia derrumba estructuras caducas para abrir paso a nuevos paradigmas y formas de existir.',
    content: `# Urano

**Símbolo:** ⛢
**Tipo:** Planeta transpersonal (generacional)
**Ciclo zodiacal:** ~7 años por signo (~84 años completo)
**Signo domicilio:** Acuario
**Signo exaltación:** Escorpio

## Significado Astrológico

Urano es el séptimo planeta del sistema solar, el primero descubierto con telescopio (1781). En astrología, representa la revolución, la ruptura con lo establecido, la originalidad y el impulso hacia el futuro.

Su influencia opera a nivel generacional: toda una generación comparte el mismo signo de Urano, definiendo las tendencias revolucionarias de su época. En la carta personal, su posición natal y sus aspectos revelan dónde somos más originales, rebeldes e innovadores.

## Palabras Clave

- Revolución e innovación
- Libertad e independencia
- Originalidad y genialidad
- Cambios inesperados
- Tecnología y progreso
- Ruptura con tradiciones

## Urano en los Signos (Generacional)

Urano permanece ~7 años en cada signo, afectando a toda una generación:
- Urano en Aries (2011-2018): Revolución del individuo, nuevas formas de ser
- Urano en Tauro (2018-2026): Revolución económica, tecnología y naturaleza
- Urano en Géminis (2026-2033): Revolución comunicativa e intelectual

## Mitología

Urano (Ouranos) es el dios griego del cielo primordial, padre de los Titanes. Su castración por Cronos simboliza la ruptura con el orden primitivo y el inicio de una nueva era — perfecto símbolo de la energía uraneana.

## Urano y el Tarot

El arcano mayor asociado a Urano es **El Loco (0)**, símbolo del potencial ilimitado, la libertad absoluta y el salto hacia lo desconocido.
`,
    metadata: {
      symbol: '⛢',
      type: 'transpersonal',
      domicile: 'aquarius',
      exaltation: 'scorpio',
      cycle: '84 años',
    },
    relatedTarotCards: null,
    sortOrder: 8,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. NEPTUNO
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'neptuno',
    nameEs: 'Neptuno',
    nameEn: 'Neptune',
    category: ArticleCategory.PLANET,
    snippet:
      'Neptuno es el planeta de los sueños, la espiritualidad y la ilusión. Rige la compasión universal, el arte inspirado y la conexión con lo invisible. Su influencia disuelve los límites del ego y abre las puertas a la experiencia mística y trascendente.',
    content: `# Neptuno

**Símbolo:** ♆
**Tipo:** Planeta transpersonal (generacional)
**Ciclo zodiacal:** ~14 años por signo (~165 años completo)
**Signo domicilio:** Piscis
**Signo exaltación:** Cáncer

## Significado Astrológico

Neptuno es el octavo planeta del sistema solar, descubierto en 1846. En astrología, representa el principio de la disolución, la espiritualidad, la compasión universal y el mundo de los sueños e ilusiones.

Neptuno disuelve los límites del ego para conectar con algo mayor. Su influencia puede manifestarse como inspiración artística, devoción espiritual, compasión profunda... o como confusión, engaño y escapismo.

## Palabras Clave

- Espiritualidad y misticismo
- Sueños e intuición
- Compasión y empatía universal
- Ilusión y engaño
- Arte e inspiración
- Disolución de límites

## Neptuno en los Signos (Generacional)

Neptuno permanece ~14 años en cada signo:
- Neptuno en Capricornio (1984-1998): Espiritualización de las estructuras
- Neptuno en Acuario (1998-2012): Espiritualidad tecnológica y colectiva
- Neptuno en Piscis (2012-2026): Máxima expresión de su energía natal

## El Desafío de Neptuno

La sombra de Neptuno incluye el escapismo, las adicciones, la victimización y la ilusión que nos impide ver la realidad. El trabajo neptuniano consiste en mantener la conexión espiritual sin perder el anclaje en la tierra.

## Mitología

Neptuno es el dios romano del mar, equivalente a Poseidón griego. Señor de las profundidades oceánicas, los terremotos y las tormentas, su tridente domina el mundo de lo impredecible y lo misterioso.

## Neptuno y el Tarot

El arcano mayor asociado a Neptuno es **El Colgado (XII)**, símbolo de la rendición, la visión desde otro ángulo y la conexión con lo trascendente a través de la pausa.
`,
    metadata: {
      symbol: '♆',
      type: 'transpersonal',
      domicile: 'pisces',
      exaltation: 'cancer',
      cycle: '165 años',
    },
    relatedTarotCards: null,
    sortOrder: 9,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 10. PLUTÓN
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'pluton',
    nameEs: 'Plutón',
    nameEn: 'Pluto',
    category: ArticleCategory.PLANET,
    snippet:
      'Plutón es el planeta de la transformación radical y el poder. Rige la muerte y el renacimiento simbólico, los procesos de catarsis profunda y el poder que surge de las sombras. Su influencia generacional redefine estructuras enteras de poder en la sociedad.',
    content: `# Plutón

**Símbolo:** ♇
**Tipo:** Planeta transpersonal (generacional)
**Ciclo zodiacal:** ~12-30 años por signo (~248 años completo)
**Signo domicilio:** Escorpio
**Signo exaltación:** Aries

## Significado Astrológico

Plutón es el planeta más lejano del sistema solar (planeta enano desde 2006), descubierto en 1930. En astrología, representa el principio de la transformación más profunda: la muerte y el renacimiento simbólico, el poder, las sombras y la regeneración.

Su influencia es intensa y lenta, operando principalmente a nivel generacional. En la carta personal, sus aspectos revelan las áreas de transformación radical, los patrones de poder y las heridas ancestrales que deben sanarse.

## Palabras Clave

- Transformación y renacimiento
- Poder y control
- Sombras y lo oculto
- Catarsis y purificación
- Muerte simbólica
- Herencias y karma ancestral

## Plutón en los Signos (Generacional)

Plutón puede tardar entre 12 y 30 años en un signo (su órbita es muy excéntrica):
- Plutón en Escorpio (1983-1995): Transformación del poder y la sexualidad
- Plutón en Sagitario (1995-2008): Transformación de las creencias y religiones
- Plutón en Capricornio (2008-2024): Transformación de las estructuras de poder
- Plutón en Acuario (2024-2044): Transformación tecnológica y social

## El Trabajo Plutónico

El trabajo con la energía de Plutón implica descender a las propias sombras, enfrentar lo que se teme o se niega, y emerger transformado. Es el proceso del fénix que renace de sus cenizas.

## Mitología

Plutón es el dios romano del inframundo, equivalente a Hades griego. Señor del mundo subterráneo y de las riquezas ocultas bajo la tierra, su reino es el de los muertos y los tesoros enterrados.

## Plutón y el Tarot

El arcano mayor asociado a Plutón es **El Juicio (XX)**, símbolo del despertar radical, la resurrección y la llamada a la transformación definitiva.
`,
    metadata: {
      symbol: '♇',
      type: 'transpersonal',
      domicile: 'scorpio',
      exaltation: 'aries',
      cycle: '248 años',
    },
    relatedTarotCards: null,
    sortOrder: 10,
  },
];
