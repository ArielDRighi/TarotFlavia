/**
 * Tarot Cards Data - 78 Cards Complete Dataset
 * Source: Rider-Waite Tarot Tradition
 * Structure: 22 Major Arcana + 56 Minor Arcana (14 per suit)
 */

export interface TarotCardData {
  name: string;
  number: number;
  category: string;
  imageUrl: string;
  meaningUpright: string;
  meaningReversed: string;
  description: string;
  keywords: string;
}

// =============================================================================
// ARCANOS MAYORES (22 cards)
// =============================================================================
export const ARCANOS_MAYORES: TarotCardData[] = [
  {
    name: 'El Loco',
    number: 0,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
    meaningUpright:
      'Nuevos comienzos, aventuras personales, oportunidades, desafíos, inocencia, espíritu libre, espontaneidad.',
    meaningReversed:
      'Bloqueo creativo, falta de decisión, impulsividad sin considerar las consecuencias, desequilibrio emocional, falta de compromiso, sin disciplina ni solidez.',
    description:
      'Es el comienzo, la Chispa que necesitamos para que todo se mueva, es el espíritu, el aliento que da vida, que inspira a dar el primer paso hacia la realización y la consumación.',
    keywords: 'Libertad, inocencia, espíritu libre, aventura, nuevos comienzos',
  },
  {
    name: 'El Mago',
    number: 1,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
    meaningUpright:
      'Invita a creer en las ideas y proyectos, a ponerse en acción. Habla de poseer la habilidad, el talento y la capacidad de manifestar todo aquello que se ha deseado. Invita a tomar las riendas de la vida en tus manos.',
    meaningReversed:
      'Persona manipuladora, estafador, charlatán, mentiroso con intenciones cuestionables. La energía está mal canalizada, incapaz de llevar a cabo proyectos. Necesita retomar la confianza en uno mismo.',
    description:
      'Este arcano tiene la voluntad, el poder y la capacidad de materializar todo aquello que se ha propuesto.',
    keywords: 'Voluntad, manifestación, poder, concentración, creación, acción',
  },
  // Continuing with all 22 Major Arcana...
  {
    name: 'La Sacerdotisa',
    number: 2,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
    meaningUpright:
      'Intuición, sabiduría, serenidad, conocimiento, comprensión, escucha, confianza en la voz interior. Momento de descubrimiento interno, invita a pensar antes de actuar, a tomarse un momento para reflexionar.',
    meaningReversed:
      'Sentimientos reprimidos, excesiva dependencia de opiniones ajenas, necesidad de aprobación y validación. Desoír nuestra voz interior, necesidad de tiempo para reflexionar y meditar. Falta de compromiso o posible infidelidad.',
    description:
      'Nos enseña que todo lo que necesitamos saber ya existe en nuestro interior. Nos invita a mirar hacia adentro, a escuchar nuestra intuición. Podemos usar esos poderes a nivel interior para enriquecernos y transformarnos a nosotros mismos.',
    keywords:
      'Intuición, misterio, conocimiento interior, lo oculto, paciencia',
  },
  {
    name: 'La Emperatriz',
    number: 3,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
    meaningUpright:
      'Productividad, fecundidad, abundancia, buena cosecha, belleza, sensualidad. Puede representar figuras femeninas del consultante. Momento para el amor, definición en las relaciones, armonía, equilibrio, relación llena de amor y sensualidad.',
    meaningReversed:
      'Estancamiento, proyectos que no dan frutos, codicia, ver solo los aspectos materiales de la vida, situación superficial con juicios poco centrados. También puede hablar de infertilidad o problemas durante el embarazo.',
    description:
      'La Emperatriz representa el cuerpo físico y el mundo material. De ella proviene todo el placer de los sentidos y la abundancia de las vidas en todas sus formas. Es el arquetipo de la madre, manifiesta la creación de bases firmes para futuros progresos.',
    keywords:
      'Fertilidad, abundancia, naturaleza, creatividad, feminidad, maternidad',
  },
  {
    name: 'El Emperador',
    number: 4,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
    meaningUpright:
      'Líder natural, persona de negocios estructurada que le cuesta mostrar sus emociones. Invita a tomarse un tiempo para el pensamiento estratégico y analítico. Su prioridad se centra en lo material y el trabajo. Invita a tomar acción pero con riesgo calculado.',
    meaningReversed:
      'Persona práctica, pragmática, estricta, rígida que lidera con puño de hierro, severidad y tiranía. Terquedad, dominante con deseo de control y tendencia a la sobreprotección. Dificultad para concentrarse o mantener el control de las situaciones.',
    description:
      'Cuando hablamos del Emperador hablamos de una figura paterna, de base sólida, de estructura y cimiento. Él es el proveedor que protege y defiende a sus seres queridos.',
    keywords:
      'Autoridad, estructura, control, poder, estabilidad, protección, paternidad',
  },
  {
    name: 'El Papa (El Hierofante)',
    number: 5,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
    meaningUpright:
      'Tradicionalismo, apego a lo convencional. Representa un mentor, guía, maestro espiritual o alguien con conocimientos específicos. Tiempo para tener fe, iluminación, despertar, encontrar el propio camino, transformación y trascendencia. Impulso por buscar conocimiento más allá de lo material.',
    meaningReversed:
      'Mente abierta para aceptar lo nuevo, ideas y formas de pensamiento que rompen con lo convencional. Puede representar a un falso profeta, mal consejero o líder negativo. En el amor puede indicar divorcio o falta de comunicación. Intolerancia por apego a tradiciones y creencias.',
    description:
      'Representa el mundo espiritual, carta de las creencias, la ideología, la moralidad, las tradiciones convencionales de todo tipo, aunque generalmente se relaciona con las espirituales y religiosas. Representa al consejero o al guía.',
    keywords:
      'Tradición, conformidad, moral y ética, espiritualidad, educación',
  },
  {
    name: 'Los Amantes',
    number: 6,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_06_Lovers.jpg',
    meaningUpright:
      'Necesidad de realizar una decisión crucial en nuestras vidas, buen augurio en las relaciones afectivas. Etapas de conciliación, armonía y dicha. Se anuncia la llegada de un nuevo amor. En lo económico, momento de ganancia moderada.',
    meaningReversed:
      'Falta de equilibrio en las relaciones, periodo de dudas, advertencia, momento de realizar cambios. Los sentimientos pueden no estar correspondidos, sin reciprocidad. Encuentros fugaces y ocasionales. Oportunidad de conectarse con el amor propio. En lo financiero, descuido por centrarse en lo amoroso.',
    description:
      'Carta del amor y del romance, habla de la unión armónica para lograr un todo. También representa la elección y la necesidad de orientación sobre alguna decisión en nuestra vida.',
    keywords: 'Amor, unión, elecciones, armonía, relaciones, valores',
  },
  {
    name: 'El Carro',
    number: 7,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
    meaningUpright:
      'Éxito, recuperación, buen momento, buenos resultados. Requiere prestar atención plena con los cinco sentidos para lograr los objetivos. Buen augurio de rápidos resultados o avances importantes tanto en lo económico como laboral. En el amor, tentación de ir demasiado rápido o precipitarse.',
    meaningReversed:
      'Energía mal canalizada, falta de concentración en los objetivos o no saber qué es lo que se quiere. Lo deseado se da pero de forma lenta. En lo económico, despilfarro de dinero o gastos imprevistos. En el amor, relaciones que van muy rápido o tienen falta de impulso.',
    description:
      'Carta muy positiva que indica el éxito como resultado de la voluntad y el dominio de nosotros mismos. Importancia de tomar las riendas de nuestra vida, equilibrando razón y emoción.',
    keywords: 'Determinación, voluntad, victoria, éxito, autocontrol',
  },
  {
    name: 'La Fuerza',
    number: 8,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
    meaningUpright:
      'Invita a afrontar con serenidad las situaciones, fortaleza interior, dominar impulsos y a sí mismo. En la pareja, habla de un buen momento, fortaleza y amor, paciencia y comprensión. Momento para corregir malos hábitos, vitalidad y energía, buen augurio, las cosas comienzan a mejorar.',
    meaningReversed:
      'Existe bloqueo por miedo e inseguridad, actuar con debilidad. Invita a fortalecer nuestra fe interior, dominar impulsos o conductas autodestructivas, necesidad de autocontrol.',
    description:
      'Esta carta nos habla de la propia fortaleza, valentía y coraje con que afrontamos las situaciones. Es también la representación de la fuerza mental y espiritual ante lo adverso, es dominar nuestros propios miedos y controlar nuestros impulsos.',
    keywords: 'Coraje, paciencia, compasión, influencia, persuasión',
  },
  {
    name: 'El Ermitaño',
    number: 9,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
    meaningUpright:
      'Momento de reflexión interna, introspección, tomar un descanso de lo mundano y cotidiano para encontrar la sabiduría interna y las respuestas. Carta de avance y evolución pero con lentitud. En el amor, necesidad de distanciarse, estar en soledad, puede representar un amor del pasado.',
    meaningReversed:
      'Alejamiento de las personas que puede ser nocivo o excesivo, quedando en soledad. Necesidad de hacer una pausa, alejarse, distanciarse para pensar y reflexionar. En el amor, el alejamiento y falta de comunicación pueden ocasionar ruptura.',
    description:
      'Esta carta nos muestra a alguien que se aísla o se aparta para poder pensar y reflexionar. Todos necesitamos reconectar con uno mismo. Las respuestas están y las encontraremos en nuestro interior.',
    keywords:
      'Introspección, búsqueda interior, soledad, orientación espiritual',
  },
  {
    name: 'La Rueda de la Fortuna',
    number: 10,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
    meaningUpright:
      'Golpe de suerte, cambios positivos, evolución favorable a un asunto, éxito, momento de fluir con los cambios y disfrutar. Cambios positivos en el amor a nivel de pareja, y si está solo puede indicar la llegada de alguien que trae cosas favorables.',
    meaningReversed:
      'Cambios poco favorables, fin de un ciclo de buena fortuna, obstáculos en futuros proyectos. En el amor habla de falta de sincronías, se experimentan situaciones adversas. Necesidad de renunciar al control y no resistirse al cambio por ser los altibajos parte de la vida misma.',
    description:
      'Esta carta representa una energía que va más allá del alcance de nuestro entendimiento y control. Los trabajos de la suerte y el destino son invisibles para nosotros, solo pueden verse los resultados cuando el propio destino decreta que es el momento oportuno para que sus efectos se manifiesten.',
    keywords: 'Destino, suerte, cambio, ciclos, puntos de inflexión',
  },
  {
    name: 'La Justicia',
    number: 11,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/RWS_Tarot_11_Justice.jpg',
    meaningUpright:
      'La ley de causa y efecto, el equilibrio y balance material. La justa recompensa. Asuntos legales a favor, resultados positivos, resoluciones favorables. Momento propicio para invertir y asociarse, mente equilibrada, asuntos tratados con integridad, objetividad e imparcialidad. Puede señalar la legalización de una relación, boda o embarazo deseado.',
    meaningReversed:
      'Injusticia, resultado negativo en asuntos legales o económicos pendientes, demoras, complicaciones en procesos judiciales. Necesidad de asumir la responsabilidad de nuestros actos y hacer cambios para mejorar el futuro. Pérdida financiera, negociaciones fallidas, contratos perdidos.',
    description:
      'La Justicia te pide que aprendas de tus experiencias pasadas, tanto lo bueno como lo malo, que lo tomes todo y que crezcas a partir de eso. La Justicia pide que seas realista sobre la causa y el efecto que tus pensamientos y acciones traen al mundo.',
    keywords: 'Justicia, verdad, ley, equilibrio, integridad',
  },
  {
    name: 'El Colgado',
    number: 12,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
    meaningUpright:
      'Cambio de punto de vista sobre la mirada de la vida. Momento de pausa para profundizar en los proyectos, en el conocimiento de uno mismo y en un trabajo de introspección profundo.',
    meaningReversed:
      'Estancamiento, auto sabotaje, aferrarse a lo que no es para uno. Situaciones dolorosas de las que no se ha logrado rescatar un aprendizaje. No mirar objetivamente la situación y reconocer las propias culpas. En el amor significa amor no correspondido, fin de una relación, desilusión, separación o derrota. Estrechez económica.',
    description:
      'El punto de vista sobre la mirada de la vida cambia. Se desprende de una visión heredada de la infancia con sus conjeturas, ilusiones y proyecciones para entrar en su propia verdad esencial. Por la posición con la cabeza inclinada, recuerda al feto en gestación. Las ramas simbolizan el linaje materno y paterno, las manos ocultas simbolizan los sacrificios al cual nos sometemos por vergüenza derivada de secretos vergonzosos.',
    keywords: 'Sacrificio, suspensión, rendición, perspectiva nueva',
  },
  {
    name: 'La Muerte',
    number: 13,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
    meaningUpright:
      'Transformación, cambio y destrucción seguida de renovación. Grandes cambios, por lo general relacionados a una vieja creencia o actitud con respecto a alguna perspectiva que ya no nos es útil y debe dejarse ir. Si se está en pareja feliz, los cambios son evolución y consolidación. Si la pareja no es feliz, se recomienda replantear si vale la pena continuar.',
    meaningReversed:
      'Apego a sentimientos, no querer salir adelante, pesimismo. Aferrarse al pasado, resistencia al cambio. Estrechez económica. En el amor, amor no correspondido o fin de una relación, separación, derrota y desilusión.',
    description:
      'Aunque la mayoría de las personas tememos a la muerte, esta carta en realidad nos habla de transformación, de una nueva vida, de una nueva manera de mirar nuestra existencia. Están en juego tanto la energía positiva como masculina.',
    keywords: 'Transformación, fin, cambio, transición, dejar ir lo viejo',
  },
  {
    name: 'La Templanza',
    number: 14,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
    meaningUpright:
      'Moderación, balance, equilibrio, paz interior, amor, cooperación, apoyo mutuo, estabilidad. Esta carta indica que todo fluye y está en equilibrio.',
    meaningReversed:
      'Conflicto de intereses, intranquilidad, falta de armonía y cooperación. Necesidad de moderarse en algún aspecto. Relaciones amorosas sin armonía, contención, sin compromisos o poca empatía. En lo laboral y financiero puede haber estancamientos, mala comunicación y situaciones fallidas.',
    description:
      'Esta carta nos invita a la moderación, a buscar el balance y el equilibrio en diferentes aspectos de nuestra vida. A buscar un punto medio, no todo es blanco o negro. Nos habla de fluir tanto en lo terrenal como en lo espiritual.',
    keywords: 'Balance, moderación, paciencia, propósito, significado',
  },
  {
    name: 'El Diablo',
    number: 15,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg',
    meaningUpright:
      'Advierte estar muy enfocado en lo material y mundano, incluso con excesos como ambición desmedida, adicciones, dominado por la lujuria, actitudes destructivas, sentimientos de culpa. Al hablar de adicciones incluye alcohol, comida, sexo, apuestas, entre otras. En las relaciones habla de pasión, celos, peleas, manipulación, lujuria y querer dominar al otro. También de inestabilidad emocional.',
    meaningReversed:
      'Las cadenas que atan a lo material están empezando a soltarse, se logra vencer el orgullo y egoísmo por medio del control de nuestros miedos y acciones. Las relaciones han logrado superar obstáculos severos o atender situaciones de pareja que representaban inestabilidad. Buenas oportunidades laborales, mejora en las finanzas, comienza a salir de situaciones negativas.',
    description:
      'Esta carta representa un puente, un tránsito. "El Diablo" aparece como tentador que muestra la vía hacia las profundidades del ser; habita en la oscuridad de la noche, del inconsciente profundo. Expresa la parte negativa de nuestra personalidad cuando nos sometemos a nuestro lado sombra. También nos dejamos llevar a situaciones que nos dañan, incluso permitiendo que controlen nuestra vida. La lección es que podemos liberarnos de cualquier restricción que nos detenga en el momento que lo decidamos.',
    keywords: 'Ataduras, materialismo, adicción, sexualidad, sombra',
  },
  {
    name: 'La Torre',
    number: 16,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
    meaningUpright:
      'Cambio brusco y repentino, caos, situaciones que se desestabilizan y provocan confusión. Creencias e ideales son cuestionados. En relaciones habla de separación, rupturas, peleas, dudas y cuestionamiento. Momento de cuidar el dinero e inversiones para evitar inestabilidad. En el trabajo evitar conflictos y cuidar lo que decimos y hacemos.',
    meaningReversed:
      'Resistencia y miedo al cambio. Tiempo de inestabilidad en la relación pero puede solucionarse si mejora la comunicación. En lo económico, surgen gastos imprevistos.',
    description:
      'Esta carta nos habla de un cambio imprevisto y repentino, que puede traer caos o desestabilización de estructuras que se creían firmes. Es la necesidad de dejar atrás creencias e ideales obsoletos; si se elige dejar ir y fluir con el cambio, la situación será mucho más fácil y sin frustraciones. Los hombres tienen la cabeza hacia abajo porque ven el mundo desde una nueva perspectiva.',
    keywords: 'Crisis, cambio repentino, caos, revelación, disrupción',
  },
  {
    name: 'La Estrella',
    number: 17,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg',
    meaningUpright:
      'Sensación de armonía, bienestar, confianza en el futuro y certeza de estar en el camino correcto. Momento positivo y favorable donde los obstáculos han sido superados. En el amor, futuro sentimental feliz con armonía, comprensión y comunicación si se está en pareja. Para solteros, inicio de relación duradera. En trabajo y finanzas está muy bien aspectada, con suerte y situaciones favorables con buenas retribuciones.',
    meaningReversed:
      'Atravesar un momento difícil con pocas oportunidades, muchos obstáculos, donde la persona puede estar desesperada, pesimista o perdiendo la fe. En las relaciones, poco comunicativa, fría, distante, con desinterés. Puede haber traición. En el trabajo hay insatisfacción, falta de retribución, trampas, engaños. Se gasta más de lo que ingresa, hay derroche.',
    description:
      'La carta de la Estrella podemos interpretarla como que no tiene nada que ocultar, solo tiene que encontrar su lugar en la tierra. La actitud sugiere piedad y sumisión, uno se arrodilla en un templo. Honra el lugar en el que se establece; sus rodillas apoyadas en el suelo pueden ser señal de arraigo, de encontrar su sitio en la tierra y estar en comunicación con el cosmos. Nos invita a confiar en que todo estará bien.',
    keywords: 'Esperanza, inspiración, renovación, espiritualidad, serenidad',
  },
  {
    name: 'La Luna',
    number: 18,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg',
    meaningUpright:
      'Tiempo de confusión donde algo no es lo que parece o nos rehusamos a aceptar la realidad. Algo importante se oculta, peligros o enemigos ocultos, chismes, habladurías enturbian la situación. En el amor, relaciones de poco compromiso o de idas y vueltas cargadas de emociones y sensualidad. Momento de cuidarse en las finanzas y de ofertas tentadoras que no lo son, invita a estar atentos.',
    meaningReversed:
      'Los momentos negativos y de confusión se van disipando. Hay mayor claridad, lo oculto sale a la luz. Confusión en los sentimientos, inseguridad en las relaciones. En el trabajo indica un cambio, seguir la vocación. En las finanzas recomienda cuidar el dinero.',
    description:
      'Esta carta invita a confiar y a seguir nuestra intuición, es la brújula interna y refleja que las cosas no siempre son como parecen, que no son tan maravillosas y que hay que afinar la percepción para descubrir lo que se oculta. Momento de ver con objetividad la realidad y enfrentar los miedos.',
    keywords: 'Intuición, inconsciente, ilusión, engaño, ansiedad',
  },
  {
    name: 'El Sol',
    number: 19,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
    meaningUpright:
      'Éxito, abundancia, satisfacción, felicidad, positividad. Momento de claridad sobre el camino a seguir. Unión, bienestar, equilibrio, armonía, perdones y reconciliaciones; salir de una etapa difícil. Si el consultante no está en relación, augura la llegada de una persona que lo llenará de emociones. En finanzas es muy positiva, augura llegada de dinero inesperado, suerte en el azar, estado de mejoría.',
    meaningReversed:
      'Infelicidad, confusión, sentirse vacío y sin propósito, visión negativa de uno mismo. Existen disputas, incomprensión, bloqueo de proyectos, momentos difíciles donde la persona no escucha consejos. En el amor desilusiones, diferencias e incluso ruptura, la pareja no está pudiendo construir bases sólidas. En cuanto al trabajo, existe estrés, tedio, sobrecarga laboral. Las ganancias disminuyen o son menos de lo esperado.',
    description:
      'Carta que habla del positivismo, de tener confianza ya que es señal de que las cosas se desarrollan de manera maravillosa. Sin importar si estamos en un periodo de oscuridad, el sol saldrá y llegará la claridad. Carta de éxito, alegría y prosperidad.',
    keywords: 'Vitalidad, alegría, confianza, éxito, positividad',
  },
  {
    name: 'El Juicio',
    number: 20,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
    meaningUpright:
      'Renacimiento, renovación, cambiar para mejorar, transformarse, ruptura de lo convencional. En cuanto al amor es un muy buen periodo para sentar las bases y mejorar la relación. Buen momento para acuerdos, contratos, actividades nuevas con impactos económicos. Momento positivo para dejar malos hábitos e iniciar una vida más saludable.',
    meaningReversed:
      'Deseo de liberarnos de una situación sin salida, atados a situaciones creadas por nosotros mismos, negar nuestra esencia o nuestra naturaleza. Crisis en la pareja, pérdida de afecto, separaciones, desilusiones. Engaño en lo laboral, disputas problemas, negocios suspendidos, contratos poco claros o confiables. Pérdidas económicas, materiales.',
    description:
      'Después de haber pasado por las profundidades del inconsciente, tras una labor que pudo llevarse a cabo con dolor en la sombra, una nueva vida despierta como un nacimiento o una resurrección. Mensaje de causa y efecto, momento de nuevos caminos, de evolución, de dejar atrás todo aquello que nos ata y que no nos aporta algo positivo. Autorrealización y despertar espiritual.',
    keywords:
      'Renacimiento, renovación, despertar espiritual, transformación, revelación',
  },
  {
    name: 'El Mundo',
    number: 21,
    category: 'arcanos_mayores',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
    meaningUpright:
      'Triunfo en cualquier actividad que se emprenda, finalización y logro. Libertad para elegir los caminos, todo está a nuestro favor. Momento propicio para el amor y la unión; si está solo es momento de conocer a alguien. En lo laboral se recoge los frutos del buen trabajo realizado y si se está buscando tener nuevas oportunidades. Favorable en lo económico, salida de las dificultades financieras.',
    meaningReversed:
      'Necesidad de cerrar ciclos y salir adelante, requiere enfocarse para alcanzar los objetivos. Éxito asegurado pero con demora retraso en los planes. Alejamiento de la pareja, incomprensión, preocupación por la pareja. En cuanto al aspecto financiero hay contratiempos y puede haber una mala retribución o escasa en lo profesional y en lo financiero.',
    description:
      'Carta que representa el triunfo luego de haber completado el ciclo, largo camino, es la conclusión de un trabajo bien hecho, bien realizado y de objetivos cumplidos.',
    keywords: 'Realización, éxito, logro, integración, viajes, plenitud',
  },
];

