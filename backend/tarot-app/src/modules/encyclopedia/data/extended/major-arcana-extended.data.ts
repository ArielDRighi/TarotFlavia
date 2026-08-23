import { CardExtendedContentMap } from './card-extended-content.types';

/**
 * Contenido extendido de los 22 Arcanos Mayores (T-SEO-009)
 *
 * Las cartas del viaje del héroe: arquetipos, no situaciones cotidianas.
 * La sección de bienestar habla de energía, descanso, hábitos y ánimo.
 */
export const MAJOR_ARCANA_EXTENDED_CONTENT: CardExtendedContentMap = {
  'the-fool': {
    meaningLove:
      'Un amor que empieza sin manual: alguien que aparece cuando no lo buscabas y desordena la agenda entera. El Loco invita a decir que sí antes de tener garantías, a viajar juntos sin itinerario, a mostrarte sin la versión ensayada de ti mismo. En una pareja de años propone romper la rutina con algo que nunca hicieron. Lo que no promete es previsibilidad: esta carta abre puertas y no sostiene puertas. Si buscas seguridad, esta no es la energía que te va a dar el mapa.',
    meaningWork:
      'El salto: dejar el trabajo estable por el proyecto propio, cambiar de rubro sin experiencia previa, aceptar la propuesta que asusta. El Loco favorece los comienzos audaces y castiga los cálculos eternos. Es excelente para emprender, mudarse de ciudad por trabajo o empezar a estudiar algo que no tiene nada que ver con tu recorrido. En el dinero indica riesgo sin red: puede salir muy bien, y conviene tener cubierto lo básico antes de dar el salto.',
    meaningWellbeing:
      'Vuelve la energía del que empieza de cero: ganas de probar cosas nuevas, de moverte sin plan, de salir a caminar sin destino. Es un momento excelente para actividades que no habías hecho nunca, sin exigirte rendimiento ni comparar con nadie. El ánimo está liviano y curioso. El único cuidado es el descuido: el Loco no mira el precipicio, así que verifica lo elemental —calzado, hidratación, límites del cuerpo— antes de lanzarte a la aventura.',
    symbolism:
      'Un joven avanza con la cabeza en alto justo al borde de un precipicio blanco, sin mirar el suelo. Lleva una rosa blanca en una mano —el deseo puro, sin cálculo— y al hombro una vara negra con un hatillo diminuto: todo su equipaje cabe en un pañuelo. Un perro blanco salta a sus pies, ladrando: el instinto que avisa. El sol brilla detrás en un cielo amarillo pleno y las montañas nevadas del fondo marcan lo que falta recorrer. Es la carta sin número: puede ir al principio o al final, porque el que se anima nunca termina de llegar.',
    advice:
      'Da el salto que venías postergando. Esta carta no premia al que espera el momento perfecto sino al que se anima con lo que tiene puesto. Al mismo tiempo, escucha al perro: hay una señal mínima de sensatez que conviene atender antes de saltar, y no es lo mismo que la voz del miedo. Distínguelas y después arranca sin mirar tanto para atrás.',
    yesNo:
      'Sí, con espíritu de aventura y sin garantías. La respuesta favorece a quien se anima a lo desconocido y desalienta a quien está buscando certezas antes de moverse.',
    combinations: [
      {
        cardSlug: 'the-magician',
        reading:
          'El impulso encuentra herramientas. Lo que empieza como un salto de fe tiene con qué concretarse: es una de las mejores secuencias del mazo para lanzar un proyecto propio desde cero.',
      },
      {
        cardSlug: 'the-world',
        reading:
          'El final y el principio se tocan. Un ciclo se cierra completo y otro empieza en el mismo movimiento: suele marcar viajes, mudanzas y etapas de vida que cambian por entero.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'El salto llega después del derrumbe, o el derrumbe llega por el salto. En cualquier orden, la combinación pide revisar la sensatez elemental antes de dar el paso.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'El deseo de aventura choca con el miedo a perder lo poco seguro que tienes. La carta no dice cuál gana: dice que estás en esa tensión y que no puedes estar en las dos.',
      },
      {
        cardSlug: 'page-of-wands',
        reading:
          'Dos comienzos que se potencian: el salto sin plan y la curiosidad que quiere probarlo todo. Entra igual, y consigue a alguien con recorrido que te acompañe en las decisiones grandes, porque en esta dupla nadie tiene experiencia previa.',
      },
    ],
  },
  'the-magician': {
    meaningLove:
      'Tienes todo lo necesario para crear el vínculo que quieres, y esta carta te pide que lo hagas con intención. Marca conquistas exitosas, comunicación que convence y momentos en los que dices exactamente lo que hacía falta. En pareja indica que se puede rediseñar la dinámica de común acuerdo. La sombra es la manipulación: la misma habilidad que seduce puede usarse para controlar. La pregunta que deja es si estás construyendo algo verdadero o simplemente demostrando que puedes.',
    meaningWork:
      'Tienes los recursos, las herramientas y el talento sobre la mesa: lo que falta es ponerlos a trabajar. Es una carta excelente para lanzamientos, presentaciones, ventas y todo lo que dependa de tu capacidad de comunicar valor. Suele aparecer cuando alguien subestima lo que ya sabe hacer. En lo económico indica que la mejora depende de una decisión tuya y no de un factor externo: los cuatro elementos ya están en el altar, falta que empieces.',
    meaningWellbeing:
      'Buena energía disponible y mucha capacidad de dirigirla: es el momento de decidir conscientemente cómo la usas. Funciona muy bien todo lo que combine cuerpo y atención plena. Es una etapa favorable para instalar un cambio de hábito con método, porque tu voluntad está alineada con tu intención. Cuida la dispersión: el poder de esta carta se diluye si lo repartes entre demasiados frentes al mismo tiempo.',
    symbolism:
      'Un hombre de túnica blanca y manto rojo levanta una vara de doble punta hacia el cielo mientras señala la tierra con la otra mano: el axioma "como es arriba, es abajo" en un solo gesto. Sobre la mesa descansan los cuatro palos del Tarot —copa, basto, espada y oro—, todos los recursos disponibles. Encima de su cabeza flota el símbolo del infinito y una serpiente que se muerde la cola le ciñe la cintura. Rosas rojas y lirios blancos crecen alrededor: el deseo y la pureza de intención sostenidos a la vez.',
    advice:
      'Empieza con lo que ya tienes. La carta insiste en que los recursos están sobre tu mesa y que la espera no es prudencia sino postergación. Define una intención clara —una sola, escrita en una frase— y actúa en esa dirección todos los días de esta semana. Y usa tu capacidad de convencer para algo que te enorgullezca contar después.',
    yesNo:
      'Sí, y depende de ti. Es una respuesta afirmativa condicionada a tu iniciativa: los medios están disponibles, la voluntad de usarlos es lo que decide.',
    combinations: [
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'La habilidad se cruza con una oportunidad material concreta. Talento, recursos y propuesta real en la misma escena: pocas combinaciones del mazo son tan favorables para empezar un negocio propio.',
      },
      {
        cardSlug: 'the-high-priestess',
        reading:
          'Acción y silencio se equilibran. Antes de manifestar conviene escuchar lo que todavía no se dijo: la dupla pide unir la iniciativa con la intuición y no elegir una sola.',
      },
      {
        cardSlug: 'seven-of-swords',
        reading:
          'La habilidad se pone al servicio del engaño. Alguien muy capaz está manejando información a su favor, y puede que ese alguien seas tú: revisa tus propios atajos.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'Talento con propósito, que es una coincidencia rara. Lo que hagas ahora tiene técnica y además sentido para ti: es un momento excelente para los proyectos vocacionales que venías postergando.',
      },
    ],
  },
  'the-high-priestess': {
    meaningLove:
      'Hay algo que no se está diciendo, y conviene escuchar antes de hablar. Marca vínculos donde lo importante sucede en silencio: atracciones no declaradas, amores secretos, intuiciones sobre el otro que todavía no tienen prueba. En pareja indica una etapa de misterio y de intimidad profunda, donde no todo se explica con palabras. Si estás sin pareja, aconseja no forzar: lo que se está gestando necesita tiempo. Confía en lo que percibes incluso sin evidencia.',
    meaningWork:
      'Información que todavía no es pública, decisiones que se están tomando puertas adentro, un proyecto que conviene no anunciar. La Sacerdotisa aconseja observar y guardar silencio en lugar de mostrar todas las cartas. Es favorable para investigación, estudio, escritura y trabajos que requieren discreción. Del lado del dinero, indica que falta un dato importante: no firmes ni inviertas hasta tenerlo. Tu intuición sobre esa persona o esa propuesta suele estar acertando.',
    meaningWellbeing:
      'El cuerpo pide silencio y ciclos propios. Es una etapa para prestar atención a las señales sutiles: cuándo tienes hambre de verdad, cuándo el cansancio es físico y cuándo es de otra cosa. Funcionan muy bien la meditación, el registro de sueños y todo lo que baje el ruido externo. El ánimo es introspectivo y algo reservado. Descansa más de lo que te parece necesario: en esta carta la reparación sucede hacia adentro y sin espectadores.',
    symbolism:
      'Una mujer con una tiara lunar de tres fases está sentada entre dos columnas, una negra con la letra B y otra blanca con la J —Boaz y Jachin, el templo de Salomón—, con un velo bordado de granadas y palmeras detrás: lo que oculta es exactamente lo que hay que atravesar. Sostiene un rollo parcialmente cubierto por el manto, con la palabra Tora apenas visible: el conocimiento se muestra a medias. A sus pies asoma una luna creciente. El agua corre detrás del velo, señal de que lo inconsciente fluye aunque no se vea.',
    advice:
      'Escucha antes de actuar y no cuentes todo. Esta carta trabaja con lo que se gesta en silencio: la respuesta que buscas no está en pedir más opiniones sino en darte un rato a solas para escuchar la tuya. Anota lo que sueñes y lo que intuyas esta semana, sin juzgarlo. Y espera: hay información que todavía no está disponible.',
    yesNo:
      'Todavía no se puede saber. La carta pide esperar a que se revele lo que hoy está oculto, y sugiere que tu intuición ya sabe algo que la razón aún no confirmó.',
    combinations: [
      {
        cardSlug: 'the-moon',
        reading:
          'Lo inconsciente domina la escena por completo. Hay información oculta y también una dosis de autoengaño: distingue lo que percibes de lo que temes antes de tomar cualquier decisión importante.',
      },
      {
        cardSlug: 'queen-of-cups',
        reading:
          'Intuición doble y muy afinada. Lo que percibes es exacto aunque no puedas probarlo: es una de las mejores duplas del mazo para confiar en la propia lectura.',
      },
      {
        cardSlug: 'the-emperor',
        reading:
          'El saber íntimo choca con la estructura formal. Hay que traducir lo que intuyes a un lenguaje de reglas y argumentos para que del otro lado lo tomen en serio.',
      },
      {
        cardSlug: 'page-of-swords',
        reading:
          'Alguien está investigando lo que se maneja en reserva. La información existe pero no está a la vista: escucha más de lo que preguntes y no fuerces las respuestas.',
      },
      {
        cardSlug: 'queen-of-swords',
        reading:
          'La intuición se encuentra con el criterio afilado. Lo que percibes sin poder explicarlo coincide con lo que el análisis frío ya venía marcando: cuando esas dos lecturas se superponen, conviene hacerles caso.',
      },
    ],
  },
  'the-empress': {
    meaningLove:
      'Abundancia afectiva: una relación que nutre, donde se disfruta del cuerpo, de la comida, del tiempo compartido sin apuro. La Emperatriz marca fertilidad en todos los sentidos, incluida la literal: es una de las cartas que más aparece en consultas por embarazo. En pareja indica una etapa sensual y generosa. Si estás sin pareja, señala que estás en un momento atractivo y receptivo. La sombra es la sobreprotección: cuidar de más termina asfixiando lo que se quiere hacer crecer.',
    meaningWork:
      'Proyectos que crecen y dan frutos, especialmente los creativos. Es una carta excelente para todo lo que tenga que ver con producir, criar, cultivar y sostener: emprendimientos gastronómicos, arte, diseño, cuidado de personas, agricultura. Indica que el terreno está fértil y que lo sembrado prende. En el dinero anticipa abundancia y también gasto generoso: entra bien y sale con la misma facilidad, así que conviene poner alguna regla antes de que se vaya todo en placeres.',
    meaningWellbeing:
      'El cuerpo pide disfrute y cuidado: comer bien y sin culpa, dormir lo suficiente, moverte con placer y no por obligación. Es una etapa de energía abundante y ánimo cálido. Funciona muy bien todo lo que conecte con lo sensorial y con la naturaleza: caminar entre árboles, cocinar, el contacto físico. El punto a mirar es el exceso: la abundancia sin ninguna medida termina pesando. Disfruta con intención y el cuerpo acompaña sin problemas.',
    symbolism:
      'Una mujer embarazada descansa recostada sobre almohadones en medio de un campo de trigo maduro, con un cetro en la mano y una corona de doce estrellas: los signos del zodíaco, el ciclo completo del año. Su vestido está estampado con granadas, fruto de la fertilidad. A su lado, un escudo con forma de corazón lleva el símbolo de Venus. Detrás corre una cascada entre árboles frondosos. Todo en la carta está maduro, blando y en producción: es la naturaleza en su punto exacto, antes de la cosecha.',
    advice:
      'Cuida lo que estás haciendo crecer y date placer sin culpa. Esta carta pide generosidad concreta: cocinar para alguien, regar el proyecto, dedicarle tiempo a lo que empezó hace poco. Y al mismo tiempo, suelta un poco: hay cosas que crecen mejor cuando dejas de intervenir todo el tiempo. Come bien, descansa y confía en el ritmo de lo que sembraste.',
    yesNo:
      'Sí, con abundancia y crecimiento. Es una de las respuestas más fértiles del mazo, especialmente en preguntas sobre familia, creatividad y proyectos que necesitan tiempo.',
    combinations: [
      {
        cardSlug: 'ace-of-cups',
        reading:
          'Fertilidad emocional desbordante. Lo que nace en este clima crece rápido y con abundancia: aparece mucho en consultas por embarazos y por proyectos creativos que despegan.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'La familia crece y también el patrimonio. Muy favorable para casas nuevas, mudanzas familiares y decisiones que amplían la vida compartida con base material sólida.',
      },
      {
        cardSlug: 'the-emperor',
        reading:
          'Nutrición y estructura juntas: lo que crece encuentra un marco que lo sostiene. Es la combinación clásica de un proyecto fértil que además tiene reglas claras.',
      },
      {
        cardSlug: 'four-of-cups',
        reading:
          'La abundancia está disponible y el desgano no la deja ver. Tienes más de lo que reconoces: la dupla pide levantar la vista antes de salir a buscar otra cosa.',
      },
      {
        cardSlug: 'page-of-cups',
        reading:
          'Una noticia tierna llega a un terreno especialmente fértil. Es de las combinaciones que más aparecen en consultas por embarazos, y también por creaciones que nacen chicas y crecen solas si alguien las cuida.',
      },
    ],
  },
  'the-emperor': {
    meaningLove:
      'Un vínculo con reglas claras y compromiso explícito. El Emperador aporta estabilidad, protección y palabra que se cumple; también rigidez cuando se pasa de rosca. En pareja marca la etapa de definir acuerdos: quién hace qué, hacia dónde van, qué se espera de cada uno. Si describe a una persona, es confiable y algo dominante. La sombra es el control: cuando la estructura reemplaza a la conversación, el vínculo se vuelve un reglamento y el otro deja de sentirse elegido.',
    meaningWork:
      'Autoridad, orden y planificación. Es la carta del jefe, del cargo con responsabilidad, de la empresa que se organiza y del proyecto que necesita reglas para funcionar. Favorece los trámites formales, los contratos, la constitución de sociedades y todo lo institucional. Indica que el éxito depende de estructurar bien y no de improvisar. En el bolsillo, marca administración firme, presupuestos y decisiones de largo plazo tomadas con la cabeza y no con el entusiasmo.',
    meaningWellbeing:
      'La disciplina es lo que sostiene la energía en esta etapa: horarios fijos, rutinas claras, límites definidos. El cuerpo responde bien a la estructura y mal a la improvisación. Es un buen momento para ordenar los hábitos con un plan concreto y sostenerlo. El riesgo es la rigidez: exigirte sin escuchar las señales de cansancio termina saliendo caro. Pon las reglas y también las excepciones, escritas de antemano, para no discutirlas en el momento.',
    symbolism:
      'Un hombre maduro de barba blanca está sentado en un trono de piedra maciza decorado con cuatro cabezas de carnero, el animal de Aries y del impulso que funda. Viste armadura bajo el manto rojo: la autoridad de esta carta ya peleó por lo que tiene. Sostiene un cetro con forma de anj —la vida— y un orbe. Detrás se alzan montañas áridas y un río mínimo corre al pie: casi nada de agua, casi nada de emoción en la escena. El trono es incómodo a propósito, porque gobernar no es descansar.',
    advice:
      'Ponle estructura a lo que está desordenado. Define las reglas del juego, escríbelas y comunícalas: la mayor parte del conflicto que estás viviendo viene de acuerdos que nunca se explicitaron. Asume la autoridad que te corresponde en lugar de esperar que alguien la ejerza por ti. Y revisa si alguna de tus reglas ya no sirve más que para no tener que pensar.',
    yesNo:
      'Sí, con orden y responsabilidad. La respuesta favorece a lo que esté bien estructurado y desalienta cualquier avance improvisado o sin acuerdos claros.',
    combinations: [
      {
        cardSlug: 'king-of-pentacles',
        reading:
          'Autoridad y solidez material en la misma escena. Todo lo que necesite fundarse con reglas claras y respaldo económico encuentra aquí su mejor momento posible.',
      },
      {
        cardSlug: 'justice',
        reading:
          'La estructura se somete a la ley. Trámites, contratos y decisiones formales avanzan bien: es una dupla muy favorable para todo lo legal y lo institucional.',
      },
      {
        cardSlug: 'the-fool',
        reading:
          'La regla choca de frente con el impulso de largarse a lo desconocido. La combinación no resuelve la tensión: solo pide elegir a conciencia, porque hay etapas para consolidar y etapas para saltar.',
      },
      {
        cardSlug: 'eight-of-swords',
        reading:
          'La estructura se volvió una jaula. Las reglas que te protegían ahora te limitan: revisa cuáles siguen teniendo sentido y cuáles sostienes por pura costumbre.',
      },
      {
        cardSlug: 'knight-of-pentacles',
        reading:
          'La autoridad se apoya en alguien que cumple sin fallar. No es la dupla más veloz del mazo y sí una de las más confiables: lo que se ordene ahora se va a ejecutar tal cual quedó escrito.',
      },
    ],
  },
  'the-hierophant': {
    meaningLove:
      'La relación busca una forma reconocida: casamiento, convivencia formal, presentación a la familia, compromiso ante los demás. El Hierofante marca vínculos con valores compartidos y también el peso de la tradición y del "qué corresponde". En pareja indica una etapa de acuerdos serios. Si estás sin pareja, señala que buscas algo convencional en el mejor sentido: estable y con reglas conocidas. La sombra es la convención vacía: sostener la forma cuando el contenido ya se fue.',
    meaningWork:
      'Instituciones, jerarquías y caminos formales: estudiar una carrera, obtener una certificación, entrar a una organización grande, respetar el procedimiento establecido. Es la carta del mentor y también del reglamento. Favorece todo lo académico, lo religioso, lo jurídico y lo tradicional. Para las finanzas, indica ingresos estables dentro de una estructura conocida y decisiones conservadoras. Aconseja hacerlo por el canal oficial, aunque sea más lento que el atajo que estás considerando.',
    meaningWellbeing:
      'Los métodos probados funcionan mejor que las novedades en esta etapa. Busca orientación de alguien con formación y experiencia, y sigue un programa establecido en lugar de armarlo por tu cuenta. Las rutinas tradicionales y las prácticas con siglos de historia —caminar, respirar, comer con horarios regulares— rinden más que cualquier método nuevo. El ánimo se ordena con el ritual: repetir lo mismo a la misma hora tiene un efecto real sobre el descanso.',
    symbolism:
      'Una figura con triple corona está sentada entre dos columnas grises, con la mano derecha alzada en señal de bendición y un cetro papal de triple cruz en la izquierda. Dos monjes de tonsura se arrodillan a sus pies, uno con rosas y otro con lirios: pasión y pureza, los dos caminos que la doctrina intenta ordenar. Entre ellos, dos llaves cruzadas en el suelo: el acceso al conocimiento que se transmite, no el que se descubre solo. Todo es simétrico, gris y estable, sin paisaje visible detrás.',
    advice:
      'Busca el consejo de alguien con experiencia y haz las cosas por el camino formal. Esta carta no premia la originalidad sino el aprendizaje de lo que ya funciona: consulta al que sabe, anótate en el curso reconocido, cumple el procedimiento. Y revisa qué tradiciones estás sosteniendo solo por costumbre: no todas merecen tu tiempo.',
    yesNo:
      'Sí, por la vía tradicional. La respuesta es favorable si sigues el camino establecido, y se vuelve dudosa si intentas resolverlo con un atajo por afuera.',
    combinations: [
      {
        cardSlug: 'two-of-cups',
        reading:
          'La unión se formaliza. Casamiento, contrato de sociedad o compromiso hecho público: lo que venía funcionando en privado adopta una forma que los demás reconocen.',
      },
      {
        cardSlug: 'three-of-pentacles',
        reading:
          'Formación reconocida y oficio en la misma línea: una carrera, una certificación, un título que habilita. El aprendizaje formal termina abriendo puertas que la sola experiencia no llegaba a abrir.',
      },
      {
        cardSlug: 'the-lovers',
        reading:
          'Hay que elegir entre lo que corresponde y lo que se siente. La combinación no resuelve por ti: solo advierte que la decisión no admite quedar bien con todos.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'La institución se sacude. Una estructura que parecía inamovible se cae y con ella una manera de hacer las cosas: lo que sigue va a tener que inventarse.',
      },
      {
        cardSlug: 'wheel-of-fortune',
        reading:
          'Lo que parecía fijo entra en movimiento. La tradición no se rompe, cambia de ciclo: conviene revisar qué parte del procedimiento sigue sirviendo y cuál quedó atada a un contexto que ya pasó.',
      },
    ],
  },
  'the-lovers': {
    meaningLove:
      'Una elección del corazón que tiene consecuencias. No es solo la carta del romance: es la del momento en que hay que decidir con quién, cómo y a costa de qué. Marca uniones profundas y conscientes, y también triángulos y encrucijadas. En pareja indica una definición pendiente que ya no se puede posponer. Si estás sin pareja, señala una atracción fuerte que te obliga a saber qué quieres de verdad. Lo que se elija aquí va a ordenar los años siguientes.',
    meaningWork:
      'Una decisión importante entre dos caminos, muchas veces entre lo que conviene y lo que te gusta. También marca sociedades, contratos y alianzas donde los valores de ambas partes tienen que estar alineados. Es una carta que pide elegir con conciencia y no por descarte. En el dinero indica una decisión que define el rumbo: aceptar la propuesta o quedarte, invertir en esto o en aquello. No hay opción neutral en esta encrucijada.',
    meaningWellbeing:
      'El bienestar depende de la coherencia entre lo que haces y lo que quieres. Esta carta suele aparecer cuando el cuerpo empieza a acusar el costo de una vida que no elegiste del todo. Es un buen momento para decidir qué hábitos conservas y cuáles dejas, con criterio propio y sin copiar lo que hace todo el mundo. El ánimo mejora notablemente en cuanto tomas la decisión que venías postergando, incluso antes de ejecutarla.',
    symbolism:
      'Un hombre y una mujer desnudos están de pie bajo un ángel enorme de alas rojas que los bendice desde una nube, con el sol pleno detrás. Ella mira al ángel, él la mira a ella: la conexión con lo alto pasa por el otro. Detrás de la mujer se alza el árbol del conocimiento con la serpiente enroscada; detrás del hombre, un árbol de doce llamas, los signos del zodíaco. Entre ambos, a lo lejos, se levanta una montaña. La escena es el Edén antes de la elección, con todo todavía posible.',
    advice:
      'Elige a conciencia y hazte cargo de lo que la elección deja afuera. Esta carta no admite la estrategia de esperar a que la decisión se tome sola: eso también es elegir, pero sin dirección. Pregúntate qué valor quieres que ordene esta etapa de tu vida y decide en función de eso, no de lo que sería más cómodo explicar.',
    yesNo:
      'Sí, si eliges con el corazón y con conciencia. La carta pide una decisión honesta en lugar de una respuesta cómoda, y avisa que no elegir tiene su propio costo.',
    combinations: [
      {
        cardSlug: 'two-of-cups',
        reading:
          'La elección encuentra reciprocidad. La atracción y la decisión consciente coinciden: es de las mejores señales del mazo para un vínculo que se define bien.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La misma escena, con cadenas. Lo que parece elección puede ser dependencia: pregúntate si te quedas por deseo o porque no te animas a soltar.',
      },
      {
        cardSlug: 'three-of-swords',
        reading:
          'La decisión lastima a alguien. No hay salida sin costo emocional en esta encrucijada: lo que sí puedes elegir es decirlo de frente y a tiempo.',
      },
      {
        cardSlug: 'two-of-swords',
        reading:
          'La elección está bloqueada porque hay algo que no quieres mirar. Saca la venda: la información que dices que te falta probablemente ya la tienes y lo que estás evitando es procesarla.',
      },
    ],
  },
  'the-chariot': {
    meaningLove:
      'Avance decidido: alguien que va por lo que quiere y lo consigue. Marca vínculos que superan un obstáculo por pura voluntad, relaciones a distancia que se sostienen y decisiones que mueven a la pareja de lugar, literalmente. En una relación estancada, indica que hace falta tomar las riendas en vez de esperar. La sombra es la imposición: avanzar sin mirar si el otro quiere ir a ese lugar. Conducir la carroza está bien; conducirla por los dos, no.',
    meaningWork:
      'Progreso, control y victoria por determinación. Es una carta excelente para proyectos que necesitan empuje sostenido, para viajes de trabajo, mudanzas de oficina y competencias donde gana el más enfocado. Indica que tienes el mando de la situación aunque las fuerzas que manejes tiren para lados distintos. En materia de dinero, marca avance concreto por gestión propia: no hay suerte en esta carta, hay dirección y disciplina aplicadas durante el tiempo suficiente.',
    meaningWellbeing:
      'Energía alta y bien dirigida, ideal para exigirte con un objetivo claro: una meta física, una rutina intensa, un plan con fecha. El cuerpo responde bien a la disciplina en esta etapa. El riesgo es la tensión sostenida: conducir todo el tiempo cansa, y la Carroza no tiene freno propio. Programa las pausas de antemano, porque el impulso de esta carta no las va a proponer solo y el cuerpo termina imponiéndolas de otra forma.',
    symbolism:
      'Un guerrero coronado con una estrella conduce una carroza de piedra tirada por dos esfinges, una blanca y una negra, que miran en direcciones opuestas: las fuerzas contrarias que hay que gobernar juntas. No lleva riendas —el control es mental, no manual—, sino una vara. Sobre la carroza hay un palio de estrellas y en el frente, un escudo con un trompo alado. Su armadura tiene lunas en los hombros y un cinturón de símbolos zodiacales. Detrás, la ciudad que dejó atrás para avanzar.',
    advice:
      'Toma las riendas y avanza en una sola dirección. Esta carta pide foco: elige un objetivo, ponle fecha y subordina el resto durante ese período. Las fuerzas que tiras para lados opuestos —el deseo y el deber, la prisa y el miedo— no se eliminan, se conducen. Y avisa a quienes viajan contigo hacia dónde estás yendo.',
    yesNo:
      'Sí, con esfuerzo y determinación. La respuesta es claramente favorable si tomas el control de la situación en lugar de esperar que se resuelva por su cuenta.',
    combinations: [
      {
        cardSlug: 'eight-of-wands',
        reading:
          'Todo se acelera y además tiene rumbo. Es una de las duplas más dinámicas del mazo: viajes que se concretan, trámites que se destraban y decisiones que avanzan rápido.',
      },
      {
        cardSlug: 'the-world',
        reading:
          'El viaje por fin llega a destino. Lo que vienes empujando durante meses se completa del todo: mudanzas al exterior, proyectos largos que cierran y ciclos de vida que terminan como corresponde.',
      },
      {
        cardSlug: 'seven-of-cups',
        reading:
          'La dispersión encuentra por fin una dirección. Eliges una opción entre muchas y el avance es inmediato: lo que faltaba no era información sino decisión.',
      },
      {
        cardSlug: 'the-hanged-man',
        reading:
          'El impulso choca contra un proceso que no se puede apurar. Forzar aquí alarga el trámite: suelta el control por un tramo y deja que madure.',
      },
      {
        cardSlug: 'knight-of-swords',
        reading:
          'Dos velocidades que se suman y ningún freno a la vista. El avance es innegable y el riesgo también: define de antemano dónde termina la carga, porque en el momento no vas a querer detenerte.',
      },
    ],
  },
  strength: {
    meaningLove:
      'Un vínculo que se sostiene con paciencia y ternura, no con presión. La Fuerza indica que la manera de resolver el conflicto actual es la calma: bajar el tono, insistir sin agresión, aguantar el proceso del otro sin abandonarlo. Marca relaciones donde alguien aprende a manejar sus propios impulsos por amor. En pareja aconseja la conversación tranquila antes que el reclamo. Si estás sin pareja, señala que tu seguridad interior es lo que atrae, mucho más que cualquier estrategia.',
    meaningWork:
      'Se supera un obstáculo laboral con constancia y buen trato, no con imposición. Es una carta favorable para negociaciones difíciles, para manejar equipos complicados y para sostener un proyecto que exige aguante. Indica que tienes más fuerza de la que crees y que el camino es firme y sin estridencia. En lo económico marca recuperación gradual de una situación complicada, con disciplina y sin decisiones desesperadas. La paciencia aquí rinde más que la audacia.',
    meaningWellbeing:
      'La energía es fuerte y sostenida cuando se la trata con amabilidad. Es una etapa excelente para retomar una actividad física con progresión suave, sin castigo ni exigencia desmedida. El cuerpo colabora si lo escuchas. También es buen momento para trabajar sobre un hábito que sabes que te hace mal: la Fuerza no lo arranca de raíz, lo doma de a poco. El ánimo mejora con la constancia amable mucho más que con la disciplina dura.',
    symbolism:
      'Una mujer de blanco, coronada por el símbolo del infinito, cierra suavemente las fauces de un león leonado apoyando las manos sobre su hocico. No hay violencia en el gesto: el león se deja, y le lame la mano. Una guirnalda de flores le rodea la cintura y otra la cabeza, uniendo a la mujer con el animal. El fondo es amarillo pleno y una montaña se alza a lo lejos. La lección está en la postura: la fuerza que domina no es la del músculo sino la de quien no necesita gritar para ser obedecido.',
    advice:
      'Insiste con suavidad. Lo que estás intentando resolver a fuerza de presión se resuelve mejor con paciencia sostenida y buen trato: repite el pedido con calma, sin subir el tono y sin abandonar. Y aplica lo mismo con tus propios impulsos: no los reprimas ni los sueltes del todo, condúcelos. Tienes más aguante del que te reconoces.',
    yesNo:
      'Sí, con paciencia y dominio propio. La respuesta es favorable siempre que sostengas la calma: la fuerza bruta o el apuro son lo único que puede arruinarlo.',
    combinations: [
      {
        cardSlug: 'seven-of-wands',
        reading:
          'Defender la posición desde la serenidad y no desde la crispación. Ganas por convicción tranquila y no por gritar más fuerte: es la mejor manera de sostener una discusión que va para largo.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'El impulso que hay que domar está identificado. La combinación señala una atadura concreta y avisa que se afloja de a poco, con paciencia y sin castigo.',
      },
      {
        cardSlug: 'the-sun',
        reading:
          'La fuerza interior se vuelve alegría visible. Lo que dominaste con paciencia ahora se disfruta sin esfuerzo: es una de las secuencias más luminosas del mazo.',
      },
      {
        cardSlug: 'nine-of-wands',
        reading:
          'El aguante ya lleva demasiado tiempo y se nota. Todavía puedes sostenerlo un tramo más, y conviene revisar antes si esta batalla sigue mereciendo toda la fuerza que le estás poniendo.',
      },
    ],
  },
  'the-hermit': {
    meaningLove:
      'Un tiempo de soledad elegida. Puede ser una pausa dentro de la pareja, una distancia necesaria para entender qué quieres, o simplemente una etapa sin buscar a nadie. El Ermitaño no es abandono: es retiro con propósito. En pareja indica que uno de los dos necesita espacio y que dárselo es lo que salva el vínculo. Si estás sin pareja, avisa que este no es el momento de salir a buscar sino de saber qué quieres encontrar cuando llegue.',
    meaningWork:
      'Trabajo en soledad, análisis profundo, decisiones que se toman lejos del ruido. Es una carta favorable para investigar, estudiar, escribir y planificar; poco favorable para lanzamientos y trabajo en equipo. También indica la búsqueda de un mentor, o el momento en que tú te conviertes en el que enseña. En el dinero aconseja prudencia y revisión detallada: no es tiempo de expandirse sino de entender bien lo que tienes entre manos.',
    meaningWellbeing:
      'El cuerpo pide silencio y menos estímulo. Es una etapa para retirarse un poco: menos compromisos sociales, más caminatas solas, más horas de descanso sin culpa. Funcionan bien la meditación, la lectura y todo lo que baje el volumen del entorno. El ánimo es introspectivo, algo melancólico y no está mal que lo sea. Cuida que el retiro no se vuelva aislamiento total: la soledad de esta carta tiene un farol encendido, no una puerta cerrada.',
    symbolism:
      'Un anciano de manto gris está de pie en la cima de una montaña nevada, sosteniendo un farol en el que brilla una estrella de seis puntas y apoyándose en un bastón. Mira hacia abajo con los ojos entrecerrados: alumbra el camino para quien viene subiendo detrás. La capucha lo cubre casi por completo. La nieve, el gris y la ausencia total de otras figuras hablan de una soledad buscada, no sufrida. La luz que lleva es pequeña y suficiente: en esta carta nadie ilumina el paisaje entero, solo el paso siguiente.',
    advice:
      'Retírate un rato del ruido. La respuesta que buscas no va a llegar de preguntarle a más gente sino de darte tiempo a solas para escuchar lo que ya sabes. Apaga el teléfono una tarde, camina sin auriculares, escribe lo que aparezca. Y si encuentras algo valioso, compártelo después: el farol del Ermitaño existe para alumbrarle el camino a otro.',
    yesNo:
      'Todavía no: es tiempo de buscar hacia adentro. La carta aconseja pausa y reflexión antes de avanzar, y no responde con un no definitivo sino con una postergación.',
    combinations: [
      {
        cardSlug: 'four-of-swords',
        reading:
          'Retiro y descanso profundo. La pausa no es un paréntesis vacío: es donde se repara lo que el ritmo anterior venía gastando sin que lo notaras.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'De la soledad sale una guía clara. Lo que encuentres en este silencio va a orientar la etapa siguiente: es una introspección que da frutos concretos.',
      },
      {
        cardSlug: 'three-of-cups',
        reading:
          'Tensión entre el retiro y la vida social, y ninguna de las dos está mal. La dupla pide elegir a conciencia en cada caso, en vez de rechazar invitaciones por pura inercia o aceptarlas por compromiso.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'Te alejas para buscarte, no para escapar. La partida tiene sentido y no necesita justificación ante nadie: es un camino hacia adentro que empieza yéndose.',
      },
    ],
  },
  'wheel-of-fortune': {
    meaningLove:
      'Un giro inesperado: alguien que reaparece, un encuentro fortuito, un cambio de etapa que nadie planeó. La Rueda indica que el vínculo entra en otra fase y que buena parte de lo que viene no depende de tu voluntad. En pareja marca el fin de un ciclo y el comienzo de otro, muchas veces mejor. Si estás sin pareja, avisa que el momento cambia solo. Lo que pide es soltar el control: lo que está girando no se detiene por más que lo empujes.',
    meaningWork:
      'Un cambio de suerte que llega desde afuera: una oportunidad inesperada, un contexto que se mueve, un ciclo laboral que se cierra y otro que empieza. Es una carta favorable en general, con la advertencia de que la rueda sigue girando y ninguna posición es definitiva. En lo económico indica un giro en la situación económica, muchas veces a mejor. Aprovecha el momento alto sin creer que es permanente y guarda algo para cuando la rueda baje.',
    meaningWellbeing:
      'La energía cambia de ciclo y conviene acompañar el movimiento en vez de resistirlo. Es un buen momento para revisar qué hábitos corresponden a esta etapa y cuáles quedaron de una anterior. El cuerpo tiene ritmos propios que suben y bajan; forzar el mismo rendimiento todo el año no funciona. El ánimo es variable en esta etapa y eso es normal. Adapta la rutina al momento en lugar de exigirle al cuerpo que sea siempre el mismo.',
    symbolism:
      'Una rueda dorada gira en el cielo con las letras TARO —o ROTA, la rueda— alternadas con el tetragrámaton hebreo, y símbolos alquímicos en los radios. Tres criaturas la acompañan: una esfinge con espada arriba, una serpiente —Tifón— descendiendo por la izquierda y Hermanubis, con cabeza de chacal, ascendiendo por la derecha. En las cuatro esquinas, las figuras aladas de Tauro, Leo, Escorpio y Acuario leen libros: los signos fijos del zodíaco, lo estable que observa lo que cambia. Nadie empuja la rueda; gira sola.',
    advice:
      'Suelta el control de lo que no depende de ti y muévete rápido con lo que sí. La rueda está girando: aprovecha el impulso favorable ahora, porque el momento no se sostiene indefinidamente. Y si estás en la parte baja del giro, aguanta sin decisiones drásticas: la posición cambia sola, y lo que hagas desde la desesperación te va a atar cuando cambie.',
    yesNo:
      'Sí, y viene por un giro del destino. La respuesta es favorable aunque el resultado dependa más de las circunstancias que de tu esfuerzo directo.',
    combinations: [
      {
        cardSlug: 'the-world',
        reading:
          'El ciclo gira y además se completa. Lo que estaba en movimiento encuentra su cierre natural: muy favorable para procesos largos que estaban por definirse.',
      },
      {
        cardSlug: 'ten-of-swords',
        reading:
          'La rueda estaba en su punto más bajo y a partir de aquí sube. El golpe ya sucedió: lo que sigue, por definición de esta carta, es el movimiento ascendente.',
      },
      {
        cardSlug: 'the-hanged-man',
        reading:
          'El giro pide esperar en suspenso. No hay nada que forzar mientras el ciclo se acomoda: usa el tiempo para mirar la situación desde otro ángulo.',
      },
      {
        cardSlug: 'ace-of-wands',
        reading:
          'El cambio de suerte trae una chispa nueva. Aparece una oportunidad justo cuando el ciclo gira: agárrala rápido, porque esta ventana no se queda abierta.',
      },
    ],
  },
  justice: {
    meaningLove:
      'Los acuerdos del vínculo se ponen sobre la mesa y se revisan con honestidad. Justicia marca decisiones equilibradas, verdades que se dicen y también consecuencias de lo que se hizo antes. En pareja indica que hay que repartir mejor: tareas, tiempo, esfuerzo emocional. También aparece en separaciones donde se dividen bienes y responsabilidades. Si estás sin pareja, avisa que lo que estás recibiendo guarda relación directa con lo que estuviste ofreciendo.',
    meaningWork:
      'Contratos, trámites legales, evaluaciones y decisiones formales. Es la carta de los procesos donde se juzga con criterio y gana quien tiene los papeles en orden. Favorece juicios, acuerdos laborales, auditorías y todo lo que requiera transparencia. Indica que el resultado va a ser justo, aunque no necesariamente el que quieres. Del lado del dinero, marca cuentas que se ordenan, deudas que se saldan y decisiones económicas que hay que tomar con la cabeza fría.',
    meaningWellbeing:
      'El equilibrio es la clave de esta etapa: proporción entre trabajo y descanso, entre exigencia y cuidado, entre lo que das y lo que recibes. El cuerpo está reflejando la falta de balance de los últimos meses. Es un buen momento para hacer un balance honesto de tus hábitos, sin excusas y sin exagerar. Corrige lo que esté claramente desproporcionado y sostén lo demás: no hace falta una transformación completa, hace falta ajustar la balanza.',
    symbolism:
      'Una figura coronada está sentada de frente entre dos columnas grises, con una espada erguida en la mano derecha y una balanza de platillos en la izquierda. La espada es de doble filo y apunta hacia arriba: la decisión corta para los dos lados. Un velo púrpura cuelga detrás, ocultando lo que hay más allá del juicio. Un zapato asoma bajo el manto rojo, detalle que recuerda que quien juzga también camina el mundo. La postura es perfectamente simétrica: nada en esta carta se inclina antes de tiempo.',
    advice:
      'Haz lo correcto, aunque no sea lo más cómodo. Revisa qué parte de la situación te corresponde y asúmela sin buscar culpables. Pon los papeles en orden, cumple lo que prometiste y di la verdad de manera completa. Lo que decidas ahora con criterio justo te va a ahorrar bastante más de lo que te cuesta hoy.',
    yesNo:
      'Sí, si es justo. La carta responde según los hechos: favorece a quien obró correctamente y desestima cualquier atajo que no resista una mirada honesta.',
    combinations: [
      {
        cardSlug: 'ace-of-swords',
        reading:
          'La verdad y la ley coinciden. Aparece una resolución clara y definitiva: es una de las mejores duplas para trámites, juicios y decisiones que necesitan zanjarse.',
      },
      {
        cardSlug: 'seven-of-swords',
        reading:
          'Lo que se ocultaba sale a la luz y tiene consecuencias. Conviene adelantarse y decir la verdad primero, porque en esta combinación la maniobra se descubre igual.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'Sucesiones y división de bienes familiares que llegan a instancia formal. Lo que se defina ahora queda escrito y firmado: hazlo con asesoramiento profesional aunque haya toda la confianza del mundo.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'El contrato tiene una trampa. Hay una atadura legal o económica en la letra chica: leé todo antes de firmar y consulta a alguien que no esté involucrado.',
      },
    ],
  },
  'the-hanged-man': {
    meaningLove:
      'El vínculo está en suspenso y no hay nada que forzar. Marca esperas: alguien que no se define, una relación a distancia sin fecha, un tiempo en el que las cosas no avanzan ni se rompen. El Colgado propone usar la pausa para mirar la situación desde otro ángulo en lugar de exigir una respuesta. En pareja indica que uno de los dos está sacrificando algo importante, y conviene revisar si ese sacrificio es una entrega o simplemente resignación disfrazada.',
    meaningWork:
      'Un proyecto frenado por causas ajenas: trámites que no salen, decisiones que dependen de otros, un puesto que no se define. La carta aconseja no forzar y aprovechar la pausa para revisar el enfoque, porque muchas veces el freno revela que el plan estaba mal orientado. También indica períodos de sacrificio voluntario: aceptar menos ahora por algo que se espera después. En lo económico, un tramo de quietud donde no conviene invertir ni mover nada.',
    meaningWellbeing:
      'El cuerpo pide una pausa que la cabeza no quiere aceptar. Es una etapa de baja energía en la que forzar rendimiento solamente estira el cansancio. Funcionan bien las prácticas que invierten el ritmo habitual: estiramiento, respiración, dormir más, cambiar el orden del día. El ánimo puede estar suspendido, ni bien ni mal, y eso también pasa. Acepta el paréntesis en lugar de pelearlo: lo que hoy parece tiempo perdido está reacomodando algo.',
    symbolism:
      'Un hombre cuelga cabeza abajo de una viga en forma de T hecha de madera viva, con hojas verdes brotando: el árbol sigue creciendo aunque él esté suspendido. Está atado por un solo pie y el otro se cruza formando un cuatro. Los brazos, ocultos detrás de la espalda, dibujan un triángulo. Su rostro está sereno y una aureola dorada lo rodea: la posición incómoda produjo una iluminación. Nadie lo obligó a colgarse y nadie lo va a bajar: es una entrega voluntaria a un tiempo que no controla.',
    advice:
      'Deja de empujar y mira la situación al revés. Lo que estás intentando destrabar a fuerza de insistencia no se destraba por ahí: pregúntate qué pasaría si el problema fuera exactamente lo contrario de lo que crees. Usa esta pausa para revisar el plan, no para desesperarte. Y acepta el sacrificio si tiene sentido, o suéltalo si solamente estás esperando que alguien lo note.',
    yesNo:
      'No por ahora: hay que esperar. La carta no cierra la puerta, la deja en suspenso, y avisa que cualquier intento de acelerar el proceso lo va a alargar.',
    combinations: [
      {
        cardSlug: 'four-of-swords',
        reading:
          'Pausa sobre pausa: el mensaje no puede ser más claro. El descanso y la espera no son opcionales en esta etapa, y resistirlos es lo único que puede empeorar la situación.',
      },
      {
        cardSlug: 'the-chariot',
        reading:
          'El impulso de avanzar choca con un proceso que no se acelera. Forzar aquí alarga el trámite: guarda la energía para cuando el freno se levante, y va a levantarse.',
      },
      {
        cardSlug: 'judgement',
        reading:
          'De la suspensión sale una revelación. Lo que se entendió durante la espera cambia el rumbo por completo: la pausa era exactamente lo que hacía falta.',
      },
      {
        cardSlug: 'ten-of-wands',
        reading:
          'El freno llega por sobrecarga acumulada. No es mala suerte: es el cuerpo y el contexto poniendo el límite que tú no pusiste. Suelta carga antes de retomar.',
      },
    ],
  },
  death: {
    meaningLove:
      'Un final que abre paso a otra cosa. Puede ser el cierre de una relación, y muy seguido es el final de una manera de estar en ella: se termina la etapa de la desconfianza, del rol que ocupabas, de la dinámica que se repetía. La Muerte no negocia y tampoco es cruel: saca lo que ya no tiene vida. En pareja indica una transformación profunda que deja el vínculo irreconocible, para bien. Lo que se resiste aquí se pudre; lo que se suelta, renace.',
    meaningWork:
      'El cierre de un ciclo laboral: un trabajo que termina, un rubro que abandonas, una etapa profesional que ya no te representa. También marca transformaciones grandes dentro de una organización. La carta indica que volver atrás no es una opción, y que el nuevo comienzo depende de aceptar el final completo. En el dinero señala el fin de una fuente de ingresos y la necesidad de rearmar el esquema: incómodo al principio y necesario después.',
    meaningWellbeing:
      'Es el momento de dejar un hábito que ya no te sirve, y la carta indica que se puede de verdad. La energía baja mientras dura la transición y después vuelve renovada. Buen tiempo para cambios profundos de rutina: cortar con algo que arrastrabas hace años, cambiar el horario de la vida, dejar de sostener lo que te desgasta. El ánimo atraviesa un tramo gris antes de mejorar. Acompaña el proceso sin apurarlo: los finales tienen su duración.',
    symbolism:
      'Un esqueleto con armadura negra cabalga un caballo blanco y sostiene un estandarte con una rosa blanca de cinco pétalos: la vida que continúa después del corte. A su paso quedan un rey caído, un obispo que suplica de pie, una mujer que gira el rostro y un niño que le ofrece flores sin miedo: cuatro maneras de recibir lo inevitable. Al fondo, entre dos torres, sale el sol sobre un río. La escena no muestra el fin del mundo sino el amanecer detrás del cortejo: nada termina del todo en esta carta.',
    advice:
      'Deja morir lo que ya terminó. La energía que estás gastando en sostener algo sin vida es exactamente la que te falta para lo que viene. Haz el duelo, agradece lo que fue y saca de tu casa —literalmente— lo que pertenece a esa etapa. Y no apures el después: entre el final y el comienzo hay un tramo vacío que también forma parte del proceso.',
    yesNo:
      'No en la forma actual: eso termina. La carta responde que hay un cierre inevitable, y que lo que preguntas solamente puede continuar si acepta transformarse por completo.',
    combinations: [
      {
        cardSlug: 'the-tower',
        reading:
          'Final abrupto y total. No queda nada del ciclo anterior y tampoco conviene que quede: es una de las secuencias más drásticas del mazo, y también de las más liberadoras.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'Después del cierre llega la calma y la esperanza vuelve. Es la mejor continuación posible: el duelo termina y aparece una etapa serena, sin el peso de lo anterior.',
      },
      {
        cardSlug: 'six-of-swords',
        reading:
          'El final se transforma en travesía. Se cierra una etapa y empieza un traslado hacia aguas más calmas: mudanzas, cambios de vida y despedidas hechas en paz.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'Una tradición o una estructura conocida llega a su fin. Lo que se hacía siempre así ya no se puede sostener: la forma nueva va a tener que inventarse.',
      },
    ],
  },
  temperance: {
    meaningLove:
      'Un vínculo que encuentra su punto justo: ni demasiado cerca ni demasiado lejos, ni todo entrega ni todo reclamo. La Templanza marca reconciliaciones que se dan de a poco, parejas que aprenden a mezclar dos maneras distintas de vivir, y también el tiempo que hace falta para que una herida cierre. En pareja aconseja paciencia y dosis: hablar sin saturar, acercarse sin invadir. Si estás sin pareja, indica una etapa de equilibrio interno que después atrae lo apropiado.',
    meaningWork:
      'Colaboración fluida y equilibrio entre partes distintas: dos áreas que se coordinan, un acuerdo que combina intereses opuestos, un proyecto que necesita mezcla y no imposición. Es una carta favorable para mediaciones, trabajos en equipo y procesos largos donde la clave es el ritmo sostenido. En el bolsillo, indica administración prudente y equilibrio entre lo que entra y lo que sale, sin decisiones extremas en ningún sentido.',
    meaningWellbeing:
      'Es la carta del equilibrio aplicado al cuerpo: dormir lo suficiente, moverte con moderación, comer sin extremos, alternar esfuerzo y descanso. Nada de planes drásticos: aquí funciona la dosis correcta sostenida en el tiempo. Es un momento excelente para recuperarse de un desgaste, porque la energía vuelve gradualmente si no la exiges de golpe. El ánimo se estabiliza. La mezcla justa entre actividad y calma es literalmente lo que esta carta enseña.',
    symbolism:
      'Un ángel de alas rojas y túnica blanca vierte agua de una copa a otra en un chorro continuo que desafía la gravedad: la mezcla nunca se interrumpe. Tiene un pie en el agua y otro en la tierra, mezclando también los elementos. En el pecho lleva un triángulo dentro de un cuadrado y en la frente, el círculo solar. Un sendero sube desde el estanque hasta unas montañas y termina en una corona dorada que brilla en el horizonte. Los lirios amarillos del borde crecen justo donde el agua toca la tierra.',
    advice:
      'Busca la dosis justa en lugar del extremo. Lo que estás intentando resolver de golpe se resuelve mezclando y esperando: un poco por día, sin saltearte pasos y sin abandonar a la primera. Combina lo que parecía incompatible en vez de elegir un solo lado. Y ten paciencia con el tiempo del proceso, que es más largo que tus ganas.',
    yesNo:
      'Sí, con paciencia y en la medida justa. La respuesta es favorable siempre que aceptes un ritmo gradual: los extremos y el apuro son lo único que puede arruinarlo.',
    combinations: [
      {
        cardSlug: 'the-star',
        reading:
          'Equilibrio y esperanza en la misma etapa. Es una de las secuencias más serenas del mazo: la recuperación avanza sola si no la interrumpes con impaciencia.',
      },
      {
        cardSlug: 'five-of-swords',
        reading:
          'Hay una salida negociada para el conflicto. Si alguien baja el tono primero, la discusión se desarma más rápido de lo que ambas partes creen posible.',
      },
      {
        cardSlug: 'three-of-swords',
        reading:
          'La reconciliación es posible y va a llevar tiempo. No se arregla con una conversación sino con muchas pequeñas, sostenidas durante bastante más de lo que quisieras.',
      },
      {
        cardSlug: 'knight-of-wands',
        reading:
          'El impulso necesita ser dosificado. Toda esa energía sirve si se administra: repártela en el tiempo en vez de gastarla entera en la primera semana.',
      },
    ],
  },
  'the-devil': {
    meaningLove:
      'Un vínculo con cadenas: dependencia, celos, atracción intensa que no deja pensar, o una relación que se sostiene por costumbre y por miedo a estar solo. El Diablo también marca la pasión más carnal y el disfrute sin culpa, así que no siempre es una advertencia. La pregunta que hace es precisa: ¿te quedas porque quieres o porque no te animas a soltar? Las cadenas de la carta están flojas, y ese detalle es toda la lectura.',
    meaningWork:
      'Un trabajo que te ata: buen sueldo y ningún sentido, un contrato que no puedes dejar, una sociedad que te conviene y te desgasta. También indica ambiciones que se volvieron obsesión y decisiones tomadas por miedo a perder estatus. Para las finanzas, marca deudas, consumos que se escaparon de control y compromisos económicos que limitan tu libertad. Mira el número real de esa deuda: la mayor parte del peso viene de no querer mirarlo.',
    meaningWellbeing:
      'Hábitos que ya no controlas del todo: comer sin hambre real, dormir mal por pantallas, sostener rutinas que sabes que te restan. La carta no juzga el placer, marca la dependencia. Es un buen momento para identificar con precisión qué te está atando y empezar a aflojarlo, preferentemente con ayuda y no en soledad heroica. El ánimo mejora bastante en cuanto se nombra el problema, incluso antes de resolverlo del todo.',
    symbolism:
      'Una figura demoníaca con cuernos de cabra, alas de murciélago y una estrella invertida en la frente se yergue sobre un pedestal negro. Levanta la mano derecha en un gesto vacío y con la izquierda baja una antorcha encendida. Un hombre y una mujer desnudos, con cuernos y colas, están encadenados al pedestal: las cadenas les cuelgan flojas alrededor del cuello y podrían sacárselas sin esfuerzo. El fondo es completamente negro. Es la misma composición de Los Enamorados, con el ángel reemplazado por la atadura.',
    advice:
      'Mira la cadena de frente y mide cuánto aprieta realmente. Nombra con precisión qué te está atando —una deuda, un vínculo, un hábito, una imagen que quieres sostener— y di en voz alta qué ganas quedándote ahí, porque siempre se gana algo. Pide ayuda: esto se afloja mejor acompañado. Y empieza por un solo eslabón, no por toda la cadena.',
    yesNo:
      'No, o sí a costa de tu libertad. La carta advierte que lo que preguntas viene con una atadura que hoy no estás viendo del todo.',
    combinations: [
      {
        cardSlug: 'the-lovers',
        reading:
          'La misma escena, con y sin cadenas. La combinación pregunta si eso que llamas elección es deseo verdadero o dependencia con buena presentación: la respuesta la sabes.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'La atadura se rompe de golpe y no de manera elegante. Lo que no soltaste por decisión se va a soltar por derrumbe: mejor adelantarse mientras se pueda elegir cómo.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'El apego material se volvió dueño de tus decisiones. Lo que retienes con tanta fuerza dejó de ser un medio: revisa qué estás protegiendo y a cambio de qué.',
      },
      {
        cardSlug: 'strength',
        reading:
          'El impulso puede domarse con paciencia. La combinación es alentadora: lo que hoy te controla se afloja de a poco, sin castigo y sin épica, si sostienes el trabajo.',
      },
    ],
  },
  'the-tower': {
    meaningLove:
      'Una ruptura o una revelación que cambia todo de golpe. Sale a la luz algo que estaba oculto, o se cae una estructura que se sostenía por inercia. La Torre es abrupta y también honesta: lo que se derrumba aquí estaba construido sobre algo falso. En pareja indica una crisis que no se puede maquillar. Duele, y deja el terreno limpio para construir sobre lo que sí es cierto. Lo que resiste el derrumbe suele salir más fuerte de lo que entró.',
    meaningWork:
      'Un cambio brusco e impuesto: despido inesperado, proyecto cancelado, empresa que se reestructura, plan que se cae la semana antes de empezar. La carta no anticipa una molestia sino un quiebre. También puede ser liberadora: el trabajo que no te animabas a dejar se termina solo. En el dinero señala una pérdida súbita o un gasto imprevisto grande. Revisa qué estructuras tuyas están apoyadas sobre supuestos que nadie verificó hace años.',
    meaningWellbeing:
      'El cuerpo pone un freno de golpe después de mucho tiempo de aviso ignorado. Es una etapa de sacudón donde lo que venías sosteniendo con esfuerzo deja de sostenerse. Lo que corresponde es parar, atender lo urgente y no intentar volver al ritmo anterior, que es justamente el que llevó hasta aquí. El ánimo se altera y después se acomoda. De estos episodios suele salir un cambio de hábitos que ninguna buena intención había logrado antes.',
    symbolism:
      'Un rayo golpea la corona de una torre construida sobre un peñasco y la vuela por el aire, mientras dos figuras caen de cabeza al vacío: una coronada y otra sin corona, porque el derrumbe no distingue jerarquías. Llamas salen por las tres ventanas. Veintidós llamas hebreas —los mismos arcanos mayores— flotan a los costados en forma de yod. La torre estaba construida sobre roca desnuda, sin cimientos visibles. Todo pasa en un instante: es la única carta del mazo donde el tiempo no existe.',
    advice:
      'No trates de sostener lo que ya se está cayendo. Pon a salvo lo esencial —la gente, los papeles, tu tranquilidad— y deja que el resto se derrumbe. Después, cuando baje el polvo, revisa qué parte de esa estructura sostenías por costumbre y no por convicción. Lo que se construye después de una Torre suele apoyarse mucho mejor que lo anterior.',
    yesNo:
      'No, y además viene un cambio abrupto. La carta anticipa un quiebre inevitable: conviene prepararse para lo que se cae en lugar de intentar apuntalarlo.',
    combinations: [
      {
        cardSlug: 'the-star',
        reading:
          'Después del derrumbe llega la calma. Es la secuencia clásica del mazo y una de las más esperanzadoras: lo que se cayó deja lugar a una etapa serena y verdadera.',
      },
      {
        cardSlug: 'ace-of-wands',
        reading:
          'Sobre el terreno despejado aparece enseguida una chispa nueva. El derrumbe fue justamente lo que hizo lugar: agarra esa oportunidad aunque todavía estés levantando escombros de lo anterior.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'Lo que se sacude es la estructura familiar o patrimonial. Algo que se sostenía por costumbre se cae y destapa lo que se venía evitando hablar durante años.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La cadena se rompe de golpe. Lo que no soltaste por decisión se suelta por derrumbe, que es más doloroso y funciona igual: lo importante es no volver a atarse.',
      },
    ],
  },
  'the-star': {
    meaningLove:
      'Vuelve la esperanza después de una etapa difícil. La Estrella marca reconciliaciones sinceras, vínculos que sanan y la capacidad de volver a confiar en alguien. No es una carta de pasión sino de calma verdadera: la sensación de estar en el lugar correcto, sin sobresaltos. En pareja indica un tiempo de transparencia y ternura. Si estás sin pareja, señala que estás en condiciones de recibir algo bueno, y que la desconfianza que traías empieza a aflojarse sola.',
    meaningWork:
      'Inspiración, vocación y un rumbo que por fin se ve claro. Es una carta excelente para proyectos creativos, para retomar algo que abandonaste y para trabajos que tienen sentido más allá del sueldo. Suele aparecer después de una crisis laboral, cuando empieza la recuperación. En materia de dinero, marca una mejora gradual y confiable, sin golpes de suerte. Lo que se siembra bajo esta carta crece despacio y con raíces: no es rápido, es sólido.',
    meaningWellbeing:
      'La recuperación está en marcha y el cuerpo lo está notando: vuelve el descanso, baja la tensión, el ánimo se aclara. Es una etapa de reparación real después de un tiempo duro. Funcionan muy bien el contacto con el agua, el aire libre y las rutinas suaves. No exijas rendimiento todavía: lo que corresponde ahora es sostener lo básico y dejar que la energía vuelva a su ritmo. La confianza en el propio cuerpo se recompone en esta etapa.',
    symbolism:
      'Una mujer desnuda, arrodillada junto a un estanque con un pie en el agua y el otro en la tierra, vierte agua de dos cántaros: uno de vuelta al estanque y otro sobre la tierra, donde se abre en cinco arroyos. En el cielo brilla una estrella grande de ocho puntas rodeada por siete estrellas menores. Detrás, un ibis se posa sobre un árbol, el pájaro de Thot, dios de la sabiduría. La desnudez total es el dato central: después de la Torre no queda nada que ocultar, y esa desnudez es exactamente la paz.',
    advice:
      'Confía y déjate reparar. Esta carta no pide esfuerzo sino permiso: descansa, muéstrate como estás, cuenta lo que te pasó sin adornarlo. Retoma eso que amabas hacer y abandonaste en la etapa dura. Y no apures la recuperación con metas ambiciosas: lo que se está acomodando necesita tiempo, y el tiempo esta vez está a tu favor.',
    yesNo:
      'Sí, con esperanza fundada. Es una de las respuestas más serenas y confiables del mazo: lo que viene es favorable, aunque llegue despacio y sin estridencias.',
    combinations: [
      {
        cardSlug: 'the-moon',
        reading:
          'La esperanza convive con la confusión. Hay una guía verdadera y también niebla: sigue la estrella y verifica los datos antes de dar cada paso concreto.',
      },
      {
        cardSlug: 'ace-of-cups',
        reading:
          'El corazón se abre después de sanar. Es de las mejores duplas del mazo para volver a confiar en alguien: la etapa dura terminó de verdad.',
      },
      {
        cardSlug: 'nine-of-wands',
        reading:
          'La guardia por fin puede bajarse del todo. Después de tanto tiempo resistiendo, aparece un alivio genuino: ya no hace falta seguir defendiendo el metro cuadrado propio de nadie.',
      },
      {
        cardSlug: 'the-magician',
        reading:
          'Vocación y talento alineados en el mismo momento. Lo que hagas ahora tiene técnica y también sentido para ti: es una ventana excelente para lanzar un proyecto que te importe de verdad.',
      },
    ],
  },
  'the-moon': {
    meaningLove:
      'Confusión, dudas y cosas que no son lo que parecen. La Luna marca vínculos donde falta información: alguien que no dice todo, celos que se alimentan de suposiciones, atracciones que confunden deseo con miedo. También aparece cuando la imaginación completa lo que la realidad no confirmó. En pareja aconseja preguntar de frente en vez de interpretar señales. Lo que sientes es real; lo que estás concluyendo a partir de eso, conviene verificarlo antes de actuar.',
    meaningWork:
      'Un panorama poco claro: propuestas con letra chica, socios que no muestran todo, un ambiente donde circulan versiones y ninguna se confirma. La carta aconseja no firmar ni decidir hasta tener datos duros. También indica trabajos vinculados a lo artístico y a lo simbólico, donde la ambigüedad es materia prima. En lo económico advierte sobre inversiones basadas en promesas: pide los números por escrito y espera a que se despeje la niebla.',
    meaningWellbeing:
      'El descanso se vuelve irregular y los sueños se hacen más vívidos e intensos. Es una etapa de sensibilidad alta donde los miedos crecen de noche y se achican de día. Ayuda mucho llevar un registro de lo que sueñas y de lo que te inquieta, y también sostener horarios regulares para darle al cuerpo un marco estable. El ánimo fluctúa. No tomes decisiones importantes en los momentos bajos: espera a la mañana.',
    symbolism:
      'Una luna con rostro humano de perfil derrama rayos rectos y curvos sobre un paisaje nocturno, mientras quince yods caen del cielo. Abajo, un perro y un lobo aúllan hacia arriba: lo domesticado y lo salvaje reaccionando igual ante lo mismo. Un cangrejo emerge del estanque, lo que sube desde lo profundo. Entre dos torres grises, un sendero amarillo se pierde hacia las montañas del fondo. No hay figuras humanas. Todo el camino está iluminado apenas lo suficiente para no saber exactamente qué se está pisando.',
    advice:
      'No decidas nada importante hasta que se despeje. Distingue lo que sabes de lo que estás suponiendo, y busca una fuente que no tenga interés en el resultado. Presta atención a los sueños y a las corazonadas, porque en esta carta traen información real, pero contrástalas antes de actuar. Y si el miedo aparece de noche, espera a la mañana para evaluarlo.',
    yesNo:
      'Indefinido: hay demasiada confusión en juego. La carta pide esperar a que se aclare el panorama y advierte que algo de lo que te contaron no es exacto.',
    combinations: [
      {
        cardSlug: 'seven-of-swords',
        reading:
          'Confusión más engaño deliberado: es la peor combinación posible para tomar decisiones. Verifica cada dato con una fuente independiente y no firmes absolutamente nada durante esta semana.',
      },
      {
        cardSlug: 'the-sun',
        reading:
          'La niebla se disipa y todo queda a la vista. Es una de las secuencias más aliviadoras del mazo: lo que hoy no se entiende se vuelve evidente muy pronto.',
      },
      {
        cardSlug: 'the-high-priestess',
        reading:
          'Hay algo verdadero escondido detrás de la niebla y conviene buscarlo. Tu intuición está captando bien, aunque la interpretación consciente le esté agregando miedos que son enteramente tuyos.',
      },
      {
        cardSlug: 'nine-of-swords',
        reading:
          'Los miedos nocturnos se agrandan solos. Buena parte de lo que te atormenta no resiste la luz del día: escríbelo a la mañana y vuelve a leerlo.',
      },
    ],
  },
  'the-sun': {
    meaningLove:
      'Alegría, claridad y un amor que se vive a la luz del día. El Sol marca relaciones felices, compromisos que se anuncian con orgullo y reconciliaciones que salen bien. Es una de las cartas más favorables del mazo: lo que estaba confuso se aclara y lo que estaba escondido se muestra sin miedo. En pareja indica una etapa luminosa y sin dobleces. Si estás sin pareja, anuncia un encuentro alegre y sin complicaciones, del tipo que no necesita ser descifrado.',
    meaningWork:
      'Éxito visible y reconocimiento: el proyecto que sale bien, la promoción, el examen aprobado, la etapa en la que todo lo que tocas funciona. Es una carta excelente para lanzamientos, presentaciones y comienzos. Indica claridad sobre lo que quieres hacer y energía suficiente para lograrlo. En el dinero marca una mejora concreta y sostenida, con abundancia que se disfruta. Aprovecha el momento alto para dejar armado lo que necesites cuando la racha baje.',
    meaningWellbeing:
      'Vitalidad alta y ánimo luminoso: el cuerpo responde bien y la energía alcanza para todo. Es una etapa excelente para retomar la actividad física, pasar tiempo al aire libre y sostener hábitos que te hagan bien. El descanso es reparador y el humor está estable. Aprovecha para consolidar rutinas ahora que cuestan poco: lo que se instala en un momento así suele resistir cuando llegan las etapas más grises.',
    symbolism:
      'Un niño desnudo con una corona de flores y una pluma roja monta un caballo blanco sin montura ni riendas, con los brazos abiertos: nada que ocultar y nada que controlar. Detrás ondea un estandarte naranja enorme. Un sol de rostro humano con veintiún rayos alternados —rectos y ondulados— ocupa la parte alta de la carta. Detrás del niño, un muro de piedra con cuatro girasoles vueltos hacia el niño y no hacia el sol. El muro marca que este jardín tiene límites, y que aun así hay lugar de sobra.',
    advice:
      'Muéstrate tal como estás. Esta carta premia la transparencia y la alegría sin justificación: cuenta lo que conseguiste, acepta la invitación, sal a la luz. Aprovecha esta racha para hacer lo que venías postergando, porque la energía está de tu lado y no siempre lo va a estar. Y comparte lo bueno: en el Sol la alegría se multiplica cuando tiene testigos.',
    yesNo:
      'Sí, rotundamente. Es la respuesta más luminosa y clara del mazo: lo que preguntas sale bien y además se hace visible para todos.',
    combinations: [
      {
        cardSlug: 'nine-of-swords',
        reading:
          'Amanece después de la peor noche. Lo que en la oscuridad parecía imposible se aclara y resulta mucho menor de lo temido: alivio profundo y bien fundado.',
      },
      {
        cardSlug: 'the-world',
        reading:
          'Éxito completo y ciclo cerrado con alegría. Pocas combinaciones son tan favorables: lo que termina lo hace en su mejor versión y deja todo listo para lo siguiente.',
      },
      {
        cardSlug: 'six-of-wands',
        reading:
          'El triunfo es público y además te hace feliz, que no siempre es lo mismo. Acepta el reconocimiento sin minimizarlo: esta vez está completamente merecido.',
      },
      {
        cardSlug: 'five-of-pentacles',
        reading:
          'La etapa dura termina y vuelve la abundancia. Es una de las mejores secuencias posibles después de una crisis material: la recuperación llega y se nota.',
      },
    ],
  },
  judgement: {
    meaningLove:
      'Un llamado que cambia la manera de ver el vínculo. Puede ser una reconciliación después de mucho tiempo, un perdón que por fin se pronuncia, o el momento en que entiendes por qué se repetía siempre el mismo patrón. El Juicio marca decisiones tomadas desde una comprensión nueva y no desde la costumbre. En pareja indica una segunda oportunidad bien fundada. Si estás sin pareja, señala que algo del pasado se cierra y te deja disponible de otra manera.',
    meaningWork:
      'Un llamado vocacional o una evaluación que define el rumbo: la propuesta que te devuelve al camino que habías dejado, el balance de una etapa entera, la decisión de cambiar de rubro por convicción. Es una carta de despertar profesional. También indica resultados de procesos largos y respuestas que por fin llegan. En lo económico marca el cierre de una etapa económica y el comienzo de otra distinta, con las cuentas del pasado saldadas.',
    meaningWellbeing:
      'Es el momento de un cambio profundo de hábitos, del tipo que se sostiene porque cambió la manera de pensarlos. La energía renace después de una etapa apagada. Buen tiempo para retomar lo que abandonaste hace años y para revisar con honestidad qué te venía haciendo mal. El ánimo mejora con la sensación de estar por fin donde corresponde. Lo que empieces ahora tiene una raíz distinta: no es fuerza de voluntad, es convicción.',
    symbolism:
      'El arcángel Gabriel toca una trompeta de la que cuelga un estandarte con una cruz, mientras abajo hombres, mujeres y niños se levantan de sarcófagos abiertos que flotan sobre el agua, con los brazos abiertos hacia arriba. Están desnudos y grises: lo que resucita no es la persona anterior. Al fondo se ven montañas nevadas y una superficie de agua vasta. Nadie sube por sus propios medios: todos responden a un llamado que viene de afuera y que ninguno esperaba escuchar ese día.',
    advice:
      'Escucha el llamado y responde. Hay algo que vienes sabiendo hace tiempo y todavía no te animaste a nombrar: esta carta pide que lo digas y actúes en consecuencia. Haz el balance completo de la etapa que termina, perdona lo que corresponda —a otros y a ti mismo— y decide desde ahí. Lo que empiece ahora va a tener otra base.',
    yesNo:
      'Sí, con un renacer de por medio. La respuesta es favorable y llega junto con un cambio de perspectiva que redefine la pregunta original.',
    combinations: [
      {
        cardSlug: 'the-world',
        reading:
          'El llamado lleva al cierre completo del ciclo. Todo lo que quedaba pendiente se resuelve y la etapa termina como corresponde: es un final con sentido.',
      },
      {
        cardSlug: 'six-of-cups',
        reading:
          'Algo del pasado vuelve, y esta vez vuelve para cerrarse bien. Un reencuentro, un perdón pendiente o una historia vieja que por fin encuentra la explicación que le faltaba.',
      },
      {
        cardSlug: 'five-of-cups',
        reading:
          'La pérdida se transforma en comprensión. Lo que se cayó tenía que caerse para que entendieras algo más grande: ahora estás en condiciones de escucharlo.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'El llamado implica irte de donde estás hoy. La comprensión nueva vuelve imposible seguir en el mismo lugar haciendo lo mismo: la partida es la consecuencia lógica de haber entendido.',
      },
    ],
  },
  'the-world': {
    meaningLove:
      'Un ciclo que se completa de la mejor manera: una relación que llega a su plenitud, un compromiso que se concreta, una historia que se cierra dejando todo dicho. El Mundo marca integración y sensación de plenitud compartida. En pareja indica que llegaron a donde querían llegar. Si estás sin pareja, señala el final de un proceso personal y el comienzo de otro, contigo completo y no buscando que alguien te complete. Muchas veces trae vínculos con gente de otro país.',
    meaningWork:
      'La meta cumplida: el proyecto terminado, el título obtenido, el negocio consolidado, el ciclo laboral que cierra bien. Es la carta del logro completo y también de la expansión internacional, los viajes y el trabajo con otras culturas. Indica reconocimiento y una sensación de haber llegado. Del lado del dinero, marca abundancia conseguida por mérito y un ciclo económico que se cierra con las cuentas ordenadas. Lo que sigue empieza desde un lugar mucho más alto.',
    meaningWellbeing:
      'Sensación de integración: el cuerpo, la cabeza y la vida acomodados en el mismo lugar. Es una etapa de bienestar completo donde lo que venías trabajando da resultados visibles. Buen momento para celebrar el progreso y para fijar la rutina que te trajo hasta aquí. El ánimo es sereno y pleno. Y como todo ciclo que termina, conviene preguntarse qué viene después: la energía de esta carta se apaga si no encuentra un objetivo nuevo.',
    symbolism:
      'Una figura desnuda envuelta en una tela violeta danza dentro de una corona de laurel con forma ovalada, sosteniendo dos varas cortas, una en cada mano, en la misma posición que el Mago tenía con una sola. La guirnalda está atada arriba y abajo con dos cintas rojas en forma de infinito. En las cuatro esquinas aparecen las mismas criaturas que en la Rueda de la Fortuna —hombre, águila, león y toro—, ahora sin libros: ya no hace falta estudiar, el ciclo se comprendió. Todo el mazo termina donde el Loco empezó.',
    advice:
      'Cierra bien lo que estás terminando antes de correr a lo siguiente. Agradece, despídete de quien corresponda, entrega lo que quedaba pendiente y date el gusto de reconocer todo lo que hiciste para llegar hasta aquí. Y después pregúntate qué quieres que empiece: esta carta es una puerta, y si la dejas cerrada demasiado tiempo, la plenitud se vuelve nostalgia.',
    yesNo:
      'Sí, con un ciclo que se completa. Es una de las respuestas más plenas del mazo: lo que preguntas se realiza y además cierra bien lo que estaba pendiente.',
    combinations: [
      {
        cardSlug: 'the-fool',
        reading:
          'El final toca el comienzo. Terminaste algo entero y la energía que queda libre empuja hacia lo siguiente antes de que llegues a extrañar lo anterior: cierra bien y arranca liviano.',
      },
      {
        cardSlug: 'two-of-wands',
        reading:
          'La expansión planeada se concreta y suele traer viaje o trabajo internacional. Lo que estabas evaluando desde la almena se transforma en un ciclo cumplido.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'El logro se vuelve patrimonio duradero. Lo que completaste no se agota en tú: queda como base para la gente que viene después y para lo que sigue.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'El cierre incluye una despedida. Lo que dejas ya te dio todo lo que tenía para darte: la partida no es fuga, es el modo correcto de terminar el ciclo.',
      },
    ],
  },
};
