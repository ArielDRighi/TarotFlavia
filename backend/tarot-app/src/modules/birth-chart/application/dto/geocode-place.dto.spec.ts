import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GeocodePlaceDto } from './geocode-place.dto';

describe('GeocodePlaceDto', () => {
  describe('valid data', () => {
    it('should pass validation with valid query', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 'Buenos Aires, Argentina',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept minimum length (3 characters)', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 'NYC',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept maximum length (255 characters)', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 'A'.repeat(255),
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept query with special characters', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 'São Paulo, Brazil - América do Sul',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should sanitize HTML in query', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: '<script>alert("xss")</script>Madrid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.query).toBe('Madrid');
    });
  });

  describe('query validation', () => {
    it('should fail when query is empty', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when query is less than 3 characters', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 'AB',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it('should fail when query exceeds 255 characters', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 'A'.repeat(256),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should fail when query is missing', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const queryError = errors.find((e) => e.property === 'query');
      expect(queryError).toBeDefined();
    });

    it('should fail when query is not a string', async () => {
      const dto = plainToInstance(GeocodePlaceDto, {
        query: 12345 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });
});
