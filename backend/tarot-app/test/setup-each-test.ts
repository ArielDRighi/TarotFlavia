import { e2eConnectionSource } from '../src/config/typeorm-e2e.config';

/**
 * Setup que se ejecuta antes de cada archivo de test
 * Resetea los usage limits para evitar que los tests fallen por límites diarios
 */
beforeEach(async () => {
  try {
    // Only reset usage limits if connection is initialized
    if (e2eConnectionSource.isInitialized) {
      await e2eConnectionSource.query(
        'TRUNCATE TABLE usage_limit RESTART IDENTITY CASCADE',
      );
    }
  } catch (error) {
    // Ignore errors if table doesn't exist or connection is not ready
    if (error instanceof Error) {
      if (
        !error.message.includes('does not exist') &&
        !error.message.includes('Connection')
      ) {
        console.warn(
          '[Setup Each Test] Could not reset usage limits:',
          error.message,
        );
      }
    }
  }
});
