/**
 * T-FR-S01: Seed de Tiradas — 132 Interpretaciones Pre-escritas para Usuarios FREE
 *
 * Estructura: 22 Arcanos Mayores × 3 categorías (amor, salud, dinero) × 2 orientaciones (upright, reversed)
 * Tono: cálido, empático, orientativo, español con sensibilidad rioplatense
 * Longitud: 2-3 oraciones por texto (~50 palabras)
 *
 * Slugs de categorías FREE:
 *   - 'amor-relaciones'  → Amor y Relaciones
 *   - 'salud-bienestar'  → Salud y Bienestar
 *   - 'dinero-finanzas'  → Dinero y Finanzas
 *
 * Generado con asistencia de Claude (revisado editorialmente).
 */

export interface CardFreeInterpretationData {
  cardSlug: string;
  categorySlug: 'amor-relaciones' | 'salud-bienestar' | 'dinero-finanzas';
  orientation: 'upright' | 'reversed';
  content: string;
}

export const CARD_FREE_INTERPRETATIONS: CardFreeInterpretationData[] = [
  // ==========================================================================
  // 0. EL LOCO
  // ==========================================================================
  {
    cardSlug: 'el-loco',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'El Loco te invita a abrirte a nuevas conexiones sin miedo. Dejá ir las expectativas y permití que el amor te sorprenda con caminos inesperados.',
  },
  {
    cardSlug: 'el-loco',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Hay un salto que estás postergando por miedo. La carta te pide revisar si la imprudencia o la resistencia están impidiendo que te entregues de verdad.',
  },
  {
    cardSlug: 'el-loco',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Es momento de soltar cargas y darte permiso para ser libre. Tu bienestar pasa por escuchar tu espíritu aventurero y no reprimir tu espontaneidad.',
  },
  {
    cardSlug: 'el-loco',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Cuidado con la dispersión o los riesgos innecesarios. Tu cuerpo te pide más presencia y menos fuga hacia delante.',
  },
  {
    cardSlug: 'el-loco',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Nuevas oportunidades están por llegar, pero requieren un salto de fe. Confiá en tu capacidad de adaptarte y atrevete a explorar caminos no convencionales.',
  },
  {
    cardSlug: 'el-loco',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Una decisión financiera apresurada puede salir cara. Antes de dar el salto, revisá si tenés la información que necesitás.',
  },

  // ==========================================================================
  // 1. EL MAGO
  // ==========================================================================
  {
    cardSlug: 'el-mago',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Tenés todas las herramientas para crear la relación que deseás. Es el momento de tomar la iniciativa y manifestar con claridad lo que buscás en el amor.',
  },
  {
    cardSlug: 'el-mago',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Algo no está siendo del todo honesto en esta conexión. La carta te invita a revisar si alguien está manipulando la situación o si vos mismo estás actuando desde el miedo.',
  },
  {
    cardSlug: 'el-mago',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Tenés el poder de transformar tu bienestar si canalizás tu energía con intención. Es un buen momento para iniciar nuevos hábitos con determinación y confianza.',
  },
  {
    cardSlug: 'el-mago',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'La energía puede estar dispersa o mal canalizada. Enfocate en una cosa a la vez y evitá promesas que no vas a poder cumplir con tu propio cuerpo.',
  },
  {
    cardSlug: 'el-mago',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Las condiciones están dadas para materializar tus proyectos económicos. Actuá con confianza y usá todos los recursos que tenés a tu disposición.',
  },
  {
    cardSlug: 'el-mago',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Cuidado con las promesas demasiado buenas o con personas que ofrecen resultados mágicos. Verificá bien antes de comprometer tu dinero en propuestas inciertas.',
  },

  // ==========================================================================
  // 2. LA SACERDOTISA
  // ==========================================================================
  {
    cardSlug: 'la-sacerdotisa',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Tu intuición sabe más de lo que tu mente quiere admitir. Escuchá esa voz interior antes de tomar decisiones en el amor; las respuestas ya están en vos.',
  },
  {
    cardSlug: 'la-sacerdotisa',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Estás ignorando señales que tu intuición ya captó. La carta te pide que no sigas solo las apariencias y te conectes con lo que realmente sentís.',
  },
  {
    cardSlug: 'la-sacerdotisa',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Tu cuerpo te habla con sutileza. Es un buen momento para prestarle atención a esas señales internas y tomarte un tiempo de descanso y reflexión.',
  },
  {
    cardSlug: 'la-sacerdotisa',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede que estés desconectada de las necesidades reales de tu cuerpo. Pausá el ruido externo y escuchá lo que tu organismo genuinamente necesita.',
  },
  {
    cardSlug: 'la-sacerdotisa',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'No es el momento de actuar; es momento de observar y recopilar información. Tu sabiduría interior te guiará mejor que cualquier consejo externo apresurado.',
  },
  {
    cardSlug: 'la-sacerdotisa',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Estás tomando decisiones financieras sin tener todos los datos. Hacé una pausa antes de comprometerte y buscá información más profunda.',
  },

  // ==========================================================================
  // 3. LA EMPERATRIZ
  // ==========================================================================
  {
    cardSlug: 'la-emperatriz',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'El amor florece en un ambiente de cuidado y abundancia. Es un momento para nutrir tus vínculos con sensualidad, afecto y presencia genuina.',
  },
  {
    cardSlug: 'la-emperatriz',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber dependencia o un desequilibrio en cómo se dan y reciben los cuidados. La carta te invita a recuperar tu propio centro antes de entregarte al otro.',
  },
  {
    cardSlug: 'la-emperatriz',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Tu cuerpo está en un ciclo de abundancia y vitalidad. Conectate con la naturaleza, el descanso y el placer sensorial; todo eso es también bienestar.',
  },
  {
    cardSlug: 'la-emperatriz',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber descuido del cuerpo físico o excesos en algún área. Volvé a los básicos: alimentación, descanso y movimiento con cariño hacia vos misma.',
  },
  {
    cardSlug: 'la-emperatriz',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Es un período fértil para las finanzas. Lo que sembraste está dando frutos y la abundancia fluye con naturalidad si te mantenés conectada a tu valor.',
  },
  {
    cardSlug: 'la-emperatriz',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Los proyectos pueden estar tardando más de lo esperado en rendir. Revisá si hay bloqueos relacionados con creencias de escasez o con sobreenfocarte en lo material.',
  },

  // ==========================================================================
  // 4. EL EMPERADOR
  // ==========================================================================
  {
    cardSlug: 'el-emperador',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'La relación puede ganar estabilidad con estructura y compromisos claros. Es un buen momento para establecer bases sólidas y asumir responsabilidades en el vínculo.',
  },
  {
    cardSlug: 'el-emperador',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber rigidez o control excesivo en la dinámica de pareja. La carta te invita a ceder un poco y recordar que el amor necesita espacio para respirar.',
  },
  {
    cardSlug: 'el-emperador',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'La disciplina y la estructura son tus aliadas ahora. Establecé rutinas concretas que cuiden tu bienestar y cumplí con ellas con determinación.',
  },
  {
    cardSlug: 'el-emperador',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'El exceso de control puede generar tensión. Tu cuerpo puede estar acusando el estrés de querer controlar todo; aprendé a delegar y a descansar.',
  },
  {
    cardSlug: 'el-emperador',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Es el momento de ordenar tus finanzas con estrategia y disciplina. Tomá decisiones con análisis frío y construí bases económicas sólidas para el futuro.',
  },
  {
    cardSlug: 'el-emperador',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber dificultades para mantener el control financiero o resistencia a cambiar métodos que ya no funcionan. Flexibilizá tu enfoque para avanzar.',
  },

  // ==========================================================================
  // 5. EL PAPA (EL HIEROFANTE)
  // ==========================================================================
  {
    cardSlug: 'el-papa-el-hierofante',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'El vínculo puede profundizarse a través de valores compartidos y compromisos formales. Es un buen momento para definir hacia dónde va la relación.',
  },
  {
    cardSlug: 'el-papa-el-hierofante',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber tensión entre lo que espera la tradición y lo que vos realmente querés. Permitite explorar nuevas formas de relacionarte sin culpa.',
  },
  {
    cardSlug: 'el-papa-el-hierofante',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Buscar orientación de un profesional o especialista puede ser muy valioso ahora. No ignores los saberes establecidos; muchas veces la tradición tiene respuestas.',
  },
  {
    cardSlug: 'el-papa-el-hierofante',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede que los métodos convencionales no estén funcionando para vos. Estar abierta a enfoques alternativos o a cuestionar viejos hábitos puede abrirte nuevos caminos.',
  },
  {
    cardSlug: 'el-papa-el-hierofante',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Los caminos probados y seguros son los más convenientes ahora. Seguí los consejos de alguien con experiencia y actuá dentro de lo convencional.',
  },
  {
    cardSlug: 'el-papa-el-hierofante',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber un consejero financiero que no te está dando la mejor orientación. Cuestioná lo que te dicen y buscá una segunda opinión antes de actuar.',
  },

  // ==========================================================================
  // 6. LOS AMANTES
  // ==========================================================================
  {
    cardSlug: 'los-amantes',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Hay una conexión poderosa y auténtica en el horizonte o ya está presente en tu vida. La carta celebra la armonía y el deseo mutuo en los vínculos.',
  },
  {
    cardSlug: 'los-amantes',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber una elección difícil o sentimientos que no están siendo correspondidos de forma equitativa. La carta te pide honestidad con vos misma y con el otro.',
  },
  {
    cardSlug: 'los-amantes',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Hay una armonía entre tu mente y tu cuerpo que favorece el bienestar. Es el momento de elegir conscientemente los hábitos que realmente te nutren.',
  },
  {
    cardSlug: 'los-amantes',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber un conflicto interno entre lo que querés y lo que hacés con tu cuerpo. Revisá si tus elecciones cotidianas están alineadas con tu bienestar real.',
  },
  {
    cardSlug: 'los-amantes',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Una asociación o decisión financiera puede llegar a buen puerto si está basada en valores compartidos y confianza mutua. Confiá en el proceso.',
  },
  {
    cardSlug: 'los-amantes',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Un descuido en las finanzas puede venir de estar demasiado enfocado en lo emocional. Poné atención en los números y no postergues decisiones importantes.',
  },

  // ==========================================================================
  // 7. EL CARRO
  // ==========================================================================
  {
    cardSlug: 'el-carro',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'La relación avanza con energía y determinación. Si tenés claro lo que querés, este es el momento de ir por ello con confianza y sin dudar.',
  },
  {
    cardSlug: 'el-carro',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber precipitación o falta de dirección en el vínculo. Antes de avanzar, asegurate de que ambos estén apuntando hacia el mismo lugar.',
  },
  {
    cardSlug: 'el-carro',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Tenés la energía y la voluntad para recuperarte o mejorar tu estado físico. Enfocate en tus objetivos de salud con disciplina y los resultados van a llegar.',
  },
  {
    cardSlug: 'el-carro',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'La energía puede estar desorganizada o el avance es más lento de lo que esperabas. No te exijas demasiado; la constancia gradual vale más que el esfuerzo desmedido.',
  },
  {
    cardSlug: 'el-carro',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Momento de acción y avance en lo económico. Los resultados son rápidos si te mantenés enfocado y actuás con determinación en tu camino financiero.',
  },
  {
    cardSlug: 'el-carro',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber gastos imprevistos o dispersión en las prioridades financieras. Retomá el control y establecé un rumbo claro antes de tomar nuevas decisiones.',
  },

  // ==========================================================================
  // 8. LA FUERZA
  // ==========================================================================
  {
    cardSlug: 'la-fuerza',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'El amor crece desde la paciencia y la comprensión, no desde la fuerza. Manejá los conflictos con calma y confiá en que la dulzura puede más que la presión.',
  },
  {
    cardSlug: 'la-fuerza',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber inseguridades que te llevan a actuar con debilidad o a tolerar más de lo que deberías. Reconectate con tu fortaleza interior y desde ahí relacionate.',
  },
  {
    cardSlug: 'la-fuerza',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Tu cuerpo tiene una resiliencia mayor de la que creés. Con paciencia y constancia podés superar lo que te preocupa y fortalecer tu vitalidad.',
  },
  {
    cardSlug: 'la-fuerza',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'El miedo o la inseguridad pueden estar bloqueando tu proceso de mejora. Trabajá en dominar los impulsos que te llevan a descuidar tu bienestar.',
  },
  {
    cardSlug: 'la-fuerza',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Las cosas están mejorando aunque sea gradualmente. Mantené la calma frente a las dificultades económicas y confiá en tu capacidad de sostener la situación.',
  },
  {
    cardSlug: 'la-fuerza',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber miedo que paraliza tus decisiones financieras. Trabajá en fortalecer tu confianza y en dominar los impulsos que te llevan a gastar o a evitar actuar.',
  },

  // ==========================================================================
  // 9. EL ERMITAÑO
  // ==========================================================================
  {
    cardSlug: 'el-ermitano',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Puede ser un período de soledad necesaria para reconectar con vos mismo antes de dar el próximo paso en el amor. La sabiduría que encontrás adentro guiará mejor tus vínculos.',
  },
  {
    cardSlug: 'el-ermitano',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'El aislamiento prolongado puede estar afectando la conexión con tu pareja o cerrándote a nuevas posibilidades. Encontrá el equilibrio entre la introspección y la presencia.',
  },
  {
    cardSlug: 'el-ermitano',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Tu cuerpo necesita descanso y quietud. Alejarte del ruido por un tiempo puede ser la medicina que más necesitás ahora para recuperar el equilibrio.',
  },
  {
    cardSlug: 'el-ermitano',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'El exceso de aislamiento puede volverse agotador. Buscá conexiones que te nutran y no caigas en la soledad como refugio de lo que no querés enfrentar.',
  },
  {
    cardSlug: 'el-ermitano',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'No es momento de grandes movimientos; es momento de reflexión y análisis. Tomá distancia de las presiones y revisá con calma tu situación financiera.',
  },
  {
    cardSlug: 'el-ermitano',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'El aislamiento o la falta de información te pueden estar jugando en contra en lo económico. Buscá orientación externa y no rechaces el consejo de otros.',
  },

  // ==========================================================================
  // 10. LA RUEDA DE LA FORTUNA
  // ==========================================================================
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Los ciclos cambian y el amor está entrando en una etapa favorable. Fluí con lo que viene sin resistirte; algo positivo está por llegar o consolidarse.',
  },
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber un ciclo difícil en lo sentimental que está llegando a su fin. No te aferres a lo que ya está cambiando; la rueda siempre sigue girando.',
  },
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Un cambio positivo en tu bienestar está en marcha. Las circunstancias se alinean para ayudarte; aprovechá este impulso para cuidarte mejor.',
  },
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber altibajos en tu energía o salud. Recordá que los ciclos bajos también pasan; no te rindas y cuidate con más atención en esta etapa.',
  },
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Un golpe de suerte o un cambio favorable puede llegar a tu situación económica. Mantente abierto a las oportunidades que aparecen de maneras inesperadas.',
  },
  {
    cardSlug: 'la-rueda-de-la-fortuna',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Un ciclo de abundancia puede estar dando paso a uno más austero. Ajustá tus gastos y sé cauteloso con nuevas inversiones hasta que la rueda vuelva a girar a tu favor.',
  },

  // ==========================================================================
  // 11. LA JUSTICIA
  // ==========================================================================
  {
    cardSlug: 'la-justicia',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'La relación está en un momento de equilibrio y honestidad. Lo que das vuelve; si querés recibir más amor, comenzá por darlo con integridad.',
  },
  {
    cardSlug: 'la-justicia',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber desequilibrio en el vínculo, donde uno da más que el otro. La carta te invita a ser honesta sobre lo que necesitás y a pedir lo que te corresponde.',
  },
  {
    cardSlug: 'la-justicia',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Lo que hacés con tu cuerpo hoy tiene consecuencias claras. Las decisiones equilibradas y conscientes sobre tu salud darán resultados justos y favorables.',
  },
  {
    cardSlug: 'la-justicia',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber consecuencias de hábitos descuidados que ahora se manifiestan. La carta te pide asumir la responsabilidad de tus elecciones y comenzar a equilibrarlas.',
  },
  {
    cardSlug: 'la-justicia',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Es un buen momento para contratos, inversiones y acuerdos. La honestidad y la legalidad están de tu lado; actuá con integridad y los resultados serán justos.',
  },
  {
    cardSlug: 'la-justicia',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber complicaciones en asuntos legales o financieros pendientes. Revisá bien los contratos y no te apresures en cerrar acuerdos sin asegurarte de que todo esté claro.',
  },

  // ==========================================================================
  // 12. EL COLGADO
  // ==========================================================================
  {
    cardSlug: 'el-colgado',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Es momento de cambiar la perspectiva sobre el amor. Soltar el control y ver la situación desde otro ángulo puede abrirte a una comprensión más profunda del vínculo.',
  },
  {
    cardSlug: 'el-colgado',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede que estés aferrada a una situación que ya no te nutre. La carta te invita a soltar lo que no es para vos y a no auto-sabotearte por miedo a perder.',
  },
  {
    cardSlug: 'el-colgado',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'A veces el descanso y la pausa son la mejor medicina. Aceptá el ritmo más lento del momento y usá este tiempo para profundizar en lo que tu cuerpo necesita.',
  },
  {
    cardSlug: 'el-colgado',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'El estancamiento puede estar generando tensión en tu cuerpo. Identificá qué situación te tiene paralizada y hacé algo concreto para comenzar a moverte.',
  },
  {
    cardSlug: 'el-colgado',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'El tiempo de espera en lo financiero es parte del proceso. Usá esta pausa para revisar tu estrategia y ver las cosas desde una perspectiva diferente.',
  },
  {
    cardSlug: 'el-colgado',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'El estancamiento económico puede ser resultado de resistirse a soltar algo que ya no funciona. Aceptá lo que no podés controlar y buscar nuevas alternativas.',
  },

  // ==========================================================================
  // 13. LA MUERTE
  // ==========================================================================
  {
    cardSlug: 'la-muerte',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Un ciclo en lo amoroso está llegando a su fin para dar paso a algo nuevo. Esta transformación puede doler, pero abre espacio para un amor más auténtico.',
  },
  {
    cardSlug: 'la-muerte',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'La resistencia al cambio puede estar manteniendo viva una situación que ya cumplió su ciclo. Soltar con gratitud lo que fue te liberará para lo que viene.',
  },
  {
    cardSlug: 'la-muerte',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Es momento de dejar ir hábitos o creencias que dañan tu bienestar. Esta transformación puede ser incómoda, pero es el inicio de una salud más integral.',
  },
  {
    cardSlug: 'la-muerte',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'El apego a viejos hábitos nocivos puede estar frenando tu recuperación. Aceptá que algo tiene que cambiar y darte permiso para empezar de nuevo.',
  },
  {
    cardSlug: 'la-muerte',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Una etapa económica está terminando para dar lugar a una nueva. El cambio puede ser difícil, pero te liberará de estructuras que ya no te sirven.',
  },
  {
    cardSlug: 'la-muerte',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'El miedo a perder puede estar bloqueando una transformación financiera necesaria. Soltá lo que ya no funciona con valentía y abrí paso a nuevas posibilidades.',
  },

  // ==========================================================================
  // 14. LA TEMPLANZA
  // ==========================================================================
  {
    cardSlug: 'la-templanza',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Hay armonía y fluir natural en tus relaciones. Es un período de equilibrio emocional donde el amor se nutre con paciencia, apoyo mutuo y comunicación.',
  },
  {
    cardSlug: 'la-templanza',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber desequilibrio o falta de armonía en el vínculo. La carta te pide moderación y buscar el punto medio antes de que la tensión escale.',
  },
  {
    cardSlug: 'la-templanza',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'El equilibrio y la moderación son la clave de tu bienestar ahora. Evitá los extremos y buscá un ritmo sostenible que cuide tanto tu cuerpo como tu mente.',
  },
  {
    cardSlug: 'la-templanza',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber excesos o falta de balance en algún área de tu salud. Es momento de identificar lo que está fuera de control y volver a un ritmo más equilibrado.',
  },
  {
    cardSlug: 'la-templanza',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Las finanzas fluyen con estabilidad cuando aplicás moderación. Es un buen momento para equilibrar ingresos y gastos y planificar con calma.',
  },
  {
    cardSlug: 'la-templanza',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber gastos descontrolados o mala gestión de recursos. Buscá el punto medio en tus finanzas y evitá las decisiones que vienen del impulso.',
  },

  // ==========================================================================
  // 15. EL DIABLO
  // ==========================================================================
  {
    cardSlug: 'el-diablo',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Puede haber una atracción intensa pero también dinámicas de control o dependencia en el vínculo. La carta te invita a examinar si la relación te limita o te libera.',
  },
  {
    cardSlug: 'el-diablo',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Estás comenzando a liberarte de patrones relacionales dañinos. Es un buen momento para revisar qué cadenas querés soltar y comenzar a construir algo más sano.',
  },
  {
    cardSlug: 'el-diablo',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Puede haber adicciones, excesos o hábitos autodestructivos que están afectando tu bienestar. La carta te pide reconocer lo que te encadena para poder liberarte.',
  },
  {
    cardSlug: 'el-diablo',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Estás encontrando la fuerza para liberarte de lo que te hacía daño. Seguí trabajando en los hábitos que te encadenan; el camino hacia el bienestar ya comenzó.',
  },
  {
    cardSlug: 'el-diablo',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Puede haber una obsesión con lo material o gastos vinculados a adicciones o compulsiones. Revisá si el dinero está siendo usado de forma consciente o como escape.',
  },
  {
    cardSlug: 'el-diablo',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Las cadenas financieras comienzan a aflojarse. Estás saliendo de una situación económica que te limitaba; aprovechá este impulso para construir algo más sólido.',
  },

  // ==========================================================================
  // 16. LA TORRE
  // ==========================================================================
  {
    cardSlug: 'la-torre',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Un cambio brusco o una revelación puede sacudir el vínculo. Aunque duele, lo que cae era frágil; lo que quede después será más auténtico y sólido.',
  },
  {
    cardSlug: 'la-torre',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Hay resistencia al cambio que genera más tensión en la relación. Afrontar lo que se viene con valentía evitará que la situación se prolongue innecesariamente.',
  },
  {
    cardSlug: 'la-torre',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Puede haber una crisis de salud que funcione como llamado de atención. Es momento de hacer cambios reales y no seguir ignorando lo que tu cuerpo viene pidiendo.',
  },
  {
    cardSlug: 'la-torre',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'El miedo al cambio puede estar retrasando decisiones importantes para tu bienestar. Enfrentar la inestabilidad con valentía te llevará antes a la recuperación.',
  },
  {
    cardSlug: 'la-torre',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Puede haber un golpe económico inesperado que desequilibre tus planes. Protegé tus recursos y evitá inversiones arriesgadas en este momento de volatilidad.',
  },
  {
    cardSlug: 'la-torre',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Aunque hay inestabilidad, podés amortiguar el impacto si actuás a tiempo. Revisá tus finanzas con honestidad y hacé los ajustes necesarios antes de que la situación escale.',
  },

  // ==========================================================================
  // 17. LA ESTRELLA
  // ==========================================================================
  {
    cardSlug: 'la-estrella',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Hay esperanza y renovación en el amor. Si pasaste por una etapa difícil, esta carta anuncia calma, conexión genuina y la posibilidad de construir algo hermoso.',
  },
  {
    cardSlug: 'la-estrella',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber desesperanza o distancia en el vínculo. La carta te invita a no perder la fe en el amor, pero sí a identificar qué está bloqueando esa conexión.',
  },
  {
    cardSlug: 'la-estrella',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Es un período de sanación y renovación. Tu cuerpo está respondiendo bien y hay motivos para confiar en que el bienestar está volviendo a vos.',
  },
  {
    cardSlug: 'la-estrella',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber desmotivación o pérdida de esperanza en el proceso de cuidado. Recuperá la fe en tu capacidad de sanar y buscá apoyo si lo necesitás.',
  },
  {
    cardSlug: 'la-estrella',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Las finanzas entran en una fase favorable y esperanzadora. Confiá en el camino que elegiste; las cosas se están alineando para traerte prosperidad.',
  },
  {
    cardSlug: 'la-estrella',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber insatisfacción o derroche que complica la situación económica. Recuperá la esperanza con acciones concretas y no te quedes esperando que las cosas mejoren solas.',
  },

  // ==========================================================================
  // 18. LA LUNA
  // ==========================================================================
  {
    cardSlug: 'la-luna',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Hay confusión o algo oculto en la situación amorosa. Confiá en tu intuición más que en las apariencias y no tomes decisiones importantes hasta tener más claridad.',
  },
  {
    cardSlug: 'la-luna',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Lo que estaba oculto está saliendo a la luz. Aunque puede ser incómodo, esta claridad te permite ver el vínculo con más honestidad y decidir desde un lugar real.',
  },
  {
    cardSlug: 'la-luna',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Puede haber confusión o ansiedad que afecta tu bienestar. Trabajá en calmar el ruido mental y conectá con tu intuición para distinguir lo real de lo imaginado.',
  },
  {
    cardSlug: 'la-luna',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'La niebla mental comienza a disiparse. Con más claridad podés identificar qué es real en términos de salud y tomar las decisiones correctas para cuidarte.',
  },
  {
    cardSlug: 'la-luna',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Hay engaños o información incompleta rondando lo financiero. No te dejes llevar por promesas tentadoras; investigá bien antes de comprometer tu dinero.',
  },
  {
    cardSlug: 'la-luna',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Lo que estaba oscuro en tus finanzas comienza a aclararse. Aprovechá esta claridad para reorganizar tus recursos y tomar decisiones más fundamentadas.',
  },

  // ==========================================================================
  // 19. EL SOL
  // ==========================================================================
  {
    cardSlug: 'el-sol',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'El amor brilla con claridad y alegría. Es un momento de conexión genuina, reconciliación y felicidad compartida; disfrutalo con gratitud y apertura.',
  },
  {
    cardSlug: 'el-sol',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber confusión o infelicidad que oscurece el vínculo. La carta te invita a buscar la fuente de esa nube y a trabajar para que la luz vuelva a la relación.',
  },
  {
    cardSlug: 'el-sol',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Hay una energía vibrante y positiva en tu bienestar. Es un excelente momento para disfrutar de actividad al aire libre y celebrar lo bien que te sentís.',
  },
  {
    cardSlug: 'el-sol',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber agotamiento o una visión negativa sobre tu salud. Buscá pequeños momentos de alegría y luz en tu día; eso también es medicina.',
  },
  {
    cardSlug: 'el-sol',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Las finanzas están en su mejor momento. Hay claridad, prosperidad y posibilidad de ingresos inesperados; aprovechá esta energía para avanzar con confianza.',
  },
  {
    cardSlug: 'el-sol',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Las ganancias pueden ser menores de lo esperado o hay estrés laboral que afecta lo económico. No te desanimes; buscá la claridad necesaria para reorientar tu camino.',
  },

  // ==========================================================================
  // 20. EL JUICIO
  // ==========================================================================
  {
    cardSlug: 'el-juicio',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'Es momento de renacimiento en el amor. Puede haber una segunda oportunidad, una reconciliación o un despertar que te permite ver el vínculo con ojos completamente nuevos.',
  },
  {
    cardSlug: 'el-juicio',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber culpa o resentimiento que impiden sanar la relación. La carta te pide que te liberes del juicio —hacia vos o hacia el otro— para avanzar.',
  },
  {
    cardSlug: 'el-juicio',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Hay un llamado a transformar tu relación con la salud. Dejar malos hábitos atrás y comenzar con nuevas rutinas puede marcar un antes y un después en tu bienestar.',
  },
  {
    cardSlug: 'el-juicio',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber resistencia a los cambios necesarios para mejorar. Revisá si el autoengaño o el miedo te están impidiendo dar el paso que ya sabés que necesitás dar.',
  },
  {
    cardSlug: 'el-juicio',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Es un momento propicio para contratos, nuevos proyectos y decisiones financieras transformadoras. Lo que sembraste está listo para dar frutos si actuás con claridad.',
  },
  {
    cardSlug: 'el-juicio',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'Puede haber engaños o negocios poco claros que pongan en riesgo tu economía. Revisá bien cada acuerdo y no firmes nada sin entender todas las condiciones.',
  },

  // ==========================================================================
  // 21. EL MUNDO
  // ==========================================================================
  {
    cardSlug: 'el-mundo',
    categorySlug: 'amor-relaciones',
    orientation: 'upright',
    content:
      'El amor está en su punto más pleno y completo. Es un momento de celebración, unión genuina y satisfacción emocional; disfrutá de lo que lograste construir.',
  },
  {
    cardSlug: 'el-mundo',
    categorySlug: 'amor-relaciones',
    orientation: 'reversed',
    content:
      'Puede haber demoras o ciclos que no se cierran del todo en lo sentimental. Enfocarate en completar lo que está pendiente antes de abrir nuevas etapas.',
  },
  {
    cardSlug: 'el-mundo',
    categorySlug: 'salud-bienestar',
    orientation: 'upright',
    content:
      'Estás en un momento de plenitud física y emocional. Los esfuerzos por tu bienestar están dando resultados; celebrá este logro y seguí cultivándolo.',
  },
  {
    cardSlug: 'el-mundo',
    categorySlug: 'salud-bienestar',
    orientation: 'reversed',
    content:
      'Puede haber algo pendiente de resolver en tu salud antes de alcanzar el bienestar pleno. No te conformes con resultados parciales; seguí buscando la integración completa.',
  },
  {
    cardSlug: 'el-mundo',
    categorySlug: 'dinero-finanzas',
    orientation: 'upright',
    content:
      'Las finanzas están en su momento cumbre. Es un período de logros, reconocimiento y prosperidad bien ganada; aprovechalo para consolidar lo que construiste.',
  },
  {
    cardSlug: 'el-mundo',
    categorySlug: 'dinero-finanzas',
    orientation: 'reversed',
    content:
      'El éxito está cerca pero puede tener demoras o contratiempos. Mantené el enfoque y no te rindas en la recta final; lo que sembraste está a punto de dar sus frutos.',
  },
];
