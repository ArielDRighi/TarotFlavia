/**
 * T-FR-S02: Seed de Carta del Día — 44 Interpretaciones Pre-escritas para Usuarios FREE/Anónimos
 *
 * Estructura: 22 Arcanos Mayores × 2 orientaciones (upright, reversed)
 * Tono: "energía del día", presente, acompañamiento — menciona brevemente amor, bienestar y dinero
 * Longitud: 3-5 oraciones (~80-100 palabras)
 * Fórmula inicial: "Hoy la energía de [carta] te acompaña..." o variante similar
 *
 * Generado con asistencia de Claude (revisado editorialmente).
 */

export interface DailyFreeInterpretationData {
  cardSlug: string;
  dailyUpright: string;
  dailyReversed: string;
}

export const DAILY_FREE_INTERPRETATIONS: DailyFreeInterpretationData[] = [
  // ==========================================================================
  // 0. EL LOCO
  // ==========================================================================
  {
    cardSlug: 'el-loco',
    dailyUpright:
      'Hoy la energía del Loco te acompaña. En el amor, es un día para animarte a dar ese primer paso sin miedo al rechazo. Tu bienestar pide soltar el control y fluir con lo inesperado. En lo económico, una oportunidad sorpresa podría aparecer si te atrevés a salir de lo habitual.',
    dailyReversed:
      'Hoy el Loco invertido te pide prudencia. En el amor, revisá si estás saltando sin mirar o si hay una decisión que conviene repensar. Tu cuerpo pide grounding, no más dispersión. En lo económico, evitá gastos impulsivos — la claridad llegará si bajás un cambio.',
  },

  // ==========================================================================
  // 1. EL MAGO
  // ==========================================================================
  {
    cardSlug: 'el-mago',
    dailyUpright:
      'Hoy el Mago pone todo su poder a tu disposición. En el amor, tenés las herramientas para comunicar lo que sentís y crear la conexión que deseás. Tu energía vital está en su punto más alto: aprovechala para moverte, crear y construir. En lo económico, este es un día para hacer, no para esperar — la manifestación está de tu lado.',
    dailyReversed:
      'Hoy el Mago invertido te invita a revisar tus intenciones. En el amor, cuidado con manipular o dejarte manipular — la honestidad vale más que cualquier estrategia. Tu bienestar puede estar afectado por el esfuerzo disperso; elegí una cosa y enfocate. En las finanzas, no es momento para apuestas arriesgadas ni para confiar en promesas vacías.',
  },

  // ==========================================================================
  // 2. LA SACERDOTISA
  // ==========================================================================
  {
    cardSlug: 'la-sacerdotisa',
    dailyUpright:
      'Hoy la Sacerdotisa te acompaña con su sabiduría silenciosa. En el amor, escuchá lo que tu intuición dice sobre esa persona o situación — la respuesta ya está dentro tuyo. Para tu bienestar, este es un día de introspección y descanso, no de acción. En lo económico, aguardá antes de decidir: la información que necesitás está por llegar.',
    dailyReversed:
      'Hoy la Sacerdotisa invertida te advierte que algo importante no estás viendo. En el amor, podés estar ignorando señales que merecen tu atención. Tu bienestar emocional sufre cuando callás lo que sentís — date permiso de expresarte. En las finanzas, hay datos ocultos en esa decisión; investigá más antes de comprometerte.',
  },

  // ==========================================================================
  // 3. LA EMPERATRIZ
  // ==========================================================================
  {
    cardSlug: 'la-emperatriz',
    dailyUpright:
      'Hoy la Emperatriz trae su energía de abundancia y amor. En las relaciones, es un día para nutrir, cuidar y recibir cariño sin culpa. Tu cuerpo y bienestar florecen cuando te permitís placer, descanso y conexión con la naturaleza. En lo económico, la abundancia llega cuando te abrís a recibirla — un buen día para sembrar proyectos con potencial fértil.',
    dailyReversed:
      'Hoy la Emperatriz invertida te señala bloqueos en tu fluir. En el amor, revisá si estás dando demasiado sin recibir o si el estancamiento afecta la conexión. Tu bienestar puede estar pidiendo que pares y te cuides con más compasión. En las finanzas, evitá la codicia o las decisiones movidas solo por lo material.',
  },

  // ==========================================================================
  // 4. EL EMPERADOR
  // ==========================================================================
  {
    cardSlug: 'el-emperador',
    dailyUpright:
      'Hoy el Emperador te llama a tomar las riendas con determinación. En el amor, la estabilidad y la claridad en lo que querés construir son más valiosas que la pasión impulsiva. Tu bienestar mejora cuando establecés límites sanos y respetás una rutina. En lo económico, es un día excelente para planificar, organizar y tomar decisiones con visión de largo plazo.',
    dailyReversed:
      'Hoy el Emperador invertido te alerta sobre un exceso de rigidez. En el amor, el control o la terquedad pueden generar conflicto — practicá la escucha. Tu bienestar pide que aflojés la exigencia sobre vos mismo. En las finanzas, cuidado con las decisiones autoritarias o con perder el hilo por querer controlarlo todo.',
  },

  // ==========================================================================
  // 5. EL PAPA (EL HIEROFANTE)
  // ==========================================================================
  {
    cardSlug: 'el-papa-el-hierofante',
    dailyUpright:
      'Hoy el Papa te invita a conectar con tus valores más profundos. En el amor, la confianza y el compromiso sincero son la base de lo que querés construir. Tu bienestar se nutre de rituales, rutinas y conexión con algo más grande que vos. En lo económico, seguí los caminos probados — no es día para innovaciones radicales sino para honrar lo que funciona.',
    dailyReversed:
      'Hoy el Papa invertido te propone cuestionar lo establecido. En el amor, quizás es momento de romper con un patrón heredado que no te sirve. Tu bienestar puede mejorar si desafiás una norma interna restrictiva. En las finanzas, cuidado con consejos de personas que solo repiten dogmas sin adaptarse a tu realidad.',
  },

  // ==========================================================================
  // 6. LOS AMANTES
  // ==========================================================================
  {
    cardSlug: 'los-amantes',
    dailyUpright:
      'Hoy los Amantes traen su energía de conexión y elección consciente. En el amor, este es un día lleno de magia y potencial — abrite a la intimidad y la sinceridad. Tu bienestar florece cuando tomás decisiones alineadas con tus valores más profundos. En lo económico, una elección importante puede presentarse hoy — elegí desde el corazón y con la cabeza.',
    dailyReversed:
      'Hoy los Amantes invertidos señalan una disarmonía en tus elecciones. En el amor, hay desacuerdos o dudas que conviene nombrar con honestidad. Tu bienestar se resiente cuando pospones decisiones que ya sabés que tenés que tomar. En las finanzas, evitá descuidar lo material por estar demasiado enfocado en lo emocional.',
  },

  // ==========================================================================
  // 7. EL CARRO
  // ==========================================================================
  {
    cardSlug: 'el-carro',
    dailyUpright:
      'Hoy el Carro te impulsa hacia adelante con fuerza y claridad. En el amor, tomá la iniciativa si hay algo que querés decir o proponer — el momento es ahora. Tu energía corporal está elevada: moverse, hacer deporte y mantenerte activo te hará muy bien. En lo económico, los avances son rápidos si te enfocás y no te distraés con ruidos externos.',
    dailyReversed:
      'Hoy el Carro invertido te pide que no fuerces lo que no fluye. En el amor, ir demasiado rápido puede asustarte a vos o al otro — tomá el ritmo necesario. Tu bienestar mejora si bajás la exigencia y te permitís descansar. En lo económico, los retrasos de hoy son oportunidades para revisar la dirección antes de seguir.',
  },

  // ==========================================================================
  // 8. LA FUERZA
  // ==========================================================================
  {
    cardSlug: 'la-fuerza',
    dailyUpright:
      'Hoy la Fuerza te acompaña con su energía serena y poderosa. En el amor, la paciencia y la compasión son tu mayor fortaleza — el vínculo se profundiza cuando te mostrás sin miedo. Tu bienestar crece cuando encarás los desafíos con calma en vez de con reacción. En lo económico, la constancia silenciosa de hoy construye los cimientos del éxito de mañana.',
    dailyReversed:
      'Hoy la Fuerza invertida te señala que algo te está debilitando. En el amor, el miedo o la inseguridad pueden impedirte mostrarte tal cual sos. Tu bienestar emocional necesita atención — identificá qué miedos están operando por debajo. En las finanzas, la falta de confianza puede hacerte perder oportunidades que estaban a tu alcance.',
  },

  // ==========================================================================
  // 9. EL ERMITAÑO
  // ==========================================================================
  {
    cardSlug: 'el-ermitano',
    dailyUpright:
      'Hoy el Ermitaño te invita a un día de introspección y silencio elegido. En el amor, puede ser un día más de reflexión que de acción — date permiso de conocerte mejor antes de buscar al otro. Tu bienestar se restaura con soledad, quietud y tiempo sin pantallas. En lo económico, pensá bien antes de hablar: la sabiduría de hoy evita los errores de mañana.',
    dailyReversed:
      'Hoy el Ermitaño invertido te advierte sobre el aislamiento excesivo. En el amor, cerrarte al otro no te protege — te aleja de lo que realmente necesitás. Tu bienestar pide conexión humana, no más encierro. En las finanzas, buscar asesoramiento externo puede darte una perspectiva que sola no estás viendo.',
  },

  // ==========================================================================
  // 10. LA RUEDA DE LA FORTUNA
  // ==========================================================================
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    dailyUpright:
      'Hoy la Rueda de la Fortuna gira a tu favor. En el amor, los ciclos cambian — algo que estuvo estancado puede moverse con sorprendente velocidad. Tu bienestar mejora cuando te entregás al flujo de la vida sin aferrarte a cómo debería ser. En lo económico, este puede ser un día de golpe de suerte o de cambio positivo inesperado — mantenete atento y abierto.',
    dailyReversed:
      'Hoy la Rueda invertida te pide que no te resistas al cambio. En el amor, un ciclo se cierra aunque no sea lo que querías — aceptarlo te libera más rápido. Tu bienestar pide soltar el control sobre lo que no podés manejar. En las finanzas, los reveses de hoy son parte de un ciclo mayor — no tomes decisiones drásticas desde el miedo.',
  },

  // ==========================================================================
  // 11. LA JUSTICIA
  // ==========================================================================
  {
    cardSlug: 'la-justicia',
    dailyUpright:
      'Hoy la Justicia te acompaña con su energía de equilibrio y verdad. En el amor, los vínculos honestos se fortalecen — es un buen día para hablar claro y restablecer acuerdos. Tu bienestar se sostiene en hábitos consistentes y en tratarte con la misma compasión que le darías a otros. En lo económico, lo justo llega a quienes actuaron con integridad — podés esperar resultados equilibrados.',
    dailyReversed:
      'Hoy la Justicia invertida señala que algo está desequilibrado. En el amor, un conflicto sin resolver está pesando más de lo que notás. Tu bienestar pide que hagas las paces con algo que te generó culpa o injusticia. En las finanzas, revisá si estás pagando o cobrando lo que merece — puede haber un desbalance que conviene corregir.',
  },

  // ==========================================================================
  // 12. EL COLGADO
  // ==========================================================================
  {
    cardSlug: 'el-colgado',
    dailyUpright:
      'Hoy el Colgado te ofrece el don de la pausa. En el amor, soltar el control de cómo debería resultar una situación puede abrirte a algo mucho mejor. Tu bienestar se profundiza cuando te permitís simplemente estar, sin hacer ni resolver. En lo económico, no es día de decisiones rápidas — dejá que las cosas se acomoden solas y observá desde otro ángulo.',
    dailyReversed:
      'Hoy el Colgado invertido te señala que la pausa se extendió demasiado. En el amor, el estancamiento ya dio sus lecciones — es momento de soltar y moverse. Tu bienestar se resiente cuando la inacción se convierte en hábito. En las finanzas, la espera que antes era sabia ahora se convirtió en postergación — tomá una decisión aunque sea pequeña.',
  },

  // ==========================================================================
  // 13. LA MUERTE
  // ==========================================================================
  {
    cardSlug: 'la-muerte',
    dailyUpright:
      'Hoy la Muerte trae su energía de transformación profunda. En el amor, algo debe terminar para que algo mejor pueda nacer — no resistas los finales naturales. Tu bienestar crece cuando dejás ir hábitos, pensamientos o situaciones que ya no te nutren. En lo económico, cerrar un ciclo — un contrato, una deuda, un proyecto — abre espacio a lo que viene con más fuerza.',
    dailyReversed:
      'Hoy la Muerte invertida te muestra el peso de lo que no terminaste de soltar. En el amor, aferrarte a lo que ya fue te impide abrirte a algo nuevo. Tu bienestar emocional pide que hagas ese duelo que venís postergando. En las finanzas, hay algo que ya no es viable y seguir invirtiendo energía ahí solo retrasa el cambio necesario.',
  },

  // ==========================================================================
  // 14. LA TEMPLANZA
  // ==========================================================================
  {
    cardSlug: 'la-templanza',
    dailyUpright:
      'Hoy la Templanza te envuelve con su energía de calma y armonía. En el amor, la comunicación fluida y la paciencia son el puente hacia una conexión más profunda. Tu bienestar brilla cuando cuidás el equilibrio entre el descanso y la actividad. En lo económico, los proyectos que avanzan con moderación y constancia son los que duran — confiá en el proceso.',
    dailyReversed:
      'Hoy la Templanza invertida señala un exceso en algún área. En el amor, puede haber desequilibrio o falta de armonía que pide ser revisada con calma. Tu bienestar sufre cuando vas a los extremos — cuerpo, mente y emociones piden moderación. En las finanzas, los excesos o la falta de planificación pueden generar tensiones hoy.',
  },

  // ==========================================================================
  // 15. EL DIABLO
  // ==========================================================================
  {
    cardSlug: 'el-diablo',
    dailyUpright:
      'Hoy el Diablo te invita a mirar de frente tus ataduras. En el amor, la pasión puede ser intensa pero revisá si hay control, celos o dependencia mezclados. Tu bienestar pide que identifiques qué hábito o pensamiento te está limitando sin que te des cuenta. En lo económico, la ambición está bien, pero hoy prestá atención si estás tomando decisiones desde el miedo o la codicia.',
    dailyReversed:
      'Hoy el Diablo invertido trae noticias liberadoras. En el amor, una dinámica que te ataba empieza a aflojarse — es una oportunidad para elegir con más libertad. Tu bienestar mejora cuando reconocés que tenés el poder de salir de cualquier patrón que te daña. En las finanzas, las ataduras materiales comienzan a ceder — tomá ese primer paso hacia más libertad económica.',
  },

  // ==========================================================================
  // 16. LA TORRE
  // ==========================================================================
  {
    cardSlug: 'la-torre',
    dailyUpright:
      'Hoy la Torre trae su energía disruptiva y reveladora. En el amor, algo que creías sólido puede sacudirse — pero lo que cae era falso; lo verdadero permanece. Tu bienestar pide que te mantengas arraigado ante el caos externo. En lo económico, evitá compromisos apresurados; si algo se derrumba hoy, es porque no tenía bases reales — dejalo ir.',
    dailyReversed:
      'Hoy la Torre invertida muestra resistencia al cambio inevitable. En el amor, el miedo a perder lo conocido puede estar generando tensión innecesaria. Tu bienestar pide que soltés la necesidad de control y te permitás adaptarte. En las finanzas, los cambios que evitás siguen acumulándose — a veces el mejor movimiento es adelantarse antes de que el derrumbe sea mayor.',
  },

  // ==========================================================================
  // 17. LA ESTRELLA
  // ==========================================================================
  {
    cardSlug: 'la-estrella',
    dailyUpright:
      'Hoy la Estrella ilumina tu camino con esperanza y renovación. En el amor, es un día lleno de ternura y posibilidad — abrite a recibir y a dar con el corazón sin defensas. Tu bienestar se restaura con belleza, agua, naturaleza y momentos de gratitud sincera. En lo económico, las oportunidades que vienen traen buena energía — confiá en que el esfuerzo pasado está por dar sus frutos.',
    dailyReversed:
      'Hoy la Estrella invertida te encuentra en un momento de duda o desilusión. En el amor, es difícil conectar desde el miedo o la desconfianza — date tiempo para sanar antes de abrirte. Tu bienestar pide que nutras tu fe interior aunque hoy no la sientas fuerte. En las finanzas, el pesimismo puede hacerte perder de vista las oportunidades reales que existen.',
  },

  // ==========================================================================
  // 18. LA LUNA
  // ==========================================================================
  {
    cardSlug: 'la-luna',
    dailyUpright:
      'Hoy la Luna tiñe el día de misterio e intuición. En el amor, no todo es lo que parece — escuchá más tu corazón que las apariencias. Tu bienestar puede estar influenciado por emociones profundas o sueños intensos — tomate un momento para procesar lo que sentís. En lo económico, no es día para decisiones grandes; esperá más información antes de comprometerte.',
    dailyReversed:
      'Hoy la Luna invertida trae claridad después de la confusión. En el amor, lo que estaba oculto empieza a revelarse — estás listo para ver la verdad aunque no sea perfecta. Tu bienestar mejora cuando dejás de huir de lo que te asusta y lo mirás de frente. En las finanzas, la neblina se disipa — ahora podés ver mejor dónde estás parado económicamente.',
  },

  // ==========================================================================
  // 19. EL SOL
  // ==========================================================================
  {
    cardSlug: 'el-sol',
    dailyUpright:
      'Hoy el Sol brilla con toda su fuerza en tu vida. En el amor, la alegría, la calidez y la conexión genuina están disponibles — celebrá los vínculos que te hacen bien. Tu bienestar está en su punto más alto: movete, disfrutá, reíte y agradecé. En lo económico, es un día muy favorable — las iniciativas que lances hoy tienen alta probabilidad de éxito.',
    dailyReversed:
      'Hoy el Sol invertido te pide que busques tu luz aunque el cielo esté nublado. En el amor, puede haber malentendidos o desilusiones que oscurecen algo que en realidad tiene potencial. Tu bienestar pide que no dejes que el ego o el perfeccionismo apaguen tu alegría natural. En las finanzas, los resultados pueden no llegar tan rápido como esperabas — la luz está, solo tarda un poco más.',
  },

  // ==========================================================================
  // 20. EL JUICIO
  // ==========================================================================
  {
    cardSlug: 'el-juicio',
    dailyUpright:
      'Hoy el Juicio te llama a un despertar y una renovación. En el amor, es momento de dejar atrás viejos rencores y abrirte a una nueva etapa con el corazón limpio. Tu bienestar se transforma cuando soltás los hábitos que ya no te sirven y elegís conscientemente quién querés ser. En lo económico, decisiones importantes hechas hoy con claridad tienen el poder de cambiar tu rumbo positivamente.',
    dailyReversed:
      'Hoy el Juicio invertido te muestra que algo no terminaste de procesar. En el amor, hay culpas o arrepentimientos que siguen pesando — es hora de perdonarte y seguir. Tu bienestar pide que hagas las paces con tu pasado antes de dar el siguiente paso. En las finanzas, la autocrítica excesiva o el miedo al fracaso pueden paralizarte — ya es suficiente, es hora de avanzar.',
  },

  // ==========================================================================
  // 21. EL MUNDO
  // ==========================================================================
  {
    cardSlug: 'el-mundo',
    dailyUpright:
      'Hoy el Mundo te abraza con su energía de plenitud y logro. En el amor, los vínculos maduros y completos brillan — si estás en pareja, celebrá lo construido; si estás solo, estás listo para algo verdadero. Tu bienestar irradia cuando te sentís completo tal como sos. En lo económico, un ciclo se cierra con éxito y las recompensas por el trabajo hecho están llegando.',
    dailyReversed:
      'Hoy el Mundo invertido te muestra que algo falta para completar el ciclo. En el amor, puede haber algo inconcluso que conviene resolver antes de dar el siguiente paso. Tu bienestar pide que cierres lo que dejaste a medias — hay energía atrapada ahí. En las finanzas, los retrasos actuales son temporales — cuando termines de cerrar lo pendiente, el flujo se restablece.',
  },
];
