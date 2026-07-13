import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

/**
 * Variables sin las cuales no se puede enviar un email real.
 */
const REQUIRED_SMTP_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
] as const;

/**
 * El render de los `.hbs` va fuera del `if`: en modo jsonTransport también se
 * ejercita el HandlebarsAdapter, así una plantilla rota se detecta en los tests
 * y no en producción (T-PROD-012).
 */
const TEMPLATE_OPTIONS: MailerOptions['template'] = {
  dir: join(__dirname, 'templates'),
  adapter: new HandlebarsAdapter(),
  options: {
    strict: true,
  },
};

/**
 * Construye la configuración del MailerModule a partir del entorno.
 *
 * En **producción**, una configuración SMTP incompleta **detiene el arranque**: antes
 * caía en silencio a `jsonTransport`, con lo cual la app levantaba perfecta, escribía
 * un warning que nadie lee y ningún usuario recibía su email (T-PROD-012).
 *
 * Fuera de producción se conserva el fallback a `jsonTransport`, del que dependen el
 * dev local y los tests.
 *
 * @throws {Error} en producción, si falta alguna variable SMTP.
 */
export function createMailerOptions(
  configService: ConfigService,
): MailerOptions {
  const logger = new Logger('EmailModule');

  const missingKeys = REQUIRED_SMTP_KEYS.filter(
    (key) => !configService.get<string>(key),
  );

  if (missingKeys.length > 0) {
    const isProduction = configService.get<string>('NODE_ENV') === 'production';

    if (isProduction) {
      throw new Error(
        `❌ SMTP configuration is incomplete in production. Missing: ${missingKeys.join(', ')}.\n\n` +
          `The app will NOT start with an incomplete SMTP setup: falling back to jsonTransport here ` +
          `would silently drop every email (password resets included) while the app looked healthy.\n` +
          `Set these variables in the deployment environment. See .env.example and docs/EMAIL_SETUP.md.`,
      );
    }

    logger.warn(
      `⚠️  Email configuration is incomplete (missing: ${missingKeys.join(', ')}). ` +
        'Running in TEST MODE with jsonTransport: emails are logged to the console, not sent.',
    );

    return {
      transport: {
        jsonTransport: true,
      },
      defaults: {
        from: 'noreply@example.com',
      },
      template: TEMPLATE_OPTIONS,
    };
  }

  const smtpPort = Number(configService.get<string>('SMTP_PORT'));
  const emailFrom = configService.get<string>('EMAIL_FROM');

  return {
    transport: {
      host: configService.get<string>('SMTP_HOST'),
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: configService.get<string>('SMTP_USER'),
        pass: configService.get<string>('SMTP_PASS'),
      },
    },
    defaults: {
      from: emailFrom,
      // Sin esto, la respuesta de un cliente a noreply@ se pierde (T-PROD-012).
      replyTo: configService.get<string>('EMAIL_REPLY_TO') ?? emailFrom,
    },
    template: TEMPLATE_OPTIONS,
  };
}
