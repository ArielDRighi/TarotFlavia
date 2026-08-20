import { CardExtendedContentMap } from './card-extended-content.types';

/**
 * Contenido extendido de las 14 Copas (T-SEO-009)
 *
 * Elemento Agua: emociones, vínculos, intimidad, mundo interno.
 * La sección de bienestar habla de energía, descanso, hábitos y ánimo.
 */
export const CUPS_EXTENDED_CONTENT: CardExtendedContentMap = {
  'ace-of-cups': {
    meaningLove:
      'Es el corazón que se abre otra vez. Anuncia un amor que empieza, una reconciliación sincera o el momento en que te permites sentir después de mucho tiempo cerrado. No habla de una relación armada sino del agua que empieza a correr: ternura, deseo de cuidar, disponibilidad emocional. Para una pareja de años marca el retorno de la intimidad verdadera, esa en la que uno se muestra sin defensa. Si estás solo, avisa que estás listo para recibir, y eso pesa más que salir a buscar.',
    meaningWork:
      'Aparece cuando el trabajo vuelve a tener sentido emocional: un proyecto que te conmueve, un equipo donde te sientes querido, una vocación que asoma después de años de puro trámite. Es una carta más de satisfacción que de facturación, aunque suele abrir puertas en áreas creativas, de cuidado y de trato con personas. En el dinero indica un ingreso que llega de manera generosa y algo inesperada, muchas veces por vínculos y no por gestión.',
    meaningWellbeing:
      'El ánimo mejora de forma notoria y eso se refleja en el cuerpo: duermes mejor, aflojas la mandíbula, vuelve el apetito por cosas simples. Es un momento propicio para retomar el contacto con el agua —nadar, ducharse largo, caminar cerca del río— y para todo lo que ablande la coraza. La energía es suave, no explosiva: no fuerces rendimiento. Lo que hoy repara es dejarse cuidar y permitir que algo lindo entre sin desconfiar de entrada.',
    symbolism:
      'Una mano surge de una nube sosteniendo una copa dorada de la que brotan cinco chorros de agua: los cinco sentidos recibiendo la emoción, más agua de la que la copa puede contener. Una paloma blanca desciende con una hostia marcada por una cruz y la introduce en la copa, uniendo lo espiritual con lo afectivo. Debajo se extiende un lago sereno cubierto de flores de loto, símbolo de lo que florece sobre el agua quieta. La letra M invertida en la copa se lee como agua en movimiento: emoción que se derrama sin cálculo.',
    advice:
      'Deja entrar lo que está llegando en lugar de analizarlo. Esta carta no pide estrategia sino permiso: decir que sí a la invitación, contestar el mensaje, mostrar afecto sin esperar a que el otro lo haga primero. Si vienes de una decepción, arriesga un poco de confianza otra vez. La copa se llena sola; lo único que tienes que hacer es no darla vuelta por miedo.',
    yesNo:
      'Sí, desde el corazón. Es una respuesta favorable en todo lo emocional y afectivo, con la condición de que te permitas recibir en lugar de controlar el resultado.',
    combinations: [
      {
        cardSlug: 'two-of-cups',
        reading:
          'El sentimiento que nace encuentra a alguien del otro lado. Lo que empezó como apertura personal se transforma en vínculo recíproco. Es una de las secuencias más claras del mazo para el comienzo de un amor correspondido.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'Después de una etapa dura, vuelve la fe y con ella la capacidad de sentir. La combinación anuncia una sanación emocional genuina y un período en el que la esperanza deja de ser un esfuerzo.',
      },
      {
        cardSlug: 'the-empress',
        reading:
          'Fertilidad en todos los planos: proyectos que nacen, casas que se llenan, embarazos posibles y creatividad desbordada. Lo que se siembra en este clima emocional crece rápido y con abundancia.',
      },
      {
        cardSlug: 'five-of-cups',
        reading:
          'El corazón se abre justo mientras algo se está despidiendo. Coexisten el duelo y lo nuevo: no tienes que terminar de llorar para empezar a sentir otra cosa, aunque la culpa insista.',
      },
    ],
  },
  'two-of-cups': {
    meaningLove:
      'Es la carta del encuentro entre iguales: dos personas que se eligen y se lo dicen. Marca noviazgos que se formalizan, reconciliaciones sinceras y esa química donde la atracción viene acompañada de respeto. No hay jerarquía, no hay uno que quiere más: hay reciprocidad. Para una pareja establecida indica una etapa de reencuentro y acuerdos que se renuevan. Si estás sin pareja, anuncia un vínculo que empieza de manera pareja, con las dos partes poniendo lo mismo desde el primer día.',
    meaningWork:
      'Sociedades, alianzas y acuerdos que benefician a los dos lados. Aparece cuando una colaboración funciona porque hay confianza real, no solo conveniencia. Es una carta muy favorable para firmar contratos entre pares, asociarse con un colega o resolver un conflicto laboral con una conversación honesta. En el dinero indica sociedades rentables y acuerdos equilibrados. La advertencia es no confundir buena onda con contrato: la afinidad es real, escríbanla igual.',
    meaningWellbeing:
      'El bienestar mejora cuando dejas de resolver todo solo. Es un momento de reconciliación con el propio cuerpo y también con alguien cercano: los vínculos sostienen la energía y bajan la tensión acumulada. Buenas señales para actividades compartidas, terapias de pareja, conversaciones que descargan. El ánimo se estabiliza en la compañía. Si andas cansado, revisa cuánto de ese cansancio viene de una distancia afectiva que se puede acortar hablando.',
    symbolism:
      'Un hombre y una mujer se acercan y se ofrecen sendas copas en un intercambio simétrico: nadie da más que el otro. Entre ellos se eleva el caduceo de Hermes, dos serpientes entrelazadas alrededor de una vara, símbolo antiguo del equilibrio entre fuerzas opuestas, coronado por la cabeza alada de un león rojo, la pasión al servicio del vínculo. Ella lleva una corona de laurel y él una guirnalda de flores. Detrás se ve una casa sobre una colina verde: el hogar posible, todavía a distancia, que este acuerdo podría construir.',
    advice:
      'Di lo que sientes en voz alta y de frente. Esta carta se activa cuando alguien se anima a hacer el primer gesto explícito: proponer, reconciliar, agradecer, pedir. No esperes a estar seguro de la respuesta. Si hay un conflicto abierto con alguien que te importa, esta es la semana para acercarte con la copa en la mano y sin lista de reproches.',
    yesNo:
      'Sí, y con acuerdo mutuo. La respuesta favorable depende de que la otra parte esté igual de dispuesta, algo que esta carta suele confirmar.',
    combinations: [
      {
        cardSlug: 'the-lovers',
        reading:
          'El vínculo pasa de la afinidad a la decisión consciente. Ya no es solo química: hay una elección con consecuencias. Muy favorable para definiciones amorosas que venían postergándose.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'La unión se formaliza ante los demás: casamiento, contrato de sociedad, presentación oficial. Lo que funcionaba en privado adopta una forma reconocida por el entorno.',
      },
      {
        cardSlug: 'three-of-swords',
        reading:
          'La reciprocidad se rompe por una verdad que duele. Aparece una traición, una distancia o algo que uno de los dos calló demasiado tiempo. Se puede reparar, pero hablando.',
      },
      {
        cardSlug: 'four-of-wands',
        reading:
          'El acuerdo entre dos se celebra en comunidad. La relación deja de ser un asunto privado y encuentra el respaldo alegre de la familia y los amigos.',
      },
    ],
  },
  'three-of-cups': {
    meaningLove:
      'Alegría compartida: festejos, reencuentros, amistades que se vuelven fundamentales. En el amor marca un tiempo liviano y sociable, donde el vínculo se disfruta con otros alrededor. Suele anunciar noticias felices en el círculo cercano —nacimientos, casamientos, mudanzas— y también el amor que aparece en una reunión. En una pareja indica que el entorno acompaña. La advertencia es leve: cuidado con que todo se comparta con todos, porque hay conversaciones que necesitan intimidad y no público.',
    meaningWork:
      'Un equipo que funciona y se reconoce entre sí. Aparece cuando el logro es colectivo: el proyecto que salió bien porque cada uno puso lo suyo, la colaboración que da gusto. Buen momento para trabajos en red, actividades sociales, eventos y todo lo que requiera coordinar personas de buen humor. En el dinero, un ingreso que se celebra o que llega gracias a un contacto. Lo que esta carta pide es agradecer en público: el mérito compartido vuelve en oportunidades.',
    meaningWellbeing:
      'La vida social repara. Es una etapa en la que el ánimo sube por contagio: encontrarte con gente querida hace por tu energía más que cualquier rutina solitaria. El cuerpo pide baile, mesa larga, risa. Aprovecha el impulso para mover el cuerpo con otros. El único cuidado es el exceso festivo repetido: la carta invita a brindar, no a vivir de brindis. Dosifica y deja lugar al descanso entre encuentro y encuentro.',
    symbolism:
      'Tres mujeres levantan sus copas en círculo, mirándose entre ellas: nadie preside, la escena es horizontal. Van vestidas de blanco, rojo y amarillo —pureza, pasión y alegría—, y una de ellas se corona con hojas de parra. A sus pies hay calabazas, uvas y frutos maduros desparramados sobre la tierra: la cosecha ya está hecha y ahora se disfruta. Es la carta más colectiva del palo. El campo abierto y el cielo claro no muestran ninguna amenaza; el tres es el número de lo que se multiplica cuando se comparte.',
    advice:
      'Busca a tu gente. Lo que necesitas resolver esta semana se resuelve mejor rodeado que en soledad: llama, organiza el encuentro, acepta la invitación que venías esquivando. Celebra los logros ajenos con la misma energía que quisieras para los tuyos. Y si estás pasando un mal momento, esta carta insiste en que no te aísles: lo que repara en esta etapa es la compañía.',
    yesNo:
      'Sí, con alegría y en compañía. La respuesta es favorable y suele llegar a través de otras personas: amistades, contactos o alguien que te recomienda.',
    combinations: [
      {
        cardSlug: 'the-sun',
        reading:
          'Felicidad plena y visible. Todo lo que se celebra acá tiene fundamento real y se sostiene en el tiempo. Una de las combinaciones más luminosas para preguntas sobre familia y amistad.',
      },
      {
        cardSlug: 'seven-of-cups',
        reading:
          'La fiesta tapa una decisión que no estás tomando. Está bien disfrutar, pero la dispersión social se está volviendo la excusa perfecta para no elegir lo que sabes que hay que elegir.',
      },
      {
        cardSlug: 'ten-of-cups',
        reading:
          'La alegría compartida se convierte en plenitud familiar duradera. Lo que empieza como festejo encuentra raíces: es una de las mejores señales del mazo para armar un hogar.',
      },
      {
        cardSlug: 'five-of-pentacles',
        reading:
          'La ayuda que necesitas está en tu círculo y todavía no la pediste. Deja el orgullo de lado: la comunidad de esta dupla está disponible apenas te animas a decir que estás complicado.',
      },
    ],
  },
  'four-of-cups': {
    meaningLove:
      'Apatía. La relación no está mal, pero tampoco te entusiasma, y esa tibieza pesa más que una pelea. Aparece cuando alguien te ofrece algo bueno y no lo ves, o cuando estás tan enganchado con lo que no funcionó que no notas lo que sí está disponible. Para quien está sin pareja indica desinterés y cansancio de intentar. La carta no pide forzar entusiasmo: pide levantar la vista y revisar si el aburrimiento es de la relación o es tuyo con la vida en general.',
    meaningWork:
      'Estancamiento y desmotivación: el trabajo que hacías con gusto se volvió rutina y ninguna propuesta te mueve. Suele aparecer justo cuando llega una oferta que descartas sin evaluarla porque estás en modo automático. También marca la etapa previa a un cambio importante, cuando ya sabes que eso no va más pero todavía no aparece el reemplazo. En el dinero, ingresos estables que dejaron de alcanzar para sostener el interés, aunque alcancen para vivir.',
    meaningWellbeing:
      'La energía está baja y plana, más por desgano que por cansancio físico. Cuesta arrancar, todo da igual, la rutina se sostiene sin placer. Es un momento para revisar hábitos que se volvieron mecánicos y para introducir un cambio chico que rompa el piloto automático: otro horario, otro recorrido, otra actividad. El ánimo mejora con estímulos nuevos y con silencio elegido, no con más obligaciones apiladas encima del desinterés.',
    symbolism:
      'Un joven está sentado bajo un árbol con los brazos cruzados y la mirada fija en tres copas alineadas en el suelo frente a él: lo que ya conoce y ya no le interesa. Una mano surge de una nube ofreciéndole una cuarta copa, la novedad, y él ni la mira. La postura cerrada de brazos y piernas es la de quien decidió de antemano que nada vale la pena. El árbol da sombra y también aísla. El paisaje es verde y tranquilo, sin ninguna amenaza: el problema de esta carta es interno, no ambiental.',
    advice:
      'Levanta la vista. Hay algo bueno siendo ofrecido justo ahora y estás mirando en la dirección equivocada por costumbre. Antes de rechazar la próxima propuesta, tómate un día para pensarla en serio. Y si el desgano viene de más lejos, no lo tapes con actividad: pregúntate qué es lo que dejó de tener sentido y sé honesto con la respuesta.',
    yesNo:
      'No por ahora, y sobre todo porque no estás interesado de verdad. La respuesta cambia si te decides a mirar lo que se te está ofreciendo.',
    combinations: [
      {
        cardSlug: 'ace-of-cups',
        reading:
          'La oferta que estás ignorando es genuina y viene con el corazón abierto. Es la advertencia más clara del mazo: si sigues con los brazos cruzados, la copa se va a otra mesa.',
      },
      {
        cardSlug: 'the-hermit',
        reading:
          'El retraimiento tiene sentido si lo eliges. La dupla distingue el aburrimiento pasivo de la introspección deliberada: convierte el encierro en una búsqueda y deja de ser un problema.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'La apatía anuncia una partida. Ya sabes que eso terminó; lo que falta es levantarte y caminar. Cuanto más demores la salida, más pesada se vuelve la etapa.',
      },
      {
        cardSlug: 'nine-of-cups',
        reading:
          'Tienes lo que pediste y no lo estás disfrutando. La combinación pide agradecer lo conseguido antes de salir a buscar otra cosa que también vas a mirar con desgano.',
      },
    ],
  },
  'five-of-cups': {
    meaningLove:
      'Duelo. Una ruptura, una decepción o el peso de algo que no fue como esperabas. La carta valida la tristeza: no viene a decirte que lo superes rápido. Lo que sí muestra es que detrás tuyo quedaron dos copas en pie, y que todavía no las miraste. En una pareja indica una herida abierta que se puede reparar si se habla, y también parejas donde uno sigue llorando algo viejo mientras el otro espera. Si estás solo, aconseja no idealizar lo que ya terminó.',
    meaningWork:
      'Un proyecto que salió mal, un despido, una oportunidad perdida. Es la carta del balance amargo, cuando la pérdida ocupa toda la pantalla y el aprendizaje todavía no se ve. Suele aparecer después de una decisión que no funcionó y antes de la recuperación. Lo que resta —contactos, experiencia, reputación— sigue disponible aunque hoy no te consuele. En el dinero marca un revés concreto: gastos imprevistos, un cobro que no llegó, una inversión que no rindió.',
    meaningWellbeing:
      'La tristeza baja la energía y eso es esperable, no un fracaso. El cuerpo pide menos exigencia y más cuidado básico: comer con regularidad, dormir, salir aunque sea a la esquina. Es una etapa en la que el ánimo se levanta de a poco y sin atajos. Evita las decisiones grandes hasta que el ánimo se estabilice. Lo que mejor funciona ahora es la compañía tranquila y el movimiento suave, no la disciplina heroica ni el encierro prolongado.',
    symbolism:
      'Una figura envuelta en una capa negra mira hacia el suelo, donde tres copas están volcadas y su contenido se derramó. Detrás de ella, dos copas siguen de pie y no las ve, porque el duelo cierra el campo visual. Un río oscuro corre a sus pies, la corriente emocional que separa el pasado del presente, y al otro lado hay un puente firme que lleva a un castillo: la salida existe y está construida. La capa negra es luto real; la carta no lo apura, solo señala que el puente sigue ahí cuando estés listo.',
    advice:
      'Date permiso para estar mal el tiempo que haga falta, y después date vuelta. Nombra lo que perdiste sin maquillarlo, cuéntaselo a alguien y deja de repasar la escena buscando el momento en que podrías haberlo evitado. Cuando puedas, mira las dos copas que quedaron de pie: no reemplazan lo que se cayó, pero son con lo que se sigue.',
    yesNo:
      'No, y trae una pérdida que conviene atravesar sin apuro. La carta pide duelo antes de intentar de nuevo, no un empujón de optimismo apresurado.',
    combinations: [
      {
        cardSlug: 'six-of-cups',
        reading:
          'La tristeza se ancla en un recuerdo. Estás llorando algo que ya pasó hace más tiempo del que reconoces; la nostalgia se volvió el lugar donde vives y no una visita.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'Después del derrame llega la calma que repara. La combinación es una de las mejores noticias posibles tras una pérdida: la fe vuelve, despacio y de verdad.',
      },
      {
        cardSlug: 'judgement',
        reading:
          'La pérdida se transforma en un llamado. Lo que se cayó tenía que caerse para que entendieras algo más grande, y ahora estás en condiciones de escucharlo.',
      },
      {
        cardSlug: 'two-of-pentacles',
        reading:
          'El duelo convive con obligaciones que no se detienen. Nadie te da licencia por tristeza: la dupla aconseja bajar la exigencia al mínimo indispensable durante unas semanas.',
      },
    ],
  },
  'six-of-cups': {
    meaningLove:
      'Nostalgia y reencuentro. Vuelve alguien del pasado, o vuelve un modo de querer que tenías olvidado: gestos simples, ternura sin cálculo, la confianza de la infancia. Es una carta cálida, aunque avisa que el recuerdo embellece. En una pareja marca el regreso del juego y de la complicidad. Si aparece un ex, la carta no dice que sea buena idea: dice que la memoria está trabajando fuerte y que conviene mirar a la persona real, no a la versión guardada en la cabeza.',
    meaningWork:
      'Reaparecen contactos y oportunidades del pasado: un ex jefe que te llama, un cliente viejo, un proyecto que habías abandonado y encuentra su momento. También indica trabajos vinculados a la infancia, la enseñanza y el cuidado. Es un buen momento para volver a lo que sabías hacer y dejaste. En el dinero, un ingreso que llega por algo antiguo —una deuda que te pagan, una herencia, un trabajo anterior— más que por una gestión nueva.',
    meaningWellbeing:
      'La energía se recupera con lo conocido: comidas de la casa, dormir en tu cama, la caminata de siempre. Es una etapa de bienestar simple y regresivo, en el mejor sentido. Recuperar un hábito que te hacía bien y abandonaste vale más ahora que inventar una rutina nueva. El ánimo se reconforta con la memoria afectiva. El cuidado es no quedarte solo ahí: nutrirse del pasado está bien, vivir en él termina apagando el presente.',
    symbolism:
      'Un niño le ofrece a una niña más pequeña una copa llena de flores blancas de cinco pétalos; hay cinco copas más floreciendo alrededor, en el patio de una casona antigua. El gesto es puro dar, sin espera de retorno: la generosidad de quien todavía no aprendió a calcular. Al fondo, una figura adulta con una pica se aleja: el guardián se retira y deja el espacio protegido. La arquitectura es sólida y de otra época. Todo en la carta habla de un lugar seguro y perdido que la memoria conserva intacto.',
    advice:
      'Recupera algo que te hacía bien y dejaste por adulto. Puede ser un hábito, un amigo, una manera de divertirte que archivaste sin motivo. Al mismo tiempo, mira el pasado con los ojos de hoy: si vas a reabrir una historia, hazlo con la información completa y no con la versión editada por la nostalgia.',
    yesNo:
      'Sí, con un aire familiar y conocido. La respuesta favorable viene de algo o alguien que ya estuvo en tu vida, no de una novedad absoluta.',
    combinations: [
      {
        cardSlug: 'the-lovers',
        reading:
          'Un amor del pasado vuelve a estar sobre la mesa y esta vez hay que decidir de verdad. La dupla pide elegir con criterio adulto lo que en su momento se manejó con impulso.',
      },
      {
        cardSlug: 'ten-of-cups',
        reading:
          'La ternura del recuerdo se vuelve familia presente. Lo que fue un buen origen encuentra continuidad: muy favorable para preguntas sobre chicos, casa y raíces compartidas.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'Volver y despedirse en el mismo movimiento. Regresas al lugar de origen justamente para poder cerrarlo y seguir; es una vuelta que sirve para irte mejor.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La nostalgia se volvió una atadura. Estás idealizando algo que en su momento te hizo mal: mira la historia completa antes de reabrir esa puerta.',
      },
    ],
  },
  'seven-of-cups': {
    meaningLove:
      'Demasiadas opciones o demasiada fantasía. Aparece cuando hay varias personas dando vueltas y ninguna elección clara, o cuando estás enamorado de una idea y no de alguien concreto. También marca vínculos donde falta información: promesas que no se verifican, historias que suenan lindas de lejos. La carta no dice que todo sea mentira, dice que estás mirando el humo. Baja a la realidad: pregunta, mira los hechos y elige. La indefinición sostenida es, en sí misma, una elección.',
    meaningWork:
      'Muchos proyectos en la cabeza y ninguno en marcha. Es la carta del emprendedor que abre siete pestañas y no termina ninguna, y también la de las propuestas que prometen mucho y ofrecen poca letra escrita. Antes de comprometerte, pide números y plazos concretos. En el dinero advierte sobre inversiones que dependen de un relato entusiasta más que de un balance. Elegir una opción y descartar seis es el trabajo real de esta etapa.',
    meaningWellbeing:
      'La energía se dispersa entre demasiados estímulos y el descanso se resiente: la cabeza sigue funcionando aunque el cuerpo esté quieto. Suele venir con sueño irregular y sueños vívidos. Ayuda mucho reducir el consumo de pantallas antes de dormir y elegir una sola actividad en lugar de rotar entre cinco. El ánimo mejora cuando bajas la cantidad de opciones abiertas: la libertad infinita cansa más de lo que entusiasma.',
    symbolism:
      'Una silueta oscura de espaldas contempla siete copas suspendidas sobre una nube, cada una con una ofrenda distinta: un rostro, una tela luminosa, una serpiente, un castillo, joyas, una corona de laurel y una figura tapada por un manto rojo. La única que no muestra su contenido es la más atractiva, y es también la más peligrosa. Todo flota: nada de eso está apoyado en la tierra. La figura está en sombra porque todavía no eligió, y elegir es lo único que la volvería real en esta escena.',
    advice:
      'Elige una y cierra las otras seis. La carta no premia al que evalúa mejor sino al que se compromete. Escribe las opciones, tacha las que dependen de que otro haga algo, tacha las que no podrías empezar esta semana y quédate con lo que sobrevive. Y desconfía de la propuesta que no te deja ver lo que hay adentro.',
    yesNo:
      'Indefinido: hay demasiadas variantes en juego y la información disponible no alcanza. La respuesta se aclara recién cuando descartes opciones y verifiques lo que te prometieron.',
    combinations: [
      {
        cardSlug: 'the-moon',
        reading:
          'Ilusión sobre ilusión: casi nada de lo que crees ver es exacto. Posterga cualquier decisión importante y busca información dura de una fuente que no tenga interés en el resultado.',
      },
      {
        cardSlug: 'the-chariot',
        reading:
          'La dispersión se ordena en una dirección. Eliges por fin y el avance es inmediato: lo que faltaba no era una opción mejor sino la decisión de tomar una.',
      },
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'Entre todas las fantasías hay una oportunidad concreta y verificable. Sigue esa: la que tiene números, fechas y alguien que responde el teléfono cuando llamas para preguntar. Lo verificable siempre le gana a lo prometido.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'Descartar es la única salida. La combinación aconseja abandonar la mayoría de las copas sin negociar y quedarte con lo poco que te importa de verdad.',
      },
    ],
  },
  'eight-of-cups': {
    meaningLove:
      'Alguien se va, y muchas veces eres tú. Es la carta de la retirada consciente: la relación no explotó, simplemente dejó de tener sentido y quedarse sería traicionarte. Aparece en separaciones maduras, en distanciamientos necesarios y en el momento en que dejas de intentar que alguien cambie. Duele igual. También marca a quien se aleja para reencontrarse consigo mismo sin que haya otra persona en el medio. Lo que promete no es un reemplazo: promete un camino propio.',
    meaningWork:
      'Renuncia. Dejar un trabajo que funcionaba pero te vaciaba, cerrar un negocio que ya no te representa, abandonar una carrera para buscar otra cosa. La carta reconoce que lo que dejas tiene valor —las ocho copas están enteras, no rotas— y aun así aconseja partir. Es un movimiento de sentido, no de conveniencia. En el dinero implica resignar seguridad a cambio de coherencia, así que conviene tener el próximo paso al menos esbozado.',
    meaningWellbeing:
      'Necesitas alejarte de algo que te está drenando la energía, aunque no puedas explicarlo con argumentos. El cuerpo lo viene avisando hace rato: cansancio que no cede con dormir, desgano específico frente a ciertas situaciones. Es un buen momento para el retiro, el viaje solo, los días de silencio. El ánimo se recupera con distancia, no con más esfuerzo. Dejar un hábito o un vínculo que ya no nutre es, en esta etapa, el mejor cuidado posible.',
    symbolism:
      'Una figura con capa roja y bastón se aleja de espaldas hacia unas montañas áridas, dejando atrás ocho copas apiladas prolijamente: no las tiró, las ordenó antes de irse. En la fila superior falta una copa, el hueco que explica la partida. Arriba, la luna aparece en eclipse, con el sol detrás: el tiempo de la conciencia interrumpiendo el ciclo automático. El agua del primer plano está quieta y el terreno del fondo es duro. La figura camina de noche, guiada por algo que no se ve en la carta.',
    advice:
      'Vete si ya sabes que te tienes que ir. Esta carta no discute las razones: cuando aparece, la decisión suele estar tomada hace meses y lo único pendiente es la ejecución. Ordena lo que dejas —dile a la gente, cierra lo que corresponda, no te vayas con portazo— y arranca la caminata. La incomodidad de partir dura menos que la de quedarte fingiendo.',
    yesNo:
      'Sí para irte, no para quedarte. La carta responde a favor de la partida y avisa que insistir con lo actual solo posterga lo inevitable.',
    combinations: [
      {
        cardSlug: 'the-hermit',
        reading:
          'La partida es hacia adentro. Te alejas para escucharte, no para buscar otra cosa. Es un retiro fértil: lo que encuentres en ese silencio va a definir la etapa siguiente.',
      },
      {
        cardSlug: 'the-world',
        reading:
          'La despedida cierra un ciclo completo. No es una fuga sino una graduación: lo que dejas ya te dio todo lo que tenía para darte y el camino sigue en otro lado.',
      },
      {
        cardSlug: 'ten-of-cups',
        reading:
          'Te vas de algo que se veía perfecto desde afuera. La familia o el entorno no van a entender la decisión: la carta pide sostenerla igual, porque el criterio acá es interno.',
      },
      {
        cardSlug: 'knight-of-cups',
        reading:
          'Alguien llega justo cuando decides partir. Cuidado con cambiar una salida madura por un romance oportuno: revisa si esa aparición es un motivo o simplemente una excusa.',
      },
    ],
  },
  'nine-of-cups': {
    meaningLove:
      'Es la carta del deseo cumplido: la relación que querías, la respuesta que esperabas, un momento de disfrute sin culpa. En pareja marca una etapa de satisfacción y placer compartido. Si estás sin pareja, indica que estás bien contigo y que eso resulta atractivo. La única advertencia es la autocomplacencia: el hombre de la carta está satisfecho, pero solo. Disfrutar lo que tienes está perfecto; conviene revisar que la comodidad no se haya convertido en distancia emocional.',
    meaningWork:
      'Se consigue lo que se pidió: el puesto, el aumento, el cliente que querías. La carta premia el deseo bien formulado y sostenido. Es un momento de disfrute profesional y de reconocimiento tangible, con dinero incluido. En lo económico marca abundancia concreta y buena administración del placer que ese dinero permite. El aviso es no confundir una buena racha con un logro definitivo: nueve copas son muchas, pero la décima —lo compartido— todavía no está en la mesa.',
    meaningWellbeing:
      'Buena energía, buen ánimo y ganas de darte gustos. El cuerpo disfruta: comida rica, descanso, placeres simples. Es una etapa favorable para sentirte a gusto con tu imagen y tu ritmo. El punto de cuidado es el exceso: esta carta invita a servirse otra copa y el bienestar se sostiene mejor con moderación que con abundancia sin freno. Disfruta con intención, no por inercia, y el cuerpo acompaña sin pasar factura después.',
    symbolism:
      'Un hombre corpulento está sentado en un banco de madera con los brazos cruzados y una sonrisa satisfecha, tocado con un gorro rojo. Detrás de él, nueve copas doradas se alinean sobre una mesa cubierta por una tela azul, en un arco perfecto: la exhibición del logro. La tela oculta lo que hay debajo de la mesa, detalle que la tradición lee como aquello que la satisfacción prefiere no mirar. El fondo amarillo es plano y sin paisaje: en esta carta no hay horizonte porque el personaje ya llegó adonde quería.',
    advice:
      'Disfruta lo conseguido sin pedir permiso ni buscarle defectos. Formula además el próximo deseo con la misma precisión con la que formulaste este, porque la carta responde a lo que se pide con claridad. Y convida: la satisfacción que se comparte con alguien dura bastante más que la que se contempla en soledad desde un banco.',
    yesNo:
      'Sí, rotundamente. Es la carta de los deseos cumplidos del mazo y responde a favor de casi cualquier pregunta, sobre todo si se trata de algo que pediste con claridad.',
    combinations: [
      {
        cardSlug: 'ten-of-cups',
        reading:
          'La satisfacción personal se transforma en felicidad compartida. Lo que disfrutabas solo encuentra con quién celebrarse: es el paso de la copa propia a la mesa familiar.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'El placer se vuelve dependencia. Lo que empezó como un gusto merecido pide cada vez más y ya no alcanza con lo de ayer. Revisa qué estás tapando con tanta comodidad antes de que la copa se vuelva obligación.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'Bienestar material y paz interior juntos. Una de las mejores duplas del mazo: lo que conseguiste además te hace bien de verdad y no solo te alivia la ansiedad.',
      },
      {
        cardSlug: 'seven-of-pentacles',
        reading:
          'El deseo cumplido es fruto de una siembra larga. Vale la pena mirar el proceso completo antes de festejar: el mérito no fue la suerte sino la paciencia.',
      },
    ],
  },
  'ten-of-cups': {
    meaningLove:
      'Es la plenitud emocional: la familia que funciona, el amor que se sostiene en el tiempo, la sensación de estar en el lugar correcto con la gente correcta. Marca compromisos duraderos, convivencias felices y reconciliaciones profundas. No es la euforia del comienzo sino la alegría tranquila de lo construido. Si estás sin pareja, anuncia un vínculo con potencial de futuro real. La advertencia mínima: cuidado con exigirle a la vida cotidiana que se parezca todo el tiempo a la postal.',
    meaningWork:
      'Armonía en el entorno laboral y trabajo que se integra bien con la vida personal. Aparece cuando el equipo se siente familia o cuando encontraste un lugar donde te tratan bien y no tienes que dejar la vida afuera. Es una carta más de satisfacción que de ambición. En el dinero indica estabilidad suficiente para sostener a los tuyos sin sobresaltos. Si estás decidiendo entre un puesto mejor pago y uno que te deja vivir, esta carta vota por el segundo.',
    meaningWellbeing:
      'El bienestar viene del clima afectivo: cuando la casa está en paz, el cuerpo descansa. Es una etapa de buena energía, sueño reparador y ánimo estable. Las rutinas compartidas —caminar en familia, cocinar juntos, actividades con los chicos— sostienen mejor que cualquier plan individual. Aprovecha para consolidar hábitos ahora que el entorno acompaña: lo que se instala en una etapa así suele quedarse cuando lleguen tiempos más movidos.',
    symbolism:
      'Una pareja abrazada levanta los brazos hacia un arcoíris en el que se disponen diez copas, mientras dos niños bailan tomados de la mano a un costado. El arcoíris es la promesa después de la tormenta, el símbolo bíblico del pacto cumplido. La casa aparece sobre una colina, con un río que corre cerca y árboles alrededor: hogar, emoción en movimiento y arraigo. Nadie mira las copas; miran el cielo. Es la única carta del palo donde la abundancia no se cuenta ni se exhibe, solo se agradece.',
    advice:
      'Cuida lo que ya tienes con la misma dedicación con la que buscarías algo nuevo. Esta carta se sostiene en gestos cotidianos: la sobremesa, la llamada al que está lejos, el rato sin pantalla con los tuyos. Agradece en voz alta y con nombre propio. Y si hay una distancia familiar pendiente, esta es la temporada indicada para acortarla.',
    yesNo:
      'Sí, con felicidad duradera. Es una de las respuestas más favorables del mazo para todo lo que tenga que ver con familia, hogar y compromisos de largo plazo.',
    combinations: [
      {
        cardSlug: 'four-of-wands',
        reading:
          'El hogar se celebra en comunidad: casamiento, mudanza festejada, reunión familiar que marca una etapa. La dupla más clara del mazo para consolidar una vida compartida.',
      },
      {
        cardSlug: 'the-empress',
        reading:
          'Fertilidad y familia que crece. Muy frecuente en consultas por embarazos, adopciones o proyectos que agrandan la casa. El clima emocional acompaña con creces y lo que se siembra ahora encuentra terreno fértil.',
      },
      {
        cardSlug: 'five-of-cups',
        reading:
          'La foto familiar tiene una ausencia que duele. La combinación pide hacerle lugar al duelo dentro de la plenitud en vez de sostener la sonrisa por compromiso.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'La armonía descansa sobre algo que nadie quiere revisar. Antes de que se sacuda solo, conviene hablar de eso que en la casa se evita nombrar hace años.',
      },
    ],
  },
  'page-of-cups': {
    meaningLove:
      'Un afecto que empieza con timidez y ternura: la declaración inesperada, el mensaje dulce, alguien que se anima a mostrar lo que siente sin tener la técnica para hacerlo elegante. Es un amor joven y sincero, un poco torpe. También marca noticias afectivas: una propuesta, un embarazo, una reconciliación que llega por sorpresa. En una pareja de años invita a volver a la ternura sin cinismo. Lo que pide es delicadeza: esta energía se lastima fácil si se la recibe con ironía.',
    meaningWork:
      'Aparece la creatividad en estado inicial: una idea artística, un proyecto que te emociona, ganas de estudiar algo que tiene más que ver con la vocación que con el sueldo. Es una carta de aprendiz sensible, buena para empezar en áreas creativas o de cuidado de personas. También anuncia noticias laborales agradables e inesperadas. En el dinero, ingresos pequeños vinculados a algo que haces con gusto y todavía no dominas del todo.',
    meaningWellbeing:
      'La energía es suave y algo sensible: el cuerpo reacciona al clima emocional más de lo habitual. Es una etapa para actividades amables —caminar, nadar, estirar— y para cuidar el descanso, porque la sensibilidad alta cansa. El ánimo mejora con expresión creativa: escribir, dibujar, tocar algo. Sacar afuera lo que se siente alivia mucho más que analizarlo. Evita ambientes hostiles: en esta etapa te afectan más de lo que reconocerías.',
    symbolism:
      'Un joven vestido con una túnica floreada y un gorro azul con una tela ondulante sostiene una copa de la que asoma un pez que lo mira. La escena es levemente absurda, y ese es el punto: lo inconsciente aparece donde no se lo espera y hay que recibirlo con humor. El pez es el símbolo tradicional de la intuición y de los contenidos que emergen del agua profunda. Detrás, el mar ondula con olas suaves. La postura es relajada, casi juguetona: el Paje no interpreta el mensaje, lo acepta.',
    advice:
      'Hazle caso a esa corazonada rara que no sabes justificar. Esta carta premia la sensibilidad sin filtro: manda el mensaje sincero, muestra el borrador, di lo que sientes aunque te salga torpe. Y trata con cuidado la sensibilidad ajena, sobre todo si alguien se está animando a abrirse contigo. La torpeza sincera vale más que la elegancia calculada.',
    yesNo:
      'Sí, con una alegría chica e inesperada. La respuesta favorable llega en formato de noticia o gesto afectivo, no como un gran acontecimiento.',
    combinations: [
      {
        cardSlug: 'the-empress',
        reading:
          'Noticia de embarazo, nacimiento o proyecto que se gesta. Es una de las duplas más frecuentes en consultas por hijos y también por creaciones que nacen con vida propia.',
      },
      {
        cardSlug: 'ace-of-cups',
        reading:
          'La sensibilidad encuentra un canal desbordante. Se abre un vínculo o una etapa creativa muy fértil: lo que sientas ahora conviene expresarlo sin editarlo demasiado.',
      },
      {
        cardSlug: 'king-of-swords',
        reading:
          'La ternura choca con un criterio frío. Alguien va a analizar con lógica algo que se ofreció con el corazón: no te tomes la respuesta racional como un rechazo personal.',
      },
      {
        cardSlug: 'three-of-cups',
        reading:
          'La buena noticia se comparte y se festeja. El círculo cercano recibe con alegría eso que estabas por contar con timidez, así que anímate a decirlo en voz alta: la respuesta va a ser mejor de lo que imaginas.',
      },
    ],
  },
  'knight-of-cups': {
    meaningLove:
      'Es el romántico que llega con una propuesta en la mano: la invitación, la declaración, el gesto que parece salido de una película. Marca cortejo, seducción elegante y vínculos que se mueven al ritmo del sentimiento. Es hermoso y también inconstante: este Caballero avanza al paso, no galopa, y a veces la fantasía le importa más que la persona concreta. Si aparece describiendo a alguien, disfruta la propuesta y observa con calma si a la promesa la sigue una acción sostenida.',
    meaningWork:
      'Una oferta atractiva llega de manera elegante: una propuesta creativa, una invitación a colaborar, un proyecto que te seduce por sentido más que por números. Es buena para trabajos artísticos, comunicación y todo lo que requiera encantar a alguien. La advertencia es práctica: revisa el contrato debajo del entusiasmo, porque esta carta promete mucho y no siempre calcula la logística. En el dinero, propuestas que suenan lindas y necesitan que alguien haga las cuentas.',
    meaningWellbeing:
      'El ánimo está sensible y romántico, con la energía flotando entre el entusiasmo y el ensueño. El cuerpo pide actividades que combinen movimiento y placer: nadar, bailar, caminar sin apuro. Es un buen momento para prácticas que integren la emoción con el cuerpo. El punto flojo es la constancia: arrancas motivado y abandonas cuando se vuelve rutina. Elige algo que te guste tanto que no necesites disciplina para sostenerlo.',
    symbolism:
      'Un caballero avanza al paso sobre un caballo blanco, sosteniendo una copa hacia adelante como quien hace una ofrenda. La armadura está cubierta por una túnica con peces bordados —la intuición otra vez— y del yelmo y los talones le brotan alas, como al Hermes griego: es un mensajero, no un guerrero. El caballo camina tranquilo, sin encabritarse. Delante corre un arroyo que la escena todavía no cruzó y al fondo se alzan montañas suaves. Todo indica avance emocional, medido y sin violencia.',
    advice:
      'Haz la propuesta romántica que tienes en la cabeza. Esta carta favorece a quien se anima al gesto: la invitación, la carta, la escena preparada con dedicación. Al mismo tiempo, revisa que el sentimiento venga acompañado de algo concreto que puedas sostener el mes que viene. Ofrecer la copa está bien; hay que estar cuando el otro la acepte.',
    yesNo:
      'Sí, con una propuesta encantadora. La respuesta es favorable en lo afectivo, aunque conviene verificar que a la seducción le siga una acción concreta.',
    combinations: [
      {
        cardSlug: 'two-of-cups',
        reading:
          'La propuesta es aceptada y se vuelve vínculo real. El cortejo encuentra reciprocidad: una de las secuencias más claras del mazo para un amor que arranca bien.',
      },
      {
        cardSlug: 'seven-of-cups',
        reading:
          'Encanto sin sustancia. Lo que te ofrecen suena maravilloso y está hecho de humo. Pide fechas, montos y detalles concretos antes de entusiasmarte con la escena, porque acá la puesta vale más que el contenido.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'El romanticismo se formaliza. Lo que empezó como cortejo apunta a un compromiso reconocido por el entorno: casamiento, presentación oficial o convivencia acordada con reglas habladas de antemano.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'Llega justo cuando estás por irte de otra cosa. Cuidado con usar una historia nueva para no atravesar la despedida que te corresponde: la aparición es real, pero el momento en que llega la vuelve sospechosa.',
      },
    ],
  },
  'queen-of-cups': {
    meaningLove:
      'Habla de alguien profundamente empático, que percibe lo que el otro siente antes de que lo diga. En pareja indica una etapa de contención y comprensión mutua, donde el vínculo se cuida de verdad. Si describe a una persona, es sensible, leal y con una intuición notable para leer intenciones. El cuidado que trae es la disolución de límites: esta figura se hace cargo del ánimo ajeno hasta perder el propio. Amar bien también incluye poder decir que hoy no puedes sostener a nadie.',
    meaningWork:
      'Es la persona que sostiene el clima del equipo: escucha, media, entiende lo que no se dice en las reuniones. Aparece cuando tu aporte pasa por la sensibilidad y no por la técnica. Muy favorable para trabajos de cuidado, acompañamiento, arte y todo lo que exija leer a las personas. En el dinero, decisiones guiadas por intuición que suelen acertar. La contra es la dificultad para poner precio y cobrar: el trabajo emocional también se factura.',
    meaningWellbeing:
      'El bienestar depende del estado emocional más que de la rutina. Es una etapa para atender el descanso profundo, los sueños y los ciclos propios. El cuerpo pide agua, silencio y menos estímulo. Ayuda mucho llevar un registro de lo que sientes: escribirlo baja la marea. El punto a cuidar es absorber el ánimo de los demás sin darte cuenta; después de un día con mucha gente, resérvate un rato a solas para volver a tu propio eje.',
    symbolism:
      'Una reina se sienta en un trono de piedra clara ubicado justo en el borde del agua, con los pies en la orilla: el único personaje del mazo que habita exactamente la frontera entre lo consciente y lo profundo. Sostiene una copa cerrada, con tapa y asas en forma de ángeles, distinta de todas las demás del palo: su mundo interno no se derrama en público. El trono está tallado con sirenas y conchas marinas. Mira la copa fijamente, absorta. Las piedras del primer plano son de colores: lo que el agua devolvió, ya trabajado.',
    advice:
      'Confía en lo que percibes, aunque no puedas fundamentarlo con datos. Tu lectura de las personas está afinada en esta etapa y suele acertar. Al mismo tiempo, distingue lo que sientes tú de lo que estás absorbiendo del otro: preguntar "¿esto es mío?" antes de hacerte cargo evita la mayoría de los desgastes de esta carta.',
    yesNo:
      'Sí, si lo sientes así. La carta te devuelve la pregunta: en esta consulta tu intuición tiene mejor información que cualquier análisis externo.',
    combinations: [
      {
        cardSlug: 'the-high-priestess',
        reading:
          'Intuición doble y muy afinada. Lo que percibes es exacto, aunque no puedas explicarlo con argumentos. Excelente combinación para decisiones donde los datos disponibles no alcanzan y hay que elegir igual.',
      },
      {
        cardSlug: 'king-of-cups',
        reading:
          'Un vínculo maduro donde los dos saben sostener. Puede ser pareja, sociedad o amistad profunda: la combinación habla de contención mutua entre dos personas que no dependen una de la otra para estar enteras.',
      },
      {
        cardSlug: 'nine-of-swords',
        reading:
          'La sensibilidad se volvió angustia nocturna. Estás cargando emociones que no son tuyas: la dupla pide poner distancia antes de seguir conteniendo a los demás.',
      },
      {
        cardSlug: 'the-moon',
        reading:
          'Intuición y confusión mezcladas. Distingue la percepción certera del miedo que la disfraza de intuición. Contrasta lo que sientes con alguien de confianza antes de decidir, porque acá las dos cosas se parecen mucho.',
      },
    ],
  },
  'king-of-cups': {
    meaningLove:
      'Madurez emocional: alguien que siente hondo y no se desborda, que puede sostener una conversación difícil sin escaparse ni explotar. En pareja marca la etapa en que los conflictos se hablan con calma y el vínculo se vuelve confiable. Si describe a una persona, es contenedora, generosa y discreta. El aviso está en el reverso: cuando esta figura se cierra, la calma se vuelve distancia y el otro queda del lado de afuera sin saber qué pasó. Sentir de más no se arregla congelando.',
    meaningWork:
      'Es el liderazgo que combina criterio y empatía: quien maneja equipos difíciles sin gritar, negocia sin humillar y sostiene la calma cuando todo se complica. Aparece en trabajos ligados al cuidado, la mediación, la terapia, la conducción de personas y el arte con oficio. En el dinero indica estabilidad manejada con prudencia y generosidad. Lo que la carta pide es que la contención tenga un límite: dirigir no es cargar con el malestar de todos.',
    meaningWellbeing:
      'La energía es estable y bien administrada, con el ánimo sereno aun cuando el contexto se mueva. Es una buena etapa para consolidar hábitos tranquilos y sostenidos en el tiempo. El cuerpo agradece la regularidad más que la intensidad. El punto de atención es lo que se guarda: esta figura procesa hacia adentro y las tensiones se acumulan en silencio. Hablar de lo que te pasa, aunque no necesites que nadie lo resuelva, descomprime más de lo que parece.',
    symbolism:
      'Un rey se sienta en un trono que flota sobre un mar agitado, sin mojarse: domina la emoción sin negarla. Sostiene una copa en una mano y un cetro corto en la otra. Del cuello le cuelga un pez, símbolo de la vida psíquica que reconoce como propia. A un lado, un delfín salta del agua y al otro, un barco navega la marea: intuición y voluntad conviviendo con el oleaje. El trono no tiene base visible, lo que da la medida del logro: mantener el equilibrio donde no hay piso firme.',
    advice:
      'Responde desde la calma, no desde la reacción. Tienes la capacidad de sostener esta situación sin perder el eje, y eso vale más que tener razón rápido. Escucha completo antes de contestar, reconoce lo que sientes en lugar de disimularlo y toma la decisión al día siguiente. Y avisa cuando estés al límite: nadie va a adivinarlo si mantienes la cara serena.',
    yesNo:
      'Sí, con calma y madurez. La respuesta es favorable siempre que actúes desde la serenidad y no desde el impulso emocional del momento.',
    combinations: [
      {
        cardSlug: 'temperance',
        reading:
          'Equilibrio emocional en su mejor versión. Todo lo que se maneje con paciencia en esta etapa sale bien: es una dupla excelente para mediaciones y reconciliaciones.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La contención tapa una dependencia. Alguien está sosteniendo un vínculo que le hace mal en nombre de la madurez: revisa qué te ata realmente a esa situación.',
      },
      {
        cardSlug: 'ten-of-cups',
        reading:
          'Madurez afectiva convertida en familia estable. Es el mejor pronóstico del palo para una vida compartida que se sostiene en el tiempo sin sobresaltos, con los conflictos hablados a tiempo y las decisiones tomadas de a dos.',
      },
      {
        cardSlug: 'five-of-swords',
        reading:
          'Alguien quiere ganar la discusión y tú puedes elegir no darla. La combinación aconseja retirarse con dignidad antes que imponerse en un conflicto que no vale el desgaste.',
      },
    ],
  },
};
