import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EmailService } from '../../../email/email.service';
import { SendContactMessageDto } from '../dto/send-contact-message.dto';
import { SendContactMessageUseCase } from './send-contact-message.use-case';

describe('SendContactMessageUseCase (T-PROD-014)', () => {
  let useCase: SendContactMessageUseCase;

  const mockEmailService: jest.Mocked<
    Pick<EmailService, 'sendContactMessageEmail'>
  > = {
    sendContactMessageEmail: jest.fn(),
  };

  const dto: SendContactMessageDto = {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    subject: 'Consulta por una lectura',
    message: 'Hola, quería saber cómo reservar una sesión.',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendContactMessageUseCase,
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    useCase = module.get<SendContactMessageUseCase>(SendContactMessageUseCase);
    jest.clearAllMocks();
  });

  it('envía el mensaje por email con los datos del formulario', async () => {
    mockEmailService.sendContactMessageEmail.mockResolvedValue(undefined);

    await useCase.execute(dto);

    expect(mockEmailService.sendContactMessageEmail).toHaveBeenCalledTimes(1);
    expect(mockEmailService.sendContactMessageEmail).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
    });
  });

  it('devuelve una confirmación en español para el usuario', async () => {
    mockEmailService.sendContactMessageEmail.mockResolvedValue(undefined);

    const result = await useCase.execute(dto);

    expect(result.message).toContain('Mensaje enviado');
  });

  it('lanza 500 si el email no sale: el bug de esta tarea era justamente devolver éxito con el mensaje perdido', async () => {
    mockEmailService.sendContactMessageEmail.mockRejectedValue(
      new Error('SMTP caído'),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('loguea el fallo de envío con el email del remitente, para poder recuperar el mensaje del log si hace falta', async () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'error');
    mockEmailService.sendContactMessageEmail.mockRejectedValue(
      new Error('SMTP caído'),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('ana@example.com'),
      expect.any(String),
    );

    loggerSpy.mockRestore();
  });

  it('loguea la causa raíz del SMTP, no el stack del re-throw: sin eso el log dice que falló pero no por qué', async () => {
    const loggerSpy = jest.spyOn(Logger.prototype, 'error');
    const smtpFailure = new Error('ECONNREFUSED smtp.resend.com:587');
    mockEmailService.sendContactMessageEmail.mockRejectedValue(
      new Error('Error al enviar el mensaje de contacto', {
        cause: smtpFailure,
      }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('ECONNREFUSED'),
    );

    loggerSpy.mockRestore();
  });
});
