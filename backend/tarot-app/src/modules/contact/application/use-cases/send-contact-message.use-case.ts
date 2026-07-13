import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EmailService } from '../../../email/email.service';
import { SendContactMessageDto } from '../dto/send-contact-message.dto';

export interface SendContactMessageResult {
  message: string;
}

/**
 * Stack del error original. `EmailService` relanza con `{ cause }`, y el stack del error
 * externo solo apunta a ese `throw`: sin desenvolver la causa, el log no dice qué falló
 * realmente en el SMTP.
 */
function rootStack(error: unknown): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const cause = error.cause;
  if (cause instanceof Error && cause.stack) {
    return cause.stack;
  }

  return error.stack ?? error.message;
}

/**
 * Envía al buzón de Auguria un mensaje del formulario de contacto (T-PROD-014).
 *
 * Si el email no sale, el caso de uso **falla**: el bug original era mostrarle al
 * visitante un "mensaje enviado" mientras el mensaje moría en la consola del navegador.
 */
@Injectable()
export class SendContactMessageUseCase {
  private readonly logger = new Logger(SendContactMessageUseCase.name);

  constructor(private readonly emailService: EmailService) {}

  async execute(dto: SendContactMessageDto): Promise<SendContactMessageResult> {
    try {
      await this.emailService.sendContactMessageEmail({
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      });
    } catch (error) {
      // Único log del fallo, y con la causa raíz: el remitente y el asunto permiten
      // rescatar el mensaje del log si el SMTP estaba caído, y el stack del `cause`
      // dice POR QUÉ falló (el `Error` que relanza EmailService no lo diría solo).
      this.logger.error(
        `No se pudo enviar el mensaje de contacto de ${dto.email} ("${dto.subject}")`,
        rootStack(error),
      );

      throw new InternalServerErrorException(
        'No pudimos enviar tu mensaje. Por favor, intentá nuevamente en unos minutos.',
      );
    }

    return {
      message: 'Mensaje enviado exitosamente. Te responderemos a la brevedad.',
    };
  }
}
