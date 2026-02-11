import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateChartDto } from './generate-chart.dto';

describe('GenerateChartDto', () => {
  describe('valid data', () => {
    it('should pass validation with all valid fields', async () => {
      const dto = plainToInstance(GenerateChartDto, {
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
    });

    it('should accept minimum valid hour (00:00)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '00:00',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept maximum valid hour (23:59)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '23:59',
        birthPlace: 'Tokyo, Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept minimum latitude (-90)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '12:00',
        birthPlace: 'Antarctica',
        latitude: -90,
        longitude: 0,
        timezone: 'Antarctica/McMurdo',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept maximum latitude (90)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '12:00',
        birthPlace: 'North Pole',
        latitude: 90,
        longitude: 0,
        timezone: 'Arctic/Longyearbyen',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept minimum longitude (-180)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '12:00',
        birthPlace: 'Fiji',
        latitude: -17.7134,
        longitude: -180,
        timezone: 'Pacific/Fiji',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept maximum longitude (180)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '12:00',
        birthPlace: 'Kiribati',
        latitude: 1.4518,
        longitude: 180,
        timezone: 'Pacific/Kiritimati',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should sanitize HTML in name field', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: '<script>alert("xss")</script>Juan Pérez',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.name).toBe('Juan Pérez');
    });

    it('should sanitize HTML in birthPlace field', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: '<b>Madrid</b>, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.birthPlace).toBe('Madrid, Spain');
    });

    it('should transform string numbers to actual numbers for coordinates', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: '-34.6037' as unknown as number,
        longitude: '-58.3816' as unknown as string,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(typeof dto.latitude).toBe('number');
      expect(typeof dto.longitude).toBe('number');
      expect(dto.latitude).toBe(-34.6037);
      expect(dto.longitude).toBe(-58.3816);
    });
  });

  describe('name validation', () => {
    it('should fail when name is empty', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: '',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when name is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const nameError = errors.find((e) => e.property === 'name');
      expect(nameError).toBeDefined();
    });

    it('should fail when name exceeds 100 characters', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'A'.repeat(101),
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should fail when name is not a string', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 12345 as unknown as string,
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });

  describe('birthDate validation', () => {
    it('should fail when birthDate is not in ISO format', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '15/05/1990',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthDate');
      expect(errors[0].constraints?.isDateString).toBeDefined();
    });

    it('should fail when birthDate is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const dateError = errors.find((e) => e.property === 'birthDate');
      expect(dateError).toBeDefined();
    });

    it('should fail when birthDate is invalid date', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '2024-13-45',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthDate');
    });

    it('should fail when birthDate includes time (ISO datetime)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15T14:30:00Z',
        birthTime: '14:30',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthDate');
      expect(errors[0].constraints?.matches).toBeDefined();
    });
  });

  describe('birthTime validation', () => {
    it('should fail when birthTime is not in HH:mm format', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30:45',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthTime');
      expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('should fail when birthTime has invalid hour (24:00)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '24:00',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthTime');
    });

    it('should fail when birthTime has invalid minute (60)', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '12:60',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthTime');
    });

    it('should fail when birthTime is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthPlace: 'Madrid, Spain',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const timeError = errors.find((e) => e.property === 'birthTime');
      expect(timeError).toBeDefined();
    });
  });

  describe('birthPlace validation', () => {
    it('should fail when birthPlace is empty', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: '',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthPlace');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when birthPlace exceeds 255 characters', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'A'.repeat(256),
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthPlace');
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should fail when birthPlace is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: 'Europe/Madrid',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const placeError = errors.find((e) => e.property === 'birthPlace');
      expect(placeError).toBeDefined();
    });
  });

  describe('latitude validation', () => {
    it('should fail when latitude is below -90', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: -90.1,
        longitude: 0,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('latitude');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail when latitude is above 90', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 90.1,
        longitude: 0,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('latitude');
      expect(errors[0].constraints?.max).toBeDefined();
    });

    it('should fail when latitude is not a number', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 'invalid' as unknown as string,
        longitude: 0,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('latitude');
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail when latitude is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        longitude: 0,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const latError = errors.find((e) => e.property === 'latitude');
      expect(latError).toBeDefined();
    });
  });

  describe('longitude validation', () => {
    it('should fail when longitude is below -180', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: -180.1,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('longitude');
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail when longitude is above 180', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 180.1,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('longitude');
      expect(errors[0].constraints?.max).toBeDefined();
    });

    it('should fail when longitude is not a number', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 'invalid' as unknown as string,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('longitude');
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail when longitude is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const lonError = errors.find((e) => e.property === 'longitude');
      expect(lonError).toBeDefined();
    });
  });

  describe('timezone validation', () => {
    it('should fail when timezone is empty', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 0,
        timezone: '',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('timezone');
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when timezone exceeds 100 characters', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 0,
        timezone: 'A'.repeat(101),
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('timezone');
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('should fail when timezone is missing', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const tzError = errors.find((e) => e.property === 'timezone');
      expect(tzError).toBeDefined();
    });

    it('should fail when timezone is not in IANA format', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('timezone');
      expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('should accept valid IANA timezone with region/city format', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 0,
        timezone: 'America/New_York',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid IANA timezone with region/country/city format', async () => {
      const dto = plainToInstance(GenerateChartDto, {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test Place',
        latitude: 0,
        longitude: 0,
        timezone: 'America/Argentina/Buenos_Aires',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
