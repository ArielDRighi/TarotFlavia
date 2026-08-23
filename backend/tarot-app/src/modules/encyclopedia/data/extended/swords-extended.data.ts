import { CardExtendedContentMap } from './card-extended-content.types';

/**
 * Contenido extendido de las 14 Espadas (T-SEO-009)
 *
 * Elemento Aire: pensamiento, palabra, conflicto, verdad.
 * La sección de bienestar habla de energía, descanso, hábitos y ánimo:
 * nunca de cuadros clínicos, aunque el palo trate temas mentales.
 */
export const SWORDS_EXTENDED_CONTENT: CardExtendedContentMap = {
  'ace-of-swords': {
    meaningLove:
      'Se dice la verdad. Aparece cuando una conversación pendiente por fin sucede y ordena todo: una definición, un límite claro, un malentendido que se disuelve con dos frases. En pareja marca el momento de hablar sin rodeos lo que se viene esquivando. Si estás sin pareja, indica claridad sobre lo que quieres y lo que ya no aceptas. La carta es filosa: la verdad que trae ordena, pero también puede cortar. Elige bien las palabras, porque en esta energía se dicen cosas que no se olvidan.',
    meaningWork:
      'Claridad mental y decisiones bien fundadas. Es la carta de la lectura certera de un problema laboral, del contrato que se firma, del argumento que convence. Muy favorable para exámenes, presentaciones, escritos y negociaciones donde gana quien piensa mejor. Suele señalar que tienes la información que necesitabas y que ahora corresponde actuar en consecuencia. Del lado del dinero, indica que los números por fin quedan a la vista: se acabaron las estimaciones y empieza la administración real.',
    meaningWellbeing:
      'La cabeza se aclara y con eso baja el desgaste. Es un buen momento para tomar decisiones sobre hábitos: cortar con algo que te hacía mal, ordenar los horarios, ponerle nombre a lo que te venía pesando. La energía mental está alta y conviene canalizarla en algo concreto antes de que se convierta en pensamiento en círculos. Escribir lo que te preocupa ayuda especialmente en esta etapa: el Aire se calma cuando encuentra forma.',
    symbolism:
      'Una mano surge de una nube gris sosteniendo una espada erguida, con la punta atravesando una corona dorada de la que cuelgan una rama de olivo y una de palma: la victoria de la razón sobre el conflicto, la paz y el triunfo entrelazados. Seis chispas doradas caen alrededor, la energía divina que acompaña la decisión justa. Al fondo, montañas grises y afiladas bajo un cielo pálido: el paisaje del pensamiento, hermoso y sin abrigo. La espada apunta arriba, señal de que la claridad todavía no bajó al terreno de los hechos.',
    advice:
      'Di la verdad, aunque sea incómoda, y dila una sola vez. Esta carta pide precisión: elige la frase exacta en lugar de dar quince vueltas amables que dejan la cuestión sin resolver. Antes de hablar, escribe lo que quieres transmitir en dos líneas. Y recuerda que la espada corta para los dos lados: la claridad que exiges también te la van a devolver.',
    yesNo:
      'Sí, con claridad y sin ambigüedades. Es una de las respuestas más nítidas del mazo, aunque la verdad que traiga no siempre sea la que esperabas escuchar.',
    combinations: [
      {
        cardSlug: 'justice',
        reading:
          'La verdad se vuelve resolución formal. Aparece un fallo, un contrato o una decisión que zanja la discusión de manera definitiva. Prepara la documentación, porque aquí se decide con pruebas y no con relatos.',
      },
      {
        cardSlug: 'the-tower',
        reading:
          'Una revelación derrumba una estructura. Lo que se descubre cambia todo de golpe y ya no hay manera de volver atrás. Duele, y a la vez despeja el terreno para construir sobre algo verdadero.',
      },
      {
        cardSlug: 'two-of-swords',
        reading:
          'La claridad choca contra alguien que prefiere no ver. Tienes la información sobre la mesa y del otro lado hay una venda voluntaria: no fuerces la verdad, ofrécela y espera.',
      },
      {
        cardSlug: 'page-of-pentacles',
        reading:
          'La idea encuentra su primera aplicación práctica. Lo que era claridad abstracta se convierte en un plan de estudio o en un proyecto con pasos concretos y calendario.',
      },
    ],
  },
  'two-of-swords': {
    meaningLove:
      'Una decisión que no quieres tomar. Aparece cuando estás entre dos personas, entre quedarte e irte, o cuando sabes algo del vínculo y prefieres no mirarlo. La carta muestra una tregua incómoda: nadie discute porque nadie habla. En pareja indica temas evitados que se acumulan detrás de una convivencia educada. Si estás sin pareja, marca a alguien que se protege del riesgo emocional negando lo que siente. La venda no es de otro: te la pusiste tú, y también puedes sacártela.',
    meaningWork:
      'Estancamiento por indecisión. Dos ofertas parecidas, dos caminos, un conflicto entre colegas donde te niegas a tomar partido. La carta describe el empate estratégico: mientras no decidas, no pierdes, pero tampoco avanzas. Suele aparecer cuando falta información y también cuando la información está y molesta. En el dinero señala cuentas que no quieres revisar. Poner los números sobre la mesa suele ser menos grave que la fantasía que estás sosteniendo por no mirarlos.',
    meaningWellbeing:
      'La tensión de lo no resuelto se instala en el cuerpo: hombros duros, mandíbula apretada, sueño liviano. No hay crisis, hay una espera que desgasta despacio. Ayuda todo lo que baje el nivel de alerta sin exigir decisiones: respirar con calma, caminar, dejar la cabeza en pausa un rato. El ánimo mejora apenas nombras aquello que estás evitando, aunque todavía no lo resuelvas. Lo que agota no es el problema, es sostener la venda.',
    symbolism:
      'Una mujer sentada de espaldas al mar sostiene dos espadas cruzadas sobre el pecho, con los ojos vendados y la postura rígida: la defensa perfecta y también la parálisis perfecta. La venda impide ver; los brazos cruzados impiden recibir. Detrás, el agua está apenas rizada y hay rocas dispersas, las emociones que no está mirando. Sobre el horizonte asoma una luna creciente, señal de que el proceso recién empieza. El banco de piedra es firme: podría quedarse ahí mucho tiempo, y ese es exactamente el riesgo.',
    advice:
      'Saca la venda y mira. La decisión que estás evitando no se va a resolver sola, y cada semana que pasa le suma costo. Junta la información que te falta, ponle plazo a la elección y comprométete con la fecha. Si las dos opciones te parecen iguales, elige la que te da más miedo: suele ser la que importa.',
    yesNo:
      'Indefinido por ahora. La carta describe una decisión pendiente más que un resultado; la respuesta aparece recién cuando dejes de esquivar la elección.',
    combinations: [
      {
        cardSlug: 'the-moon',
        reading:
          'No ves y además lo que crees ver está distorsionado. Es la peor combinación para decidir: junta datos objetivos y posterga la elección hasta que se despeje la niebla.',
      },
      {
        cardSlug: 'the-lovers',
        reading:
          'La decisión es afectiva y ya no admite postergación. Hay que elegir entre dos caminos del corazón, y no elegir también es una respuesta que el otro va a leer.',
      },
      {
        cardSlug: 'six-of-swords',
        reading:
          'La salida es aceptar la pérdida e irte. Una vez que sacas la venda, el movimiento se vuelve evidente: dejar el lugar en calma y empezar el traslado.',
      },
      {
        cardSlug: 'the-high-priestess',
        reading:
          'La respuesta ya la sabes por dentro, aunque no puedas justificarla. Deja de buscar más argumentos externos y escucha lo que ya te venía diciendo la intuición.',
      },
    ],
  },
  'three-of-swords': {
    meaningLove:
      'Es la carta del corazón atravesado: una traición, una separación, una verdad que llega tarde y duele. También aparece en triángulos amorosos y en distancias que se hacen insoportables. No la suaviza nada: describe una herida real y reciente. Lo que aporta es la nitidez, porque el dolor de esta carta viene con información. Lo que se rompió aquí ya no se puede desconocer, y esa claridad, con el tiempo, es lo que permite reconstruir sobre algo que sea cierto.',
    meaningWork:
      'Una mala noticia que se veía venir: un despido, un proyecto cancelado, una crítica dura que da en el blanco. También marca ambientes donde se habla mal a espaldas o donde alguien rompió un acuerdo. Es un golpe concreto y no una catástrofe permanente: la lluvia de la carta pasa. En el bolsillo, indica una pérdida puntual o un contrato que se cae. Toca aceptar el número real, hacer el duelo corto y rearmar el plan con lo que quede.',
    meaningWellbeing:
      'La tristeza pesa en el cuerpo y la carta no la apura: cansancio, ganas de no hacer nada, la sensación de moverse en cámara lenta. Lo que mejor funciona ahora es lo básico sostenido: dormir, comer con horarios, salir un rato aunque no tengas ganas y hablar con alguien de confianza. Evita las decisiones importantes hasta que el ánimo se acomode. El llanto, en esta carta, es descarga y no debilidad.',
    symbolism:
      'Tres espadas atraviesan un corazón rojo suspendido en el aire, sobre un fondo de nubes cargadas y lluvia constante. No hay figuras humanas: el dolor está mostrado en estado puro, sin escena ni contexto, porque en este golpe todos se reconocen. Las espadas entran limpias, sin sangre, y forman un equilibrio casi geométrico: la herida aquí viene de la palabra y de la conciencia, no de la violencia. La lluvia gris, densa, cubre todo el fondo. Y como toda lluvia en el Tarot, se entiende que va a parar.',
    advice:
      'Deja que duela sin apurar la cicatriz. Nombrar lo que pasó con palabras exactas —no con eufemismos ni con exageraciones— es lo que empieza a ordenar el golpe. Habla con alguien que te escuche sin dar consejos. Y no tomes decisiones definitivas mientras la herida esté abierta: lo que hoy parece irreversible se ve distinto en un par de semanas.',
    yesNo:
      'No. La carta anticipa dolor o una verdad difícil en el camino de lo que estás preguntando, y conviene prepararse en lugar de insistir.',
    combinations: [
      {
        cardSlug: 'the-star',
        reading:
          'Después de la herida llega la calma que repara. Es de las mejores noticias posibles tras un golpe: la lluvia para, la confianza vuelve y el proceso avanza sin apuro.',
      },
      {
        cardSlug: 'the-lovers',
        reading:
          'Un triángulo o una elección que rompe un vínculo. Alguien va a salir lastimado en esta historia y la carta pide que la decisión, al menos, se tome de frente.',
      },
      {
        cardSlug: 'eight-of-cups',
        reading:
          'El dolor termina en una partida. Una vez dicho lo que había que decir, quedarse ya no tiene sentido: la salida es la única forma de que la herida deje de abrirse.',
      },
      {
        cardSlug: 'temperance',
        reading:
          'La reconciliación es posible si hay paciencia. No se arregla con una conversación sino con muchas pequeñas: el proceso pide tiempo y dosis medidas de acercamiento.',
      },
    ],
  },
  'four-of-swords': {
    meaningLove:
      'Pausa. La relación necesita un tiempo de silencio para no seguir desgastándose en discusiones repetidas. No es ruptura: es tregua consciente. Aparece cuando hace falta bajar la intensidad, dejar de hablar del mismo tema y recuperar el aire. Si estás sin pareja, indica una etapa de recogimiento voluntario después de un desgaste afectivo, y avisa que está bien no buscar a nadie por un rato. Lo que se repara en este descanso vuelve mucho mejor que lo que se fuerza.',
    meaningWork:
      'Necesitas parar. La carta llega cuando el rendimiento cae por agotamiento acumulado y seguir empujando ya no rinde. Indica licencias, pausas entre proyectos, un fin de semana sin abrir el correo. También aparece en procesos que están detenidos por causas ajenas y donde lo mejor es esperar sin desesperar. En el dinero, un tiempo sin movimientos: no es el momento de invertir ni de lanzar nada, sino de dejar que las cosas se acomoden.',
    meaningWellbeing:
      'El cuerpo pide descanso profundo y la carta lo autoriza sin culpa. Dormir bien, quedarte quieto, bajar la cantidad de estímulos: eso es lo que corresponde ahora. Es una etapa excelente para el silencio, la meditación y las rutinas que no exigen rendimiento. El ánimo se recupera solo si le das tiempo. Forzar actividad en este tramo es lo que estira el cansancio; entregarse a la pausa es lo que lo acorta.',
    symbolism:
      'La efigie de un caballero yace horizontal sobre una tumba de piedra dentro de una capilla, con las manos juntas en oración. Tres espadas cuelgan de la pared sobre él y una cuarta descansa tallada bajo su cuerpo: los conflictos siguen ahí, pero están guardados, no en uso. Un vitral colorido muestra una escena de bendición con dos figuras: el descanso tiene algo de sagrado. La quietud es total. Es la única carta del palo donde nadie sufre, porque nadie está peleando.',
    advice:
      'Para de verdad, no a medias. Un descanso con el teléfono al lado no descansa nada: aparta un día entero, avisa que no vas a estar disponible y sosténlo. Lo que estás tratando de resolver a fuerza de insistencia se va a acomodar solo cuando le saques presión. Vuelve recién cuando tengas energía, no cuando se te acabe la culpa.',
    yesNo:
      'Todavía no: es momento de esperar. La respuesta no es negativa, es un aplazamiento; la situación se define mejor después de un período de pausa.',
    combinations: [
      {
        cardSlug: 'the-hermit',
        reading:
          'Retiro profundo y elegido. La soledad de esta etapa no es abandono sino trabajo interno: lo que encuentres en el silencio va a orientar la decisión siguiente.',
      },
      {
        cardSlug: 'eight-of-wands',
        reading:
          'La pausa se interrumpe de golpe. Todo se acelera justo cuando necesitabas parar: prioriza sin culpa y responde solo lo que de verdad no puede esperar.',
      },
      {
        cardSlug: 'ten-of-wands',
        reading:
          'El descanso llega después de una sobrecarga larga. No es pereza, es reparación: la combinación insiste en que sueltes tareas antes de volver al ritmo anterior.',
      },
      {
        cardSlug: 'judgement',
        reading:
          'De la quietud sale un llamado claro. La pausa no era un paréntesis vacío: era el espacio necesario para escuchar hacia dónde va la etapa que empieza.',
      },
    ],
  },
  'five-of-swords': {
    meaningLove:
      'Se gana la discusión y se pierde el vínculo. Aparece en peleas donde alguien necesita tener razón por encima de todo, en reproches que humillan y en conversaciones que dejan cicatriz. También marca vínculos donde la competencia reemplazó a la complicidad. La carta no reparte culpas de manera prolija: muestra que el costo del triunfo es la distancia. Si vienes de una discusión así, la pregunta útil no es quién tenía razón sino qué quieres conservar.',
    meaningWork:
      'Ambiente hostil: competencia desleal, alguien que se lleva el crédito, victorias conseguidas pasando por encima de otros. Puede ser que estés del lado que gana o del que perdió, y en ninguno de los dos la carta trae buenas noticias de fondo. Es un aviso para elegir bien las batallas y para revisar si ese logro vale el clima que deja. En el bolsillo, ganancias con costo relacional: contratos que se firman rompiendo confianza.',
    meaningWellbeing:
      'La hostilidad sostenida desgasta más que el trabajo. El cuerpo acumula tensión, el sueño se pone liviano y el ánimo se vuelve irritable con cualquiera. Lo que ayuda es sacar la energía del conflicto: mover el cuerpo, alejarte físicamente del ambiente tenso, cortar las conversaciones que se repiten sin avanzar. Revisa cuánto tiempo por día dedicas a discutir en la cabeza con alguien que ni siquiera está presente.',
    symbolism:
      'Un hombre de expresión burlona recoge tres espadas y mira por encima del hombro a dos figuras que se alejan cabizbajas hacia la orilla, dejando sus armas en el suelo. El vencedor está solo en primer plano: ganó y no tiene con quién festejar. El cielo está agitado con nubes irregulares y el mar detrás se ve revuelto. Es una de las pocas cartas del Tarot narradas desde el punto de vista del que gana, y aun así el clima es de derrota. La pregunta que deja es cuánto costó ese triunfo.',
    advice:
      'Elige entre tener razón y tener el vínculo. Si la discusión ya llegó al punto de humillar, retírate aunque estés ganando: no hay victoria que compense un puente quemado. Si fuiste el que perdió, junta tus espadas y sal del campo sin dar la revancha. Y revisa qué necesidad tuya se está satisfaciendo con esa pelea.',
    yesNo:
      'No, o sí a un costo que no conviene pagar. La carta advierte que el resultado se obtiene rompiendo algo importante en el camino.',
    combinations: [
      {
        cardSlug: 'seven-of-swords',
        reading:
          'Hay engaño detrás del conflicto. Alguien está jugando con información oculta o quedándose con algo que no le corresponde: revisa los detalles antes de seguir discutiendo de frente.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'La pelea se volvió un vínculo en sí misma. Discuten porque no saben estar de otra manera: la dupla pide cortar el circuito antes de buscar quién empezó.',
      },
      {
        cardSlug: 'temperance',
        reading:
          'Hay una salida negociada disponible. Si alguno baja el tono primero, el conflicto se desarma más rápido de lo que ambos creen. Sé tú quien lo hace.',
      },
      {
        cardSlug: 'six-of-swords',
        reading:
          'Después del conflicto, la partida. No hay reconciliación en el corto plazo: lo que corresponde es alejarse y dejar que el tiempo baje la temperatura.',
      },
    ],
  },
  'six-of-swords': {
    meaningLove:
      'Se pasa a una etapa más tranquila después de un período difícil. Puede ser una mudanza, una separación que se resuelve en calma o el momento en que dejas de discutir y aceptas lo que pasó. No es alegría todavía: es alivio. En pareja indica que los dos deciden dejar atrás un conflicto y avanzar sin revolverlo más. Si estás sin pareja, marca la salida de un vínculo que dolía y el comienzo de un tiempo más sereno, todavía sin destino claro.',
    meaningWork:
      'Un cambio necesario que se hace sin escándalo: cambiar de trabajo, de rubro, de ciudad. La carta indica transición ordenada, muchas veces con ayuda de alguien que te guía o te lleva. También aparece en viajes laborales y en procesos de mudanza de la empresa. Del lado del dinero, un tramo de recursos ajustados durante el traslado, con mejora a la vista. Lo importante es no llevarse a la nueva etapa las mismas discusiones de la anterior.',
    meaningWellbeing:
      'La energía empieza a recuperarse despacio, como quien sale de una etapa larga de tensión. El cuerpo agradece los cambios de escenario: salir de la casa, viajar aunque sea cerca, cambiar el recorrido diario. El descanso mejora a medida que la cabeza deja de repasar lo que quedó atrás. Es una etapa suave, sin impulso, donde lo mejor que puedes hacer es no exigirte volumen y dejar que la calma se instale sola.',
    symbolism:
      'Un barquero empuja con una pértiga una barca en la que viajan una mujer envuelta en un manto y un niño, ambos de espaldas. Seis espadas están clavadas en la madera de la barca: el equipaje del dolor viaja con ellos, pero ya no en las manos. El agua del lado izquierdo está agitada y del lado derecho, hacia donde van, se ve calma y una costa arbolada. Nadie mira atrás. La escena es silenciosa, sin drama: hay travesías que se hacen así, sin discurso de despedida.',
    advice:
      'Acepta la mudanza aunque implique dejar cosas. No todo se puede reparar donde se rompió, y a veces avanzar significa cambiar de lugar en lugar de insistir. Llévate lo aprendido y deja el reproche en la orilla. Y si alguien se está ofreciendo a acompañarte en el traslado, acepta la ayuda: esta carta no premia el orgullo de cruzar solo.',
    yesNo:
      'Sí, pero implica dejar algo atrás. La respuesta es favorable en el sentido de una mejora gradual, no de un cambio inmediato ni espectacular.',
    combinations: [
      {
        cardSlug: 'the-world',
        reading:
          'El traslado cierra un ciclo completo y bien terminado. Mudanzas al exterior, cambios de vida definitivos y procesos largos que por fin se cierran de la manera correcta, sin nada pendiente de resolver.',
      },
      {
        cardSlug: 'the-star',
        reading:
          'La travesía lleva a la calma verdadera. Después de este cruce vuelve la confianza: es de las mejores secuencias del mazo para una recuperación emocional.',
      },
      {
        cardSlug: 'five-of-pentacles',
        reading:
          'El cambio se hace con recursos ajustados. Se sale igual, pero con lo justo: planifica el presupuesto del traslado y no cortes vínculos que pueden ayudarte.',
      },
      {
        cardSlug: 'knight-of-cups',
        reading:
          'Alguien acompaña la transición con afecto genuino. No estás cruzando solo, y esa compañía es lo que hace más liviana una etapa que igual iba a suceder.',
      },
    ],
  },
  'seven-of-swords': {
    meaningLove:
      'Hay algo que no se está diciendo. Puede ser una infidelidad, pero mucho más seguido es una omisión: gastos que se ocultan, planes que se hacen aparte, una conversación entera que sucede en la cabeza de uno solo. La carta pide revisar qué información estás guardando y por qué. Si sospechas de alguien, junta datos en vez de acusar. Y si el que oculta eres tú, esta carta avisa que la estrategia funciona a corto plazo y se paga cara después.',
    meaningWork:
      'Alguien se está llevando algo: crédito por tu trabajo, información sensible, un cliente. También describe estrategias inteligentes pero poco transparentes, atajos y acuerdos que no se cuentan a todos. Es momento de proteger tus materiales, guardar respaldos y poner por escrito lo que se acordó de palabra. Para las finanzas, indica movimientos poco claros, gastos que aparecen sin explicación o socios que manejan información que no comparten.',
    meaningWellbeing:
      'La energía se va en sostener algo que no se dice. Guardar un secreto, disimular un malestar o fingir que todo está bien consume mucho más de lo que parece: cansancio raro, sueño interrumpido, la sensación de estar en guardia. El cuerpo mejora apenas la información se ordena, aunque decirla sea incómodo. Revisa también los atajos que estás tomando con tus propias rutinas: en esta carta, hacerse trampa a uno mismo se paga con desgaste.',
    symbolism:
      'Un hombre se escabulle de un campamento militar cargando cinco espadas contra el pecho, mirando por encima del hombro con una sonrisa. Dos espadas quedan clavadas en el suelo detrás de él: no pudo llevárselo todo, y eso lo delata. Camina en puntas de pie sobre el amarillo brillante del terreno, a plena luz del día, lo que subraya el detalle más incómodo de la carta: la maniobra no es tan invisible como el personaje cree. Al fondo, las carpas y las figuras de la tropa siguen su rutina sin notar nada.',
    advice:
      'Revisa qué estás evitando decir y calcula qué te cuesta seguir sosteniéndolo. Si detectas una maniobra ajena, no acuses de inmediato: junta la información y elige el momento. Si el atajo es tuyo, decide si lo asumes de frente o lo abandonas antes de que se descubra solo. Guarda copia de todo lo que sea importante y pon por escrito lo acordado.',
    yesNo:
      'No, o no de la manera que te están contando. Falta información en esta consulta y algo se está manejando de forma poco transparente.',
    combinations: [
      {
        cardSlug: 'the-moon',
        reading:
          'Engaño más confusión: casi nada de lo que te llega es exacto. Verifica cada dato con una fuente independiente que no tenga nada que ganar, y posterga toda decisión importante hasta que la niebla se despeje.',
      },
      {
        cardSlug: 'justice',
        reading:
          'Lo oculto sale a la luz y se resuelve formalmente. La maniobra se descubre y hay consecuencias concretas: conviene adelantarse y decir la verdad primero.',
      },
      {
        cardSlug: 'the-magician',
        reading:
          'Habilidad al servicio de una estrategia poco clara. Alguien muy capaz está manejando la escena a su favor y lo hace bien: no subestimes a quien tienes enfrente ni supongas que improvisa.',
      },
      {
        cardSlug: 'four-of-pentacles',
        reading:
          'Se oculta algo relacionado con dinero. Cuentas que no se muestran, bienes que no se declaran o gastos que aparecen tarde: pide los números completos.',
      },
    ],
  },
  'eight-of-swords': {
    meaningLove:
      'Te sientes atrapado en una relación y no ves la salida, aunque exista. Aparece cuando alguien se queda por miedo —a la soledad, al qué dirán, a la reacción del otro— y se convence de que no tiene opciones. También marca vínculos donde uno se anula para no generar conflicto. La carta lo dice sin rodeos: las ataduras están flojas y la venda te la sacas tú. Nadie va a venir a liberarte, y esa es la mala y la buena noticia.',
    meaningWork:
      'Sensación de estar encerrado en un trabajo o en una situación que no elegiste: contratos que atan, jefes que limitan, una carrera que sientes que ya no puedes cambiar. La carta muestra que la limitación es mucho más mental que real. Suele indicar que hay opciones que descartaste sin evaluarlas por sentir que no estabas a la altura. En el dinero, la creencia de que no se puede mejorar el ingreso, sostenida sin haberlo intentado en serio.',
    meaningWellbeing:
      'La cabeza está en modo alarma y el cuerpo lo acompaña: tensión constante, dormir mal, la sensación de no poder frenar los pensamientos. Lo que mejor funciona ahora es lo concreto y pequeño: caminar todos los días, escribir lo que te da vueltas, hablar con alguien de afuera que te devuelva perspectiva. El ánimo mejora en cuanto das un paso real, aunque sea mínimo. La parálisis alimenta el miedo; el movimiento lo desarma.',
    symbolism:
      'Una mujer con los ojos vendados y el cuerpo envuelto en telas rojas está de pie entre ocho espadas clavadas en el barro, dispuestas a su alrededor como una jaula. La jaula está abierta al frente: hay espacio libre por delante y ella no lo ve. Las ataduras del torso son flojas y los pies están libres. El suelo es fangoso y detrás se alza un castillo sobre una roca, la estructura que la mantiene en ese lugar. El cielo gris no amenaza tormenta. Todo el encierro depende de que no se mueva.',
    advice:
      'Da un paso, aunque sea chico, en cualquier dirección. El encierro de esta carta se rompe con acción concreta y no con más análisis. Escribe la lista de opciones que descartaste por imposibles y revisa cuáles descartaste sin intentar. Pide una opinión externa: alguien que no esté adentro del problema va a ver la salida que a ti se te está escapando.',
    yesNo:
      'No mientras sigas creyendo que no puedes. La carta señala una limitación autoimpuesta: la respuesta cambia apenas te muevas del lugar en el que estás parado.',
    combinations: [
      {
        cardSlug: 'the-star',
        reading:
          'La salida llega junto con la esperanza recuperada. Alguien o algo te devuelve la confianza y desde ahí la jaula se ve por lo que es: una construcción mental.',
      },
      {
        cardSlug: 'the-devil',
        reading:
          'Encierro con dependencia: hay algo que te ata y a la vez te resulta cómodo. La combinación pide mirar de frente qué ganas quedándote donde estás.',
      },
      {
        cardSlug: 'ace-of-swords',
        reading:
          'Una verdad corta las ataduras. Basta con nombrar la situación con precisión para que el encierro pierda fuerza: la claridad es aquí la herramienta de rescate.',
      },
      {
        cardSlug: 'knight-of-wands',
        reading:
          'Aparece un impulso que rompe la parálisis. Alguien te empuja o te dan ganas de moverte de golpe: aprovecha ese impulso antes de volver a pensarlo demasiado.',
      },
    ],
  },
  'nine-of-swords': {
    meaningLove:
      'Angustia nocturna por un vínculo: la preocupación que no deja dormir, los pensamientos que se repiten, imaginar escenarios que todavía no ocurrieron. Aparece en relaciones donde el miedo a perder al otro ocupa más espacio que la relación misma, y también después de una separación, cuando las noches son lo más difícil. La carta reconoce el sufrimiento y aporta un dato importante: buena parte de lo que te atormenta a las tres de la mañana no resiste la luz del día.',
    meaningWork:
      'Preocupación intensa por el trabajo o el dinero, muchas veces desproporcionada frente a los hechos reales. Miedo a perder el puesto, a no llegar, a que se descubra que no sabes lo suficiente. La carta no niega que haya un problema: señala que lo estás mirando en el peor momento posible y a solas. Poner los números y los plazos por escrito, a la luz del día, suele reducir el monstruo a un problema manejable con una lista de tareas.',
    meaningWellbeing:
      'El descanso está roto: te acuestas cansado y te despiertas peor, con la cabeza funcionando desde temprano. El desgaste no viene de la actividad del día sino de las horas de preocupación nocturna. Ayudan las rutinas de cierre: apagar pantallas un rato antes, anotar lo que te da vueltas para sacarlo de la cabeza, caminar a la tarde. Y sobre todo, hablarlo con alguien: lo que se dice en voz alta pierde bastante del peso que tenía en silencio.',
    symbolism:
      'Una figura sentada en la cama se cubre el rostro con las manos, despierta en plena noche. Nueve espadas cuelgan horizontales en la pared oscura del fondo, ordenadas y quietas: están ahí, pero ninguna la toca. El cobertor está decorado con rosas y con los signos del zodíaco, señal de que la vida sigue su ciclo mientras la persona sufre. El costado de la cama tiene tallada la escena de un duelo entre dos figuras. Nada en la carta ataca: el tormento es interno, y el amanecer no aparece porque todavía no llegó.',
    advice:
      'Sácalo de tu cabeza y ponlo afuera. Escribe lo que te está atormentando en una hoja, a la mañana, y separa lo que efectivamente pasó de lo que estás imaginando. Cuéntaselo a alguien de confianza aunque te dé pudor. Y si el problema es real, haz una sola cosa concreta hoy para atenderlo: la acción mínima ordena la noche mucho mejor que la voluntad.',
    yesNo:
      'No, aunque el miedo esté exagerando la situación. Conviene revisar cuánto de la respuesta negativa viene de los hechos y cuánto de la preocupación.',
    combinations: [
      {
        cardSlug: 'ten-of-swords',
        reading:
          'El miedo se concreta y toca el fondo. Duele, y a la vez termina la incertidumbre: a partir de aquí lo que sigue es reconstruir sobre algo cierto.',
      },
      {
        cardSlug: 'the-sun',
        reading:
          'Amanece. Lo que en la noche parecía imposible se aclara y resulta mucho menor de lo temido: una de las secuencias más aliviadoras del mazo.',
      },
      {
        cardSlug: 'four-of-swords',
        reading:
          'Necesitas descanso urgente y la carta no lo discute. El tormento viene del agotamiento acumulado, así que parar unos días hace más por ti que cualquier intento de resolverlo a fuerza de pensarlo de noche.',
      },
      {
        cardSlug: 'queen-of-cups',
        reading:
          'Hay alguien dispuesto a escucharte de verdad. La dupla insiste en no atravesar esto en soledad: contarlo cambia el peso de todo lo que estás cargando.',
      },
    ],
  },
  'ten-of-swords': {
    meaningLove:
      'El final. Una relación que termina sin vuelta atrás, una traición que no se puede reparar, el punto en que ya no queda nada por intentar. Es una carta dura y también un alivio: cuando algo tocó fondo, se termina la agonía de sostenerlo. No es la carta del conflicto sino la del después. Lo que promete el amanecer del fondo es que a partir de aquí lo único posible es levantarse, y que ninguna espada más va a caer sobre esa historia.',
    meaningWork:
      'Un cierre abrupto: el despido, el negocio que se funde, el proyecto que se cae del todo. La carta no negocia: eso terminó. Puede venir con la sensación de haber sido apuñalado por la espalda, sobre todo si hubo gente involucrada. El consuelo es estructural: es el diez, el final del ciclo, y lo que sigue es otro comienzo. En el dinero marca una pérdida importante que obliga a rearmar el esquema desde cero, con la ventaja de saber exactamente dónde estás parado.',
    meaningWellbeing:
      'El ánimo tocó fondo y el cansancio ya no se disimula. La carta pide bajar la exigencia a lo elemental —dormir, comer con horarios, salir aunque sea a la esquina— y no montar encima un plan de recuperación ambicioso. Y sobre todo pide compañía: este es el tramo del mazo que menos conviene atravesar en soledad, así que apóyate en alguien y cuenta lo que te está pasando.',
    symbolism:
      'Una figura yace boca abajo en la orilla con diez espadas clavadas en la espalda, cubierta por un manto rojo. La mano derecha está en posición de bendición, un detalle que cambia la lectura entera de la carta: hasta en el peor momento hay un gesto de sentido. El agua está completamente quieta y el cielo negro se abre en el horizonte con una franja dorada: el amanecer ya empezó. Las montañas oscuras cierran el fondo. Diez espadas son demasiadas para un solo golpe, y esa exageración también es el mensaje.',
    advice:
      'Acepta que terminó y deja de intentar revivirlo. La energía que estás poniendo en sostener algo que ya cayó es exactamente la que te falta para empezar lo que sigue. Cuenta lo que pasó, pide ayuda si la necesitas y date un tiempo antes de decidir el próximo paso. Mira el horizonte de la carta: la franja dorada ya está ahí, aunque desde el piso todavía no se vea.',
    yesNo:
      'No. La carta marca un cierre definitivo en lo que estás preguntando, y lo que corresponde es aceptar el final y empezar otra cosa.',
    combinations: [
      {
        cardSlug: 'the-sun',
        reading:
          'Después del final absoluto llega una etapa luminosa. El contraste es enorme: lo que hoy parece el peor momento se lee, meses después, como el principio de algo mejor.',
      },
      {
        cardSlug: 'death',
        reading:
          'Cierre total y transformación profunda. No queda nada del ciclo anterior y tampoco conviene que quede, porque lo que viene después necesita el terreno completamente limpio para poder apoyarse.',
      },
      {
        cardSlug: 'ace-of-pentacles',
        reading:
          'De la ruina sale una oportunidad concreta y verificable. Se cae una estructura y casi enseguida aparece una propuesta material nueva: acéptala aunque todavía no te sientas listo para encararla.',
      },
      {
        cardSlug: 'three-of-swords',
        reading:
          'Herida sobre herida. El golpe llega cuando todavía estabas cerrando el anterior, y por eso pesa el doble: pide ayuda, porque este tramo no está pensado para atravesarse en soledad.',
      },
    ],
  },
  'page-of-swords': {
    meaningLove:
      'Curiosidad y muchas preguntas: alguien que quiere saber todo del otro, a veces con más ansias que delicadeza. Marca vínculos que empiezan con conversaciones largas e intensas, y también etapas de vigilancia —revisar el teléfono, buscar información, sacar conclusiones apuradas—. En pareja aconseja preguntar de frente en lugar de investigar por atrás. Si estás sin pareja, indica que estás observando a alguien con atención: mira los hechos y no solo lo que te gustaría que signifiquen.',
    meaningWork:
      'Aprendizaje, estudio y comunicación: cursos, exámenes, escritura, tareas que exigen investigar. Es la carta del principiante despierto, que pregunta mucho y todavía no tiene experiencia para ordenar la información. También indica noticias que llegan y conviene verificar antes de reenviar. Muy buena para arrancar una carrera o un oficio intelectual. Para las finanzas, ingresos ligados a comunicación, docencia o tareas de análisis, todavía modestos pero prometedores.',
    meaningWellbeing:
      'Mucha actividad mental y poca descarga corporal: la cabeza va a mil y el cuerpo queda sentado. Conviene equilibrar el estudio y las pantallas con movimiento real, aunque sea caminar. El descanso se resiente cuando la mente sigue procesando de noche. Ayuda cerrar el día con algo que no sea información: música, una charla, aire libre. El ánimo es despierto e inquieto, y mejora cuando la curiosidad encuentra un destino en vez de dispersarse.',
    symbolism:
      'Un joven de pie sobre un promontorio sostiene una espada en alto con las dos manos, en actitud de alerta más que de ataque, y mira hacia atrás por encima del hombro. El viento agita su pelo y las nubes se mueven rápido: el Aire está activo en toda la escena. Detrás se ven diez árboles inclinados por el viento y bandadas de pájaros, símbolo de las ideas que van y vienen. El terreno es alto e irregular. La postura tiene algo de ensayo: sostiene el arma sin saber todavía cómo se usa.',
    advice:
      'Pregunta directamente en lugar de deducir. Esta carta se equivoca cuando saca conclusiones con información parcial y acierta cuando investiga en serio. Verifica lo que te contaron antes de repetirlo, toma notas y elige un tema para profundizar en vez de saltar entre diez. Y cuida el filo de lo que dices: la curiosidad honesta funciona, la ironía no.',
    yesNo:
      'Depende de la información con la que estés trabajando. La respuesta se vuelve favorable si te tomas el trabajo de comprobar lo que te contaron antes de avanzar sobre ello.',
    combinations: [
      {
        cardSlug: 'the-high-priestess',
        reading:
          'Estás investigando algo que se maneja en silencio, y el método frontal no va a funcionar. Baja las ganas de preguntar, quédate cerca y deja que la información aparezca sola: acá se averigua escuchando, no interrogando.',
      },
      {
        cardSlug: 'eight-of-wands',
        reading:
          'Noticias que llegan rápido y por escrito. La comunicación se acelera de un día para el otro: responde, pero relee antes de mandar, porque en esta dupla los malentendidos vuelan más rápido que las aclaraciones.',
      },
      {
        cardSlug: 'seven-of-swords',
        reading:
          'Lo que averiguas no es toda la verdad. Alguien está entregando información recortada a propósito y con un objetivo: busca una segunda fuente independiente antes de sacar cualquier conclusión.',
      },
      {
        cardSlug: 'eight-of-pentacles',
        reading:
          'La curiosidad se convierte en oficio. Lo que empezó como interés suelto encuentra método y práctica: excelente para quien está empezando a formarse en algo.',
      },
    ],
  },
  'knight-of-swords': {
    meaningLove:
      'Alguien que llega diciendo todo de golpe: directo, apasionado por las ideas, poco atento al momento oportuno. Marca conversaciones necesarias que se dan sin filtro y también discusiones que escalan por velocidad más que por gravedad. En pareja aparece cuando uno de los dos quiere resolverlo todo ya, en una sola charla. Si describe a una persona, es honesta y algo impaciente: dice la verdad sin medir el impacto, y después se sorprende de la reacción.',
    meaningWork:
      'Avance veloz con la mente por delante: proyectos que se lanzan a toda velocidad, argumentos afilados, decisiones tomadas rápido y con convicción. Es excelente para negociar, defender un caso o resolver un problema técnico que estaba trabado. La contra es la falta de detalle: la prisa hace saltear pasos y letra chica. En materia de dinero, movimientos rápidos que pueden salir muy bien o muy mal según cuánto hayas verificado antes de firmar.',
    meaningWellbeing:
      'La cabeza va más rápido que el cuerpo y eso se siente: tensión, apuro, dificultad para frenar aunque estés cansado. La energía es alta pero no está bien distribuida. Ayuda mucho la actividad física intensa para descargar, y también las pausas forzadas: comer sin pantalla, caminar sin objetivo, dormir sin repasar el día. El ánimo es combativo y algo impaciente; bajar la velocidad es aquí el mejor cuidado disponible.',
    symbolism:
      'Un caballero de armadura carga a galope tendido con la espada en alto y el cuerpo inclinado hacia adelante. El caballo blanco tiene los ojos muy abiertos y las patas estiradas al máximo: nadie está midiendo el terreno. Las nubes se ven revueltas y los árboles del fondo están doblados por el viento, mientras los pájaros vuelan en desorden. La armadura está decorada con pájaros y mariposas, símbolos del Aire. Es la carta más veloz del mazo, y su riesgo está escrito en la escena: nadie mira dónde termina la carga.',
    advice:
      'Avanza, pero verifica antes de firmar y respira antes de contestar. Tu claridad y tu velocidad son una ventaja real en esta situación: no las desperdicies por saltarte los detalles. Escribe el mensaje difícil y mándalo recién al día siguiente. Y elige bien contra quién cargas: mucha de la energía de esta carta se gasta en batallas que no cambian nada.',
    yesNo:
      'Sí, y rápido, aunque sin garantía de precisión. La respuesta favorable llega con velocidad; los detalles son los que después piden revisión.',
    combinations: [
      {
        cardSlug: 'the-chariot',
        reading:
          'Velocidad con dirección firme. Todo lo que necesite avanzar de golpe encuentra aquí el impulso perfecto: mudanzas que se resuelven, trámites trabados que se destraban y decisiones que venían durmiendo hace meses.',
      },
      {
        cardSlug: 'five-of-swords',
        reading:
          'La carga termina en un conflicto con costo. Ganas la discusión y rompes algo en el camino: mide si esa pelea vale lo que va a dejar atrás.',
      },
      {
        cardSlug: 'the-hanged-man',
        reading:
          'El apuro choca con un proceso que no se puede acelerar. La combinación aconseja soltar el control y esperar: forzar ahora solo alarga el trámite.',
      },
      {
        cardSlug: 'queen-of-pentacles',
        reading:
          'La velocidad se equilibra con criterio práctico. Alguien con los pies en la tierra ordena el impulso y lo transforma en algo que efectivamente funciona.',
      },
    ],
  },
  'queen-of-swords': {
    meaningLove:
      'Habla de alguien lúcido, honesto y con límites bien puestos, que aprendió a querer sin perderse. En pareja marca una etapa de conversaciones claras y acuerdos explícitos, sin sobreentendidos. Si describe a una persona, es independiente, directa y leal, con una historia previa que le enseñó a no aceptar cualquier cosa. El riesgo de esta figura es la coraza: la lucidez usada como defensa deja afuera también lo bueno. Se equilibra permitiéndose necesitar a alguien de vez en cuando.',
    meaningWork:
      'Criterio profesional afilado: la persona que ve el error en el plan antes que nadie y lo dice sin adornos. Aparece cuando tu aporte es analítico y tu autoridad viene de la experiencia. Excelente para roles de auditoría, coordinación, derecho, comunicación y todo lo que exija pensar con independencia. En materia de dinero, indica decisiones frías y acertadas, sin sentimentalismos. Lo que la carta pide es cuidar el tono: el mismo señalamiento, dicho con más tacto, se acepta mucho mejor.',
    meaningWellbeing:
      'La energía es estable y la mente está clara, pero el cuerpo suele quedar en segundo plano detrás de las obligaciones. Es una buena etapa para poner orden en las rutinas con criterio realista, sin planes ambiciosos que no vas a sostener. Cuida la tensión acumulada de estar siempre alerta y resolviendo lo de todos. Aflojar la exigencia contigo mismo hace más por tu ánimo que cualquier sistema nuevo de organización.',
    symbolism:
      'Una reina se sienta en un trono de piedra tallado con una silfo alada y una guirnalda de flores, sosteniendo la espada erguida en la mano derecha mientras la izquierda se abre hacia adelante, como quien recibe con una condición. Está de perfil, mirando de frente hacia un costado: no elude nada. Una sola nube atraviesa el cielo azul debajo del trono y un pájaro solitario vuela arriba. La borla de su corona y su manto se mueven con el viento. Es la figura del palo que aprendió del dolor sin volverse cruel.',
    advice:
      'Di lo que piensas con claridad y sin disculparte por pensarlo. Tienes la lectura correcta de esta situación y el problema no es tu criterio sino cuánto lo estás guardando. Pon el límite de manera explícita, una vez, y no lo argumentes cinco veces. Y revisa si la independencia que defiendes no se convirtió en una manera elegante de no pedir ayuda nunca.',
    yesNo:
      'Sí, si la decisión resiste el análisis frío. La carta responde a favor de lo razonable y en contra de lo que solo se sostiene con ilusión.',
    combinations: [
      {
        cardSlug: 'justice',
        reading:
          'Criterio y ley alineados. Es una combinación muy favorable para trámites, juicios y acuerdos: lo que decidas con este par tiene fundamento y se sostiene.',
      },
      {
        cardSlug: 'three-of-swords',
        reading:
          'La lucidez viene de una herida vieja. Estás decidiendo con la experiencia del dolor: útil para no repetir errores, riesgoso si te cierra a lo que hoy sí podría funcionar.',
      },
      {
        cardSlug: 'queen-of-cups',
        reading:
          'Razón y sensibilidad juntas en la misma mesa. Puede ser una tensión interna o dos personas complementarias: la mejor decisión sale de escuchar a las dos.',
      },
      {
        cardSlug: 'ten-of-pentacles',
        reading:
          'Decisiones claras sobre patrimonio y familia. Herencias, contratos entre parientes o el ordenamiento de asuntos que se venían postergando por incomodidad: es momento de poner los papeles al día.',
      },
    ],
  },
  'king-of-swords': {
    meaningLove:
      'Alguien que ordena el vínculo con la palabra: define, aclara, propone reglas. En pareja marca la etapa en que las cosas se conversan como adultos y se toman decisiones que dejan de depender del humor del día. Si describe a una persona, es íntegra, exigente y algo reservada con lo que siente. El aviso es conocido: cuando todo se procesa con la cabeza, el otro se queda esperando una señal de calor que no llega. Explicar bien no reemplaza mostrar afecto.',
    meaningWork:
      'Autoridad intelectual y decisiones fundadas: el profesional cuyo criterio se respeta, el que arma la estrategia y sostiene la posición en la negociación difícil. Muy favorable para temas legales, contratos, análisis y roles de dirección. Es una carta de mando ejercido con reglas claras y sin favoritismos. En lo económico indica administración prudente y decisiones bien evaluadas. Lo que hay que vigilar es la rigidez: aplicar la norma sin mirar el caso concreto sale caro con las personas.',
    meaningWellbeing:
      'La disciplina sostiene la energía: en esta etapa las rutinas ordenadas funcionan bien y el cuerpo responde a la estructura. El punto flojo es la desconexión con lo que se siente, que se acumula en tensión y en un descanso poco reparador. Ayuda incorporar algo que no tenga objetivo ni rendimiento: caminar sin medir, escuchar música, cocinar sin apuro. El ánimo mejora cuando la cabeza deja de dirigir absolutamente todo el día.',
    symbolism:
      'Un rey está sentado de frente en un trono de piedra tallado con mariposas y una luna creciente, sosteniendo la espada erguida con una leve inclinación hacia la derecha. Es la carta de la corte con la postura más frontal: mira directamente al consultante. Su manto azul indica el pensamiento y el forro rojo, la pasión que sostiene debajo. Dos pájaros vuelan en el cielo despejado y los árboles del fondo apenas se mueven: el aire está calmo. La espada no amenaza, sostiene una posición. Es autoridad que no necesita gritar.',
    advice:
      'Decide con la cabeza fría y comunica la decisión con claridad. Tienes los elementos para resolver esto de manera justa; lo que falta es enunciar la regla y sostenerla. Escribe lo acordado, revisa los papeles y no dejes nada librado a la interpretación. Y agrega una frase de calidez a lo que digas: la razón sin afecto se recibe como distancia.',
    yesNo:
      'Sí, si es justo y está bien fundado. La respuesta favorece a lo que resiste el escrutinio racional y desestima lo que se apoya solo en el deseo.',
    combinations: [
      {
        cardSlug: 'the-emperor',
        reading:
          'Autoridad doble: criterio afilado y estructura firme. Todo lo formal —contratos, cargos, reglamentos— avanza con solidez y sin objeciones. Es el momento indicado para poner el orden por escrito y firmarlo.',
      },
      {
        cardSlug: 'the-hierophant',
        reading:
          'La norma y la tradición se refuerzan mutuamente. Los trámites institucionales salen bien: es una dupla favorable para lo legal, lo académico y lo oficial.',
      },
      {
        cardSlug: 'ace-of-cups',
        reading:
          'La lógica se ablanda y aparece el afecto. Alguien muy racional se permite sentir: es una de las mejores señales para un vínculo que estaba frío.',
      },
      {
        cardSlug: 'eight-of-swords',
        reading:
          'El exceso de análisis se volvió una jaula. Pensar más no va a resolverlo: la salida aquí es un paso concreto, aunque no tengas todo calculado.',
      },
    ],
  },
};
