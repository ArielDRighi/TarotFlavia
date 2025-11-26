import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RejectApplicationDto } from './reject-application.dto';

describe('RejectApplicationDto', () => {
  it('should validate successfully with rejection reason', async () => {
    const dto = plainToInstance(RejectApplicationDto, {
      adminNotes: 'No cumple con los requisitos mínimos de experiencia',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when adminNotes is missing', async () => {
    const dto = plainToInstance(RejectApplicationDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('adminNotes');
  });

  it('should fail when adminNotes is too short', async () => {
    const dto = plainToInstance(RejectApplicationDto, {
      adminNotes: 'No',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('adminNotes');
  });
});
