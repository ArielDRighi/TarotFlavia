import { DataSource } from 'typeorm';

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

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if interpretations already exist (idempotency)
    const existingCount = (await queryRunner.query(
      `SELECT COUNT(*) as count FROM "pendulum_interpretations"`,
    )) as Array<{ count: string }>;

    const count = Number(existingCount[0]?.count || 0);

    if (count > 0) {
      console.log(
        `✅ Pendulum interpretations already seeded (found ${count} interpretation(s)). Skipping...`,
      );
      return;
    }

    // Define interpretations data
    const interpretations = [
      // YES (10)
      {
        responseType: 'yes',
        text: 'El universo afirma tu camino. La energía fluye a tu favor.',
      },
      {
        responseType: 'yes',
        text: 'Las fuerzas cósmicas se alinean positivamente. Confía en tu intuición.',
      },
      {
        responseType: 'yes',
        text: 'La respuesta es clara como el cristal. El momento es propicio.',
      },
      {
        responseType: 'yes',
        text: 'Los astros sonríen ante tu pregunta. Adelante con confianza.',
      },
      {
        responseType: 'yes',
        text: 'La luz guía tu sendero. Esta es la dirección correcta.',
      },
      {
        responseType: 'yes',
        text: 'El péndulo confirma lo que tu corazón ya sabía.',
      },
      {
        responseType: 'yes',
        text: 'Las vibraciones son armoniosas. El sí resuena en el éter.',
      },
      {
        responseType: 'yes',
        text: 'Tu energía atrae lo positivo. La respuesta está clara.',
      },
      {
        responseType: 'yes',
        text: 'El cosmos conspira a tu favor en este momento.',
      },
      {
        responseType: 'yes',
        text: 'La sabiduría ancestral confirma: es tiempo de avanzar.',
      },

      // NO (10)
      {
        responseType: 'no',
        text: 'El universo sugiere pausa. Hay otras direcciones por explorar.',
      },
      {
        responseType: 'no',
        text: 'Las energías indican resistencia. Quizás no sea el momento.',
      },
      {
        responseType: 'no',
        text: 'El péndulo señala cautela. Reflexiona antes de actuar.',
      },
      {
        responseType: 'no',
        text: 'Los vientos cósmicos soplan en otra dirección por ahora.',
      },
      {
        responseType: 'no',
        text: 'La respuesta requiere paciencia. Este no es el camino indicado.',
      },
      {
        responseType: 'no',
        text: 'Las fuerzas sutiles aconsejan esperar. Hay lecciones por aprender.',
      },
      {
        responseType: 'no',
        text: 'El cosmos protege tu camino desviándote de esta ruta.',
      },
      {
        responseType: 'no',
        text: 'La energía universal sugiere reconsiderar tus opciones.',
      },
      {
        responseType: 'no',
        text: 'El no de hoy puede ser el sí de mañana. Todo tiene su tiempo.',
      },
      {
        responseType: 'no',
        text: 'La sabiduría del péndulo aconseja otro rumbo.',
      },

      // MAYBE (10)
      {
        responseType: 'maybe',
        text: 'Las energías están en equilibrio. El momento requiere más claridad.',
      },
      {
        responseType: 'maybe',
        text: 'El universo guarda silencio por ahora. La respuesta vendrá.',
      },
      {
        responseType: 'maybe',
        text: 'El péndulo danza entre mundos. Hay factores aún por revelarse.',
      },
      {
        responseType: 'maybe',
        text: 'Las fuerzas cósmicas deliberan. Ten paciencia.',
      },
      {
        responseType: 'maybe',
        text: 'Ni sí ni no. El misterio se mantiene por una razón.',
      },
      {
        responseType: 'maybe',
        text: 'El cosmos sugiere esperar más información antes de decidir.',
      },
      {
        responseType: 'maybe',
        text: 'Las energías fluctúan. La respuesta se cristalizará con el tiempo.',
      },
      {
        responseType: 'maybe',
        text: 'El péndulo refleja tu propia incertidumbre. Medita más.',
      },
      {
        responseType: 'maybe',
        text: 'Hay variables ocultas en juego. El tiempo revelará la verdad.',
      },
      {
        responseType: 'maybe',
        text: 'El universo te invita a la reflexión profunda antes de actuar.',
      },
    ];

    // Insert all interpretations
    console.log(
      `💾 Inserting ${interpretations.length} pendulum interpretations...`,
    );

    for (const interpretation of interpretations) {
      await queryRunner.query(
        `INSERT INTO "pendulum_interpretations" ("responseType", "text", "isActive") VALUES ($1, $2, $3)`,
        [interpretation.responseType, interpretation.text, true],
      );
    }

    console.log(
      `✅ Successfully seeded ${interpretations.length} pendulum interpretations`,
    );
    console.log(`   • YES interpretations: 10`);
    console.log(`   • NO interpretations: 10`);
    console.log(`   • MAYBE interpretations: 10`);
    console.log(
      `\n🎉 Pendulum interpretations seeding completed successfully!`,
    );
  } catch (error) {
    console.error('❌ Error seeding pendulum interpretations:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
