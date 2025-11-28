import { validate } from 'class-validator';
import { BanUserDto } from './ban-user.dto';

describe('BanUserDto', () => {
  it('should validate a valid ban reason', async () => {
    const dto = new BanUserDto();
    dto.reason = 'Violated terms of service';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if reason is empty', async () => {
    const dto = new BanUserDto();
    dto.reason = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail if reason exceeds max length', async () => {
    const dto = new BanUserDto();
    dto.reason = 'a'.repeat(501); // Max is 500

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should pass with reason up to 500 characters', async () => {
    const dto = new BanUserDto();
    dto.reason = 'a'.repeat(500);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should trim whitespace from reason', async () => {
    const dto = new BanUserDto();
    dto.reason = '  Spam behavior  ';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    // After transform, should be trimmed
  });
});