// =============================================================================
// ARCANOS MENORES - BASTOS (14 cards)
// =============================================================================
export const ARCANOS_MENORES_BASTOS: TarotCardData[] = [
  {
    name: 'As de Bastos',
    number: 1,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg',
    meaningUpright:
      'Chispa divina, semilla, inicio. Impulso hacia una dirección. Don de la fuerza, la energía sexual absoluta, llena de pasión, amor y vida. Capacidad de decisión. Atención puesta en toda la tensión creadora. Momento de ser valiente, atrevido y arriesgar sin miedos, siendo el entusiasmo su guía y defensa. En el amor: inicio de una relación llena de energía, entusiasmo y atracción sexual. Pura pasión sin ahondar en las emociones.',
    meaningReversed:
      'Demoras, caos, planes cancelados, superficialidad, depresión. Energía mal canalizada que se consume y no llega nada, "el que mucho abarca, poco aprieta". Sexualidad apagada y reprimida.',
    description:
      'La familia de los bastos es la naturaleza fogosa, instintiva, dinámica, valiente, luchadora, impulsiva y autocentrada. El As representa la chispa divina, el inicio de un nuevo ciclo.',
    keywords:
      'Inicio, energía, pasión, creatividad, entusiasmo, nuevos proyectos',
  },
  {
    name: 'Dos de Bastos',
    number: 2,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg',
    meaningUpright:
      'Energía de la creatividad espiritual, la energía de la voluntad, conquista, dominio, belicosa, llena de intensidad y dinamismo. Energía de la posición personal "yo domino el mundo". El dominio puesto a lo terrenal y material, seguridad de sus posesiones. Es hora de tomar el mando así lograr ver florecer nuestras ambiciones nos llenará de satisfacción. Es abrirse y permitir que se acerquen.',
    meaningReversed:
      'Miedo, pérdida de interés, frustración, insatisfacción, temor por el futuro, destrucción, violencia explosiva, cobardía, irresponsabilidad, tiranía, egoísmo. Excesivamente sentimental, poco realista. Agresividad, arrogancia.',
    description:
      'Es la polaridad, el instinto y la mente se oponen, juego de poder. Refiere a una pelea ya sea con alguien o con una situación, está en una situación de guerra consigo mismo y al estarlo también lo está con el resto.',
    keywords: 'Planificación, decisiones, poder personal, dominio, ambición',
  },
  {
    name: 'Tres de Bastos',
    number: 3,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg',
    meaningUpright:
      'Desarrollo de la creatividad espiritual, liderazgo, planes seguros. Oportunidad, aventura, realización y éxito, esfuerzo, sociedades, negocios. Todo se logra de manera paciente y meditada. Es el inicio de una búsqueda donde los valores y virtudes estarán presentes. Época para planificar y viajar. En el amor: el amor y la sexualidad se viven con conciencia espiritual, es el sentido de la pareja virtuosa, pareja perfecta.',
    meaningReversed:
      'Periodo de recuerdos perturbadores, intranquilidad, desesperanza, impaciencia. Falta de visión, no estar preparado para el camino que hay por delante. La carta invita a hacer algo con lo que lo entusiasme y lo gratifique. Atraviesa momentos de temor a lo desconocido, dudas, ansiedad, miedos y preocupación.',
    description:
      'Desarrollo de la creatividad espiritual, momento de planificación y toma de decisiones estratégicas.',
    keywords: 'Expansión, previsión, progreso, oportunidades, viajes',
  },
  {
    name: 'Cuatro de Bastos',
    number: 4,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg',
    meaningUpright:
      'La consumación, conseguir nuestros objetivos, recompensa por el trabajo realizado. Mayor actividad sexual, periodo de creatividad floreciente. La carta invita a romper limitaciones físicas, mentales y emocionales para buscar una vida más plena. En el amor: el espejo de nuestras virtudes puesto en nuestra pareja, relación estable y armoniosa. Invita a buscar los condimentos en la relación para no caer en la rutina.',
    meaningReversed:
      'Posiblemente no valores lo que posee, necesidad de querer controlar todo con suprema seguridad. Sentirse incompleto, con opresión y cansancio.',
    description:
      'Celebración, estabilidad, armonía en el hogar, momento de disfrutar los logros alcanzados.',
    keywords: 'Celebración, armonía, hogar, estabilidad, logros',
  },
  {
    name: 'Cinco de Bastos',
    number: 5,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg',
    meaningUpright:
      'Aspecto destructivo de la fuerza, energía desintegradora, romper límites, retos, competición, ambición y determinación, rebelión, revolución y mando. Movimiento evolutivo y dinámico, compulsiones, impulsos, tensión, debates, concurso. Energía usada con fuerza para competir y ser reconocido y recompensado. Confusión, conflicto, pugna, desacuerdos. Hay competición sin intención de destruir. Así enfrentamos nuestras debilidades y exteriorizamos nuestros poderes. En el amor: despertar del erotismo y canalización de la energía sexual. Poco o nulo romanticismo.',
    meaningReversed:
      'Bloqueo sexual, de la competencia pasó a la guerra. Destitución, dificultades jurídicas, desacuerdos, sumisión. Despotismo, deslealtad.',
    description:
      'Conflicto, competencia, desafíos. Energía desorganizada que necesita ser canalizada correctamente.',
    keywords: 'Conflicto, competencia, desafíos, tensión, lucha',
  },
  {
    name: 'Seis de Bastos',
    number: 6,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg',
    meaningUpright:
      'Energía dinámica, fluida y autoconfianza. El 6 representa la victoria, triunfos, éxito, logros, placer tras la lucha, valentía, optimismo, riquezas, claridad, unificación, calidez emocional, oportunidades. Cuando esta carta aparece nos habla de nuevas oportunidades que se harán presentes en nuestra vida. Encontramos armonía en nuestros logros emocionales. En su interior existe una fuerte necesidad de expansión y de realización personal. En el amor: nos habla de una exitosa unión de emociones intensas, alegría y compatibilidad perfecta. Sexualidad plena lo que energiza a la relación y favorece a la realización profesional.',
    meaningReversed:
      'Orgullo y arrogancia desmedidos. Falsas amistades que solo están por nuestro éxito. Profecía autocumplida, derrotismo. Traición, ruina, decepción, demora, frustración, falsas esperanzas. Ego inflado falsamente.',
    description:
      'Victoria, reconocimiento público, éxito después del esfuerzo. Momento de celebrar los logros.',
    keywords: 'Victoria, éxito, reconocimiento, liderazgo, confianza',
  },
  {
    name: 'Siete de Bastos',
    number: 7,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Wands07.jpg',
    meaningUpright:
      'Aspecto fogoso, instinto y emociones. Tensión, el 7 viene a romper la estabilidad del 6. Oposición, lucha en la profesión, coraje y determinación, resistencia, firmeza. Ventaja sobre las adversidades. Enfrentar el miedo y asumir el riesgo confiando nuestros instintos, uso de destrezas y habilidades aprendidas. Nos invita a mantenerse firme para bloquear la energía que avanza en contra. A veces sentimos que aún dar lo mejor de nosotros no es suficiente, lo que genera una gran presión. En el amor: debe superar obstáculos y la tensión. Quizás la pareja impone cosas al compañero y corta sus alas.',
    meaningReversed:
      'Derrotas, retroceso, fracaso, miedo, autoexigencia. La carta nos invita a decidir si luchamos, nos rendimos o aprendemos a fluir sobre nuestras fuertes convicciones.',
    description:
      'Defensa, perseverancia, mantener la posición. Momento de defender lo conquistado.',
    keywords: 'Defensa, perseverancia, desafíos, valentía, resistencia',
  },
  {
    name: 'Ocho de Bastos',
    number: 8,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg',
    meaningUpright:
      'Ritmo de la voluntad/velocidad. Acción rápida, conclusión, noticias de progreso, de lo que llega a su fin y se completa. Lo que comienza como una idea se plasma en lo concreto. Momento de aprovechar la oportunidad. Puede haber alguien que nos atemoriza (personas o situaciones). El consultante lleva un tiempo acumulando rabia y dolor, su equilibrio psicofísico se ve alterado, le cuesta conectarse consigo mismo. En el amor: romances tempestuosos, pasiones repentinas e instintivas, desbordadas, es una llamarada que pronto llegará a su fin. Canaliza la ira y las frustraciones a través del sexo, por lo que las relaciones no son duraderas.',
    meaningReversed:
      'Actúa impulsivamente, sin pensar en consecuencias. Desgano. Demoras, cancelaciones, celos, peleas, discusión, confusión en los sentimientos hacia la pareja.',
    description:
      'Movimiento rápido, acción inmediata, noticias que llegan, conclusión de asuntos.',
    keywords: 'Velocidad, movimiento, acción rápida, conclusión, noticias',
  },
  {
    name: 'Nueve de Bastos',
    number: 9,
    category: 'bastos',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Tarot_Nine_of_Wands.jpg',
    meaningUpright:
      'La energía se asienta y se estructura sobre bases sólidas. Después de la tormenta llega la calma. Fortaleza, resistencia y decisión. Fortaleza interior, ambición, logros, dedicación, la fuerza espiritual del guerrero. Curación de las viejas heridas, armonía entre lo consciente y lo inconsciente, defensa de nuestros recursos. Esta carta nos indica precaución. Si seguimos en el camino actual o si ponemos un freno. El cambio es estabilidad y la estabilidad es fortaleza. En el amor: se afirma la relación, la pareja está consolidada y unida por objetivos en común, floreciendo su crecimiento y maduración. La relación podrá ser fogosa pero falta de expresión de cariño.',
    meaningReversed:
      'Oposición, privación, debilidad, ineficiencia, impotencia o incapacidad, rendición, falta de energía, descuido, bloqueos, miedos internos, heridas psicológicas, paranoia. A veces luchar nos trae un gran riesgo.',
    description:
      'Resistencia, perseverancia, preparación para el último esfuerzo. Protección de lo logrado.',
    keywords: 'Resistencia, perseverancia, defensa, precaución, fortaleza',
  },
  {
    name: 'Diez de Bastos',
    number: 10,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wands10.jpg',
    meaningUpright:
      'Nos muestra la situación límite y está impedida de avanzar. Presión, resistencia, perseverancia, determinación, exceso de obligaciones. "Quien mucho abarca, poco aprieta". Pesada carga que estamos llevando nuestras espaldas. Nos enseña a liberarnos de los miedos racionales, la moral rígida y el autoengaño y ver con claridad las imposiciones autoimpuestas como barreras psicológicas. Invita a reconsiderar tu forma de trabajar, de equilibrar las obligaciones y cuidar la salud. Invita a aprender a parar y respirar. Dejar el trabajo en el trabajo. En el amor: la relación se volvió una carga pesada, ya no vive su propia vida. Sentimientos de saturación y angustia. La relación ya no da para más.',
    meaningReversed:
      'Enfrentar las dificultades. Fuerzas que se oponen, apatía, descuido, pérdida, malicia.',
    description:
      'Sobrecarga, responsabilidades excesivas, carga pesada. Momento de delegar y liberar peso.',
    keywords: 'Sobrecarga, responsabilidad, presión, agotamiento, carga',
  },
  {
    name: 'Sota de Bastos',
    number: 11,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Wands11.jpg',
    meaningUpright:
      'Mirada hacia el futuro, gustoso de la aventura, proyectos laborales. Espíritu emprendedor, inquieto. Curiosidad. Audaz, actividad, acción inicial, entusiasmo.',
    meaningReversed:
      'Persona hiperactiva, le cuesta poner el foco en lo que debe hacer. Indica el fin de un viaje, proyectos o algo que requiere la pasión y la voluntad de la persona. Impaciencia, arrogancia, sin energía, apática, torpeza, cobardía.',
    description:
      'Mensajero de noticias, energía juvenil, espíritu aventurero y emprendedor.',
    keywords: 'Mensajero, noticias, aventura, energía juvenil, entusiasmo',
  },
  {
    name: 'Caballero de Bastos',
    number: 12,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Wands12.jpg',
    meaningUpright:
      'Es la carta con mayor poder sexual. Representa a un joven con mucha acción, propositivo que le gusta ir a la batalla y viajar. Romanticismo, fogosidad, ambición, pasión, potencia, sexualidad.',
    meaningReversed:
      'Persona con dificultad para controlar su carácter, persona que no cede. Retraso o cancelación de proyectos a nivel laboral. Temerario, violento, acción irracional, impotencia.',
    description:
      'Aventurero apasionado, impetuoso, cambios rápidos. Energía sexual poderosa.',
    keywords: 'Pasión, aventura, impetuosidad, cambio, energía sexual',
  },
  {
    name: 'Reina de Bastos',
    number: 13,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Wands13.jpg',
    meaningUpright:
      'Tiene la fama de tener gran conexión con la sexualidad, con lo místico, lo mágico. Muestra una persona con facilidad a lo exterior o magia natural. Mujer líder que proyecta y ejecuta con independencia y seguridad, sabe dirigirse a otras personas y su mirada es hacia el futuro. Liderazgo, magnetismo vivaz.',
    meaningReversed:
      'Persona insegura que utiliza sus habilidades para dañar a otros. Puede mostrar a un jefe inflexible y severo. Sin pasión, sin visión, falsedad, sin deseo sexual.',
    description:
      'Mujer magnética, líder natural, independiente. Gran conexión con su sexualidad y poder personal.',
    keywords:
      'Independencia, confianza, carisma, liderazgo femenino, atracción',
  },
  {
    name: 'Rey de Bastos',
    number: 14,
    category: 'bastos',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Wands14.jpg',
    meaningUpright:
      'Persona muy sexual, el más carismático de los reyes. Sabe dirigir, buen líder, sabio en tomar decisiones correctas en el momento preciso. (Jefe, padre, dirigente social) Carisma, poder, emprendedor, justo, determinación.',
    meaningReversed:
      'Persona violenta físicamente, mal líder, se deja someter y guiar por los demás sin dar su punto de vista. Deshonesto, despotismo, arrogancia, retrógrado, ambición desmedida.',
    description:
      'Líder carismático, visionario, emprendedor. El más sexual de los reyes.',
    keywords: 'Liderazgo, visión, carisma, emprendimiento, sexualidad',
  },
];

