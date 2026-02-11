import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBirthChartDto } from './generate-chart.dto';

describe('CreateBirthChartDto', () => {
  describe('valid data', () => {
    it('should pass validation with all fields including chartName', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
        chartName: 'Mi carta natal',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chartName).toBe('Mi carta natal');
    });

    it('should pass validation without chartName (optional)', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chartName).toBeUndefined();
    });

    it('should sanitize HTML in chartName', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
        chartName: '<script>alert("xss")</script>My Chart',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.chartName).toBe('My Chart');
    });

    it('should inherit all validations from GenerateChartDto', async () => {
      // Test que hereda validaciones del padre
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
        chartName: 'Test Chart',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('chartName validation', () => {
    it('should fail when chartName exceeds 100 characters', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
        chartName: 'A'.repeat(101),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const chartNameError = errors.find((e) => e.property === 'chartName');
      expect(chartNameError).toBeDefined();
      expect(chartNameError?.constraints?.maxLength).toBeDefined();
    });

    it('should fail when chartName is not a string', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
        chartName: 12345 as any,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const chartNameError = errors.find((e) => e.property === 'chartName');
      expect(chartNameError).toBeDefined();
      expect(chartNameError?.constraints?.isString).toBeDefined();
    });

    it('should accept empty string for chartName (optional field)', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
        chartName: '',
      });

      const errors = await validate(dto);
      // Empty string should pass because chartName is optional
      expect(errors).toHaveLength(0);
    });
  });

  describe('inherited validations from GenerateChartDto', () => {
    it('should fail when name is missing', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
        chartName: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when birthDate is invalid', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'Test User',
        birthDate: '15/05/1990',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
        chartName: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find((e) => e.property === 'birthDate');
      expect(dateError).toBeDefined();
    });

    it('should fail when latitude is out of range', async () => {
      const dto = plainToInstance(CreateBirthChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 91,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
        chartName: 'Test',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const latError = errors.find((e) => e.property === 'latitude');
      expect(latError).toBeDefined();
    });
  });
});
