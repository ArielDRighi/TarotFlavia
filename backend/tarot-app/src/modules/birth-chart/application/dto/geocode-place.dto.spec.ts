import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GeocodePlaceDto, SelectPlaceDto } from './geocode-place.dto';

describe('GeocodePlaceDto', () => {
  describe('Valid inputs', () => {
    it('should validate a correct GeocodePlaceDto', async () => {
      const input = {
        query: 'Buenos Aires, Argentina',
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept minimum length (3 characters)', async () => {
      const input = {
        query: 'New',
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept maximum length (255 characters)', async () => {
      const input = {
        query: 'a'.repeat(255),
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Invalid inputs', () => {
    it('should fail if query is empty', async () => {
      const input = {
        query: '',
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if query is less than 3 characters', async () => {
      const input = {
        query: 'AB',
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail if query exceeds 255 characters', async () => {
      const input = {
        query: 'a'.repeat(256),
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should sanitize HTML in query', () => {
      const input = {
        query: '<script>alert("xss")</script>Buenos Aires',
      };

      const dto = plainToInstance(GeocodePlaceDto, input);
      expect(dto.query).toBe('Buenos Aires');
    });

    it('should fail if query is not provided', async () => {
      const input = {};

      const dto = plainToInstance(GeocodePlaceDto, input as any);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('query');
    });
  });
});

describe('SelectPlaceDto', () => {
  describe('Valid inputs', () => {
    it('should validate a correct SelectPlaceDto', async () => {
      const input = {
        placeId: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs',
      };

      const dto = plainToInstance(SelectPlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept any non-empty string as placeId', async () => {
      const input = {
        placeId: 'some-custom-place-id-12345',
      };

      const dto = plainToInstance(SelectPlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Invalid inputs', () => {
    it('should fail if placeId is empty', async () => {
      const input = {
        placeId: '',
      };

      const dto = plainToInstance(SelectPlaceDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('placeId');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if placeId is not provided', async () => {
      const input = {};

      const dto = plainToInstance(SelectPlaceDto, input as any);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('placeId');
    });

    it('should fail if placeId is not a string', async () => {
      const input = {
        placeId: 12345,
      };

      const dto = plainToInstance(SelectPlaceDto, input as any);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('placeId');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
