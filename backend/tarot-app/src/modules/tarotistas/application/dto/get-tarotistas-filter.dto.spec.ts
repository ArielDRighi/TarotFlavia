import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetTarotistasFilterDto } from './get-tarotistas-filter.dto';

describe('GetTarotistasFilterDto', () => {
  it('should validate successfully with all parameters', async () => {
    const dto = plainToInstance(GetTarotistasFilterDto, {
      page: 1,
      limit: 20,
      search: 'Luna',
      isActive: true,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate successfully with defaults', async () => {
    const dto = plainToInstance(GetTarotistasFilterDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when page is less than 1', async () => {
    const dto = plainToInstance(GetTarotistasFilterDto, {
      page: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should fail when limit exceeds maximum', async () => {
    const dto = plainToInstance(GetTarotistasFilterDto, {
      limit: 150,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail when sortOrder is invalid', async () => {
    const dto = plainToInstance(GetTarotistasFilterDto, {
      sortOrder: 'INVALID',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const sortOrderError = errors.find((e) => e.property === 'sortOrder');
    expect(sortOrderError).toBeDefined();
  });
});
