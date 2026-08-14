/**
 * Perfiles estáticos de los 12 signos del zodiaco occidental (T-SEO-004).
 *
 * Es el contenido **indexable** de `/horoscopo/[sign]`: no depende de la API, de
 * la sesión ni del día, así que se renderiza en el servidor y llega completo al
 * crawler. El horóscopo del día sigue resolviéndose en el cliente, porque se
 * calcula contra el día calendario **local** del visitante (T-PROD-020): en el
 * servidor mostraría el día del servidor.
 *
 * ⚠️ **El ángulo es deliberado y no se puede cambiar sin romper la tarea.**
 * `/enciclopedia/astrologia/signos/[slug]` ya publica el perfil astrológico del
 * signo (carácter, fortalezas, desafíos, amor, compatibilidades, tarot). Si esta
 * ficha dijera lo mismo, Google agruparía las dos URLs como duplicadas y el
 * trabajo no serviría de nada. Por eso acá se escribe **la lectura diaria**: cómo
 * transcurre un día del signo, qué mirar en cada área del horóscopo de hoy, en
 * qué franja rinde y qué señal conviene atender. La ficha enlaza al artículo de
 * la enciclopedia para el perfil completo, en vez de repetirlo.
 *
 * ⚠️ El texto de cada signo debe ser **único**: doce URLs con el mismo párrafo
 * son contenido duplicado. `zodiac-sign-profiles.data.test.ts` lo verifica.
 *
 * **Qué NO va acá** (se deriva y ya está testeado en `lib/utils/zodiac.ts`):
 * fechas (`getZodiacDateRange`), elemento (`ZODIAC_SIGNS_INFO`), modalidad
 * (`getZodiacModality`), afinidades (`getHarmonicSigns`) y opuesto
 * (`getOppositeSign`). Duplicarlos en el contenido es pedir que se contradigan.
 */

import { ZodiacSign } from '@/types/horoscope.types';

/** Qué mirar en cada área del horóscopo del día, según el signo. */
export interface ZodiacDailyAreas {
  /** Vínculos afectivos en la jornada. */
  love: string;
  /** Energía, descanso y cuerpo. */
  wellness: string;
  /** Trabajo, decisiones y dinero. */
  money: string;
}

/** Ficha estática de un signo, escrita desde la lectura diaria. */
export interface ZodiacSignProfileData {
  /** Titular corto que resume cómo transita el signo un día cualquiera. */
  tagline: string;
  /** Planeta regente, tal como se muestra (moderno, con el tradicional aclarado). */
  rulingPlanet: string;
  /** Dos párrafos: el pulso del día y cómo le sirve el horóscopo diario. */
  intro: [string, string];
  /** Qué observar en cada área de la predicción de hoy. */
  dailyAreas: ZodiacDailyAreas;
  /** Franja del día en la que el signo rinde mejor. */
  bestMoment: string;
  /** La señal a atender cuando el día se pone cuesta arriba. */
  watchOut: string;
  /** Etiquetas cortas de la energía diaria del signo. */
  dailyKeywords: string[];
  /** Por qué fluye con los signos afines (`getHarmonicSigns`). */
  harmonyNote: string;
  /** Qué le devuelve su signo opuesto (`getOppositeSign`) en un día difícil. */
  oppositeNote: string;
}

/**
 * Mínimo de palabras propias que debe aportar cada perfil.
 *
 * El umbral del guardarraíl de T-SEO-001 es 120 palabras **de la página entera**
 * y el criterio de aceptación de T-SEO-004 son 150. Se piden 200 acá para dejar
 * margen: la ficha no es todo lo que la página renderiza, pero sí lo único
 * garantizado cuando la API del horóscopo no responde.
 */
export const MIN_SIGN_PROFILE_WORDS = 200;

