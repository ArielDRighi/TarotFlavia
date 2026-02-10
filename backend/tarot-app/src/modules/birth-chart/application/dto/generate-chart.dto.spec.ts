import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateChartDto, CreateBirthChartDto } from './generate-chart.dto';

describe('GenerateChartDto', () => {
  describe('Valid inputs', () => {
    it('should validate a correct GenerateChartDto', async () => {
      const input = {
        name: 'María García',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept edge coordinates (north/south poles)', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'North Pole',
        latitude: 90,
        longitude: 0,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept midnight time (00:00)', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '00:00',
        birthPlace: 'Test City',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should accept end of day time (23:59)', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '23:59',
        birthPlace: 'Test City',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Invalid name', () => {
    it('should fail if name is empty', async () => {
      const input = {
        name: '',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if name exceeds 100 characters', async () => {
      const input = {
        name: 'a'.repeat(101),
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should sanitize HTML in name', () => {
      const input = {
        name: '<script>alert("xss")</script>María',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      expect(dto.name).toBe('María');
    });
  });

  describe('Invalid birthDate', () => {
    it('should fail if birthDate is not ISO format', async () => {
      const input = {
        name: 'Test User',
        birthDate: '15/05/1990',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthDate');
    });

    it('should fail if birthDate is invalid date', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-13-45',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthDate');
    });
  });

  describe('Invalid birthTime', () => {
    it('should fail if birthTime is not HH:mm format', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthTime');
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail if hour is invalid (>23)', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '25:30',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthTime');
    });

    it('should fail if minutes are invalid (>59)', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:60',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthTime');
    });
  });

  describe('Invalid birthPlace', () => {
    it('should fail if birthPlace is empty', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: '',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthPlace');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if birthPlace exceeds 255 characters', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'a'.repeat(256),
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('birthPlace');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should sanitize HTML in birthPlace', () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: '<b>Buenos Aires</b>, Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      expect(dto.birthPlace).toBe('Buenos Aires, Argentina');
    });
  });

  describe('Invalid coordinates', () => {
    it('should fail if latitude is below -90', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: -91,
        longitude: 0,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('latitude');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail if latitude is above 90', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: 91,
        longitude: 0,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('latitude');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail if longitude is below -180', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: 0,
        longitude: -181,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('longitude');
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail if longitude is above 180', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: 0,
        longitude: 181,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('longitude');
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should transform string numbers to floats', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: '-34.6037' as any,
        longitude: '-58.3816' as any,
        timezone: 'UTC',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.latitude).toBe('number');
      expect(typeof dto.longitude).toBe('number');
      expect(dto.latitude).toBe(-34.6037);
      expect(dto.longitude).toBe(-58.3816);
    });
  });

  describe('Invalid timezone', () => {
    it('should fail if timezone is empty', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: 0,
        longitude: 0,
        timezone: '',
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('timezone');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail if timezone exceeds 100 characters', async () => {
      const input = {
        name: 'Test User',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Test City',
        latitude: 0,
        longitude: 0,
        timezone: 'a'.repeat(101),
      };

      const dto = plainToInstance(GenerateChartDto, input);
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('timezone');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });
  });
});

describe('CreateBirthChartDto', () => {
  it('should validate with all required fields', async () => {
    const input = {
      name: 'María García',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires, Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    };

    const dto = plainToInstance(CreateBirthChartDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept optional chartName', async () => {
    const input = {
      name: 'María García',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires, Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
      chartName: 'Mi carta natal',
    };

    const dto = plainToInstance(CreateBirthChartDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.chartName).toBe('Mi carta natal');
  });

  it('should fail if chartName exceeds 100 characters', async () => {
    const input = {
      name: 'María García',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires, Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
      chartName: 'a'.repeat(101),
    };

    const dto = plainToInstance(CreateBirthChartDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('chartName');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should sanitize HTML in chartName', () => {
    const input = {
      name: 'María García',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires, Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
      chartName: '<script>alert("xss")</script>Mi carta',
    };

    const dto = plainToInstance(CreateBirthChartDto, input);
    expect(dto.chartName).toBe('Mi carta');
  });

  it('should work without chartName (undefined)', async () => {
    const input = {
      name: 'María García',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires, Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    };

    const dto = plainToInstance(CreateBirthChartDto, input);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.chartName).toBeUndefined();
  });
});
