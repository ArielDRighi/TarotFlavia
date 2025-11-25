import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetPublicTarotistasFilterDto } from './get-public-tarotistas-filter.dto';

describe('GetPublicTarotistasFilterDto', () => {
  describe('Valid inputs', () => {
    it('should accept default values (empty object)', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {});
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(20);
      expect(dto.orderBy).toBe('createdAt');
      expect(dto.order).toBe('DESC');
    });

    it('should accept valid page and limit', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        page: 2,
        limit: 10,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(10);
    });

    it('should accept search query', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        search: 'Luna',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('Luna');
    });

    it('should accept especialidad filter', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        especialidad: 'Amor',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.especialidad).toBe('Amor');
    });

    it('should accept orderBy rating', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        orderBy: 'rating',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.orderBy).toBe('rating');
    });

    it('should accept orderBy totalLecturas', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        orderBy: 'totalLecturas',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.orderBy).toBe('totalLecturas');
    });

    it('should accept orderBy nombrePublico', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        orderBy: 'nombrePublico',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.orderBy).toBe('nombrePublico');
    });

    it('should accept order ASC', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        order: 'ASC',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.order).toBe('ASC');
    });

    it('should accept multiple filters combined', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        page: 3,
        limit: 15,
        search: 'Flavia',
        especialidad: 'Trabajo',
        orderBy: 'rating',
        order: 'ASC',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(15);
      expect(dto.search).toBe('Flavia');
      expect(dto.especialidad).toBe('Trabajo');
      expect(dto.orderBy).toBe('rating');
      expect(dto.order).toBe('ASC');
    });
  });

  describe('Invalid inputs', () => {
    it('should reject page = 0', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        page: 0,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('min');
    });

    it('should reject negative page', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        page: -1,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('min');
    });

    it('should reject limit = 0', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        limit: 0,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints).toHaveProperty('min');
    });

    it('should reject limit > 100', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        limit: 101,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints).toHaveProperty('max');
    });

    it('should reject invalid orderBy value', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        orderBy: 'invalidField',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const orderByError = errors.find((e) => e.property === 'orderBy');
      expect(orderByError).toBeDefined();
      expect(orderByError?.constraints).toHaveProperty('isIn');
    });

    it('should reject invalid order value', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        order: 'INVALID',
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const orderError = errors.find((e) => e.property === 'order');
      expect(orderError).toBeDefined();
      expect(orderError?.constraints).toHaveProperty('isIn');
    });

    it('should reject non-string search', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        search: 123,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const searchError = errors.find((e) => e.property === 'search');
      expect(searchError).toBeDefined();
      expect(searchError?.constraints).toHaveProperty('isString');
    });

    it('should reject non-string especialidad', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        especialidad: 123,
      });
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const especialidadError = errors.find(
        (e) => e.property === 'especialidad',
      );
      expect(especialidadError).toBeDefined();
      expect(especialidadError?.constraints).toHaveProperty('isString');
    });
  });

  describe('Edge cases', () => {
    it('should accept max limit (100)', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        limit: 100,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(100);
    });

    it('should accept min page (1)', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        page: 1,
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
    });

    it('should accept empty search string', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        search: '',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('');
    });

    it('should accept search with special characters', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        search: 'Luna & Estrellas',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.search).toBe('Luna & Estrellas');
    });

    it('should transform string page to number', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        page: '5',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(5);
      expect(typeof dto.page).toBe('number');
    });

    it('should transform string limit to number', async () => {
      const dto = plainToInstance(GetPublicTarotistasFilterDto, {
        limit: '25',
      });
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(25);
      expect(typeof dto.limit).toBe('number');
    });
  });
});
