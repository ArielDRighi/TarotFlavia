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
      // El log lleva el remitente y el asunto: si el SMTP estaba caído, el mensaje
      // todavía puede rescatarse del log en vez de perderse del todo.
      this.logger.error(
        `No se pudo enviar el mensaje de contacto de ${dto.email} ("${dto.subject}")`,
        error instanceof Error ? error.stack : String(error),
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
