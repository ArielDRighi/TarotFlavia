import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const smtpHost = configService.get<string>('SMTP_HOST');
        const smtpPort = configService.get<number>('SMTP_PORT');
        const smtpUser = configService.get<string>('SMTP_USER');
        const smtpPass = configService.get<string>('SMTP_PASS');
        const emailFrom = configService.get<string>('EMAIL_FROM');

        // Si no hay configuración SMTP, usar configuración por defecto que no enviará emails
        if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailFrom) {
          return {
            transport: {
              jsonTransport: true, // Modo de prueba que no envía emails reales
            },
            defaults: {
              from: 'noreply@example.com',
            },
          };
        }

        return {
          transport: {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          },
          defaults: {
            from: emailFrom,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
