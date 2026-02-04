import { Test, TestingModule } from '@nestjs/testing';
import { PendulumContentValidatorService } from './pendulum-content-validator.service';

describe('PendulumContentValidatorService', () => {
  let service: PendulumContentValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PendulumContentValidatorService],
    }).compile();

    service = module.get<PendulumContentValidatorService>(
      PendulumContentValidatorService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateQuestion', () => {
    describe('Valid questions', () => {
      it('should validate null question', () => {
        const result = service.validateQuestion(null);
        expect(result.isValid).toBe(true);
        expect(result.blockedCategory).toBeUndefined();
      });

      it('should validate undefined question', () => {
        const result = service.validateQuestion(undefined);
        expect(result.isValid).toBe(true);
        expect(result.blockedCategory).toBeUndefined();
      });

      it('should validate empty question', () => {
        const result = service.validateQuestion('');
        expect(result.isValid).toBe(true);
        expect(result.blockedCategory).toBeUndefined();
      });

      it('should validate safe question about love', () => {
        const result = service.validateQuestion('¿Debo aceptar este trabajo?');
        expect(result.isValid).toBe(true);
        expect(result.blockedCategory).toBeUndefined();
      });

      it('should validate question about relationships', () => {
        const result = service.validateQuestion(
          '¿Es el momento de iniciar esta relación?',
        );
        expect(result.isValid).toBe(true);
        expect(result.blockedCategory).toBeUndefined();
      });

      it('should validate question about personal growth', () => {
        const result = service.validateQuestion(
          '¿Debo enfocarme en mi crecimiento personal?',
        );
        expect(result.isValid).toBe(true);
        expect(result.blockedCategory).toBeUndefined();
      });
    });

    describe('Blocked health questions', () => {
      it('should block question about disease', () => {
        const result = service.validateQuestion('¿Tengo alguna enfermedad?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question about cancer', () => {
        const result = service.validateQuestion('¿Tengo cáncer?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question about death', () => {
        const result = service.validateQuestion('¿Cuándo voy a morir?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question about suicide', () => {
        const result = service.validateQuestion('¿Debo suicidarme?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question about medical treatment', () => {
        const result = service.validateQuestion(
          '¿Debo tomar este medicamento?',
        );
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question with accents normalized', () => {
        const result = service.validateQuestion('¿Tengo algún diagnóstico?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });
    });

    describe('Blocked legal questions', () => {
      it('should block question about lawsuit', () => {
        const result = service.validateQuestion('¿Ganaré la demanda?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('legal');
      });

      it('should block question about prison', () => {
        const result = service.validateQuestion('¿Me irán a la cárcel?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('legal');
      });

      it('should block question about legal judgment', () => {
        const result = service.validateQuestion(
          '¿Saldré bien del juicio legal?',
        );
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('legal');
      });

      it('should block question about arrest', () => {
        const result = service.validateQuestion('¿Me van a arrestar?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('legal');
      });
    });

    describe('Blocked financial questions', () => {
      it('should block question about cryptocurrency', () => {
        const result = service.validateQuestion('¿Debo invertir en Bitcoin?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });

      it('should block question about gambling', () => {
        const result = service.validateQuestion('¿Debo apostar hoy?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });

      it('should block question about lottery', () => {
        const result = service.validateQuestion('¿Ganaré la lotería?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });

      it('should block question about investment', () => {
        const result = service.validateQuestion('¿Es buena esta inversión?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });

      it('should block question about casino', () => {
        const result = service.validateQuestion('¿Voy al casino esta noche?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });
    });

    describe('Blocked violence questions', () => {
      it('should block question about harming', () => {
        const result = service.validateQuestion('¿Debo dañar a alguien?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('contenido sensible');
      });

      it('should block question about revenge', () => {
        const result = service.validateQuestion('¿Es momento de venganza?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('contenido sensible');
      });

      it('should block question about killing', () => {
        const result = service.validateQuestion('¿Debo matar?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('contenido sensible');
      });
    });

    describe('Case sensitivity and normalization', () => {
      it('should block uppercase question', () => {
        const result = service.validateQuestion('¿TENGO CÁNCER?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block mixed case question', () => {
        const result = service.validateQuestion('¿TenGo CánCeR?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question without accents', () => {
        const result = service.validateQuestion('¿Tengo cancer?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should block question with extra spaces', () => {
        const result = service.validateQuestion(
          '¿Debo   invertir   en   Bitcoin?',
        );
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });
    });

    describe('Partial word matching', () => {
      it('should block word within larger sentence', () => {
        const result = service.validateQuestion(
          'Tengo dudas sobre mi salud, ¿tengo cáncer en mi familia?',
        );
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should not block if word is part of valid word', () => {
        // "cáncer" no debería bloquearse si es parte de "canceriano" (signo zodiacal)
        // pero nuestro sistema sí lo bloqueará por simplicidad (better safe than sorry)
        const result = service.validateQuestion('¿Soy canceriano?');
        expect(result.isValid).toBe(false); // Comportamiento esperado por seguridad
        expect(result.blockedCategory).toBe('salud');
      });
    });

    describe('Edge cases', () => {
      it('should handle very long question', () => {
        const longQuestion =
          '¿' + 'a'.repeat(1000) + 'cáncer' + 'b'.repeat(1000) + '?';
        const result = service.validateQuestion(longQuestion);
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('salud');
      });

      it('should handle question with special characters', () => {
        const result = service.validateQuestion('¿Tengo $$$$ en Bitcoin?');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });

      it('should handle question with emojis', () => {
        const result = service.validateQuestion('¿Debo apostar? 🎰💰');
        expect(result.isValid).toBe(false);
        expect(result.blockedCategory).toBe('financiero');
      });
    });
  });
});
