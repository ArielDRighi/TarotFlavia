import { CardExtendedContentMap } from './card-extended-content.types';

/**
 * Contenido extendido de los 14 Bastos (T-SEO-009)
 *
 * Elemento Fuego: voluntad, acción, creatividad, impulso vital.
 * La sección de bienestar habla de energía, descanso, hábitos y ánimo.
 */
export const WANDS_EXTENDED_CONTENT: CardExtendedContentMap = {
  'ace-of-wands': {
    meaningLove:
      'En el amor es el chispazo: la atracción que aparece de golpe y enciende el cuerpo antes que la cabeza. Anuncia un encuentro con química evidente, el deseo que vuelve a una pareja de años o el impulso de declararte sin ensayar el discurso. No promete continuidad —eso lo dicen las cartas que la acompañan—, promete voltaje. Si vienes de una etapa apagada, el As te avisa que la brasa sigue ahí y que alcanza un gesto para avivarla. Lo que pide es que te muevas mientras la chispa está viva.',
    meaningWork:
      'Es la idea que llega entera y no te deja dormir: el proyecto que quieres arrancar, la propuesta que se te ocurre en la ducha, la oportunidad que aparece antes de que la busques. En lo laboral marca comienzos con energía propia, no heredada; algo que nace de tu iniciativa y no de una orden. Para quien trabaja por cuenta propia es el momento de lanzar. En el dinero indica un ingreso nuevo todavía chico pero con potencial de crecer si lo alimentas con trabajo sostenido.',
    meaningWellbeing:
      'Aparece un envión de energía que conviene aprovechar sin quemarlo en una sola noche. Es buen momento para retomar el movimiento del cuerpo, volver a una actividad que dejaste o empezar algo que venías postergando por pereza. El ánimo sube y el entusiasmo contagia. El riesgo del Fuego es arrancar a toda velocidad y abandonar en dos semanas: elige una rutina que puedas sostener con la agenda que realmente tienes, no con la que te gustaría tener.',
    symbolism:
      'Una mano surge de una nube sosteniendo una vara todavía viva: le brotan hojas, señal de que la madera no está muerta sino germinando. Las hojas que caen alrededor son las ocho llamas hebreas que en el Tarot Rider-Waite marcan la energía en estado puro, todavía sin forma. Abajo se ve un paisaje fértil con un río, un castillo lejano y colinas verdes: el territorio que la chispa puede conquistar si alguien la sostiene. La nube indica que el impulso viene de afuera, como una inspiración recibida; la mano, que hace falta alguien que la agarre.',
    advice:
      'Actúa ahora, mientras el entusiasmo está caliente. No esperes tener el plan completo: la energía de esta carta se enfría si la dejas madurar demasiado. Da el primer paso más chico posible hoy mismo —un mensaje, un boceto, una llamada— y deja que el movimiento genere el resto del camino. Si dudas entre pensarlo un poco más y empezar, empieza.',
    yesNo:
      'Sí, y además es un buen momento para arrancar. La condición es que actúes pronto: la respuesta favorable depende de tu impulso, no de que las cosas se acomoden solas.',
    combinations: [
      {
        cardSlug: 'the-magician',
        reading:
          'La chispa se vuelve manifestación concreta. Tienes la idea y también las herramientas para ejecutarla, así que la excusa de la falta de recursos se cae sola. Es una de las combinaciones más potentes para lanzar un proyecto propio.',
      },
      {
        cardSlug: 'three-of-wands',
        reading:
          'El comienzo ya empezó a dar señales de expansión. Lo que arrancó como una idea suelta encuentra su primer horizonte concreto y aparecen contactos o clientes de otro lugar. Sostén el impulso: esta secuencia premia la continuidad.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'La energía nueva llega justo después de un derrumbe. Lo que se cayó dejó espacio limpio y la chispa aparece sobre el terreno despejado. Duele el orden anterior, pero el As te dice que hay material para levantar algo mejor.',
      },
      {
        cardSlug: 'four-of-cups',
        reading:
          'Aparece la oportunidad y tú estás mirando para otro lado. Es la advertencia clásica del mazo: la apatía te tiene distraído mientras algo valioso pasa por delante. Levanta la vista antes de que la chispa se apague sola.',
      },
    ],
  },
  'two-of-wands': {
    meaningLove:
      'Estás en el momento de decidir hacia dónde va el vínculo. Puede ser el paso de convivir, la conversación sobre el futuro que se viene postergando o la elección entre dos historias posibles. La carta no muestra la escena romántica: muestra a alguien con el mapa en la mano evaluando. Si estás sin pareja, indica que tienes claro qué quieres y que ya no aceptas cualquier cosa por ocupar el lugar vacío. En una relación estable, invita a planear juntos algo que amplíe el mundo compartido.',
    meaningWork:
      'Es la etapa de planificación previa al salto: analizas el mercado, comparas propuestas, calculas riesgos. Aparece cuando tienes un logro asegurado y estás decidiendo si te conformas con eso o vas por más. Suele señalar expansión hacia otro territorio, sociedades con gente de afuera o el proyecto que todavía está sobre el papel. En el dinero, momento excelente para diseñar una estrategia a mediano plazo; malo para gastar impulsivamente lo que aún no cobraste.',
    meaningWellbeing:
      'La energía está disponible pero contenida, esperando destino. Es un tiempo de planear el cambio de hábitos más que de ejecutarlo: elegir la actividad, reservar el horario, conseguir lo que necesitas. El ánimo es estable con una pizca de inquietud, esa sensación de estar listo para algo que todavía no empieza. Cuidado con quedarte eternamente en la etapa de planear: el cuerpo pide movimiento real, no una lista de intenciones.',
    symbolism:
      'Un hombre de pie sobre la almena de un castillo sostiene un globo terráqueo en la mano derecha; lo mira como quien evalúa un territorio que todavía no pisó. Una vara está fijada al muro —lo ya conquistado, lo seguro— y la otra la sostiene él, todavía suelta: lo que puede llevarse si decide partir. El muro de piedra gris marca la frontera entre el logro y la aventura. Al fondo el mar abierto y una costa lejana. Las flores blancas y rojas del cruce simbolizan la unión entre el deseo y la voluntad de ejecutarlo.',
    advice:
      'Decide antes de que la decisión la tome el tiempo por ti. Tienes la información suficiente para elegir; lo que falta no es un dato más sino coraje. Escribe las dos opciones en dos columnas, asume que ninguna es perfecta y elige la que te deja más despierto. Y una vez elegida, comprométete: esta carta castiga la duda eterna más que el error.',
    yesNo:
      'Sí, si te decides. La carta responde afirmativamente a los planes bien pensados, pero deja el resultado atado a que salgas del análisis y des el paso concreto.',
    combinations: [
      {
        cardSlug: 'the-world',
        reading:
          'El plan de expansión se concreta y suele traer viaje, mudanza o trabajo con gente de otro país. Lo que estás evaluando desde la almena se transforma en un ciclo completo. Pocas combinaciones son tan claras para animarse a lo grande.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'La decisión implica dejar algo atrás. No se puede tomar el territorio nuevo sosteniendo el viejo con la otra mano: la secuencia pide una despedida honesta antes de partir hacia lo que estás mirando en el horizonte.',
      },
      {
        cardSlug: 'seven-of-pentacles',
        reading:
          'Estás decidiendo justo cuando toca evaluar lo sembrado. La combinación aconseja mirar los números fríos de lo que ya tienes antes de apostar por la expansión: la ambición sin balance previo es la trampa de esta dupla.',
      },
      {
        cardSlug: 'the-moon',
        reading:
          'El horizonte que crees ver puede ser una proyección de tu deseo. Antes de decidir, verifica los datos con alguien de afuera: acá el mapa está dibujado con información incompleta y la niebla se disfraza de oportunidad.',
      },
    ],
  },
  'three-of-wands': {
    meaningLove:
      'El vínculo empieza a mostrar resultados de lo que sembraste. Aparece después de una etapa de espera: la persona que respondió, la relación que sobrevivió a la distancia, la conversación pendiente que finalmente sucede. Marca amores que llegan de lejos —de otra ciudad, de otro círculo, de un viaje— y también parejas que se animan a un proyecto compartido de largo plazo. No es la carta del enamoramiento súbito sino la de la confianza en algo que ya está navegando y todavía no llegó a puerto.',
    meaningWork:
      'Los barcos ya zarparon: hiciste el trabajo y ahora estás en el momento de ver los primeros retornos. Señala expansión hacia mercados nuevos, colaboraciones a distancia, exportación, clientes de otras provincias o países. Es una carta favorable para quien está esperando respuesta de una postulación o el resultado de una inversión de tiempo. En el dinero anticipa ingresos que crecen, aunque todavía no estén acreditados: sigue trabajando mientras esperas, la carta premia la paciencia activa.',
    meaningWellbeing:
      'La energía se estabiliza después del envión inicial y aparece una sensación de resistencia sostenida. Buen momento para actividades al aire libre, caminatas largas, planes que impliquen salir de la rutina conocida. El ánimo mejora cuando cambias de escenario: si vienes de días encerrado, el cuerpo te está pidiendo horizonte. Cuida el descanso entre esfuerzos, porque el impulso de Fuego tiende a apurar los tiempos de recuperación.',
    symbolism:
      'Una figura de espaldas, envuelta en una capa roja y verde, observa el mar desde un promontorio elevado. De espaldas: la carta no muestra el rostro porque lo importante no es quien mira sino lo que se ve. Tres varas están plantadas firmes en la tierra y él sostiene una de ellas, apoyado, en actitud de espera confiada. En el agua se distinguen barcos pequeños que ya navegan: el trabajo hecho, viajando solo. Las montañas doradas del fondo son la ganancia posible, todavía lejana. El amarillo del cielo indica claridad mental sobre el propio proyecto.',
    advice:
      'Levanta la vista del escritorio y mira más lejos de lo que estás acostumbrado. Lo que sembraste ya está en camino: no lo desentierres para verificar si creció. Usa este tiempo para preparar la escala siguiente en lugar de vigilar la actual. Si tienes la posibilidad de ampliar el radio —otra ciudad, otro idioma, otro público—, esta es la temporada para intentarlo.',
    yesNo:
      'Sí, aunque el resultado tarde más de lo que te gustaría. La respuesta llega desde afuera o desde lejos y pide que sostengas la espera sin desarmar lo construido.',
    combinations: [
      {
        cardSlug: 'the-chariot',
        reading:
          'La expansión se convierte en avance dirigido. Dejas de esperar en el promontorio y tomas las riendas del viaje. Muy favorable para mudanzas, viajes de trabajo y decisiones que requieren empuje sostenido durante varios meses.',
      },
      {
        cardSlug: 'eight-of-wands',
        reading:
          'La espera se termina de golpe. Los barcos llegan todos juntos y las noticias se acumulan en pocos días. Prepárate para responder rápido: esta dupla acelera cualquier proceso que venías dando por dormido.',
      },
      {
        cardSlug: 'five-of-pentacles',
        reading:
          'Los planes de expansión chocan con una realidad material más ajustada de lo previsto. No cancela el proyecto, pero pide revisar el presupuesto y no comprometer dinero que todavía no entró.',
      },
      {
        cardSlug: 'queen-of-wands',
        reading:
          'Alguien con presencia y carisma impulsa tu expansión: una socia, una jefa, una clienta que te abre puertas. Acepta la ayuda sin sentir que le debes el mérito: el trabajo previo lo hiciste tú.',
      },
    ],
  },
  'four-of-wands': {
    meaningLove:
      'Es la carta de la celebración del vínculo: casamiento, convivencia, presentación en familia, aniversario que se festeja de verdad. Marca el momento en que la relación deja de ser un asunto privado y se muestra al mundo con orgullo. Si estás sin pareja, anuncia reencuentros, fiestas y ambientes donde la gente se conoce con alegría. Para quien viene de un período difícil, es el descanso merecido: un tramo estable donde el amor se disfruta en lugar de negociarse.',
    meaningWork:
      'Se completa una etapa y hay motivo para brindar: el proyecto entregado, el equipo consolidado, la mudanza a una oficina propia. Indica ambientes laborales sanos, socios que se llevan bien y logros que se comparten en lugar de disputarse. En lo económico marca estabilidad suficiente para respirar, no fortuna. Suele aparecer cuando conviene consolidar lo conseguido antes de encarar la etapa siguiente: es una base, no un techo.',
    meaningWellbeing:
      'El cuerpo pide fiesta y encuentro, y eso también sostiene el ánimo. Es una etapa de energía alegre, sueño reparador y ganas de compartir mesa. Las actividades en grupo funcionan mejor que las solitarias: baile, deportes de equipo, cocinar con otros. El cuidado a tener es el exceso festivo sostenido en el tiempo, que después se paga con cansancio. Celebra y vuelve a la rutina sin culpa.',
    symbolism:
      'Cuatro varas plantadas sostienen una guirnalda de flores y frutos, formando un umbral: es una estructura, no un edificio, lo que indica estabilidad conseguida pero todavía liviana. Dos figuras levantan ramilletes en señal de bienvenida bajo el arco. Detrás se ve un castillo de piedra —la solidez del clan, la familia, el proyecto que contiene— y un grupo de personas celebrando. El cielo amarillo, sin nubes, es la carta más luminosa del palo. El cuatro es el número de la estructura: cuatro patas, cuatro paredes, la base mínima para que algo se sostenga.',
    advice:
      'Detente a celebrar lo que conseguiste antes de correr a lo siguiente. Reunir a la gente que te acompañó no es un lujo: es lo que convierte un logro suelto en una base firme. Abre la puerta de tu casa, agradece en voz alta y deja que otros vean tu alegría. La energía que compartes ahora vuelve multiplicada en la etapa que empieza.',
    yesNo:
      'Sí, con festejo incluido. Es una de las respuestas más claramente favorables del mazo, sobre todo en preguntas sobre hogar, familia y compromisos que se hacen públicos.',
    combinations: [
      {
        cardSlug: 'ten-of-cups',
        reading:
          'La celebración se vuelve plenitud familiar duradera. Es la mejor dupla del mazo para preguntas sobre convivencia, casamiento o formar un hogar: lo que se festeja acá tiene raíces emocionales verdaderas, no solo protocolo.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'La unión se formaliza según la tradición: casamiento por iglesia o registro civil, contrato firmado, compromiso con testigos. La institución acompaña lo que ya funcionaba en privado.',
      },
      {
        cardSlug: 'five-of-cups',
        reading:
          'Se celebra con una ausencia presente: alguien falta en la mesa y se nota. La combinación pide hacer lugar al duelo dentro de la alegría en lugar de fingir que todo está entero.',
      },
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'El festejo llega después de mucho oficio callado. Se reconoce públicamente un trabajo hecho con paciencia durante años. Disfrútalo: en esta dupla el reconocimiento está bien ganado.',
      },
    ],
  },
  'five-of-wands': {
    meaningLove:
      'Hay fricción, y no siempre es grave: discusiones que se repiten por cosas chicas, competencia por tener razón, dos personas que quieren llevar la relación hacia lugares distintos al mismo tiempo. También aparece en triángulos, rivalidades por la misma persona o interferencia de terceros con opinión. La carta no habla de ruptura sino de desgaste por choque de voluntades. Bien trabajada, esta energía se vuelve pasión y juego; mal trabajada, convierte la convivencia en un ring donde nadie escucha.',
    meaningWork:
      'Ambiente competitivo: varias personas peleando por el mismo puesto, licitaciones, entrevistas con muchos candidatos, reuniones donde todos hablan y nadie decide. Indica que tu proyecto tiene competencia real y que vas a tener que diferenciarte para destacar. No es una carta negativa para quien sabe pelear: la fricción también entrena. En el dinero avisa de gastos que se disputan entre varias urgencias y de discusiones por presupuesto o herencia.',
    meaningWellbeing:
      'La energía está dispersa y peleada consigo misma: quieres hacer cinco cosas a la vez y terminas agotado sin haber avanzado en ninguna. El ánimo se irrita fácil y el sueño se pone liviano. El cuerpo agradece descargar el exceso de Fuego en actividad física intensa —correr, boxeo, deporte de contacto— en lugar de que salga en forma de discusiones. Conviene bajar la cantidad de frentes abiertos antes de subir el esfuerzo.',
    symbolism:
      'Cinco jóvenes agitan sus varas en el aire en lo que parece más una escaramuza que una batalla: nadie está herido, nadie tiene armadura, las varas no se usan como armas sino como palos que se cruzan. Cada uno viste ropa de color distinto, señal de que el conflicto viene de la diversidad de intereses y no de la maldad. El suelo es firme y el cielo está despejado: el caos es de superficie. La escena sugiere un entrenamiento desordenado, energía joven que todavía no encontró disciplina ni objetivo común.',
    advice:
      'Elige tu batalla y abandona las otras cuatro. La mayor parte del desgaste que sientes no viene del conflicto principal sino de los frentes menores que dejaste abiertos por orgullo. Define qué quieres ganar realmente, dilo en voz alta y deja de discutir por lo demás. Si el ambiente es competitivo, compite con tu trabajo, no con tu ruido.',
    yesNo:
      'Todavía no. Hay demasiada competencia y demasiado ruido alrededor de la pregunta; la respuesta se define cuando la fricción baje y quede claro quién quiere qué.',
    combinations: [
      {
        cardSlug: 'six-of-wands',
        reading:
          'La competencia se resuelve a tu favor. Es la secuencia clásica del mazo: primero el enfrentamiento desordenado y después el reconocimiento público. Sostén la disputa un tramo más, el desenlace te favorece.',
      },
      {
        cardSlug: 'justice',
        reading:
          'El conflicto termina en un ámbito formal: mediación, abogados, recursos humanos, un contrato que define quién tiene razón. Prepara la documentación, porque acá gana quien puede probar lo que dice.',
      },
      {
        cardSlug: 'two-of-cups',
        reading:
          'La rivalidad esconde atracción. Muy frecuente en vínculos que empiezan discutiendo: el choque de egos tapa una química real que todavía ninguno se anima a nombrar.',
      },
      {
        cardSlug: 'the-hermit',
        reading:
          'La respuesta al conflicto es retirarte. No todas las peleas merecen tu presencia: la dupla aconseja salir del ring, tomar distancia y dejar que los demás se cansen solos.',
      },
    ],
  },
  'six-of-wands': {
    meaningLove:
      'Llega el reconocimiento: la relación se afianza a la vista de todos, alguien te elige públicamente o recibes la declaración que esperabas. Si vienes de una etapa de dudas, es la confirmación de que valías la pena la espera. Para quien está sin pareja, indica un período de brillo personal en el que resultas visiblemente atractivo. El único cuidado es el ego: cuando el vínculo se convierte en un trofeo para mostrar, la persona real que está al lado queda en segundo plano.',
    meaningWork:
      'Victoria y reconocimiento público: el ascenso, la propuesta ganada, el proyecto que sale bien y todos se enteran. Aparece cuando el esfuerzo por fin se vuelve visible para quien decide. Es una carta excelente para presentaciones, exámenes, concursos y entrevistas. En el dinero marca una mejora concreta ligada al mérito, no a la suerte. El consejo que trae es no acomodarse en el aplauso: el caballo sigue avanzando, la carta es un tramo del camino, no la meta.',
    meaningWellbeing:
      'La energía está alta y el ánimo también: te sientes capaz y eso se nota en el cuerpo. Buen momento para exigirte un poco más en la actividad física, correr esa distancia que venías esquivando o sostener una rutina con constancia. La confianza mejora el descanso y baja la tensión acumulada. Cuidado con la soberbia física: sentirte fuerte no es lo mismo que estar entrenado, y las lesiones tontas aparecen justo en las rachas buenas.',
    symbolism:
      'Un jinete avanza sobre un caballo blanco engalanado con una manta verde, rodeado de gente que camina a pie: la altura marca la diferencia entre quien fue reconocido y quienes acompañan. Lleva una corona de laurel en la cabeza y otra atada a la vara que sostiene, señal de que el triunfo es doble: personal y público. El caballo blanco es la fuerza instintiva ya domada. Las varas de los acompañantes están levantadas en señal de apoyo, no de amenaza. Es una procesión, no una fuga: la victoria acá tiene testigos.',
    advice:
      'Acepta el reconocimiento sin minimizarlo y sin agrandarlo. Si te felicitan, di gracias en lugar de explicar por qué no fue para tanto. Aprovecha el envión de credibilidad para pedir lo que venías postergando: hoy tu palabra pesa más que el mes pasado. Y acuérdate de nombrar a quienes caminaron al lado del caballo.',
    yesNo:
      'Sí, con reconocimiento incluido. Es una de las respuestas más favorables del palo, especialmente cuando la pregunta involucra el juicio o la aprobación de otras personas.',
    combinations: [
      {
        cardSlug: 'the-sun',
        reading:
          'El éxito es rotundo y además te hace feliz, que no siempre es lo mismo. Todo lo que estaba en duda se aclara y se celebra. Es una de las duplas más luminosas del mazo para cualquier pregunta.',
      },
      {
        cardSlug: 'seven-of-wands',
        reading:
          'Ganaste y ahora toca defender el lugar. El reconocimiento genera competencia nueva: prepárate para sostener tu posición frente a quienes recién ahora te ven como rival.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'El triunfo se apoya en una base que no resiste. Revisa qué sostiene realmente el logro antes de subir más alto: esta secuencia advierte sobre éxitos construidos sobre estructuras frágiles.',
      },
      {
        cardSlug: 'nine-of-pentacles',
        reading:
          'El reconocimiento se traduce en bienestar material propio. Lo ganado no se evapora en el festejo: se convierte en independencia concreta y en un estilo de vida que puedes sostener solo.',
      },
    ],
  },
  'seven-of-wands': {
    meaningLove:
      'Estás defendiendo la relación de algo: la opinión de la familia, un ex que reaparece, comentarios de gente que opina sin que le pregunten. También aparece cuando tienes que sostener tus límites dentro de la pareja frente a alguien que insiste. La carta te da la razón —estás en el lugar alto, tienes la ventaja— pero avisa que vas a tener que decirlo con firmeza más de una vez. Si estás sin pareja, indica que defiendes tu forma de vivir frente a los que te presionan para que te acomodes.',
    meaningWork:
      'Te toca defender tu posición, tu proyecto o tu criterio profesional frente a varios que empujan en contra. Aparece en negociaciones difíciles, competencia por un cliente o cuando alguien intenta atribuirse tu trabajo. La buena noticia es la topografía: estás arriba, ellos abajo. Tienes ventaja si sostienes la firmeza sin salir del terreno. En el dinero marca la necesidad de defender tarifas, cobrar lo que corresponde y no aceptar rebajas por cansancio.',
    meaningWellbeing:
      'La energía se va en estar alerta. Es un período de tensión sostenida en el cuerpo: mandíbula apretada, hombros duros, sueño en guardia. El desgaste no viene del esfuerzo sino de la vigilancia permanente. Conviene bajar el estado de alarma con actividades que aflojen —estiramiento, respiración, agua caliente— y elegir conscientemente momentos del día en los que no defiendas nada. El ánimo mejora apenas dejas de pelear en tu cabeza discusiones que ya terminaron.',
    symbolism:
      'Un hombre solo, parado sobre un promontorio verde, sostiene una vara en actitud defensiva mientras seis varas suben desde abajo del encuadre: no se ve quién las empuña, porque en esta carta el adversario es difuso. Un detalle célebre del Rider-Waite es que lleva zapatos distintos en cada pie, señal de que se levantó apurado a defenderse. El terreno elevado es su única ventaja real, y es suficiente. El cielo despejado indica que la amenaza no es catastrófica, solo persistente.',
    advice:
      'Sostén tu posición, pero elige el terreno. No bajes a discutir a la altura de quien te desafía: tu ventaja es el lugar donde estás parado, y lo pierdes apenas te enredas en la pelea de otro. Repite tu límite una vez más de las que te resulten cómodas y no lo justifiques cada vez. Y revisa si de verdad hace falta defender todo lo que estás defendiendo.',
    yesNo:
      'Sí, pero vas a tener que pelearlo. La respuesta es favorable únicamente si sostienes tu posición sin ceder ante la presión de los primeros embates.',
    combinations: [
      {
        cardSlug: 'strength',
        reading:
          'La defensa se hace desde la calma y no desde la crispación. Ganas por serenidad, no por gritar más fuerte. Esta dupla convierte una pelea desgastante en una demostración tranquila de convicción.',
      },
      {
        cardSlug: 'ten-of-wands',
        reading:
          'Estás defendiendo demasiadas cosas a la vez y el peso te está aplastando. Suelta lo que no es tuyo: la combinación advierte que el agotamiento va a llegar antes que la victoria.',
      },
      {
        cardSlug: 'the-emperor',
        reading:
          'Tu posición se apoya en una autoridad legítima: un cargo, un contrato, una norma. Invoca la estructura formal en vez de discutir de igual a igual y el conflicto se acorta.',
      },
      {
        cardSlug: 'five-of-swords',
        reading:
          'Ojo con el costo de ganar. Puedes imponerte y quedarte solo en el campo. Antes del último empujón, pregúntate qué relación estás dispuesto a romper por tener razón.',
      },
    ],
  },
  'eight-of-wands': {
    meaningLove:
      'Todo se acelera: el mensaje que llega, la cita que se arma en dos días, la conversación pendiente que por fin sucede. Es una carta de noticias y de movimiento veloz en los vínculos, muchas veces a distancia. Para una pareja estancada, señala que algo se destraba de golpe. Si estás esperando que alguien se manifieste, esta carta dice que la respuesta viene en camino y pronto. El riesgo es la precipitación: en este ritmo se dicen cosas sin pensar y se toman decisiones que después cuesta explicar.',
    meaningWork:
      'Los proyectos que estaban frenados arrancan todos juntos. Aparecen respuestas, aprobaciones, mails que destraban procesos, viajes que se confirman con poca anticipación. Es una carta excelente para lanzamientos, envíos y todo lo que dependa de la comunicación. La agenda se llena rápido. En el dinero indica movimientos veloces: cobros que se acreditan, transferencias, pagos que llegan en el momento justo. Organízate antes de que la velocidad te organice a ti.',
    meaningWellbeing:
      'La energía está acelerada y el cuerpo va más rápido que la cabeza. Los días pasan volando y el descanso se vuelve la primera víctima de la agenda. Es un buen momento para actividades dinámicas, pero pésimo para saltearte las comidas y dormir cinco horas apostando a que el envión aguanta. Baja un cambio antes de dormir: el ánimo de esta carta cuesta apagar de noche y el sueño se resiente si no le das un descenso gradual.',
    symbolism:
      'Ocho varas cruzan el aire en diagonal, paralelas, ya en la parte final de su vuelo: están descendiendo hacia la tierra, lo que indica que el mensaje está por aterrizar. No hay figuras humanas —única carta del palo sin personas—: lo que importa es el movimiento, no quien lo protagoniza. Debajo se ve un paisaje verde, un río sereno y una colina con una casa pequeña: el destino tranquilo al que llega toda esta velocidad. El cielo claro y sin obstáculos dice que nada va a interrumpir la trayectoria.',
    advice:
      'Aprovecha la ventana: lo que se mueve rápido también se cierra rápido. Responde los mensajes pendientes hoy, confirma lo que estabas dejando en suspenso y manda lo que tenías listo hace semanas. Al mismo tiempo, relee antes de enviar: la velocidad de esta carta es buena para avanzar y pésima para corregir. Un minuto de revisión ahorra una semana de aclaraciones.',
    yesNo:
      'Sí, y antes de lo que esperas. La respuesta llega rápido y suele venir por escrito o desde lejos; prepárate para actuar con poco tiempo de aviso.',
    combinations: [
      {
        cardSlug: 'the-chariot',
        reading:
          'Velocidad con dirección clara: viajes que se concretan, mudanzas que se resuelven en días, procesos que avanzan sin trabas. Una de las duplas más dinámicas del mazo para cualquier cosa que necesite arrancar ya.',
      },
      {
        cardSlug: 'page-of-swords',
        reading:
          'Llegan noticias por escrito y conviene leer la letra chica. La información viaja rápido pero no necesariamente completa: verifica antes de reenviar o de tomar decisiones sobre lo que te contaron.',
      },
      {
        cardSlug: 'four-of-swords',
        reading:
          'El acelerón choca contra la necesidad de parar. El cuerpo te pide pausa justo cuando todo se destraba. Elige qué es urgente de verdad y posterga el resto sin culpa.',
      },
      {
        cardSlug: 'the-lovers',
        reading:
          'El mensaje que llega es del corazón. Una declaración, un reencuentro o una definición amorosa que se resuelve rápido después de mucho tiempo en suspenso.',
      },
    ],
  },
  'nine-of-wands': {
    meaningLove:
      'Llegas al vínculo con las heridas de los anteriores todavía a la vista. Desconfías, mides cada palabra y esperas el golpe antes de que exista. La carta reconoce que el dolor fue real y avisa que la coraza está empezando a costarte más de lo que te protege. En una pareja de años marca el tramo de cansancio en el que se sigue por convicción, no por entusiasmo. Falta poco para el descanso: la última guardia siempre es la más larga.',
    meaningWork:
      'Estás cerca del final de un proceso agotador y no quieres bajar los brazos justo ahora. Aparece cuando ya diste muchas peleas laborales y te queda una, o cuando la desconfianza acumulada te hace revisar todo tres veces. Tienes más recursos de los que sientes: las ocho varas plantadas detrás son experiencia, no cicatrices inútiles. En el dinero indica reservas ajustadas pero suficientes; no es momento de arriesgar el colchón que te queda.',
    meaningWellbeing:
      'El cansancio es real y viene de lejos: no es de esta semana, es acumulado. El cuerpo está en alerta permanente y eso consume más energía que el trabajo en sí. Lo que pide la carta no es más esfuerzo sino descanso verdadero, del que corta la vigilancia. Dormir mejor, aflojar la guardia con gente de confianza y dejar de anticipar problemas que todavía no pasaron. El ánimo se recupera cuando el cuerpo confirma que ya no hay que estar defendiendo.',
    symbolism:
      'Un hombre con la cabeza vendada se apoya en una vara y mira de reojo hacia un costado, atento a un peligro que quizás ya no está. Detrás de él, ocho varas se alzan formando una empalizada: son las batallas anteriores convertidas en defensa. La venda muestra que ya fue golpeado y sobrevivió. El gesto es de agotamiento, no de derrota: sigue de pie. El fondo muestra colinas áridas y un cielo pálido, un paisaje sin amenaza visible. La carta pregunta si la guardia todavía protege algo o si solo te está impidiendo descansar.',
    advice:
      'Aguanta un poco más, pero deja de pelear con fantasmas. Distingue el peligro actual de la memoria del peligro anterior: no son lo mismo y solo uno merece tu energía. Pide ayuda aunque te cueste; esta carta insiste en la soledad y la soledad es justamente lo que la vuelve tan pesada. Estás más cerca del final de lo que crees.',
    yesNo:
      'Sí, si resistes el último tramo. La carta anticipa una prueba de perseverancia antes del resultado favorable, y ese resultado depende de que no abandones ahora.',
    combinations: [
      {
        cardSlug: 'the-star',
        reading:
          'Después del agotamiento llega la calma que repara. La combinación anuncia que la guardia por fin puede bajarse: lo que viene es alivio genuino y recuperación de la confianza perdida.',
      },
      {
        cardSlug: 'ten-of-wands',
        reading:
          'El cansancio se convierte en sobrecarga y la carta lo dice sin vueltas. Si sigues sumando responsabilidades encima del agotamiento previo, el desenlace no es la victoria sino el derrumbe. Suelta algo esta semana, aunque salga peor sin tu control, y reparte lo que quede.',
      },
      {
        cardSlug: 'six-of-swords',
        reading:
          'La salida es irte, no resistir más. La dupla propone dejar el territorio en disputa y empezar en otro lado, con la experiencia puesta como equipaje y no como armadura.',
      },
      {
        cardSlug: 'king-of-wands',
        reading:
          'La resistencia madura en liderazgo. Lo que aprendiste peleando se convierte en autoridad reconocida. Es hora de conducir en lugar de defender el metro cuadrado propio.',
      },
    ],
  },
  'ten-of-wands': {
    meaningLove:
      'La relación se volvió una obligación más en una agenda que ya no da. Aparece cuando uno de los dos carga con todo —los trámites, la casa, el ánimo del otro— y el vínculo dejó de ser un lugar de descanso. También marca amores que continúan por deber, por los chicos o por costumbre. No dice que haya que terminarlo: dice que hay que repartir el peso y hablarlo antes de que el resentimiento haga el trabajo por ti. Si estás sin pareja, señala que no tienes espacio libre para que entre alguien.',
    meaningWork:
      'Estás haciendo el trabajo de tres personas. La carta del sobrecompromiso: tareas que aceptaste por no saber decir que no, responsabilidades que te delegaron sin darte autoridad, proyectos propios que te asfixian. El éxito está ahí —las diez varas son cosecha real— pero llegar a la meta así te va a dejar sin nada. Es el momento de delegar, priorizar o negociar plazos. En el dinero indica ingresos que existen pero exigen un esfuerzo desproporcionado para sostenerlos.',
    meaningWellbeing:
      'El agotamiento ya es físico, no solo mental: espalda cargada, dormir mal, la sensación de arrastrarte por la semana. El cuerpo lleva demasiado tiempo funcionando en modo exigencia y está pidiendo pausa a los gritos. La carta no aconseja una rutina nueva sino sacar cosas de la lista. Un día entero sin obligaciones vale más que cualquier plan de mejora que agregue otra tarea. Aflojar la carga no es pereza: es la única forma de llegar entero.',
    symbolism:
      'Una figura encorvada avanza cargando diez varas apiladas contra el pecho, tantas que le tapan la vista del camino y de la ciudad que se ve al fondo. Está a pocos pasos del destino y no puede verlo: la sobrecarga esconde la meta. Las varas están vivas, con hojas: no es basura lo que carga, son logros. Nadie se las puso encima; las juntó él. El terreno es llano y el cielo está despejado —no hay tormenta— porque el obstáculo de esta carta no viene de afuera sino del propio exceso de responsabilidad asumida.',
    advice:
      'Baja las varas al piso y mira qué hay realmente en tus brazos. La mitad de lo que cargas no es tuyo o ya no hace falta. Delega dos cosas esta semana, aunque salgan peor que si las hicieras tú, y di que no la próxima vez que te ofrezcan una tarea más. Llegar agotado a la meta no es mérito: es una forma cara de perder el premio.',
    yesNo:
      'Sí, pero a un costo alto en esfuerzo. Antes de avanzar, pregúntate si el resultado justifica el peso que vas a tener que cargar para conseguirlo.',
    combinations: [
      {
        cardSlug: 'the-hanged-man',
        reading:
          'La sobrecarga obliga a frenar y mirar la situación desde otro ángulo. La pausa no es opcional: si no la eliges, llega igual. Aprovéchala para revisar por qué aceptaste todo eso.',
      },
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'Mucho trabajo, pero con oficio y método. La carga se vuelve manejable apenas ordenas el proceso: no es que sea demasiado, es que lo estás haciendo todo a la vez y sin sistema.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'Cargas ese peso porque algo te ata: dinero, culpa o la necesidad de sentirte imprescindible. Mira la cadena antes de seguir sumando varas, porque el problema no es la tarea sino el motivo.',
      },
      {
        cardSlug: 'temperance',
        reading:
          'La salida es el equilibrio, no el abandono. Ajusta las proporciones —menos horas, mejor reparto, ritmo sostenible— y lo que hoy te aplasta vuelve a ser un proyecto que disfrutas.',
      },
    ],
  },
  'page-of-wands': {
    meaningLove:
      'Es el flechazo entusiasta y un poco atolondrado: mensajes a cualquier hora, planes improvisados, la alegría de recién conocerse. Marca vínculos jóvenes en el sentido de frescos, no de edad, donde todo es descubrimiento y nada está definido. Para una pareja larga, es la invitación a jugar de nuevo, a romper la rutina con algo inesperado. El aviso que trae es la inconstancia: este entusiasmo enciende rápido y también se distrae rápido si no encuentra algo que lo sostenga.',
    meaningWork:
      'Aparecen ganas de aprender algo nuevo, un curso que te entusiasma, una propuesta que te saca de lo conocido. Es la carta del aprendiz motivado: todavía no sabes hacerlo, pero quieres. Suele señalar noticias que abren posibilidades, entrevistas prometedoras y proyectos en etapa exploratoria. Excelente para empezar a estudiar; insuficiente para sostener un negocio sin ayuda. En el dinero, ingresos pequeños ligados a algo nuevo que recién estás probando.',
    meaningWellbeing:
      'Vuelve la curiosidad por el cuerpo: ganas de probar una actividad distinta, salir a andar en bicicleta, anotarte en algo solo para ver cómo es. La energía es alta y juguetona, con poca disciplina. El ánimo mejora con novedad y se apaga con la repetición. Aprovecha el impulso para explorar sin exigirte resultados, y busca compañía: en esta carta lo que se hace con otros dura mucho más que lo que se promete en soledad.',
    symbolism:
      'Un joven de pie, con una túnica amarilla decorada con salamandras —el animal que en la tradición alquímica vive en el fuego y representa la energía vital indestructible—, sostiene una vara florecida y la mira con curiosidad, como preguntándole qué se puede hacer con ella. Las salamandras de su ropa tienen la cola casi cerrada en círculo: la transformación todavía está incompleta. Lleva una pluma roja en el sombrero, señal de audacia. Detrás se extiende un desierto con tres pirámides: mucho territorio por explorar y poco camino recorrido.',
    advice:
      'Anímate a probar antes de saber si sirve. Esta carta premia la exploración honesta y castiga la parálisis del que quiere garantías. Anótate, pregunta, manda el mensaje, empieza el curso. Al mismo tiempo, elige una sola cosa nueva y dale al menos un mes: el entusiasmo del Paje se evapora si lo repartes entre cinco intereses a la vez.',
    yesNo:
      'Sí, con entusiasmo aunque sin garantías. Es una respuesta favorable para empezar y explorar, no para comprometerte a largo plazo con lo que recién estás descubriendo.',
    combinations: [
      {
        cardSlug: 'the-fool',
        reading:
          'Doble energía de comienzo, doble ingenuidad. La aventura arranca con toda la frescura y ninguna experiencia: entra igual, pero consigue a alguien con recorrido que te acompañe en las decisiones grandes.',
      },
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'El entusiasmo se convierte en oficio. La curiosidad encuentra disciplina y lo que empezó como un juego se transforma en una habilidad real. Es la mejor dupla para quien está aprendiendo algo nuevo.',
      },
      {
        cardSlug: 'seven-of-cups',
        reading:
          'Demasiadas opciones y ninguna elegida. El entusiasmo se dispersa entre proyectos que suenan bien en la cabeza. Baja la lista a uno solo y prueba en la realidad antes de seguir soñando.',
      },
      {
        cardSlug: 'queen-of-wands',
        reading:
          'Alguien con experiencia y carisma se convierte en tu mentora. El aprendiz encuentra maestra: escucha, copia lo que funciona y aprovecha las puertas que esa persona te abre.',
      },
    ],
  },
  'knight-of-wands': {
    meaningLove:
      'Pasión intensa que llega a toda velocidad: alguien que te encanta, te desborda y no siempre se queda. Es el romance con temperatura alta, aventuras, viajes juntos y decisiones tomadas en caliente. Enciende cualquier vínculo dormido. El aviso es conocido: este Caballero galopa hacia donde el fuego lo llame, y cuando el entusiasmo baja puede irse igual de rápido que como llegó. Disfrútalo por lo que es y no le pidas estabilidad antes de que la demuestre.',
    meaningWork:
      'Acción decidida y sin demasiado plan: lanzarte al proyecto, cambiar de trabajo de un día para otro, encarar un desafío que asusta a otros. Es una energía excelente para arrancar, mudarse, viajar por trabajo o resolver algo que estaba trabado por miedo. La debilidad es el seguimiento: empieza fuerte y se aburre en la etapa administrativa. En el dinero, movimientos audaces con retorno posible y riesgo real. Rodéate de alguien metódico antes de firmar.',
    meaningWellbeing:
      'Energía desbordante que necesita salida física urgente. El cuerpo pide velocidad, intensidad, sudor. Buen momento para el deporte exigente y las actividades que descargan adrenalina. El riesgo son los excesos y los golpes por apuro: en esta carta las lesiones vienen de no calentar, no de entrenar. El ánimo es alto y algo impaciente. Alterna el envión con descanso real, porque el Caballero no sabe frenar por sí solo y el cuerpo termina frenándolo.',
    symbolism:
      'Un caballero con armadura avanza sobre un caballo alazán encabritado, con las patas delanteras en el aire: el impulso es tan fuerte que ni el jinete lo controla del todo. La armadura está decorada con salamandras, otra vez el fuego que no se apaga, y del yelmo brota una pluma roja larga que se dobla con la velocidad. Sostiene la vara inclinada hacia adelante, como una lanza. Al fondo, tres pirámides en un desierto árido: mucho horizonte, poca agua, un terreno que exige energía y no perdona la improvisación.',
    advice:
      'Ve, pero mira dónde pisas. El impulso es tu mejor herramienta y también lo que te hace tropezar: úsalo para arrancar y consigue quien sostenga los detalles. Antes de lanzarte, define una sola cosa concreta que tenga que estar terminada en treinta días. Y si algo te enciende hoy, pregúntate si te va a seguir importando en tres meses.',
    yesNo:
      'Sí, con movimiento rápido e intenso. La respuesta es favorable en el corto plazo; la duración de ese sí queda en duda si nadie sostiene el proyecto cuando baje el entusiasmo.',
    combinations: [
      {
        cardSlug: 'the-chariot',
        reading:
          'Impulso más dirección: la fórmula del avance imparable. Lo que arranca acá llega lejos porque la audacia encuentra por fin un rumbo definido. Excelente para viajes, mudanzas y lanzamientos.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'El galope choca contra alguien que no quiere soltar nada. Tu impulso encuentra resistencia conservadora, propia o ajena. Negocia el ritmo o vas a chocar contra un muro que no se mueve.',
      },
      {
        cardSlug: 'two-of-cups',
        reading:
          'La pasión encuentra reciprocidad. Lo que empezó como aventura tiene con qué volverse vínculo verdadero. Es la mejor señal para que el Caballero decida quedarse en algún lado.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'Velocidad más estructura frágil: riesgo de accidente. Baja un cambio, revisa lo que te estás salteando por apuro y no firmes ni viajes sin leer los detalles.',
      },
    ],
  },
  'queen-of-wands': {
    meaningLove:
      'Habla de alguien seguro de sí mismo, magnético y cálido, que atrae sin esforzarse. En una relación, marca el momento en que te muestras entero y eso gusta. Es la carta de la seducción con autoestima, no con estrategia. Si describe a una persona de tu entorno, es alguien sociable, generoso y con un límite claro: acompaña, pero no se achica por nadie. El aviso viene por el lado de los celos: cuando esta energía se siente ignorada, quema. Se le responde con presencia, no con explicaciones.',
    meaningWork:
      'Liderazgo carismático: la persona que arma equipo, contagia entusiasmo y consigue que otros quieran trabajar con ella. Aparece cuando te toca mostrarte, vender tu proyecto o poner la cara. Excelente para emprendimientos propios, trabajos de cara al público, docencia y todo lo que dependa de convencer. En el dinero indica ingresos ligados a tu marca personal y a tu capacidad de generar confianza. Rodearte de gente que te admire está bien; rodearte solo de eso, no.',
    meaningWellbeing:
      'Energía cálida y sostenida, muy distinta del envión del Caballero: esta se administra sola. Buen momento para rutinas que disfrutes de verdad, porque las vas a sostener. El ánimo es alto y contagioso, y el cuerpo responde bien a lo que se hace con placer. Cuida el descanso emocional: esta figura sostiene a mucha gente y rara vez pide sostén. Reservar tiempo propio, sin público, es lo que evita que el fuego se consuma a sí mismo.',
    symbolism:
      'Una mujer coronada se sienta en un trono de piedra decorado con leones enfrentados, símbolo del Fuego dominado. Sostiene una vara florecida en una mano y un girasol en la otra: la vara es la voluntad, el girasol es la alegría que sigue a la luz. Está sentada con las piernas abiertas, en postura de autoridad relajada, no de rigidez. A sus pies hay un gato negro que la mira de frente, guardián de su intuición y de su costado menos visible. El fondo es un desierto amarillo bajo un cielo claro: territorio duro que ella habita sin dramatismo.',
    advice:
      'Ocupa tu lugar sin pedir permiso. La seguridad que muestres es lo que va a convencer, mucho más que los argumentos que prepares. Muéstrate, habla en primera persona, ofrece lo que tienes con orgullo. Y cuando la generosidad empiece a vaciarte, acuérdate del gato negro: hay una parte tuya que no se le presta a nadie.',
    yesNo:
      'Sí, y depende de que te muestres. La respuesta favorable llega cuando pones el cuerpo y la voz en juego, no cuando esperas que otros noten tu valor por su cuenta.',
    combinations: [
      {
        cardSlug: 'the-star',
        reading:
          'Carisma con propósito. Tu presencia inspira a otros y además tiene un sentido claro para ti. Muy favorable para proyectos que combinan visibilidad pública con vocación genuina.',
      },
      {
        cardSlug: 'king-of-wands',
        reading:
          'Dos liderazgos fuertes en la misma escena. Puede ser una sociedad potente o una lucha de egos: la diferencia está en repartir territorios claros desde el primer día.',
      },
      {
        cardSlug: 'nine-of-swords',
        reading:
          'La seguridad exterior tapa una angustia nocturna que nadie ve. La combinación pide dejar de sostener el personaje frente a la gente de confianza y decir lo que realmente está pasando.',
      },
      {
        cardSlug: 'three-of-cups',
        reading:
          'Carisma y comunidad: aparece un círculo de amistad o un equipo donde brillas acompañado. Buen momento para reunir gente, celebrar y armar redes que después sostienen proyectos.',
      },
    ],
  },
  'king-of-wands': {
    meaningLove:
      'Es la carta del compromiso apasionado y firme: alguien que sabe lo que quiere, lo dice y lo sostiene. En una relación indica la etapa en que las decisiones se toman de común acuerdo y con convicción, sin dar vueltas. Si describe a una persona, es generosa, leal y acostumbrada a conducir; con tendencia a decidir por los dos si el otro no marca su lugar. El aviso es la impaciencia: cuando este fuego no consigue lo que quiere, arrasa. Se equilibra con escucha real, no con obediencia.',
    meaningWork:
      'Visión estratégica más capacidad de ejecución: el emprendedor que ve la oportunidad, arma el equipo y la lleva adelante. Aparece cuando te toca asumir el mando de un proyecto o cuando alguien con poder de decisión apuesta por ti. Excelente para negocios propios, sociedades y cargos de conducción. En el dinero marca crecimiento sostenido, decisiones audaces bien fundadas e inversiones a mediano plazo. Delegar es la asignatura de esta carta: sin eso, el rey termina haciendo el trabajo de todos.',
    meaningWellbeing:
      'Energía fuerte y bien administrada, con un cuerpo que responde a la exigencia si le das descanso proporcional. Es una etapa de vitalidad alta y ánimo firme. El punto flojo es la tendencia a ignorar las señales de cansancio hasta que se vuelven imposibles de ignorar: este arquetipo no frena por prevención, frena por obligación. Fija los límites de antemano —horario de corte, un día libre real— porque en el momento no vas a querer ponerlos.',
    symbolism:
      'Un rey coronado se sienta en un trono adornado con leones y salamandras, los mismos símbolos del Fuego que aparecen en toda la corte de Bastos, pero acá las salamandras cierran el círculo mordiéndose la cola: la transformación está completa. Sostiene la vara florecida con firmeza, apoyada en el piso. Está de perfil, ligeramente girado, como si estuviera por levantarse: la autoridad de esta carta no es estática, ejecuta. Junto al trono hay una salamandra viva. Su manto naranja y el fondo del mismo tono muestran un mundo que arde sin quemarlo.',
    advice:
      'Toma la decisión que estás postergando y comunícala con claridad. Tienes la visión y la autoridad para hacerlo; lo que falta es que dejes de consultar para confirmar lo que ya sabes. Define el rumbo, reparte tareas y confía en quienes las reciben. Y mide la intensidad con la que hablas: lo que a ti te suena a convicción, del otro lado puede sonar a orden.',
    yesNo:
      'Sí, con autoridad y convicción. Es una respuesta afirmativa fuerte, especialmente si la pregunta involucra liderar, emprender o hacerte cargo de algo grande.',
    combinations: [
      {
        cardSlug: 'the-emperor',
        reading:
          'Visión y estructura juntas: el proyecto tiene ambición y también las reglas para sostenerla. Es una de las mejores combinaciones del mazo para fundar algo que dure en el tiempo.',
      },
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'El liderazgo encuentra una oportunidad material concreta. Lo que hasta ahora era visión se vuelve negocio con números reales. Muy favorable para lanzar un emprendimiento propio.',
      },
      {
        cardSlug: 'five-of-wands',
        reading:
          'Tu autoridad es discutida por varios al mismo tiempo. No respondas a todos: define quién decide qué y el ruido se acomoda solo cuando la estructura queda clara.',
      },
      {
        cardSlug: 'the-hanged-man',
        reading:
          'El impulso de mandar choca con un tiempo que no se puede apurar. La combinación aconseja soltar el control por un tramo: hay procesos que solo maduran sin que nadie los conduzca.',
      },
    ],
  },
};
