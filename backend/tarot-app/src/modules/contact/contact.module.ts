import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { SendContactMessageUseCase } from './application/use-cases/send-contact-message.use-case';
import { ContactController } from './infrastructure/controllers/contact.controller';

/**
 * Formulario de contacto público (T-PROD-014).
 */
@Module({
  imports: [EmailModule],
  controllers: [ContactController],
  providers: [SendContactMessageUseCase],
})
export class ContactModule {}
