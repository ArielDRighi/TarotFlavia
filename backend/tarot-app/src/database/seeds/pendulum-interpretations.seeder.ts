import { DataSource } from 'typeorm';
import { PendulumInterpretation } from '../../modules/pendulum/entities/pendulum-interpretation.entity';
import { PendulumResponse } from '../../modules/pendulum/domain/enums/pendulum.enums';

/**
 * Seed Pendulum Interpretations
 * This seeder populates the database with 30 predefined interpretations
 * for the Digital Pendulum feature (10 per response type: yes, no, maybe)
 *
 * Features:
 * - Idempotent: Can be run multiple times without duplicating data
 * - Creates 30 mystical interpretations (10 YES, 10 NO, 10 MAYBE)
 * - All interpretations are generic and applicable to any question
 * - Spanish language for user-facing content
 */
export async function seedPendulumInterpretations(
  dataSource: DataSource,
): Promise<void> {
  console.log('🔮 Starting Pendulum Interpretations seeding process...');

  const interpretationRepository = dataSource.getRepository(
    PendulumInterpretation,
  );

  // Check if interpretations already exist (idempotency)
  const existingCount = await interpretationRepository.count();

  if (existingCount > 0) {
    console.log(
      `✅ Pendulum interpretations already seeded (found ${existingCount} interpretation(s)). Skipping...`,
    );
    return;
  }

  // Define interpretations data
  const interpretations = [
    // YES (10)
    {
      responseType: PendulumResponse.YES,
      text: 'El universo afirma tu camino. La energía fluye a tu favor.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'Las fuerzas cósmicas se alinean positivamente. Confía en tu intuición.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'La respuesta es clara como el cristal. El momento es propicio.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'Los astros sonríen ante tu pregunta. Adelante con confianza.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'La luz guía tu sendero. Esta es la dirección correcta.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'El péndulo confirma lo que tu corazón ya sabía.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'Las vibraciones son armoniosas. El sí resuena en el éter.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'Tu energía atrae lo positivo. La respuesta está clara.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'El cosmos conspira a tu favor en este momento.',
    },
    {
      responseType: PendulumResponse.YES,
      text: 'La sabiduría ancestral confirma: es tiempo de avanzar.',
    },

    // NO (10)
    {
      responseType: PendulumResponse.NO,
      text: 'El universo sugiere pausa. Hay otras direcciones por explorar.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'Las energías indican resistencia. Quizás no sea el momento.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'El péndulo señala cautela. Reflexiona antes de actuar.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'Los vientos cósmicos soplan en otra dirección por ahora.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'La respuesta requiere paciencia. Este no es el camino indicado.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'Las fuerzas sutiles aconsejan esperar. Hay lecciones por aprender.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'El cosmos protege tu camino desviándote de esta ruta.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'La energía universal sugiere reconsiderar tus opciones.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'El no de hoy puede ser el sí de mañana. Todo tiene su tiempo.',
    },
    {
      responseType: PendulumResponse.NO,
      text: 'La sabiduría del péndulo aconseja otro rumbo.',
    },

    // MAYBE (10)
    {
      responseType: PendulumResponse.MAYBE,
      text: 'Las energías están en equilibrio. El momento requiere más claridad.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'El universo guarda silencio por ahora. La respuesta vendrá.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'El péndulo danza entre mundos. Hay factores aún por revelarse.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'Las fuerzas cósmicas deliberan. Ten paciencia.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'Ni sí ni no. El misterio se mantiene por una razón.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'El cosmos sugiere esperar más información antes de decidir.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'Las energías fluctúan. La respuesta se cristalizará con el tiempo.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'El péndulo refleja tu propia incertidumbre. Medita más.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'Hay variables ocultas en juego. El tiempo revelará la verdad.',
    },
    {
      responseType: PendulumResponse.MAYBE,
      text: 'El universo te invita a la reflexión profunda antes de actuar.',
    },
  ];

  // Insert all interpretations using repository
  console.log(
    `💾 Inserting ${interpretations.length} pendulum interpretations...`,
  );

  const interpretationEntities = interpretations.map((data) =>
    interpretationRepository.create({
      responseType: data.responseType,
      text: data.text,
      isActive: true,
    }),
  );

  await interpretationRepository.save(interpretationEntities);

  console.log(
    `✅ Successfully seeded ${interpretations.length} pendulum interpretations`,
  );
  console.log(`   • YES interpretations: 10`);
  console.log(`   • NO interpretations: 10`);
  console.log(`   • MAYBE interpretations: 10`);
  console.log(`\n🎉 Pendulum interpretations seeding completed successfully!`);
}
