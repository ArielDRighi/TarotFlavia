import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Environment, EnvironmentVariables } from './env.validation';

/**
 * `FRONTEND_URL` tiene default, así que class-validator nunca la marca como faltante.
 * En producción eso era una falla silenciosa: sin la variable, los links de todos los
 * emails (reset de contraseña incluido) salían apuntando a localhost y no se registraba
 * ningún error. En producción exigimos una URL real (T-PROD-012).
 */
function validateProductionOnlyVariables(
  config: Record<string, unknown>,
  validatedConfig: EnvironmentVariables,
): void {
  if (validatedConfig.NODE_ENV !== Environment.Production) {
    return;
  }

  const frontendUrl =
    typeof config.FRONTEND_URL === 'string' ? config.FRONTEND_URL.trim() : '';
  const isLocal =
    frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');

  if (!frontendUrl || isLocal) {
    throw new Error(
      `❌ Environment variable validation failed:\n\n` +
        `FRONTEND_URL: must be set to the real frontend URL in production ` +
        `(got: ${frontendUrl || 'not set'}).\n\n` +
        `It builds the links of every email (password reset included): left unset it falls back ` +
        `to localhost and the links point nowhere, without a single error in the logs.\n` +
        `See .env.example for reference.`,
    );
  }
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints)
          : [];
        return `${error.property}: ${constraints.join(', ')}`;
      })
      .join('\n');

    throw new Error(
      `❌ Environment variable validation failed:\n\n${errorMessages}\n\n` +
        `Please check your .env file and ensure all required variables are set correctly.\n` +
        `See .env.example for reference.`,
    );
  }

  validateProductionOnlyVariables(config, validatedConfig);

  return validatedConfig;
}
