import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SendContactMessageUseCase } from '../../application/use-cases/send-contact-message.use-case';
import { ContactController } from './contact.controller';

describe('ContactController (T-PROD-014)', () => {
  const validBody = {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    subject: 'Consulta por una lectura',
    message: 'Hola, quería saber cómo reservar una sesión.',
  };

  const mockUseCase = {
    execute: jest.fn(),
  };

  describe('delegación', () => {
    let controller: ContactController;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [ContactController],
        providers: [
          { provide: SendContactMessageUseCase, useValue: mockUseCase },
        ],
      }).compile();

      controller = module.get<ContactController>(ContactController);
      jest.clearAllMocks();
    });

    it('delega en el use case y devuelve su respuesta', async () => {
      mockUseCase.execute.mockResolvedValue({ message: 'Mensaje enviado' });

      const result = await controller.sendMessage(validBody);

      expect(mockUseCase.execute).toHaveBeenCalledWith(validBody);
      expect(result).toEqual({ message: 'Mensaje enviado' });
    });

    it('es un endpoint público: exigir JWT dejaría el formulario inservible para un visitante', () => {
      const guards = (Reflect.getMetadata(
        '__guards__',
        ContactController.prototype.sendMessage,
      ) ?? []) as unknown[];

      expect(guards).not.toContain(JwtAuthGuard);
    });
  });

  describe('endpoint HTTP', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          // Sin storage propio el @Throttle del controller no se aplica: el rate limit
          // es lo único que separa a este endpoint público de un buzón de spam.
          ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
        ],
        controllers: [ContactController],
        providers: [
          { provide: SendContactMessageUseCase, useValue: mockUseCase },
          { provide: APP_GUARD, useClass: ThrottlerGuard },
        ],
      }).compile();

      app = module.createNestApplication();
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();

      jest.clearAllMocks();
      mockUseCase.execute.mockResolvedValue({ message: 'Mensaje enviado' });
    });

    afterEach(async () => {
      await app.close();
    });

    it('acepta un mensaje válido (200)', async () => {
      await request(app.getHttpServer())
        .post('/contact')
        .send(validBody)
        .expect(200);

      expect(mockUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it.each([
      ['name corto', { ...validBody, name: 'A' }],
      ['email inválido', { ...validBody, email: 'no-es-un-email' }],
      ['subject corto', { ...validBody, subject: 'Hi' }],
      ['message corto', { ...validBody, message: 'corto' }],
      [
        'message de más de 2000 caracteres',
        {
          ...validBody,
          message: 'a'.repeat(2001),
        },
      ],
      [
        'subject con salto de línea (inyección de cabeceras)',
        {
          ...validBody,
          subject: 'Hola\nBcc: victima@example.com',
        },
      ],
    ])('rechaza con 400: %s', async (_caso, body) => {
      await request(app.getHttpServer())
        .post('/contact')
        .send(body)
        .expect(400);

      expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it('responde 429 pasado el límite: el endpoint es público y sin él sería un buzón de spam abierto', async () => {
      const server = app.getHttpServer();

      // El límite del endpoint es 3/hora (@Throttle en el controller).
      await request(server).post('/contact').send(validBody).expect(200);
      await request(server).post('/contact').send(validBody).expect(200);
      await request(server).post('/contact').send(validBody).expect(200);

      await request(server).post('/contact').send(validBody).expect(429);

      expect(mockUseCase.execute).toHaveBeenCalledTimes(3);
    });
  });
});
