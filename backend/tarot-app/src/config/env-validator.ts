import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { EnvironmentVariables } from './env.validation';

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

  return validatedConfig;
}