// =============================================================================
// ARCANOS MENORES - COPAS (14 cards)
// =============================================================================
export const ARCANOS_MENORES_COPAS: TarotCardData[] = [
  {
    name: 'As de Copas',
    number: 1,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg',
    meaningUpright:
      'Amor perfecto, inicio de relación, alegría, nacimiento, emociones intensas, creatividad, intuición, intimidad, atracción, felicidad, potencial emocional.',
    meaningReversed:
      'Amor bloqueado, ruptura, emociones reprimidas, frialdad emocional, falta de creatividad, vacío emocional.',
    description:
      'Inicio de un nuevo amor o renacimiento emocional. Copa que rebosa de amor puro.',
    keywords:
      'Amor nuevo, emociones, intuición, felicidad, potencial emocional',
  },
  {
    name: 'Dos de Copas',
    number: 2,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg',
    meaningUpright:
      'Unión, asociación, amor recíproco, compatibilidad, armonía, comunicación, equilibrio emocional, amistad, sociedades.',
    meaningReversed:
      'Ruptura, separación, desequilibrio, desacuerdos, falta de comunicación, relaciones rotas.',
    description:
      'Unión perfecta de dos personas o energías. Relación equilibrada y armoniosa.',
    keywords: 'Unión, amor recíproco, asociación, armonía, equilibrio',
  },
  {
    name: 'Tres de Copas',
    number: 3,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Cups03.jpg',
    meaningUpright:
      'Celebración, amistad, comunidad, reuniones, abundancia emocional, creatividad compartida, alegría, satisfacción.',
    meaningReversed:
      'Excesos, aislamiento social, indulgencia, triángulos amorosos, desilusión.',
    description:
      'Celebración con amigos y seres queridos. Alegría compartida y abundancia emocional.',
    keywords: 'Celebración, amistad, alegría, comunidad, abundancia',
  },
  {
    name: 'Cuatro de Copas',
    number: 4,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Cups04.jpg',
    meaningUpright:
      'Apatía, descontento, meditación, reevaluación, introspección, oportunidades perdidas, aburrimiento.',
    meaningReversed:
      'Nuevas perspectivas, motivación renovada, aceptación de oportunidades, salir de la apatía.',
    description:
      'Momento de reflexión profunda. Invitación a mirar oportunidades que se presentan.',
    keywords: 'Reflexión, apatía, meditación, reevaluación, oportunidades',
  },
  {
    name: 'Cinco de Copas',
    number: 5,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cups05.jpg',
    meaningUpright:
      'Pérdida, duelo, decepción, tristeza, remordimiento, lamentación, enfoque en lo negativo.',
    meaningReversed:
      'Aceptación, perdón, recuperación, avanzar, dejar ir el pasado.',
    description:
      'Dolor emocional por pérdida. Necesidad de procesar el duelo y mirar hacia adelante.',
    keywords: 'Pérdida, duelo, decepción, tristeza, remordimiento',
  },
  {
    name: 'Seis de Copas',
    number: 6,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Cups06.jpg',
    meaningUpright:
      'Nostalgia, recuerdos, inocencia, generosidad, niñez, pasado, reencuentros, felicidad simple.',
    meaningReversed:
      'Vivir en el pasado, idealización, resistencia al cambio, inmadurez emocional.',
    description:
      'Recuerdos del pasado y nostalgia. Reencuentros con personas o situaciones de antaño.',
    keywords: 'Nostalgia, recuerdos, inocencia, pasado, generosidad',
  },
  {
    name: 'Siete de Copas',
    number: 7,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cups07.jpg',
    meaningUpright:
      'Opciones, fantasía, ilusiones, imaginación, elecciones, confusión, deseos, sueños.',
    meaningReversed:
      'Claridad, toma de decisiones, realidad, determinación, enfoque.',
    description:
      'Múltiples opciones y posibilidades. Necesidad de discernir entre ilusión y realidad.',
    keywords: 'Opciones, fantasía, ilusiones, imaginación, elecciones',
  },
  {
    name: 'Ocho de Copas',
    number: 8,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Cups08.jpg',
    meaningUpright:
      'Abandono, búsqueda espiritual, dejar atrás, desilusión, crecimiento personal, cambio necesario.',
    meaningReversed:
      'Miedo al cambio, estancamiento, evitar problemas, negación.',
    description:
      'Dejar atrás lo conocido para buscar algo más significativo. Viaje interior.',
    keywords: 'Abandono, búsqueda, dejar atrás, crecimiento, cambio',
  },
  {
    name: 'Nueve de Copas',
    number: 9,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Cups09.jpg',
    meaningUpright:
      'Satisfacción, contentamiento, deseos cumplidos, gratificación, placer, abundancia emocional.',
    meaningReversed:
      'Insatisfacción, codicia, materialismo, deseos vacíos, indulgencia excesiva.',
    description:
      'La carta del deseo cumplido. Satisfacción emocional y material plena.',
    keywords:
      'Satisfacción, deseos cumplidos, contentamiento, placer, abundancia',
  },
  {
    name: 'Diez de Copas',
    number: 10,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Cups10.jpg',
    meaningUpright:
      'Felicidad familiar, armonía, amor duradero, plenitud emocional, paz, alegría compartida.',
    meaningReversed:
      'Conflictos familiares, desarmonía, valores rotos, desilusión en relaciones.',
    description:
      'Máxima felicidad emocional. Familia armoniosa y amor verdadero.',
    keywords: 'Felicidad, armonía familiar, plenitud, amor duradero, paz',
  },
  {
    name: 'Sota de Copas',
    number: 11,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Cups11.jpg',
    meaningUpright:
      'Mensajero emocional, creatividad, intuición, sensibilidad, romance juvenil, ofertas emocionales.',
    meaningReversed:
      'Inmadurez emocional, inseguridad, bloqueo creativo, noticias emocionales negativas.',
    description:
      'Mensajero de amor y creatividad. Energía juvenil y romántica.',
    keywords: 'Mensajero, creatividad, intuición, romance, sensibilidad',
  },
  {
    name: 'Caballero de Copas',
    number: 12,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cups12.jpg',
    meaningUpright:
      'Romántico, seductor, idealista, propuestas amorosas, caballerosidad, imaginación, arte.',
    meaningReversed:
      'Superficialidad, engaño, manipulación emocional, promesas vacías, irrealidad.',
    description:
      'El romántico por excelencia. Caballero de los sueños y el amor idealizado.',
    keywords: 'Romance, idealismo, seducción, propuestas, caballerosidad',
  },
  {
    name: 'Reina de Copas',
    number: 13,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Cups13.jpg',
    meaningUpright:
      'Intuición profunda, compasión, amor maternal, empatía, sanación emocional, espiritualidad.',
    meaningReversed:
      'Codependencia, inestabilidad emocional, manipulación, inseguridad, ahogarse en emociones.',
    description:
      'Maestra de las emociones. Profundamente intuitiva y compasiva.',
    keywords: 'Intuición, compasión, empatía, amor maternal, sanación',
  },
  {
    name: 'Rey de Copas',
    number: 14,
    category: 'copas',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Cups14.jpg',
    meaningUpright:
      'Control emocional, diplomacia, sabiduría emocional, compasión, equilibrio, consejero.',
    meaningReversed:
      'Represión emocional, frialdad, manipulación, volatilidad emocional, adicciones.',
    description: 'Maestro del equilibrio emocional. Sabio y compasivo líder.',
    keywords:
      'Equilibrio emocional, sabiduría, compasión, diplomacia, consejero',
  },
];

