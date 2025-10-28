import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { TarotDeck } from './decks/entities/tarot-deck.entity';
import { TarotCard } from './cards/entities/tarot-card.entity';
import { TarotSpread } from './spreads/entities/tarot-spread.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const deckRepository = app.get<Repository<TarotDeck>>(
    getRepositoryToken(TarotDeck),
  );
  const cardRepository = app.get<Repository<TarotCard>>(
    getRepositoryToken(TarotCard),
  );
  const spreadRepository = app.get<Repository<TarotSpread>>(
    getRepositoryToken(TarotSpread),
  );

  try {
    // Comprobar si ya hay datos cargados
    const decksCount = await deckRepository.count();
    const spreadsCount = await spreadRepository.count();

    if (decksCount === 0) {
      console.log('Cargando mazo inicial...');

      // Crear un mazo de tarot
      const deck = await deckRepository.save({
        name: 'Rider-Waite',
        description:
          'El Rider-Waite es uno de los mazos de tarot más populares y ampliamente reconocidos. Diseñado por Arthur Edward Waite e ilustrado por Pamela Colman Smith, fue publicado por primera vez en 1909. Sus imágenes ricas en simbolismo y sus interpretaciones accesibles lo han convertido en el estándar de referencia para muchos lectores de tarot.',
        imageUrl: 'https://m.media-amazon.com/images/I/71sRs14acjL._SY741_.jpg',
        cardCount: 78,
      });

      console.log(`Mazo "${deck.name}" creado con ID: ${deck.id}`);

      // Arcanos Mayores completos con la información detallada proporcionada
      const arcanosMayores = [
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
          keywords:
            'Libertad, inocencia, espíritu libre, aventura, nuevos comienzos',
          deckId: deck.id,
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
          keywords:
            'Voluntad, manifestación, poder, concentración, creación, acción',
          deckId: deck.id,
        },
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          keywords:
            'Transformación, fin, cambio, transición, dejar ir lo viejo',
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          keywords:
            'Esperanza, inspiración, renovación, espiritualidad, serenidad',
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
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
          deckId: deck.id,
        },
      ];

      for (const cardData of arcanosMayores) {
        const card = await cardRepository.save(cardData);
        console.log(`Carta "${card.name}" creada con ID: ${card.id}`);
      }
    } else {
      console.log(
        `Ya existen ${decksCount} mazos en la base de datos. Saltando creación de mazos y cartas.`,
      );
    }

    if (spreadsCount === 0) {
      console.log('Cargando tiradas iniciales...');

      // Crear una tirada de 3 cartas
      const spread = await spreadRepository.save({
        name: 'Tirada de Tres Cartas',
        description:
          'Una tirada simple pero poderosa que representa el pasado, presente y futuro en relación a una situación o pregunta.',
        cardCount: 3,
        positions: [
          {
            name: 'Pasado',
            description:
              'Representa eventos o influencias del pasado que afectan la situación actual.',
          },
          {
            name: 'Presente',
            description:
              'Muestra la situación actual y las energías que rodean el momento presente.',
          },
          {
            name: 'Futuro',
            description:
              'Indica la dirección hacia donde se dirige la situación si se mantiene el rumbo actual.',
          },
        ],
        imageUrl: 'https://ejemplo.com/tiradas/tres-cartas.jpg',
      });

      console.log(`Tirada "${spread.name}" creada con ID: ${spread.id}`);

      // Crear una tirada de Cruz Celta
      const celticCross = await spreadRepository.save({
        name: 'Cruz Celta',
        description:
          'Una de las tiradas más completas y tradicionales del tarot, que permite un análisis profundo de una situación con múltiples perspectivas.',
        cardCount: 10,
        positions: [
          {
            name: 'Presente',
            description:
              'Representa la situación actual y las energías que te rodean.',
          },
          {
            name: 'Desafío',
            description: 'El obstáculo principal que debes enfrentar.',
          },
          {
            name: 'Pasado',
            description:
              'Influencias y eventos del pasado que han contribuido a la situación actual.',
          },
          {
            name: 'Futuro',
            description:
              'Lo que podría ocurrir en un futuro cercano si se mantiene el curso actual.',
          },
          {
            name: 'Consciente',
            description: 'Lo que piensas conscientemente sobre la situación.',
          },
          {
            name: 'Inconsciente',
            description:
              'Lo que sientes inconscientemente o lo que podría estar oculto.',
          },
          {
            name: 'Tu influencia',
            description:
              'Cómo tus acciones y actitud están afectando la situación.',
          },
          {
            name: 'Influencia externa',
            description:
              'Cómo el entorno y otras personas están impactando la situación.',
          },
          {
            name: 'Esperanzas o temores',
            description: 'Tus deseos o miedos respecto a la situación.',
          },
          {
            name: 'Resultado',
            description:
              'El resultado probable si continúa el curso actual de los acontecimientos.',
          },
        ],
        imageUrl: 'https://ejemplo.com/tiradas/cruz-celta.jpg',
      });

      console.log(
        `Tirada "${celticCross.name}" creada con ID: ${celticCross.id}`,
      );
    } else {
      console.log(
        `Ya existen ${spreadsCount} tiradas en la base de datos. Saltando creación de tiradas.`,
      );
    }

    console.log('¡Datos iniciales cargados con éxito!');
  } catch (error) {
    console.error('Error al cargar datos iniciales:', error);
  } finally {
    await app.close();
  }
}

void bootstrap();