export const ZODIAC_SIGN_PROFILES: Record<ZodiacSign, ZodiacSignProfileData> = {
  [ZodiacSign.ARIES]: {
    tagline: 'Arranca el día antes de terminar de despertarse',
    rulingPlanet: 'Marte',
    intro: [
      'Un día de Aries se define en las primeras dos horas. Es el signo que abre la rueda y su forma de habitar la jornada es esa: decide rápido, empieza antes de tener todo resuelto y descubre el plan mientras lo ejecuta. Cuando la mañana le sale bien, el resto del día se acomoda solo; cuando arranca trabada, tiende a forzar en vez de esperar.',
      'Por eso el horóscopo diario le rinde distinto que a otros signos: no lo necesita para saber qué quiere —eso ya lo sabe— sino para elegir dónde poner el empuje. Leerlo temprano, antes de la primera decisión del día, le ahorra el gasto de energía en la puerta equivocada.',
    ],
    dailyAreas: {
      love: 'En el amor, el día de Aries se juega en la franqueza. Dice lo que siente en el momento en que lo siente, y eso acerca o incendia según el timing. Si la predicción de hoy marca tensión afectiva, suele ser cuestión de esperar unas horas antes de contestar.',
      wellness:
        'La energía le sobra de a ratos y se le corta de golpe. El cuerpo de Aries pide movimiento antes que descanso: una caminata o algo físico temprano ordena el resto del día mejor que cualquier pausa forzada.',
      money:
        'Con el dinero es igual de rápido que con todo lo demás. El día favorable es el de empezar algo nuevo o cerrar una negociación estancada; el día difícil es el de la compra impulsiva a las once de la noche.',
    },
    bestMoment:
      'La primera mitad de la mañana. Aries rinde cuando todavía nadie le llenó la agenda y puede elegir el orden de sus propias batallas.',
    watchOut:
      'La impaciencia disfrazada de eficiencia. Cuando empieza a interrumpir a los demás para acelerar, el día ya se le fue de las manos.',
    dailyKeywords: ['Impulso', 'Iniciativa', 'Franqueza', 'Velocidad'],
    harmonyNote:
      'Con los otros signos de fuego se entiende por intensidad compartida, y con los de aire porque le devuelven el plan que a él le falta: ideas y palabras para el envión que ya trae.',
    oppositeNote:
      'Libra le muestra lo que a Aries le cuesta ver en un día apurado: que la otra persona también tiene un tiempo, y que consultar no es perder terreno.',
  },

  [ZodiacSign.TAURUS]: {
    tagline: 'Necesita que el día tenga un ritmo, no una carrera',
    rulingPlanet: 'Venus',
    intro: [
      'El día de Tauro se construye por acumulación. No busca el golpe de suerte ni el giro inesperado: busca que lo de hoy sostenga lo de ayer. Un desayuno tranquilo, la misma silla, el mismo recorrido, y sobre esa base sí puede rendir durante horas sin que se le note el esfuerzo.',
      'Leer el horóscopo del día le sirve sobre todo para anticipar los cambios de plan, que es lo único que lo desarma. Avisado con tiempo, Tauro se adapta mejor de lo que su fama sugiere; avisado sobre la marcha, se planta.',
    ],
    dailyAreas: {
      love: 'En lo afectivo, su día se mide en gestos concretos más que en declaraciones. Un mensaje a la hora acordada o una comida compartida le dicen más que una conversación larga sobre el vínculo.',
      wellness:
        'El cuerpo le avisa antes que la cabeza. Cuando el día viene cargado, Tauro lo siente en la espalda, en el cuello o en el apetito: atender eso temprano le evita arrastrar la tensión hasta la noche.',
      money:
        'Es el área donde su horóscopo diario suele ser más útil. Tauro no improvisa con el dinero, así que una señal de oportunidad la aprovecha con calma y una de riesgo le confirma que hoy no toca mover nada.',
    },
    bestMoment:
      'La tarde larga, después del almuerzo. Con el día ya encaminado y sin sorpresas pendientes, Tauro entra en su mejor velocidad de crucero.',
    watchOut:
      'La resistencia automática. Si nota que dijo que no antes de escuchar la propuesta completa, conviene volver a preguntar más tarde.',
    dailyKeywords: ['Constancia', 'Ritmo propio', 'Disfrute', 'Seguridad'],
    harmonyNote:
      'Con los signos de tierra comparte el gusto por lo que se puede tocar, y con los de agua encuentra la temperatura emocional que a su día le falta cuando se vuelve demasiado práctico.',
    oppositeNote:
      'Escorpio le devuelve la pregunta incómoda que Tauro evita en un día cómodo: qué está sosteniendo por costumbre y ya no por deseo.',
  },

  [ZodiacSign.GEMINI]: {
    tagline: 'Un día suyo tiene tres conversaciones y dos planes nuevos',
    rulingPlanet: 'Mercurio',
    intro: [
      'Géminis vive el día en fragmentos y eso no es un defecto: es su manera de procesar. Empieza algo, se cruza con una idea mejor, vuelve a lo primero con información nueva. Al final de la jornada suele haber avanzado en varios frentes, aunque ninguno se vea terminado a la mitad del día.',
      'El horóscopo diario le funciona como filtro. Con tantos estímulos disponibles, la predicción le sirve para decidir a cuál de todas las conversaciones abiertas conviene darle tiempo hoy y cuál puede esperar sin costo.',
    ],
    dailyAreas: {
      love: 'En el amor necesita que el día traiga tema. Un intercambio interesante lo acerca más que cualquier gesto solemne, y el silencio prolongado lo inquieta antes que la discusión.',
      wellness:
        'Su cansancio es mental antes que físico. Cuando el día se le llena de pantallas y mensajes, lo que le devuelve energía no es dormir más sino cortar el flujo de información un rato.',
      money:
        'Con el dinero se mueve por información: se entera de algo, compara, decide. Los días favorables suelen traer un dato o un contacto útil, más que una cifra.',
    },
    bestMoment:
      'El mediodía y el rato inmediatamente posterior, cuando ya tiene el pulso de lo que pasa y todavía le queda jornada para usarlo.',
    watchOut:
      'La dispersión que se siente productiva. Si a las seis de la tarde no puede nombrar una cosa terminada, el día se le fue en abrir puertas.',
    dailyKeywords: ['Curiosidad', 'Palabra', 'Versatilidad', 'Contacto'],
    harmonyNote:
      'Con los signos de aire comparte el idioma —se entienden sin explicarse— y con los de fuego encuentra a quien convierte en acción las ideas que él suelta al pasar.',
    oppositeNote:
      'Sagitario le recuerda que juntar datos no es lo mismo que tener una dirección, y que a veces el día pide una sola pregunta grande en lugar de veinte chicas.',
  },

  [ZodiacSign.CANCER]: {
    tagline: 'Su día depende del clima emocional de la casa',
    rulingPlanet: 'la Luna',
    intro: [
      'Cáncer arranca el día leyendo el ambiente antes que la agenda. Si en casa hay algo sin resolver, lo va a llevar puesto a todos lados; si el clima está tranquilo, rinde con una capacidad de cuidado y de detalle que pocos signos sostienen tantas horas seguidas.',
      'Como su regente es la Luna, que cambia de signo cada dos días y medio, su humor tiene un vaivén más marcado que el del resto. El horóscopo diario le sirve justamente para eso: para distinguir lo que está pasando de verdad de lo que está sintiendo hoy.',
    ],
    dailyAreas: {
      love: 'Es el área que le ordena el resto del día. Cáncer necesita saber que el vínculo está bien antes de poder ocuparse de otra cosa, y una conversación pendiente le pesa más que una jornada difícil de trabajo.',
      wellness:
        'Su energía sube y baja con la marea del ánimo. Las horas de sueño y una comida tranquila en casa le reparan más que cualquier rutina exigente cuando el día vino movido.',
      money:
        'Con el dinero es previsor y algo aprensivo: piensa en el resguardo antes que en la ganancia. Un día favorable en esta área suele traducirse en tranquilidad, no en riesgo.',
    },
    bestMoment:
      'El final de la tarde y la noche temprana, cuando el ruido del día bajó y puede ocuparse de lo suyo sin que nadie le pida atención.',
    watchOut:
      'Guardarse la molestia. Cáncer no discute: se retira, y si el día termina con un silencio raro, ahí está el tema sin decir.',
    dailyKeywords: ['Cuidado', 'Intuición', 'Memoria', 'Hogar'],
    harmonyNote:
      'Con los signos de agua se entiende sin traducir lo que siente, y con los de tierra encuentra la estructura que sostiene su mundo emocional cuando el día lo desborda.',
    oppositeNote:
      'Capricornio le aporta lo que a Cáncer le cuesta en un día sensible: separar el asunto del sentimiento y resolver primero lo que tiene arreglo concreto.',
  },

  [ZodiacSign.LEO]: {
    tagline: 'El día le rinde cuando algo suyo se ve',
    rulingPlanet: 'el Sol',
    intro: [
      'Leo necesita que la jornada tenga un momento de brillo, aunque sea chico: una idea que se acepta, un trabajo que alguien reconoce, una charla en la que se ríen de su chiste. No es vanidad, es combustible. Con ese reconocimiento adelante, sostiene un nivel de generosidad y de empuje que arrastra al grupo entero.',
      'El horóscopo del día le sirve para ubicar dónde está hoy ese escenario. Leo pierde tiempo cuando insiste en lucirse justo donde nadie está mirando, y lo gana cuando pone su energía en el frente que sí tiene público.',
    ],
    dailyAreas: {
      love: 'En el amor, su día mejora con una demostración clara. Leo da mucho y espera que se note lo que recibe: un gesto explícito le cambia la jornada más que una semana de acuerdos tácitos.',
      wellness:
        'Su energía es fuerte pero no infinita, y suele gastarla toda de una. Un descanso planificado a mitad del día le evita el bajón de las siete de la tarde, que es cuando se le nota el desgaste.',
      money:
        'Es generoso con el dinero, incluso cuando la cuenta no acompaña. Los días de invitar a todos conviene mirarlos con la predicción financiera al lado.',
    },
    bestMoment:
      'El horario central del día, cuando hay gente alrededor. Leo rinde en compañía y se apaga cuando le toca una jornada entera en soledad.',
    watchOut:
      'El orgullo que se ofende rápido. Si algo menor le arruinó la mañana, el tema no era ese comentario sino sentirse pasado por alto.',
    dailyKeywords: ['Presencia', 'Generosidad', 'Calidez', 'Reconocimiento'],
    harmonyNote:
      'Con los signos de fuego comparte el volumen y el entusiasmo, y con los de aire consigue quien celebre y difunda lo que él propone, que es exactamente lo que le da sentido a su día.',
    oppositeNote:
      'Acuario le recuerda que hay logros que no llevan firma, y que el día también rinde cuando el resultado es del grupo y no de una persona.',
  },

  [ZodiacSign.VIRGO]: {
    tagline: 'Ordena el día para poder confiar en él',
    rulingPlanet: 'Mercurio',
    intro: [
      'Virgo no empieza el día: lo prepara. Revisa la lista, calcula los tiempos reales, deja resuelto lo que puede fallar. Esa preparación es lo que le permite después ocuparse del detalle con una precisión que el resto agradece y rara vez ve.',
      'La predicción diaria le resulta útil como control de calidad, no como oráculo: le sirve para chequear si el plan que armó anoche sigue siendo el mejor con la información de hoy, y para bajarle el volumen a la autocrítica cuando algo se corre de lugar.',
    ],
    dailyAreas: {
      love: 'Demuestra afecto resolviendo cosas. En un día afectivamente cargado, Virgo se acerca ofreciendo ayuda concreta, y ahí conviene leer el gesto y no esperar la frase.',
      wellness:
        'Es el signo que más somatiza la exigencia. Digestión, sueño liviano y tensión en los hombros son sus indicadores tempranos de que el día se le está haciendo demasiado.',
      money:
        'Administra bien y revisa dos veces. Su día favorable en esta área es el de encontrar el error en la cuenta o el gasto que sobraba, más que el de la ganancia inesperada.',
    },
    bestMoment:
      'La mañana entera, con la cabeza fresca y la lista todavía intacta. Es cuando su capacidad de análisis rinde sin esfuerzo.',
    watchOut:
      'Corregir lo que ya estaba bien. Cuando el día se le va en pulir un detalle que nadie va a notar, la exigencia dejó de ser útil.',
    dailyKeywords: ['Precisión', 'Método', 'Servicio', 'Análisis'],
    harmonyNote:
      'Con los signos de tierra comparte el criterio de lo que es real y lo que no, y con los de agua aprende que hay cosas que no se resuelven con un método, sino con presencia.',
    oppositeNote:
      'Piscis le ofrece el permiso que Virgo no se da en un día perfeccionista: dejar algo sin terminar y aceptar que igual funciona.',
  },

  [ZodiacSign.LIBRA]: {
    tagline: 'Un día equilibrado le importa más que un día ganado',
    rulingPlanet: 'Venus',
    intro: [
      'Libra atraviesa la jornada midiendo el clima entre las personas. Percibe la tensión antes de que se diga en voz alta y actúa para desactivarla, muchas veces a costa de postergar lo propio. Cuando el ambiente está en paz, su capacidad de negociar y de encontrar la salida elegante no tiene competencia.',
      'El horóscopo diario le sirve para lo que más le cuesta: decidir. Libra sopesa opciones hasta que se le va el día, y una señal externa suele ser el empujón que necesita para elegir de una vez y seguir.',
    ],
    dailyAreas: {
      love: 'Es el eje de su día. Libra piensa de a dos incluso cuando está solo, y una asimetría en el vínculo —dar mucho más de lo que recibe— le tiñe todas las demás horas.',
      wellness:
        'La tensión no resuelta le pesa físicamente. Un día de conflicto evitado le deja el cuerpo cansado sin haber hecho nada, y ahí la salida es hablar, no descansar más.',
      money:
        'Gasta en lo que embellece el día: el entorno, la ropa, la mesa. Su predicción financiera favorable suele coincidir con acuerdos y sociedades, que es donde mejor se mueve.',
    },
    bestMoment:
      'La media tarde, en el ida y vuelta con otros. Libra necesita interlocutor para dar lo mejor, y en soledad rinde a media máquina.',
    watchOut:
      'El sí automático. Si terminó el día con la agenda llena de compromisos ajenos, el problema no fue el tiempo sino la dificultad para decir que no.',
    dailyKeywords: ['Equilibrio', 'Acuerdo', 'Estética', 'Vínculo'],
    harmonyNote:
      'Con los signos de aire comparte el gusto por conversar hasta entender, y con los de fuego consigue la decisión rápida que a su día le falta cuando queda atrapado entre dos opciones parecidas.',
    oppositeNote:
      'Aries le devuelve algo simple y difícil: que hay días en los que primero va lo propio, y que elegir sin consultar a nadie también es una forma válida de resolver.',
  },

  [ZodiacSign.SCORPIO]: {
    tagline: 'Lee el día en lo que nadie dijo en voz alta',
    rulingPlanet: 'Plutón (Marte en la tradición)',
    intro: [
      'Escorpio no vive la jornada en la superficie. Registra el tono con el que le contestaron, la pausa antes de una respuesta, lo que se evitó nombrar en una reunión. Esa lectura le da una ventaja real —se entera de las cosas antes— y también un peso: procesa mucho más material del que el día parecía traer.',
      'La predicción diaria le sirve para dosificar esa intensidad. Escorpio tiende a jugar cada asunto a todo o nada, y saber qué frente conviene sostener hoy le evita gastar en una batalla que no era.',
    ],
    dailyAreas: {
      love: 'En el amor no hay término medio: el día está bien o está en revisión. Escorpio necesita verdad antes que armonía, y una conversación difícil lo alivia más que un silencio amable.',
      wellness:
        'Su energía es profunda y se recupera en soledad. Cuando el día lo dejó expuesto, lo que lo repara es un rato sin nadie mirando, no más actividad.',
      money:
        'Es estratégico y reservado con sus números. Sus días favorables suelen tener que ver con recursos compartidos —acuerdos, deudas, sociedades— más que con el gasto cotidiano.',
    },
    bestMoment:
      'La noche, cuando bajó el ruido. Es la franja en la que Escorpio piensa con más claridad y toma sus decisiones importantes.',
    watchOut:
      'La sospecha que crece sin datos. Si a media tarde ya armó una historia completa sobre la intención de alguien, conviene preguntar antes de concluir.',
    dailyKeywords: ['Intensidad', 'Estrategia', 'Verdad', 'Profundidad'],
    harmonyNote:
      'Con los signos de agua no necesita explicar lo que percibe, y con los de tierra encuentra el terreno firme donde apoyar una intensidad que, sola, se le vuelve en contra.',
    oppositeNote:
      'Tauro le ofrece la calma que Escorpio no se permite en un día removido: que algunas cosas están bien como están y no hay nada que investigar.',
  },

  [ZodiacSign.SAGITTARIUS]: {
    tagline: 'Necesita que el día apunte a algún lado',
    rulingPlanet: 'Júpiter',
    intro: [
      'Sagitario soporta cualquier jornada exigente si tiene sentido, y ninguna rutina cómoda si no lo tiene. Su manera de habitar el día es ir hacia adelante: un viaje, un proyecto, una idea grande, algo que abra el horizonte más allá de la lista de pendientes.',
      'Por eso el horóscopo diario le funciona mejor como brújula que como agenda. No le interesa tanto el detalle de la hora como saber si el día empuja en la dirección que ya venía tomando o le está pidiendo corregir el rumbo.',
    ],
    dailyAreas: {
      love: 'En el vínculo necesita aire y verdad. Un día afectivo bueno para Sagitario es el de la conversación honesta y el plan compartido, y uno difícil, el de sentirse vigilado.',
      wellness:
        'La energía le vuelve con movimiento y cambio de escenario. Salir a otro lado, aunque sea a la vuelta, le levanta el día más que dormir la siesta.',
      money:
        'Es optimista con las cifras, a veces de más. Su predicción financiera vale sobre todo para los días de entusiasmo, cuando conviene revisar el número antes de comprometerlo.',
    },
    bestMoment:
      'La mañana ya empezada y el primer tramo de la tarde, cuando el día está abierto y todavía se puede cambiar de plan sin romper nada.',
    watchOut:
      'La promesa hecha con entusiasmo. Sagitario dice que sí a lo que le parece posible hoy y le queda grande el jueves.',
    dailyKeywords: ['Horizonte', 'Entusiasmo', 'Sentido', 'Libertad'],
    harmonyNote:
      'Con los signos de fuego comparte la temperatura y el impulso, y con los de aire encuentra con quién pensar en voz alta las ideas que necesita antes de salir corriendo hacia ellas.',
    oppositeNote:
      'Géminis le muestra el detalle que su mirada amplia se saltea, y que a veces la respuesta del día está en lo cercano y no en el próximo destino.',
  },

  [ZodiacSign.CAPRICORN]: {
    tagline: 'Cada día es un tramo de algo más largo',
    rulingPlanet: 'Saturno',
    intro: [
      'Capricornio mide la jornada por lo que deja construido. No le interesa el día brillante y aislado: le interesa que lo de hoy sirva dentro de seis meses. Esa mirada larga le da una resistencia enorme y una capacidad de sostener el esfuerzo cuando ya nadie está mirando.',
      'El horóscopo diario le sirve como parte del cálculo: qué frente conviene empujar hoy y cuál puede esperar sin costo. Leerlo no le cambia la meta, le ajusta el orden.',
    ],
    dailyAreas: {
      love: 'Demuestra el afecto haciéndose cargo. En un día cargado, Capricornio prioriza cumplir con lo prometido antes que decirlo bonito, y ahí es donde hay que leerlo.',
      wellness:
        'Aguanta más de lo que le conviene. Su indicador no es el cansancio, que ignora, sino la rigidez del cuerpo y la falta de ganas de cualquier cosa que no sea productiva.',
      money:
        'Es el terreno donde se siente más cómodo. Planifica, reserva, sostiene. Su día favorable en esta área es el del avance concreto, aunque sea chico.',
    },
    bestMoment:
      'Temprano, antes de que empiecen las interrupciones. Es la franja donde Capricornio adelanta lo que después no tendrá tiempo de hacer.',
    watchOut:
      'La exigencia que no afloja. Si el día terminó y siente que igual no alcanzó, el problema es la vara, no la jornada.',
    dailyKeywords: ['Estructura', 'Perseverancia', 'Estrategia', 'Compromiso'],
    harmonyNote:
      'Con los signos de tierra comparte el criterio de lo que vale la pena sostener, y con los de agua recupera el registro emocional que su día productivo deja afuera.',
    oppositeNote:
      'Cáncer le devuelve la pregunta que Capricornio posterga: para quién es todo esto, y si el día también dejó lugar para los suyos.',
  },

  [ZodiacSign.AQUARIUS]: {
    tagline: 'Hace el día a su manera, aunque la de todos funcione',
    rulingPlanet: 'Urano (Saturno en la tradición)',
    intro: [
      'Acuario mira la jornada desde afuera. Ve el sistema entero —cómo se organiza el trabajo, por qué se hace así, qué se podría cambiar— y le cuesta seguir una rutina cuya lógica no comparte. Cuando encuentra el sentido, aporta soluciones que a nadie se le habían ocurrido.',
      'La predicción diaria le interesa menos por lo que anuncia que por lo que le permite contrastar: Acuario la usa como una lectura más entre varias, y suele quedarse con la parte que le sirve para pensar distinto.',
    ],
    dailyAreas: {
      love: 'Necesita amistad dentro del vínculo. Su día afectivo mejora con espacio propio respetado y empeora con la demanda de presencia constante, aun cuando el afecto no esté en discusión.',
      wellness:
        'Se desconecta del cuerpo cuando algo le interesa. El aviso le llega tarde: se saltea comidas y horarios sin notarlo, y el cansancio le cae de golpe al final del día.',
      money:
        'Su relación con el dinero es poco convencional. Los días buenos suelen venir por un camino lateral —un proyecto raro, un contacto inesperado— antes que por la vía previsible.',
    },
    bestMoment:
      'La noche o cualquier hora fuera del horario esperable. Acuario produce mejor cuando el mundo alrededor bajó la velocidad.',
    watchOut:
      'La distancia emocional. Si resolvió el día entero con argumentos impecables y quedó alguien dolido, ahí faltó algo que no era lógica.',
    dailyKeywords: ['Originalidad', 'Independencia', 'Visión', 'Comunidad'],
    harmonyNote:
      'Con los signos de aire comparte la manera de razonar el mundo, y con los de fuego encuentra la energía que convierte sus ideas en algo que efectivamente ocurre.',
    oppositeNote:
      'Leo le recuerda que las personas concretas importan tanto como las ideas, y que un día también se mide en el afecto que dejó, no solo en lo que mejoró.',
  },

  [ZodiacSign.PISCES]: {
    tagline: 'Absorbe el día entero, incluso lo que no era suyo',
    rulingPlanet: 'Neptuno (Júpiter en la tradición)',
    intro: [
      'Piscis termina la jornada cargando cosas que no le pertenecen: el mal humor de la reunión, la angustia de un amigo, el clima del lugar donde estuvo. Esa permeabilidad es lo que lo vuelve tan buen compañero y también lo que le hace confundir su cansancio con el de los demás.',
      'El horóscopo diario le sirve como punto de apoyo. En un día en el que todo se mezcla, tener una referencia externa lo ayuda a separar lo que le está pasando a él de lo que simplemente estaba en el ambiente.',
    ],
    dailyAreas: {
      love: 'Es donde más entrega y donde más se desdibuja. Su día afectivo mejora cuando alguien le pregunta qué necesita, porque solo rara vez lo dice sin que se lo pidan.',
      wellness:
        'Necesita silencio para recuperarse, no solo descanso. Música, agua, caminar sin destino: las vías por las que Piscis recarga son más sensoriales que deportivas.',
      money:
        'Con el dinero es despreocupado, y por eso su predicción financiera es de las más útiles del zodiaco: le marca los días en los que conviene mirar la cuenta antes de decir que sí.',
    },
    bestMoment:
      'El final del día, cuando la exigencia cede y su intuición trabaja sin interferencia. Muchas de sus mejores ideas aparecen ahí.',
    watchOut:
      'La sensación difusa de tristeza sin causa. Casi siempre viene de haberse hecho cargo del estado de ánimo de otra persona.',
    dailyKeywords: ['Sensibilidad', 'Imaginación', 'Empatía', 'Intuición'],
    harmonyNote:
      'Con los signos de agua comparte la manera de percibir sin palabras, y con los de tierra encuentra los bordes que su día necesita para no diluirse en el de los demás.',
    oppositeNote:
      'Virgo le da la herramienta que le falta en un día confuso: dividir lo que siente en tareas concretas y empezar por la más chica.',
  },
};

/**
 * Perfil estático del signo.
 *
 * @example
 * ```typescript
 * getZodiacSignProfile(ZodiacSign.LEO).tagline;
 * ```
 */
export function getZodiacSignProfile(sign: ZodiacSign): ZodiacSignProfileData {
  return ZODIAC_SIGN_PROFILES[sign];
}

/**
 * Palabras propias que aporta el perfil de un signo.
 *
 * Lo usan los tests como guardarraíl: es la medida de lo que la página garantiza
 * al crawler aunque la API del horóscopo no responda.
 */
export function getSignProfileWordCount(sign: ZodiacSign): number {
  const profile = ZODIAC_SIGN_PROFILES[sign];

  return [
    profile.tagline,
    ...profile.intro,
    profile.dailyAreas.love,
    profile.dailyAreas.wellness,
    profile.dailyAreas.money,
    profile.bestMoment,
    profile.watchOut,
    profile.harmonyNote,
    profile.oppositeNote,
    ...profile.dailyKeywords,
  ]
    .join(' ')
    .trim()
    .split(/\s+/).length;
}