// =============================================================================
// ARCANOS MENORES - ESPADAS (14 cards)
// =============================================================================
export const ARCANOS_MENORES_ESPADAS: TarotCardData[] = [
  {
    name: 'As de Espadas',
    number: 1,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/1/1a/Swords01.jpg',
    meaningUpright:
      'Claridad mental, verdad, justicia, nuevas ideas, momento decisivo, corte con el pasado, victoria intelectual.',
    meaningReversed:
      'Confusión mental, injusticia, falta de claridad, ideas bloqueadas, verdades dolorosas.',
    description:
      'Espada de la verdad y claridad mental. Momento de cortar con lo que no sirve.',
    keywords: 'Claridad, verdad, ideas nuevas, justicia, decisión',
  },
  {
    name: 'Dos de Espadas',
    number: 2,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Swords02.jpg',
    meaningUpright:
      'Indecisión, estancamiento, evitar conflictos, elección difícil, bloqueo mental, negación.',
    meaningReversed:
      'Decisión tomada, claridad, fin del estancamiento, enfrentar la verdad.',
    description:
      'Parálisis por indecisión. Necesidad de quitar la venda de los ojos.',
    keywords: 'Indecisión, estancamiento, elección difícil, evitar, bloqueo',
  },
  {
    name: 'Tres de Espadas',
    number: 3,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/0/02/Swords03.jpg',
    meaningUpright:
      'Dolor emocional, traición, ruptura, tristeza profunda, corazón roto, sufrimiento.',
    meaningReversed:
      'Sanación, perdón, recuperación del dolor, liberar el sufrimiento.',
    description: 'Dolor del corazón herido. Traición o pérdida dolorosa.',
    keywords: 'Dolor, traición, ruptura, tristeza, corazón roto',
  },
  {
    name: 'Cuatro de Espadas',
    number: 4,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/bf/Swords04.jpg',
    meaningUpright:
      'Descanso, recuperación, meditación, pausa necesaria, retiro, contemplación, sanación.',
    meaningReversed:
      'Agotamiento, necesidad urgente de descanso, insomnio, inquietud mental.',
    description: 'Momento de descanso y recuperación mental. Pausa necesaria.',
    keywords: 'Descanso, recuperación, meditación, pausa, contemplación',
  },
  {
    name: 'Cinco de Espadas',
    number: 5,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Swords05.jpg',
    meaningUpright:
      'Conflicto, derrota, deshonra, traición, victoria vacía, hostilidad, pérdida.',
    meaningReversed:
      'Reconciliación, hacer las paces, aceptar la derrota, aprender de errores.',
    description:
      'Victoria que no trae satisfacción. Conflictos que dejan heridos.',
    keywords: 'Conflicto, derrota, traición, hostilidad, victoria vacía',
  },
  {
    name: 'Seis de Espadas',
    number: 6,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/29/Swords06.jpg',
    meaningUpright:
      'Transición, viaje, alejarse de problemas, recuperación, cambio gradual, calma después de tormenta.',
    meaningReversed:
      'Resistencia al cambio, quedarse en situación difícil, viaje retrasado.',
    description:
      'Alejarse de aguas turbulentas hacia calma. Transición necesaria.',
    keywords: 'Transición, viaje, alejarse, recuperación, cambio',
  },
  {
    name: 'Siete de Espadas',
    number: 7,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/34/Swords07.jpg',
    meaningUpright:
      'Engaño, estrategia, traición, robo, actuar a escondidas, astucia, deshonestidad.',
    meaningReversed:
      'Verdad revelada, confesar, dejar de huir, asumir responsabilidad.',
    description: 'Actuar con astucia o deshonestidad. Secretos y traiciones.',
    keywords: 'Engaño, estrategia, traición, astucia, secretos',
  },
  {
    name: 'Ocho de Espadas',
    number: 8,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/a/a7/Swords08.jpg',
    meaningUpright:
      'Restricción, prisión mental, limitaciones autoimpuestas, víctima, impotencia, miedo.',
    meaningReversed:
      'Liberación, empoderamiento, eliminar restricciones, nueva perspectiva.',
    description:
      'Prisión mental creada por uno mismo. Liberación está al alcance.',
    keywords: 'Restricción, prisión mental, limitaciones, víctima, miedo',
  },
  {
    name: 'Nueve de Espadas',
    number: 9,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Swords09.jpg',
    meaningUpright:
      'Ansiedad, pesadillas, preocupación extrema, miedo, culpa, tormento mental, insomnio.',
    meaningReversed:
      'Esperanza, liberación de ansiedad, buscar ayuda, sanación mental.',
    description:
      'Tormento mental y preocupaciones nocturnas. Ansiedad extrema.',
    keywords: 'Ansiedad, pesadillas, preocupación, miedo, tormento mental',
  },
  {
    name: 'Diez de Espadas',
    number: 10,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords10.jpg',
    meaningUpright:
      'Fin doloroso, traición profunda, colapso, toque fondo, crisis, derrota total.',
    meaningReversed:
      'Recuperación, resiliencia, levantarse de nuevo, fin del sufrimiento.',
    description:
      'El final más doloroso. Después de tocar fondo solo queda subir.',
    keywords: 'Fin doloroso, traición, colapso, crisis, toque fondo',
  },
  {
    name: 'Sota de Espadas',
    number: 11,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/4c/Swords11.jpg',
    meaningUpright:
      'Vigilancia, curiosidad, ideas nuevas, comunicación directa, observador, investigación.',
    meaningReversed:
      'Chismoso, espía, falta de planificación, ideas sin fundamento.',
    description: 'Mensajero de ideas y comunicación. Vigilante y observador.',
    keywords: 'Vigilancia, curiosidad, ideas, comunicación, observación',
  },
  {
    name: 'Caballero de Espadas',
    number: 12,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Swords12.jpg',
    meaningUpright:
      'Acción rápida, ambición, determinación, intelectual, directo, impulsivo, agresivo.',
    meaningReversed:
      'Imprudencia, arrogancia, sin dirección, agresividad descontrolada.',
    description: 'Guerrero intelectual impetuoso. Acción rápida y determinada.',
    keywords: 'Acción rápida, ambición, determinación, impulsivo, directo',
  },
  {
    name: 'Reina de Espadas',
    number: 13,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Swords13.jpg',
    meaningUpright:
      'Inteligencia, independencia, claridad mental, honestidad directa, viuda, soledad elegida.',
    meaningReversed:
      'Frialdad, amargura, crueldad, rencor, crítica destructiva.',
    description:
      'Mujer de mente aguda y corazón fuerte. Independiente y clara.',
    keywords: 'Inteligencia, independencia, claridad, honestidad, soledad',
  },
  {
    name: 'Rey de Espadas',
    number: 14,
    category: 'espadas',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/3/33/Swords14.jpg',
    meaningUpright:
      'Autoridad intelectual, verdad, lógica, juicio imparcial, disciplina mental, honestidad.',
    meaningReversed:
      'Tiranía, manipulación, crueldad, abuso de poder, frialdad emocional.',
    description: 'Maestro de la lógica y la razón. Juez imparcial y honesto.',
    keywords: 'Autoridad, verdad, lógica, juicio, disciplina mental',
  },
];

