import { PendulumResponse, PendulumMovement } from './pendulum.enums';

describe('Pendulum Enums', () => {
  describe('PendulumResponse', () => {
    it('should have YES value', () => {
      expect(PendulumResponse.YES).toBe('yes');
    });

    it('should have NO value', () => {
      expect(PendulumResponse.NO).toBe('no');
    });

    it('should have MAYBE value', () => {
      expect(PendulumResponse.MAYBE).toBe('maybe');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(PendulumResponse);
      expect(values).toHaveLength(3);
      expect(values).toContain('yes');
      expect(values).toContain('no');
      expect(values).toContain('maybe');
    });

    it('should be usable in switch statements', () => {
      const testResponse = (response: PendulumResponse): string => {
        switch (response) {
          case PendulumResponse.YES:
            return 'Sí';
          case PendulumResponse.NO:
            return 'No';
          case PendulumResponse.MAYBE:
            return 'Quizás';
        }
      };

      expect(testResponse(PendulumResponse.YES)).toBe('Sí');
      expect(testResponse(PendulumResponse.NO)).toBe('No');
      expect(testResponse(PendulumResponse.MAYBE)).toBe('Quizás');
    });
  });

  describe('PendulumMovement', () => {
    it('should have VERTICAL value', () => {
      expect(PendulumMovement.VERTICAL).toBe('vertical');
    });

    it('should have HORIZONTAL value', () => {
      expect(PendulumMovement.HORIZONTAL).toBe('horizontal');
    });

    it('should have CIRCULAR value', () => {
      expect(PendulumMovement.CIRCULAR).toBe('circular');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(PendulumMovement);
      expect(values).toHaveLength(3);
      expect(values).toContain('vertical');
      expect(values).toContain('horizontal');
      expect(values).toContain('circular');
    });

    it('should map responses to movements correctly', () => {
      const getMovement = (response: PendulumResponse): PendulumMovement => {
        switch (response) {
          case PendulumResponse.YES:
            return PendulumMovement.VERTICAL;
          case PendulumResponse.NO:
            return PendulumMovement.HORIZONTAL;
          case PendulumResponse.MAYBE:
            return PendulumMovement.CIRCULAR;
        }
      };

      expect(getMovement(PendulumResponse.YES)).toBe(PendulumMovement.VERTICAL);
      expect(getMovement(PendulumResponse.NO)).toBe(
        PendulumMovement.HORIZONTAL,
      );
      expect(getMovement(PendulumResponse.MAYBE)).toBe(
        PendulumMovement.CIRCULAR,
      );
    });
  });

  describe('Enum compatibility', () => {
    it('should work with database enum types', () => {
      // Test that enum values are strings suitable for DB
      expect(typeof PendulumResponse.YES).toBe('string');
      expect(typeof PendulumResponse.NO).toBe('string');
      expect(typeof PendulumResponse.MAYBE).toBe('string');

      expect(typeof PendulumMovement.VERTICAL).toBe('string');
      expect(typeof PendulumMovement.HORIZONTAL).toBe('string');
      expect(typeof PendulumMovement.CIRCULAR).toBe('string');
    });

    it('should use lowercase snake_case for consistency', () => {
      // All enum values should be lowercase with underscores
      const responseValues = Object.values(PendulumResponse);
      responseValues.forEach((value) => {
        expect(value).toMatch(/^[a-z_]+$/);
      });

      const movementValues = Object.values(PendulumMovement);
      movementValues.forEach((value) => {
        expect(value).toMatch(/^[a-z_]+$/);
      });
    });
  });
});
