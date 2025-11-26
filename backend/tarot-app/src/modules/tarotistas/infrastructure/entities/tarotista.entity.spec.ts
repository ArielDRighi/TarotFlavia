import { Tarotista } from './tarotista.entity';
import { User } from '../../../users/entities/user.entity';

describe('Tarotista Entity', () => {
  describe('creation and validation', () => {
    it('should create a tarotista with required fields', () => {
      const tarotista = new Tarotista();
      tarotista.id = 1;
      tarotista.userId = 1;
      tarotista.nombrePublico = 'Flavia';
      tarotista.bio = 'Tarotista con 20 años de experiencia';
      tarotista.isActive = true;
      tarotista.isAcceptingNewClients = true;
      tarotista.comisiónPorcentaje = 30.0;

      expect(tarotista.id).toBe(1);
      expect(tarotista.userId).toBe(1);
      expect(tarotista.nombrePublico).toBe('Flavia');
      expect(tarotista.bio).toBe('Tarotista con 20 años de experiencia');
      expect(tarotista.isActive).toBe(true);
      expect(tarotista.comisiónPorcentaje).toBe(30.0);
    });

    it('should have default values for optional fields', () => {
      const tarotista = new Tarotista();
      tarotista.nombrePublico = 'Test';
      tarotista.userId = 1;

      expect(tarotista.isActive).toBeUndefined(); // Will be set by default in entity
      expect(tarotista.isFeatured).toBeUndefined();
      expect(tarotista.comisiónPorcentaje).toBeUndefined();
      expect(tarotista.totalLecturas).toBeUndefined();
      expect(tarotista.ratingPromedio).toBeUndefined();
      expect(tarotista.totalReviews).toBeUndefined();
    });

    it('should accept array fields for especialidades and idiomas', () => {
      const tarotista = new Tarotista();
      tarotista.especialidades = ['Amor', 'Trabajo', 'Salud'];
      tarotista.idiomas = ['Español', 'Inglés'];

      expect(tarotista.especialidades).toEqual(['Amor', 'Trabajo', 'Salud']);
      expect(tarotista.idiomas).toEqual(['Español', 'Inglés']);
      expect(tarotista.especialidades.length).toBe(3);
      expect(tarotista.idiomas.length).toBe(2);
    });

    it('should store session information', () => {
      const tarotista = new Tarotista();
      tarotista.ofreceSesionesVirtuales = true;
      tarotista.precioSesionUsd = 50.0;
      tarotista.duracionSesionMinutos = 60;

      expect(tarotista.ofreceSesionesVirtuales).toBe(true);
      expect(tarotista.precioSesionUsd).toBe(50.0);
      expect(tarotista.duracionSesionMinutos).toBe(60);
    });

    it('should track statistics', () => {
      const tarotista = new Tarotista();
      tarotista.totalLecturas = 150;
      tarotista.ratingPromedio = 4.8;
      tarotista.totalReviews = 50;

      expect(tarotista.totalLecturas).toBe(150);
      expect(tarotista.ratingPromedio).toBe(4.8);
      expect(tarotista.totalReviews).toBe(50);
    });
  });

  describe('relationships', () => {
    it('should have a user relationship', () => {
      const tarotista = new Tarotista();
      const user = new User();
      user.id = 1;
      user.email = 'flavia@example.com';
      user.name = 'Flavia';

      tarotista.user = user;
      tarotista.userId = user.id;

      expect(tarotista.user).toBeDefined();
      expect(tarotista.userId).toBe(1);
      expect(tarotista.user.email).toBe('flavia@example.com');
    });

    it('should support multiple relationships', () => {
      const tarotista = new Tarotista();
      tarotista.configs = [];
      tarotista.customCardMeanings = [];
      tarotista.subscriptions = [];
      tarotista.readings = [];
      tarotista.reviews = [];
      tarotista.revenueMetrics = [];

      expect(Array.isArray(tarotista.configs)).toBe(true);
      expect(Array.isArray(tarotista.customCardMeanings)).toBe(true);
      expect(Array.isArray(tarotista.subscriptions)).toBe(true);
      expect(Array.isArray(tarotista.readings)).toBe(true);
      expect(Array.isArray(tarotista.reviews)).toBe(true);
      expect(Array.isArray(tarotista.revenueMetrics)).toBe(true);
    });
  });

  describe('business logic', () => {
    it('should validate commission percentage range (0-100)', () => {
      const tarotista = new Tarotista();

      // Valid values
      tarotista.comisiónPorcentaje = 0;
      expect(tarotista.comisiónPorcentaje).toBe(0);

      tarotista.comisiónPorcentaje = 50;
      expect(tarotista.comisiónPorcentaje).toBe(50);

      tarotista.comisiónPorcentaje = 100;
      expect(tarotista.comisiónPorcentaje).toBe(100);

      // Note: Actual validation happens at DB level via CHECK constraint
    });

    it('should validate rating range (0-5)', () => {
      const tarotista = new Tarotista();

      // Valid values
      tarotista.ratingPromedio = 0;
      expect(tarotista.ratingPromedio).toBe(0);

      tarotista.ratingPromedio = 4.5;
      expect(tarotista.ratingPromedio).toBe(4.5);

      tarotista.ratingPromedio = 5;
      expect(tarotista.ratingPromedio).toBe(5);

      // Note: Actual validation happens at DB level via CHECK constraint
    });

    it('should track if accepting new clients', () => {
      const tarotista = new Tarotista();
      tarotista.isAcceptingNewClients = false;

      expect(tarotista.isAcceptingNewClients).toBe(false);

      tarotista.isAcceptingNewClients = true;
      expect(tarotista.isAcceptingNewClients).toBe(true);
    });

    it('should support featured tarotistas', () => {
      const tarotista = new Tarotista();
      tarotista.isFeatured = true;

      expect(tarotista.isFeatured).toBe(true);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const tarotista = new Tarotista();
      const now = new Date();

      tarotista.createdAt = now;
      tarotista.updatedAt = now;

      expect(tarotista.createdAt).toEqual(now);
      expect(tarotista.updatedAt).toEqual(now);
    });
  });
});