// =============================================================================
// ARCANOS MENORES - OROS (14 cards)
// =============================================================================
export const ARCANOS_MENORES_OROS: TarotCardData[] = [
  {
    name: 'As de Oros',
    number: 1,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Pents01.jpg',
    meaningUpright:
      'Nueva oportunidad financiera, prosperidad, abundancia, manifestación, comienzo material, éxito.',
    meaningReversed:
      'Oportunidad perdida, escasez, mala planificación financiera, codicia.',
    description:
      'Semilla de abundancia material. Nueva oportunidad de prosperidad.',
    keywords: 'Prosperidad, abundancia, oportunidad, manifestación, éxito',
  },
  {
    name: 'Dos de Oros',
    number: 2,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Pents02.jpg',
    meaningUpright:
      'Equilibrio, adaptabilidad, prioridades, malabarismo, múltiples responsabilidades.',
    meaningReversed:
      'Desequilibrio, desorganización, pérdida de control, sobrecarga.',
    description:
      'Malabarear múltiples responsabilidades. Necesidad de equilibrio.',
    keywords:
      'Equilibrio, adaptabilidad, malabarismo, prioridades, flexibilidad',
  },
  {
    name: 'Tres de Oros',
    number: 3,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents03.jpg',
    meaningUpright:
      'Trabajo en equipo, colaboración, maestría, aprendizaje, calidad, construcción.',
    meaningReversed:
      'Falta de trabajo en equipo, desorganización, falta de habilidad.',
    description: 'Colaboración exitosa. Maestría en el trabajo.',
    keywords: 'Trabajo en equipo, colaboración, maestría, aprendizaje, calidad',
  },
  {
    name: 'Cuatro de Oros',
    number: 4,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Pents04.jpg',
    meaningUpright:
      'Avaricia, control, posesividad, seguridad material, ahorro excesivo, miedo a perder.',
    meaningReversed: 'Generosidad, liberación, dejar ir el control, gastar.',
    description: 'Aferrarse demasiado a lo material. Necesidad de soltar.',
    keywords: 'Control, posesividad, seguridad, avaricia, miedo',
  },
  {
    name: 'Cinco de Oros',
    number: 5,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Pents05.jpg',
    meaningUpright:
      'Pobreza, dificultades financieras, enfermedad, aislamiento, pérdida, necesidad.',
    meaningReversed:
      'Recuperación financiera, ayuda recibida, mejora de situación.',
    description: 'Dificultades materiales. Ayuda está disponible si se busca.',
    keywords: 'Pobreza, dificultades, enfermedad, pérdida, necesidad',
  },
  {
    name: 'Seis de Oros',
    number: 6,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Pents06.jpg',
    meaningUpright:
      'Generosidad, caridad, compartir riqueza, dar y recibir, equilibrio financiero.',
    meaningReversed:
      'Deudas, codicia, aprovecharse, desequilibrio en dar/recibir.',
    description: 'Generosidad y compartir. Equilibrio entre dar y recibir.',
    keywords: 'Generosidad, caridad, compartir, dar y recibir, equilibrio',
  },
  {
    name: 'Siete de Oros',
    number: 7,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Pents07.jpg',
    meaningUpright:
      'Paciencia, inversión a largo plazo, espera de resultados, evaluación, perseverancia.',
    meaningReversed:
      'Impaciencia, falta de resultados, esfuerzo desperdiciado, ansiedad.',
    description: 'Esperar la cosecha. Evaluar inversiones y esfuerzos.',
    keywords: 'Paciencia, inversión, espera, evaluación, perseverancia',
  },
  {
    name: 'Ocho de Oros',
    number: 8,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/Pents08.jpg',
    meaningUpright:
      'Maestría, dedicación, trabajo duro, habilidad, aprendizaje, perfeccionamiento.',
    meaningReversed:
      'Falta de enfoque, trabajo mal hecho, falta de ambición, perfeccionismo.',
    description: 'Dedicación al trabajo y perfeccionamiento de habilidades.',
    keywords: 'Maestría, dedicación, habilidad, trabajo duro, aprendizaje',
  },
  {
    name: 'Nueve de Oros',
    number: 9,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Pents09.jpg',
    meaningUpright:
      'Abundancia, lujo, autosuficiencia, éxito material, independencia financiera.',
    meaningReversed:
      'Dependencia financiera, pérdida de estabilidad, trabajo excesivo.',
    description: 'Éxito y abundancia alcanzada. Disfrute de logros materiales.',
    keywords: 'Abundancia, lujo, autosuficiencia, éxito, independencia',
  },
  {
    name: 'Diez de Oros',
    number: 10,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Pents10.jpg',
    meaningUpright:
      'Riqueza familiar, legado, estabilidad financiera, tradiciones, herencias, prosperidad.',
    meaningReversed:
      'Pérdida financiera, problemas familiares, valores rotos, disputas por dinero.',
    description: 'Máxima abundancia material y familiar. Legado y herencia.',
    keywords: 'Riqueza, legado, estabilidad, tradiciones, prosperidad familiar',
  },
  {
    name: 'Sota de Oros',
    number: 11,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Pents11.jpg',
    meaningUpright:
      'Estudiante aplicado, oportunidad de aprendizaje, noticias financieras, manifestación.',
    meaningReversed:
      'Falta de progreso, procrastinación, desinterés, oportunidad perdida.',
    description: 'Mensajero de oportunidades materiales. Estudiante dedicado.',
    keywords: 'Estudiante, oportunidad, aprendizaje, noticias, manifestación',
  },
  {
    name: 'Caballero de Oros',
    number: 12,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Pents12.jpg',
    meaningUpright:
      'Responsabilidad, trabajo duro, confiabilidad, rutina, conservador, metódico.',
    meaningReversed:
      'Pereza, estancamiento, aburrimiento, falta de iniciativa.',
    description: 'Trabajador confiable y metódico. Progreso lento pero seguro.',
    keywords: 'Responsabilidad, trabajo duro, confiabilidad, metódico, rutina',
  },
  {
    name: 'Reina de Oros',
    number: 13,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Pents13.jpg',
    meaningUpright:
      'Nutrición, abundancia práctica, seguridad, confort, generosidad maternal, estabilidad.',
    meaningReversed:
      'Dependencia financiera, descuido del hogar, trabajólica, materialismo.',
    description: 'Madre tierra generosa. Nutrición y abundancia práctica.',
    keywords: 'Nutrición, abundancia, seguridad, confort, generosidad',
  },
  {
    name: 'Rey de Oros',
    number: 14,
    category: 'oros',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Pents14.jpg',
    meaningUpright:
      'Riqueza, éxito empresarial, liderazgo práctico, seguridad, abundancia, generosidad.',
    meaningReversed:
      'Corrupción, codicia, materialismo extremo, mal uso del poder.',
    description:
      'Maestro de los negocios y finanzas. Líder próspero y generoso.',
    keywords: 'Riqueza, éxito, liderazgo, seguridad, abundancia',
  },
];

// =============================================================================
// EXPORT ALL CARDS (78 total)
// =============================================================================
export const ALL_TAROT_CARDS: TarotCardData[] = [
  ...ARCANOS_MAYORES, // 22 cards
  ...ARCANOS_MENORES_BASTOS, // 14 cards
  ...ARCANOS_MENORES_COPAS, // 14 cards
  ...ARCANOS_MENORES_ESPADAS, // 14 cards
  ...ARCANOS_MENORES_OROS, // 14 cards
];

// Total: 22 + 14 + 14 + 14 + 14 = 78 cards
