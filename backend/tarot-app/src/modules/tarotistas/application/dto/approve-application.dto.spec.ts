import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApproveApplicationDto } from './approve-application.dto';

describe('ApproveApplicationDto', () => {
  it('should validate successfully with admin notes', async () => {
    const dto = plainToInstance(ApproveApplicationDto, {
      adminNotes: 'Excelente perfil, experiencia verificada',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate successfully without admin notes', async () => {
    const dto = plainToInstance(ApproveApplicationDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when adminNotes is too short', async () => {
    const dto = plainToInstance(ApproveApplicationDto, {
      adminNotes: 'OK',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('adminNotes');
  });
});
