import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Environment, EnvironmentVariables } from './env.validation';

/**
 * Sin estas 5, no se puede enviar un solo email.
 */
const REQUIRED_SMTP_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
] as const;

/**
 * Hostnames que delatan una URL de desarrollo colada en producción.
 */
const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'];

/**
 * `FRONTEND_URL` tiene default, así que class-validator nunca la marca como faltante, y
 * la app la consume tal cual para armar los links de todos los emails. Se valida
 * **parseándola**: una URL sin esquema (`www.auguriatarot.com`) produciría links rotos,
 * y sería la misma falla silenciosa un escalón más abajo (T-PROD-012).
 *
 * @returns el mensaje de error, o `null` si la URL sirve.
 */
function checkFrontendUrl(rawValue: unknown): string | null {
  const value = typeof rawValue === 'string' ? rawValue.trim() : '';

  if (!value) {
    return (
      `FRONTEND_URL: must be set to the real frontend URL in production (not set).\n` +
      `  It builds the links of every email (password reset included): left unset it falls back ` +
      `to localhost, and the links point nowhere without a single error in the logs.`
    );
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return (
      `FRONTEND_URL: must be an absolute URL including the scheme (got: ${value}).\n` +
      `  Without it, every email link comes out broken. Example: https://auguriatarot.com`
    );
  }

  if (LOCAL_HOSTNAMES.includes(url.hostname)) {
    return `FRONTEND_URL: must not point to a local host in production (got: ${value}).`;
  }

  return null;
}

/**
 * Validaciones que solo aplican en producción, y que class-validator no puede expresar
 * (variables con default, o exigidas únicamente cuando `NODE_ENV=production`).
 *
 * Corre dentro de `ConfigModule.forRoot`, es decir **antes** de que TypeORM conecte y
 * aplique las migraciones: un deploy con el email mal configurado muere sin haber tocado
 * la base. Y acumula **todos** los errores en un solo mensaje, para que Ops no tenga que
 * descubrir las variables faltantes de a una por deploy (T-PROD-012).
 */
function validateProductionOnlyVariables(
  config: Record<string, unknown>,
  validatedConfig: EnvironmentVariables,
): void {
  if (validatedConfig.NODE_ENV !== Environment.Production) {
    return;
  }

  const errors: string[] = [];

  const missingSmtpKeys = REQUIRED_SMTP_KEYS.filter((key) => !config[key]);
  if (missingSmtpKeys.length > 0) {
    errors.push(
      `SMTP configuration is incomplete. Missing: ${missingSmtpKeys.join(', ')}.\n` +
        `  Falling back to jsonTransport here would silently drop every email (password resets ` +
        `included) while the app looked perfectly healthy.`,
    );
  }

  const frontendUrlError = checkFrontendUrl(config.FRONTEND_URL);
  if (frontendUrlError) {
    errors.push(frontendUrlError);
  }

  // El string vacío tampoco es un buzón: `@Transform` ya lo convirtió en undefined.
  if (!validatedConfig.CONTACT_EMAIL_TO) {
    errors.push(
      `CONTACT_EMAIL_TO: must be set to the mailbox that receives the contact form messages (not set).\n` +
        `  Without it, every message a client sends from /contacto would go nowhere (T-PROD-014).\n` +
        `  Example: consultas@auguriatarot.com`,
    );
  }

  if (errors.length > 0) {
    throw new Error(
      `❌ Environment variable validation failed (production):\n\n${errors.join('\n\n')}\n\n` +
        `The app will NOT start with an incomplete email setup.\n` +
        `See .env.example and docs/EMAIL_SETUP.md for reference.`,
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
