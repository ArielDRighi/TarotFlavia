import { Injectable, Inject, Logger } from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { EmailService } from '../../../email/email.service';
import { IPasswordResetRepository } from '../../domain/interfaces/password-reset-repository.interface';
import { PASSWORD_RESET_REPOSITORY } from '../../domain/interfaces/repository.tokens';

/**
 * Mensaje único: no revela si el email está registrado (previene enumeración de usuarios).
 */
const GENERIC_MESSAGE =
  'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: IPasswordResetRepository,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      this.logger.log(
        'Solicitud de recuperación para un email no registrado — no se genera token',
      );
      return { message: GENERIC_MESSAGE };
    }

    const { token } =
      await this.passwordResetRepository.generateResetToken(email);

    // Envío en segundo plano, a propósito: si esperáramos al SMTP, la respuesta tardaría
    // ~1s para un email registrado y ~0ms para uno que no lo está. Ese delta es un oráculo
    // de enumeración de usuarios, justo lo que el mensaje genérico intenta evitar.
    // Un fallo de envío tampoco debe cambiar la respuesta, por la misma razón.
    void this.emailService
      .sendPasswordResetEmail(user.email, user.name, token)
      .catch((error: unknown) => {
        this.logger.error(
          `Error al enviar el email de recuperación al usuario ${user.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      });

    return { message: GENERIC_MESSAGE };
  }
}
