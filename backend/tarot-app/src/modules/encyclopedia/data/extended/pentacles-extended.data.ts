import { CardExtendedContentMap } from './card-extended-content.types';

/**
 * Contenido extendido de los 14 Oros (T-SEO-009)
 *
 * Elemento Tierra: materia, trabajo, dinero, cuerpo, tiempo largo.
 * La sección de bienestar habla de energía, descanso, hábitos y ánimo.
 */
export const PENTACLES_EXTENDED_CONTENT: CardExtendedContentMap = {
  'ace-of-pentacles': {
    meaningLove:
      'Un vínculo que empieza con los pies en la tierra: alguien confiable, presente, que se ocupa. No es el flechazo incendiario sino la relación que se construye con gestos concretos y sostenidos. Suele marcar el momento en que una pareja da un paso material —convivir, comprar algo juntos, planificar— y el vínculo deja de ser una promesa para volverse un hecho. Si estás sin pareja, indica que aparece alguien estable en el horizonte y que estás en condiciones de sostener algo real.',
    meaningWork:
      'Una oportunidad concreta con números reales: la oferta de trabajo, el cliente que llega, el capital inicial para arrancar. Es la mejor carta del mazo para empezar algo material, porque no promete: entrega. Suele venir con una propuesta que exige compromiso a largo plazo, y ahí está su condición. En el dinero indica un ingreso nuevo, una inversión que empieza bien o un ahorro que se convierte en herramienta. Lo que se planta ahora rinde si se lo trabaja con paciencia.',
    meaningWellbeing:
      'Buen momento para instalar un hábito y sostenerlo, porque la energía de esta carta es lenta y constante. Todo lo que empieces ahora tiene chances reales de durar: una rutina de movimiento, un horario de descanso, una manera más ordenada de comer. El cuerpo responde bien a la regularidad y mal a la exigencia repentina. Empieza chico y sin fecha de vencimiento: acá el resultado viene del acumulado, no de la intensidad de la primera semana.',
    symbolism:
      'Una mano surge de una nube blanca sosteniendo una moneda dorada con un pentáculo grabado, ofrecida con la palma hacia arriba: es un regalo, no un préstamo. Debajo se extiende un jardín cuidado con lirios blancos —la pureza del deseo material honesto— y un seto florecido con un arco de entrada. Más allá del arco se ven montañas azules. El arco es el detalle clave: la oportunidad está sobre la mesa, pero hay que atravesar el portal y caminar hasta las montañas. La mano no lleva a nadie, solo ofrece.',
    advice:
      'Acepta la oportunidad y trátala como una semilla, no como un premio. Da el primer paso concreto esta semana: abrir la cuenta, firmar el papel, comprar la herramienta, reservar el horario. Y planifica el mediano plazo, porque esta carta paga a quien sostiene. Lo que hoy parece pequeño se vuelve importante en un año si no lo abandonas en el camino.',
    yesNo:
      'Sí, con una oportunidad material concreta. Es una de las respuestas más sólidas del mazo, siempre que estés dispuesto a trabajarla en lugar de esperar que crezca sola.',
    combinations: [
      {
        cardSlug: 'the-empress',
        reading:
          'Abundancia que se multiplica sin esfuerzo aparente. Proyectos que crecen, casas que se agrandan y embarazos posibles: lo que se siembra en este clima encuentra la tierra en su mejor momento.',
      },
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'La oportunidad encuentra oficio. Lo que empieza como propuesta se convierte en una habilidad que dominas con la práctica: es la mejor secuencia para quien arranca un camino profesional.',
      },
      {
        cardSlug: 'seven-of-cups',
        reading:
          'Entre todas las fantasías que estás evaluando, esta es la única con sustancia. Descarta lo demás y quédate con lo que tiene fecha, monto y alguien responsable del otro lado.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'Llega la oportunidad y el miedo a perder lo poco que tienes te frena. La combinación advierte que el capital guardado bajo llave no se multiplica: hay que ponerlo a trabajar.',
      },
    ],
  },
  'two-of-pentacles': {
    meaningLove:
      'Estás haciendo malabares entre el vínculo y todo lo demás: el trabajo, la familia, las obligaciones que no se detienen. La relación no está mal, está corriendo detrás de la agenda. También aparece cuando alguien reparte su atención entre dos historias o entre dos ciudades. La carta no juzga: muestra que el equilibrio se sostiene con movimiento constante y que cansa. Conviene revisar qué se puede soltar antes de que se caiga solo lo que más te importa.',
    meaningWork:
      'Múltiples tareas al mismo tiempo y una gimnasia diaria para llegar a todo: dos trabajos, un proyecto propio en paralelo, ingresos que entran y salen sin quedarse. La carta indica que estás pudiendo, con esfuerzo y con cierta gracia. En el dinero marca flujo de caja apretado pero funcional: se cubre lo que hay que cubrir moviendo fechas y prioridades. El aviso es no agregar nada más al malabar hasta que alguna de las pelotas encuentre lugar fijo.',
    meaningWellbeing:
      'La energía alcanza justo, y eso funciona hasta que aparece un imprevisto. El cuerpo sostiene el ritmo mientras la rutina sea flexible: adaptarse en vez de exigirse es lo que da resultado ahora. Cuida los horarios de comida y sueño, que son lo primero que se desordena cuando hay que llegar a todo. El ánimo es ágil aunque disperso. Un solo hábito estable, aunque sea chico, le da al día un punto fijo del que agarrarse.',
    symbolism:
      'Un joven con un sombrero rojo alto y puntiagudo baila mientras sostiene dos monedas unidas por una cinta verde que dibuja el símbolo del infinito: el equilibrio no es estático, se sostiene en movimiento y se renueva sin fin. Está de puntas de pie, con una pierna levantada, en una postura imposible de mantener quieta. Detrás, el mar está agitado con dos barcos que suben y bajan las olas: los ciclos de la economía y del ánimo. Nadie se cae en esta carta, pero nadie descansa tampoco.',
    advice:
      'Ordena las prioridades antes de sumar una obligación más. Escribe todo lo que estás sosteniendo y elige qué se cae por decisión propia, en vez de esperar a que se caiga por cansancio. Acepta que hoy no vas a hacer todo bien y define qué es lo que sí tiene que salir bien. Y aprovecha tu flexibilidad: es tu mejor recurso en esta etapa.',
    yesNo:
      'Sí, si logras acomodar el resto. La respuesta es favorable pero condicionada: vas a poder con esto solamente si sueltas algo de lo que ya estás cargando.',
    combinations: [
      {
        cardSlug: 'ten-of-wands',
        reading:
          'El malabar se convirtió en sobrecarga. Ya no estás equilibrando, estás cargando: la combinación pide soltar algo esta semana antes de que el peso decida por ti.',
      },
      {
        cardSlug: 'the-world',
        reading:
          'El movimiento constante encuentra su cierre. Los viajes, las mudanzas y los proyectos en paralelo se ordenan y por fin algo se completa del todo.',
      },
      {
        cardSlug: 'three-of-pentacles',
        reading:
          'Dejas de hacerlo todo solo y aparece un equipo. Lo que hoy sostienes con esfuerzo se vuelve manejable apenas repartes tareas con gente que sabe lo suyo.',
      },
      {
        cardSlug: 'the-hanged-man',
        reading:
          'El equilibrio se pierde y hay que aceptar una pausa. Algo se frena por causas ajenas: aprovecha el paréntesis para reordenar en vez de pelear contra el freno.',
      },
    ],
  },
  'three-of-pentacles': {
    meaningLove:
      'La relación se construye entre los dos, con acuerdos explícitos sobre quién hace qué. Es la carta del vínculo que funciona como equipo: la convivencia bien repartida, la crianza compartida, el proyecto común que avanza porque cada uno aporta lo suyo. También indica que hace falta escuchar al otro como se escucha a un colega, con respeto por su criterio. Si estás sin pareja, señala que un vínculo puede empezar en un ámbito de trabajo o estudio.',
    meaningWork:
      'Se reconoce tu oficio y te convocan por lo que sabes hacer. Es la carta del trabajo en equipo bien coordinado, donde cada rol está claro y el resultado supera lo que cualquiera lograría solo. Aparece en obras, proyectos colectivos, colaboraciones profesionales y también cuando alguien con más experiencia te evalúa favorablemente. En el dinero indica ingresos por trabajo especializado, con posibilidad de mejorar el precio: tu habilidad tiene valor de mercado y ahora se nota.',
    meaningWellbeing:
      'La energía rinde mucho más cuando hay método y compañía. Es un buen momento para incorporar a alguien a tu rutina: entrenar con otra persona, sumarte a un grupo, tomar clases en lugar de improvisar solo. El cuerpo responde bien a la técnica correcta y mal a la repetición desprolija. Aprender a hacerlo bien —con quien sabe— es la mejor inversión de esta etapa, y el ánimo mejora con el progreso visible.',
    symbolism:
      'Un artesano de pie sobre un banco trabaja la piedra de una catedral mientras dos figuras —un monje con un plano y un noble— observan y discuten con él el diseño. Los tres dialogan de igual a igual: el que sabe hacer, el que sabe diseñar y el que financia. En lo alto del muro hay tres pentáculos tallados dentro de un arco gótico. La catedral es la obra que ninguno puede terminar solo y que probablemente ninguno vea terminada: el símbolo del trabajo que trasciende a quien lo hace.',
    advice:
      'Pide ayuda especializada en vez de improvisar. Lo que estás intentando resolver solo se resuelve mejor con alguien que ya lo hizo antes: consulta, contrata, pregunta. Y muestra tu trabajo, aunque esté a medio terminar: en esta etapa el reconocimiento llega cuando otros pueden ver lo que sabes hacer. Define bien los roles antes de arrancar y ponlos por escrito.',
    yesNo:
      'Sí, trabajando en equipo. La respuesta es favorable si aceptas la colaboración de otros; en soledad, el mismo proyecto se estira mucho más de lo necesario.',
    combinations: [
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'Oficio y reconocimiento en la misma línea. La práctica constante encuentra por fin quien la valore y la pague: es de las mejores secuencias del mazo para una carrera profesional.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'Formación institucional: una carrera, una certificación, un título que te habilita. El aprendizaje se vuelve oficial y eso abre puertas que la sola experiencia no abría.',
      },
      {
        cardSlug: 'five-of-wands',
        reading:
          'El equipo discute más de lo que produce. Faltan roles definidos y sobra ego: la combinación pide una reunión donde se aclare quién decide qué antes de seguir.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'El trabajo bien hecho se convierte en patrimonio duradero. Lo que construyes ahora va a sostener a más gente que tú y durante bastante más tiempo.',
      },
    ],
  },
  'four-of-pentacles': {
    meaningLove:
      'Alguien se aferra: al vínculo, al control, a la seguridad de que nada cambie. Aparece en relaciones donde hay miedo a perder al otro y ese miedo se expresa como posesividad o como rigidez. También marca a quien no se anima a abrirse por temor a que le vuelvan a doler. La carta no dice que el vínculo sea malo: dice que está cerrado con llave. Aflojar un poco la mano es lo que permite que entre aire, y que el otro se quede por ganas.',
    meaningWork:
      'Conservación: cuidar el puesto, no arriesgar, sostener lo conseguido. Es una postura razonable en un contexto inestable y un límite claro para el crecimiento. En el dinero indica ahorro estricto, control de gastos y también avaricia: dinero quieto que no se invierte ni se disfruta. Aparece cuando alguien no delega por miedo a perder el control de su trabajo. Revisa si estás protegiendo un patrimonio o simplemente evitando el riesgo por costumbre.',
    meaningWellbeing:
      'La rigidez se nota en el cuerpo: postura tensa, movimientos acotados, resistencia al cambio de rutina. La energía está guardada y poco disponible. Ayuda todo lo que abra: estiramiento, respiración amplia, salir del recorrido conocido. También conviene revisar los hábitos que sostienes por control y no por bienestar. El ánimo mejora cuando aflojas el puño, aunque sea en algo chico y aparentemente irrelevante.',
    symbolism:
      'Un hombre coronado está sentado en un banco de piedra abrazando una moneda contra el pecho, con otra sobre la corona y una bajo cada pie: cuatro pentáculos que le tapan el corazón, la cabeza y el contacto con la tierra. La postura es completamente cerrada, sin un solo espacio libre. Detrás se ve la ciudad de la que se alejó para custodiar lo suyo. El cielo es gris uniforme. Nadie lo amenaza en la escena: la fortaleza que construyó también es la celda donde está sentado.',
    advice:
      'Suelta algo a propósito. Gasta en algo que disfrutes, delega una tarea, presta lo que estás guardando por si acaso. La seguridad que estás construyendo se volvió una pared y ya no te protege: te encierra. Revisa qué es lo que temes perder realmente y verifica si esa amenaza existe hoy o es un recuerdo de una época en la que sí existía.',
    yesNo:
      'No, o sí a costa de quedarte donde estás. La carta favorece conservar y desalienta cualquier movimiento que implique arriesgar lo ya conseguido.',
    combinations: [
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'Hay una oportunidad concreta y el miedo la está bloqueando. La combinación es una advertencia directa: si no aflojas el puño ahora, la propuesta se va a otra mesa.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'El apego se volvió una atadura. Lo material dejó de ser un medio y se convirtió en dueño de tus decisiones: mira de frente qué estás sosteniendo y por qué.',
      },
      {
        cardSlug: 'six-of-pentacles',
        reading:
          'Se abre la mano y algo circula. Dar o recibir ayuda rompe el bloqueo: la generosidad, en esta dupla, es lo que vuelve a poner el dinero en movimiento.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'Lo que retienes con fuerza se sacude igual. La estructura que estás protegiendo no depende solo de ti: prepara un plan alternativo en vez de apretar más.',
      },
    ],
  },
  'five-of-pentacles': {
    meaningLove:
      'Sensación de exclusión y frío afectivo: sentirte afuera, no correspondido, o atravesar una etapa difícil sintiendo que nadie acompaña. Aparece en parejas que enfrentan juntas un problema material y también en vínculos donde uno se siente permanentemente en falta. Lo que la carta señala es que hay una puerta iluminada al lado y nadie la mira: la ayuda existe, en el círculo cercano, y no llega porque no se pide. El orgullo es acá el peor consejero.',
    meaningWork:
      'Un tramo económico duro: pérdida de trabajo, ingresos que no alcanzan, un negocio que no despega. La carta reconoce la dificultad real y agrega un dato: la situación es transitoria y hay recursos disponibles que todavía no activaste. Contactos que podrías llamar, ayudas que podrías gestionar, trabajos temporales que descartaste por considerarlos poco. En el dinero es una etapa de austeridad obligada donde conviene priorizar lo básico y pedir lo que haga falta sin vergüenza.',
    meaningWellbeing:
      'El desgaste material se siente en el cuerpo: cansancio, frío, ánimo bajo, la sensación de estar a la intemperie. Es una etapa que pide cuidados básicos y compañía, no grandes planes. Comer con regularidad, abrigarse, dormir y aceptar la ayuda que ofrezcan. El aislamiento empeora todo y es justamente lo que la carta muestra: dos personas caminando afuera cuando adentro hay luz. Pide, apóyate en alguien y no atravieses este tramo solo.',
    symbolism:
      'Dos figuras avanzan descalzas por la nieve: una con muletas y una manta raída, la otra con un chal sobre la cabeza, ambas encorvadas por el frío. Sobre ellas brilla un vitral de iglesia con cinco pentáculos y un diseño de árbol de la vida, cálido e iluminado. Están justo debajo y no lo miran. Esa es la tragedia de la carta: el refugio está al alcance de la mano y la desesperación no deja levantar la vista. La nieve cubre todo el suelo y la noche es cerrada, pero la ventana sigue encendida.',
    advice:
      'Pide ayuda hoy. Esa es la instrucción completa de esta carta y la que más cuesta seguir. Haz una lista de tres personas o instituciones a las que podrías recurrir y contacta a una esta semana. Y revisa qué recursos estás descartando por orgullo: un trabajo temporal, una habitación más chica, un pedido incómodo. Es un tramo, no un destino.',
    yesNo:
      'No por ahora: faltan recursos y el momento es adverso. La respuesta mejora bastante si aceptas la ayuda que tienes disponible y no lo intentas en soledad.',
    combinations: [
      {
        cardSlug: 'six-of-pentacles',
        reading:
          'La ayuda llega. Alguien con más recursos aparece justo a tiempo: acéptala sin sentir que quedas en deuda, porque en esta dupla el que da también está recibiendo algo.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'El apoyo viene de una institución o de una comunidad: la iglesia del fondo se vuelve concreta. Gestiona lo que corresponda en vez de resolverlo todo por tu cuenta.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'La familia es el recurso disponible. Lo que te falta hoy está del otro lado de una llamada incómoda: la combinación insiste en que la hagas igual.',
      },
      {
        cardSlug: 'the-sun',
        reading:
          'La etapa dura termina y vuelve la abundancia. Es una de las mejores secuencias posibles después de una crisis material: la recuperación llega y es visible.',
      },
    ],
  },
  'six-of-pentacles': {
    meaningLove:
      'Habla del equilibrio entre dar y recibir. Aparece cuando en la pareja uno pone mucho más que el otro —tiempo, dinero, cuidado— y esa balanza empieza a pesar. También marca vínculos generosos y de apoyo mutuo, donde ayudar no se cobra. La pregunta que trae es incómoda y útil: en esta relación, ¿quién sostiene la balanza? Si siempre eres el que da, revisa qué estás comprando con eso. Si siempre recibes, revisa qué estás postergando devolver.',
    meaningWork:
      'Un apoyo económico que llega o que das: un préstamo, un adelanto, un cliente que paga bien, una beca. También indica relaciones laborales donde hay una diferencia clara de poder y conviene tenerla presente. Es una buena carta para negociar aumentos, cobrar deudas y ordenar acuerdos económicos entre partes desiguales. En el dinero marca circulación sana: entra y sale, se comparte, se invierte. Guarda registro escrito de lo que se presta y de lo que se debe.',
    meaningWellbeing:
      'La energía se recupera cuando hay reciprocidad. Si te la pasas sosteniendo a los demás, el cansancio no es físico sino de balanza: estás dando más de lo que entra. Es un buen momento para aceptar ayuda concreta con la casa, los chicos o el trabajo. Y también para dar, si estás del lado con recursos, porque la generosidad hace bien de manera comprobable al ánimo. Revisa el reparto de tareas de tu semana con honestidad.',
    symbolism:
      'Un comerciante de túnica roja sostiene una balanza de platillos en una mano mientras con la otra deja caer monedas sobre dos mendigos arrodillados a sus pies. La balanza es el detalle central: mide, decide cuánto le toca a cada uno y esa decisión es enteramente suya. Los que reciben están de rodillas y él de pie: la generosidad de esta carta no es entre iguales. El fondo es una ciudad amurallada bajo un cielo gris claro. La escena invita a preguntarse en qué lugar de esa balanza estás parado.',
    advice:
      'Equilibra la balanza a conciencia. Si estás en posición de dar, hazlo con generosidad y sin condiciones ocultas. Si necesitas recibir, pide con claridad y sin disculpas eternas. Y en cualquier acuerdo económico de esta etapa, deja por escrito los montos y los plazos: la buena voluntad se recuerda distinto según de qué lado de la balanza estuviste.',
    yesNo:
      'Sí, con la ayuda de alguien más. La respuesta favorable llega a través de un tercero que aporta recursos, contactos o respaldo económico.',
    combinations: [
      {
        cardSlug: 'five-of-pentacles',
        reading:
          'El auxilio llega justo cuando hacía falta. Es una de las secuencias más aliviadoras del palo: la carencia encuentra respuesta concreta y la etapa dura empieza a ceder.',
      },
      {
        cardSlug: 'justice',
        reading:
          'El reparto se formaliza. Herencias, divisiones de bienes, acuerdos de pago: lo que se defina ahora queda escrito y conviene que sea equitativo de verdad.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La ayuda viene con una atadura. Ese préstamo o ese favor tiene condiciones que todavía no se dijeron en voz alta: pregunta qué se espera a cambio antes de aceptar.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'La generosidad circula dentro de la familia. Apoyo económico entre parientes, herencias adelantadas o el sostén de varias generaciones repartido con criterio y sin que nadie quede en falta.',
      },
    ],
  },
  'seven-of-pentacles': {
    meaningLove:
      'Momento de evaluar la relación: cuánto pusiste, qué recibiste, si vale la pena seguir invirtiendo. No es una carta de ruptura sino de balance honesto, la clase de pregunta que aparece a los años y no a los meses. En pareja indica una pausa reflexiva antes de decidir el paso siguiente. Si estás sin pareja, marca la revisión de un patrón que se repite. La carta pide paciencia con lo que está creciendo bien y decisión con lo que claramente no crece.',
    meaningWork:
      'Estás en la mitad de un proceso largo y todavía no ves el retorno completo. Es la carta del emprendimiento que va por el segundo año, del estudio que aún no da frutos, de la inversión que crece despacio. Aconseja evaluar con números concretos: qué rinde, qué no, dónde estás poniendo esfuerzo sin resultado. En el dinero, momento de revisar el rendimiento de lo que tienes y de decidir con frialdad qué se sostiene y qué se abandona.',
    meaningWellbeing:
      'La constancia empieza a mostrar resultados, aunque menos rápido de lo que esperabas. Es un buen momento para revisar la rutina con honestidad: qué te está haciendo bien de verdad y qué sostienes solo por inercia. La energía es estable y algo impaciente. El ánimo mejora al ver progreso, así que conviene medir en plazos largos y no día a día. Ajusta lo que no funciona y dale más tiempo a lo que sí, sin cambiar todo de golpe.',
    symbolism:
      'Un campesino apoyado en su azada contempla un arbusto cargado con seis pentáculos, mientras un séptimo descansa en el suelo junto a sus pies. La postura es de pausa: dejó de trabajar para mirar. La expresión no es de alegría ni de decepción, es de evaluación. El pentáculo caído a un costado suele leerse como lo que se descarta o lo que se resiembra. La tierra está trabajada y las hojas del arbusto son abundantes y verdes. El cielo despejado indica que no hay amenaza: solo falta tiempo.',
    advice:
      'Evalúa con números, no con sensaciones. Ponte a mirar qué rindió y qué no en los últimos seis meses, con datos concretos sobre la mesa. Sostienes lo que crece y podas lo que no, aunque le hayas puesto mucho cariño. Y ten paciencia con lo que va bien: arrancar la planta para ver la raíz es el error clásico de esta etapa.',
    yesNo:
      'Sí, pero más lento de lo que quisieras. El resultado llega si sostienes el esfuerzo; la carta pide paciencia y una evaluación honesta en el camino.',
    combinations: [
      {
        cardSlug: 'the-hanged-man',
        reading:
          'La espera se alarga y no está en tus manos acelerarla. Cambia el punto de vista sobre el proyecto en vez de forzar el calendario: hay algo que todavía no estás viendo.',
      },
      {
        cardSlug: 'nine-of-pentacles',
        reading:
          'La siembra rinde y por fin llega el bienestar. Es la mejor continuación posible para esta carta: lo que evaluaste con paciencia termina de madurar y se convierte en independencia concreta.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'La evaluación termina en abandono, y está bien que así sea. Después de mirar los números con honestidad, la decisión correcta es dejarlo: no todo lo sembrado merece otra temporada de riego.',
      },
      {
        cardSlug: 'three-of-wands',
        reading:
          'Lo sembrado empieza a dar señales desde lejos. Aparecen los primeros retornos y conviene mirar más allá del proyecto actual: la expansión ya está en marcha.',
      },
    ],
  },
  'eight-of-pentacles': {
    meaningLove:
      'El vínculo se trabaja todos los días, con dedicación y sin épica. Es la carta de quien mejora la relación con gestos repetidos: escuchar mejor, corregir lo que molesta, aprender a convivir. También indica el esfuerzo consciente por aprender a estar en pareja después de historias que salieron mal. No es una carta romántica y es una de las más confiables: lo que se construye así dura. Si estás sin pareja, marca un tiempo de trabajo sobre tú mismo que después rinde.',
    meaningWork:
      'Oficio, práctica y perfeccionamiento. Aparece cuando estás aprendiendo algo en serio o repitiendo una tarea hasta dominarla. Es la carta del artesano, del que estudia, del que mejora su producto sin apuro. Muy favorable para capacitaciones, cambios de rubro con formación previa y trabajos donde la calidad importa más que la velocidad. En el dinero indica ingresos ganados con dedicación y en aumento gradual: cada mes un poco mejor que el anterior, sin saltos.',
    meaningWellbeing:
      'La repetición constante es lo que da resultado. Es una etapa excelente para sostener una rutina física, aprender bien la técnica y avanzar de a poco. El cuerpo mejora con la práctica regular y el ánimo se ordena con el hábito. Cuida de no volverlo obsesivo: cuando la rutina deja de ser cuidado y se vuelve exigencia, empieza a restar. Mide el progreso cada varias semanas y no todos los días.',
    symbolism:
      'Un artesano sentado en un banco talla con un buril un pentáculo apoyado sobre un tronco. Seis pentáculos ya terminados cuelgan de un poste vertical a su izquierda y uno más descansa a sus pies: la producción está a la vista y ordenada. Trabaja concentrado, con la cabeza baja y un delantal de cuero. Al fondo, un camino amarillo lleva a una ciudad lejana: podría estar allá vendiendo, y eligió quedarse perfeccionando el trabajo. Es la carta más obrera del mazo y la que menos promete atajos.',
    advice:
      'Practica todos los días, aunque sea poco. Esta carta no premia el talento sino la constancia: media hora diaria durante seis meses supera a cualquier arranque brillante que se abandona. Busca alguien que te corrija, porque la repetición con un error incorporado no mejora nada. Y no compares tu proceso con el resultado terminado de otro.',
    yesNo:
      'Sí, con trabajo y dedicación. La respuesta es favorable siempre que estés dispuesto a poner las horas: acá nada llega por suerte ni por atajo.',
    combinations: [
      {
        cardSlug: 'three-of-pentacles',
        reading:
          'El oficio encuentra reconocimiento y equipo. Lo que practicaste en soledad ahora se valora y se paga: es de las mejores secuencias del mazo para consolidar una profesión.',
      },
      {
        cardSlug: 'the-magician',
        reading:
          'Habilidad y talento se combinan. Dominas la técnica y además sabes presentarla: momento ideal para mostrar tu trabajo y cobrarlo por lo que realmente vale.',
      },
      {
        cardSlug: 'four-of-swords',
        reading:
          'La dedicación se volvió agotamiento sin que lo notaras. Trabajaste bien y ahora necesitas parar: el descanso en esta dupla no interrumpe el progreso, lo protege de la caída por sobreexigencia.',
      },
      {
        cardSlug: 'page-of-pentacles',
        reading:
          'Estudio con proyección concreta. Lo que estás aprendiendo tiene salida laboral real: sigue con el plan de formación, porque el camino elegido es el correcto.',
      },
    ],
  },
  'nine-of-pentacles': {
    meaningLove:
      'Independencia y disfrute propio. Aparece cuando alguien está bien solo y no acepta cualquier compañía para llenar un espacio: la carta lo celebra en lugar de compadecerlo. En pareja indica dos personas que conservan su mundo propio y por eso funcionan. También marca una etapa donde vale más la calidad del vínculo que la urgencia por tenerlo. Si estás buscando pareja, el mensaje es claro: estar bien contigo es lo que va a atraer a alguien que sume, no que rescate.',
    meaningWork:
      'Autonomía conseguida: trabajar por tu cuenta, manejar tus tiempos, cosechar lo que sembraste durante años. Es una carta de logro material bien merecido y sostenido con criterio. Suele aparecer cuando alguien alcanza estabilidad suficiente para elegir en qué trabaja y con quién. En el dinero indica solvencia real, ahorros que rinden y capacidad de darte gustos sin desequilibrar nada. El aviso menor: cuida que la independencia no se convierta en no necesitar nunca a nadie.',
    meaningWellbeing:
      'Buena energía, buen descanso y una relación amable con el propio cuerpo. Es una etapa para disfrutar lo conseguido: rutinas que te gustan, tiempo al aire libre, placeres cuidados. El bienestar acá viene de la autonomía, de manejar tus horarios y de no vivir corriendo. Sostén lo que ya funciona en vez de cambiarlo por algo más exigente. El ánimo es sereno y bien plantado: es de los mejores momentos del mazo para consolidar hábitos.',
    symbolism:
      'Una mujer elegante camina sola por un viñedo cargado de uvas, con un halcón encapuchado posado en su mano enguantada. El halcón entrenado es el símbolo central: el pensamiento y el deseo bajo control voluntario, la disciplina que hizo posible este jardín. Nueve pentáculos crecen entre las vides. Su vestido está bordado con flores y al fondo se ve una casa señorial. Un caracol avanza por el suelo, recordatorio del ritmo lento con el que se consiguió todo esto. Nadie más aparece en la escena, y ella no parece extrañar a nadie.',
    advice:
      'Disfruta de lo que construiste sin pedir disculpas. Date el gusto que venías postergando y tómate el tiempo libre que te ganaste. Al mismo tiempo, revisa si la independencia no se volvió una forma elegante de no dejar entrar a nadie: puedes seguir siendo autónomo y aun así compartir el jardín con alguien.',
    yesNo:
      'Sí, y por mérito propio. Es una respuesta favorable que además llega sin depender de nadie: el resultado es consecuencia directa de lo que ya hiciste.',
    combinations: [
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'El logro individual se transforma en patrimonio compartido. Lo que conseguiste sola o solo empieza a sostener a una familia: la abundancia se vuelve herencia.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'Bienestar material y paz interior en la misma etapa. Rara combinación de calma verdadera: lo conseguido además te hace bien y no solo te alivia la preocupación.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'La independencia se está volviendo cerrazón sin que te des cuenta. Cuidado con confundir autonomía con no necesitar a nadie nunca: la puerta cerrada con llave también deja afuera lo bueno.',
      },
      {
        cardSlug: 'two-of-cups',
        reading:
          'Alguien aparece cuando ya estabas bien solo, y por eso mismo la cosa funciona. El vínculo suma en vez de rescatar: es la mejor manera de empezar algo.',
      },
    ],
  },
  'ten-of-pentacles': {
    meaningLove:
      'Familia, raíces y proyectos de largo plazo. Es la carta del vínculo que se piensa en décadas: casarse, tener hijos, comprar una casa, integrar dos familias. Marca estabilidad y también el peso de la tradición familiar, que a veces opina de más. En pareja indica solidez y decisiones compartidas sobre patrimonio. Si estás sin pareja, señala que buscas algo con proyección real. El aviso: cuidado con sostener una estructura por respeto al apellido cuando lo de adentro ya no funciona.',
    meaningWork:
      'Estabilidad económica y patrimonio construido: el negocio familiar, la empresa consolidada, la propiedad, la jubilación planificada. Es la carta del dinero que se ordena para durar más que uno. Aparece en herencias, sucesiones y decisiones sobre bienes de la familia. En lo laboral indica un puesto seguro dentro de una estructura grande. Lo que pide es pensar en el largo plazo: contratos, seguros, escrituras y todo lo que hoy parece burocrático y mañana evita un conflicto.',
    meaningWellbeing:
      'El bienestar depende del entorno estable: casa en orden, cuentas al día, familia sin conflictos abiertos. Es una etapa de energía tranquila donde lo que sostiene son los hábitos compartidos y las costumbres de la casa. Buen momento para instalar rutinas familiares: comer juntos, caminar los fines de semana, apagar las pantallas a la misma hora. El ánimo se apoya en la seguridad material, así que ordenar lo económico descomprime bastante más de lo esperable.',
    symbolism:
      'Una escena familiar completa bajo un arco: un anciano de manto bordado sentado a un costado acaricia a dos perros, mientras una pareja conversa y un niño juega junto a ellos. Diez pentáculos se distribuyen sobre la imagen formando el árbol de la vida cabalístico, la estructura que sostiene lo visible. El anciano está apartado y nadie parece hablarle: la generación mayor observa lo que construyó. Al fondo, el pueblo con sus torres y un escudo de armas en el muro. Es la carta más poblada del mazo.',
    advice:
      'Piensa en plazos largos y ordena los papeles. Lo que hoy resuelves con una firma —un contrato, un seguro, una conversación clara sobre bienes— evita un conflicto familiar dentro de diez años. Consulta a la generación que vino antes: hay experiencia disponible que nadie te está ofreciendo porque nadie sabe que la necesitas. Y haz lugar en la mesa al que está mirando desde el costado.',
    yesNo:
      'Sí, con estabilidad y proyección de futuro. Es una de las respuestas más sólidas del mazo para preguntas sobre familia, casa, patrimonio y decisiones de largo plazo.',
    combinations: [
      {
        cardSlug: 'the-empress',
        reading:
          'La familia crece y el patrimonio también. Muy frecuente en consultas por embarazos, casas nuevas y proyectos que expanden la vida compartida con abundancia real.',
      },
      {
        cardSlug: 'justice',
        reading:
          'Sucesiones, divisiones de bienes y acuerdos familiares que por fin se formalizan. Conviene hacerlo con asesoramiento y por escrito, aunque haya toda la confianza del mundo entre las partes.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'La estructura familiar se sacude. Algo que se sostenía por costumbre se cae: duele, y a la vez destapa lo que se venía evitando durante años.',
      },
      {
        cardSlug: 'six-of-cups',
        reading:
          'Las raíces y la memoria se vuelven presentes. Reencuentros familiares, casas de la infancia y tradiciones que vuelven a tener sentido en esta etapa de la vida.',
      },
    ],
  },
  'page-of-pentacles': {
    meaningLove:
      'Un vínculo que empieza despacio y en serio: alguien que se toma el tiempo de conocerte, sin fuegos artificiales. Es la carta del cortejo tranquilo y de las relaciones que crecen con gestos concretos. También marca a quien está aprendiendo a estar en pareja y lo hace con voluntad de mejorar. En una relación de años, invita a estudiar juntos algo nuevo o a arrancar un proyecto compartido. Lo que promete no es intensidad, es constancia, y eso rinde con el tiempo.',
    meaningWork:
      'Un aprendiz con futuro: alguien que empieza a estudiar, hace una pasantía o entra a un rubro nuevo con ganas de aprender bien. Es la carta de las oportunidades formativas y de los proyectos que arrancan en pequeño con proyección real. Muy favorable para volver a estudiar de grande. En el dinero, un ingreso inicial modesto que puede crecer si se lo trabaja: el primer cliente, la primera venta, el ahorro que empieza con poco y con método.',
    meaningWellbeing:
      'Buen momento para empezar algo y hacerlo bien desde el principio: aprender la técnica, conseguir orientación, arrancar con expectativas realistas. La energía es estable y algo lenta, ideal para instalar una rutina sin sobresaltos. El ánimo mejora cuando ves progreso concreto, así que lleva un registro simple de lo que haces. Evita los planes ambiciosos: en esta carta, lo pequeño y sostenido gana siempre por goleada.',
    symbolism:
      'Un joven de pie en un campo verde sostiene un pentáculo con las dos manos y lo contempla con atención, casi con reverencia, elevado a la altura de sus ojos. No lo guarda ni lo gasta: lo estudia. Viste una túnica marrón y verde y un sombrero rojo. El terreno bajo sus pies está arado y florecido, con un bosquecillo a la izquierda y montañas al fondo. Es el único Paje que mira su símbolo de frente, con la seriedad de quien acaba de entender que eso que sostiene tiene valor real.',
    advice:
      'Empieza en serio y en pequeño. Anótate en el curso, abre la cuenta de ahorro, dedícale una hora por día a lo que quieres aprender. Esta carta no pide talento sino método y continuidad. Busca quien te enseñe bien desde el principio, porque corregir un mal hábito después cuesta el doble. Y no te apures: lo que empieza así llega lejos.',
    yesNo:
      'Sí, con paciencia y aprendizaje. La respuesta favorable llega a través de un proceso lento y bien hecho, no de un resultado inmediato.',
    combinations: [
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'El estudiante se vuelve artesano. Lo que empezó como curiosidad encuentra método y horas de práctica: la mejor secuencia posible para quien está iniciando un camino.',
      },
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'Aparece una oportunidad concreta justo cuando empiezas a formarte y todavía no te sientes listo. Acéptala igual: el aprendizaje sobre la marcha es parte del trato en esta combinación.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'Formación institucional formal: una carrera, un título, una certificación reconocida. En este caso el camino largo y avalado rinde bastante más que la capacitación suelta o el curso rápido.',
      },
      {
        cardSlug: 'seven-of-pentacles',
        reading:
          'El aprendizaje pide paciencia. Todavía no hay resultados visibles y eso desanima: la combinación insiste en sostener el proceso unos meses más antes de evaluar.',
      },
    ],
  },
  'knight-of-pentacles': {
    meaningLove:
      'Un vínculo confiable y sin sobresaltos: alguien que cumple lo que promete, aparece cuando dice y sostiene la relación con actos. Es la carta menos vertiginosa del mazo en el amor y una de las más seguras. En pareja indica una etapa de rutina estable, con la advertencia obvia: la previsibilidad, sin gestos nuevos, termina en aburrimiento. Si describe a una persona, es leal y algo lenta para las decisiones emocionales. Vale la pena esperarla; también vale la pena avisarle que a veces hay que acelerar.',
    meaningWork:
      'Trabajo metódico, cumplimiento y avance lento pero seguro. Es la carta del empleado o del profesional que no falla: entrega a tiempo, respeta el procedimiento y sostiene el ritmo durante años. Excelente para proyectos que requieren disciplina y para trámites largos. La contra es la resistencia al cambio y la lentitud frente a las oportunidades que piden reflejos. En el dinero indica administración prudente, ahorro constante y crecimiento sostenido sin sobresaltos.',
    meaningWellbeing:
      'La rutina es la mejor aliada de esta etapa: horarios regulares, actividad moderada y constante, descanso previsible. El cuerpo responde muy bien a la repetición y mal a los cambios bruscos. Es un buen momento para sostener lo que ya venías haciendo en lugar de innovar. El riesgo es el estancamiento: si la rutina se volvió inmovilidad, agrega algo mínimo que la mueva. El ánimo es estable, tranquilo y poco reactivo.',
    symbolism:
      'Un caballero con armadura oscura está detenido sobre un caballo negro y macizo, ambos completamente quietos: es el único jinete del mazo que no se mueve. Sostiene el pentáculo con calma, sin exhibirlo. El caballo tiene las cuatro patas en el suelo y la cabeza baja, en actitud de trabajo. Detrás se extiende un campo arado hasta el horizonte, tierra ya trabajada. El yelmo y la brida están adornados con ramas de roble, símbolo de resistencia. Nada en la escena tiene apuro, y esa es exactamente su fuerza.',
    advice:
      'Sostén el plan aunque los resultados tarden. Esta carta gana por acumulación: lo importante es no interrumpir. Revisa el método una vez y después dedicate a cumplirlo sin dramatismo. Y agenda un cambio chico cada tanto —una variación en la rutina, una idea nueva— para que la constancia no se convierta en piedra.',
    yesNo:
      'Sí, aunque va a tardar. La respuesta es favorable y confiable, con la única condición de que aceptes que el proceso avanza a paso de arado.',
    combinations: [
      {
        cardSlug: 'the-world',
        reading:
          'La constancia lleva a completar el ciclo. Lo que sostuviste durante años llega a su forma terminada: es la recompensa larga que esta carta viene prometiendo.',
      },
      {
        cardSlug: 'eight-of-wands',
        reading:
          'Lo lento se cruza con lo veloz. Algo se acelera y te encuentra a mitad del arado: adapta el ritmo sin abandonar el método que venía funcionando.',
      },
      {
        cardSlug: 'four-of-cups',
        reading:
          'La rutina se volvió desgano. Cumples sin ganas y el trabajo perdió sentido: hace falta un estímulo nuevo antes de que la constancia se vuelva pura inercia.',
      },
      {
        cardSlug: 'king-of-pentacles',
        reading:
          'El trabajador metódico llega a la maestría. Los años de método se convierten en autoridad y en patrimonio: la evolución natural de esta carta, cumplida.',
      },
    ],
  },
  'queen-of-pentacles': {
    meaningLove:
      'Habla de alguien cálido y práctico, que demuestra el afecto ocupándose: la comida, la casa, los detalles que hacen la vida más fácil. En pareja marca una etapa de cuidado mutuo y bienestar cotidiano compartido. Si describe a una persona, es generosa, confiable y con los pies en la tierra, capaz de sostener a varios a la vez. El aviso es clásico: esta figura cuida tanto que se olvida de sí misma. Dejarse cuidar de vez en cuando es parte del trabajo de esta carta.',
    meaningWork:
      'Gestión práctica y eficiente: la persona que resuelve, administra y hace que las cosas funcionen sin necesidad de figurar. Aparece en trabajos que combinan producción y cuidado, en emprendimientos caseros y en la administración doméstica de una economía familiar. Muy buena para negocios propios de escala mediana. En el dinero indica manejo prudente, capacidad de estirar los recursos y decisiones sensatas: no es la carta que arriesga, es la que hace rendir lo que hay.',
    meaningWellbeing:
      'El bienestar viene de lo cotidiano bien atendido: comer bien, dormir suficiente, tener la casa en orden y ratos de calma. La energía es abundante y se gasta en sostener a otros, así que el punto de atención es la propia reserva. Reserva tiempo para ti con la misma seriedad con la que atiendes lo de los demás. Las actividades al aire libre, la huerta y todo lo que implique contacto con la tierra funcionan especialmente bien en esta etapa.',
    symbolism:
      'Una reina se sienta en un trono tallado con frutas, cabras y querubines, en medio de un jardín exuberante, y sostiene un pentáculo sobre la falda mirándolo con ternura, casi como se sostiene a un hijo. Un conejo salta en la esquina inferior de la carta, símbolo de fertilidad y de abundancia sencilla. Rosas rojas trepan formando un arco sobre su cabeza y a sus pies hay flores amarillas. El paisaje es fértil y cuidado. Todo indica una riqueza que se disfruta y se comparte, no una que se exhibe.',
    advice:
      'Ocúpate de lo concreto y hazlo con generosidad. Lo que hoy resuelve tu situación no es una gran estrategia sino la suma de gestos prácticos: ordenar la casa, cocinar, revisar las cuentas, atender a quien te necesita. Y pon un límite claro a cuánto puedes sostener: la generosidad sin reserva propia se agota y termina resintiendo a quien la recibe.',
    yesNo:
      'Sí, de manera práctica y concreta. La respuesta es favorable y llega por el camino sensato: recursos que alcanzan, ayuda cercana y decisiones bien administradas.',
    combinations: [
      {
        cardSlug: 'the-empress',
        reading:
          'Abundancia doble: cuidado, fertilidad y bienestar material juntos. Muy favorable para la casa, los proyectos familiares y todo lo que necesite crecer con nutrición constante.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'El cuidado cotidiano se convierte en patrimonio familiar. Lo que sostienes todos los días termina siendo la base sobre la que se apoya toda una casa.',
      },
      {
        cardSlug: 'ten-of-wands',
        reading:
          'Estás cuidando a demasiada gente al mismo tiempo. La combinación pide repartir la carga: sostener a todos sola o solo es lo que va a terminar en agotamiento.',
      },
      {
        cardSlug: 'knight-of-cups',
        reading:
          'Lo práctico se encuentra con lo romántico. Alguien aporta el gesto emotivo y tú el sostén concreto de todos los días: es una combinación complementaria que funciona bien si ambos lo reconocen.',
      },
    ],
  },
  'king-of-pentacles': {
    meaningLove:
      'Compromiso sólido y protector: alguien que ofrece estabilidad concreta y la sostiene en el tiempo. En pareja marca una etapa de seguridad, decisiones patrimoniales compartidas y proyectos que se cumplen. Si describe a una persona, es generosa, confiable y algo controladora con lo material. El aviso está en el reverso: cuando el afecto se demuestra únicamente proveyendo, el otro puede sentirse bien cuidado y poco visto. La estabilidad no reemplaza la conversación.',
    meaningWork:
      'Éxito material consolidado: el empresario, el profesional establecido, quien maneja recursos con criterio y genera trabajo para otros. Aparece cuando alcanzas una posición sólida o cuando alguien con poder económico te respalda. Excelente para inversiones, expansión de negocios y decisiones patrimoniales de largo plazo. En el dinero indica abundancia bien administrada y rendimientos estables. La contra es la rigidez: lo que funcionó veinte años no siempre funciona el año que viene.',
    meaningWellbeing:
      'La energía es sólida y bien administrada, sostenida por hábitos firmes y una vida material ordenada. Es una etapa de estabilidad donde el cuerpo responde bien porque el entorno acompaña. El riesgo es la comodidad excesiva y el sedentarismo que viene con el éxito: mucho escritorio, poca caminata. Sostén el movimiento aunque ya no lo necesites para sentirte bien, y no descuides el descanso real por atender lo que siempre parece urgente.',
    symbolism:
      'Un rey de manto negro bordado con racimos de uvas se sienta en un trono tallado con cabezas de toro, apoyando una mano sobre un pentáculo y sosteniendo un cetro con la otra. Alrededor del trono crecen enredaderas cargadas de frutos: la abundancia lo rodea físicamente. Debajo de su pie asoma una armadura, señal de que la seguridad de hoy se ganó peleando antes. Al fondo, el castillo que construyó. Es la carta del mazo donde la riqueza se ve más asentada y menos exhibida.',
    advice:
      'Administra lo que tienes con visión de largo plazo y compártelo. Es un buen momento para invertir con criterio, formalizar lo que estaba de palabra y respaldar a alguien que recién empieza. Y revisa si la estructura que armaste sigue sirviendo a lo que quieres hoy: la solidez es una virtud mientras no se convierta en la razón para no cambiar nunca nada.',
    yesNo:
      'Sí, con seguridad y respaldo material. Es una de las respuestas más firmes del mazo en preguntas sobre dinero, negocios y decisiones patrimoniales.',
    combinations: [
      {
        cardSlug: 'the-emperor',
        reading:
          'Poder material y autoridad estructural en la misma escena. Todo lo que necesite fundarse con reglas claras y respaldo económico encuentra en esta dupla el mejor momento posible para arrancar.',
      },
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'Capital disponible justo cuando aparece la oportunidad nueva. Hay respaldo suficiente para arrancar en serio: es de las mejores duplas del mazo para lanzar un negocio propio con base firme.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'La solidez derivó en acumulación por acumulación. Tienes más de lo que necesitas y sigues sin soltar: revisa qué estás protegiendo y de qué amenaza exactamente.',
      },
      {
        cardSlug: 'the-fool',
        reading:
          'La experiencia se cruza con un impulso nuevo. Puede ser un choque generacional o la oportunidad de renovarse: escucha la idea antes de descartarla por inmadura.',
      },
    ],
  },
};
