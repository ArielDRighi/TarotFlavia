import { SystemConfig } from './system-config.entity';

describe('SystemConfig Entity', () => {
  describe('constructor', () => {
    it('should create a SystemConfig instance', () => {
      const config = new SystemConfig();
      expect(config).toBeDefined();
      expect(config).toBeInstanceOf(SystemConfig);
    });
  });

  describe('properties', () => {
    it('should set and get all properties correctly', () => {
      const config = new SystemConfig();

      config.id = 1;
      config.category = 'usage_limits';
      config.key = 'birth_chart';
      config.value = '{"anonymous":0,"free":3,"premium":5}';
      config.description = 'Límites de carta astral';
      config.updatedBy = 'admin@auguria.com';
      config.createdAt = new Date('2026-02-06T12:00:00Z');
      config.updatedAt = new Date('2026-02-06T12:00:00Z');

      expect(config.id).toBe(1);
      expect(config.category).toBe('usage_limits');
      expect(config.key).toBe('birth_chart');
      expect(config.value).toBe('{"anonymous":0,"free":3,"premium":5}');
      expect(config.description).toBe('Límites de carta astral');
      expect(config.updatedBy).toBe('admin@auguria.com');
      expect(config.createdAt).toEqual(new Date('2026-02-06T12:00:00Z'));
      expect(config.updatedAt).toEqual(new Date('2026-02-06T12:00:00Z'));
    });

    it('should allow nullable fields', () => {
      const config = new SystemConfig();

      config.description = null;
      config.updatedBy = null;

      expect(config.description).toBeNull();
      expect(config.updatedBy).toBeNull();
    });
  });

  describe('JSON value parsing', () => {
    it('should store and parse valid JSON in value field', () => {
      const config = new SystemConfig();
      const limits = { anonymous: 0, free: 3, premium: 5 };

      config.value = JSON.stringify(limits);

      const parsed = JSON.parse(config.value);
      expect(parsed).toEqual(limits);
      expect(parsed.anonymous).toBe(0);
      expect(parsed.free).toBe(3);
      expect(parsed.premium).toBe(5);
    });

    it('should handle complex JSON structures', () => {
      const config = new SystemConfig();
      const complexValue = {
        limits: { free: 3, premium: 5 },
        metadata: { lastUpdated: '2026-02-06', reason: 'testing' },
      };

      config.value = JSON.stringify(complexValue);

      const parsed = JSON.parse(config.value);
      expect(parsed).toEqual(complexValue);
      expect(parsed.limits.free).toBe(3);
      expect(parsed.metadata.reason).toBe('testing');
    });
  });
});
