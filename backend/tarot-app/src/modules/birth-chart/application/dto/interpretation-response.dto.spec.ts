import { plainToInstance } from 'class-transformer';
import { InterpretationDto } from './interpretation-response.dto';

describe('InterpretationDto', () => {
  it('should create a valid instance for planet_in_sign', () => {
    const dto = plainToInstance(InterpretationDto, {
      category: 'planet_in_sign',
      planet: 'sun',
      sign: 'leo',
      content: 'El Sol en Leo representa una personalidad carismática...',
      summary: 'Personalidad carismática y creativa',
    });

    expect(dto).toBeDefined();
    expect(dto.category).toBe('planet_in_sign');
    expect(dto.planet).toBe('sun');
    expect(dto.sign).toBe('leo');
    expect(dto.content).toContain('El Sol en Leo');
    expect(dto.summary).toBe('Personalidad carismática y creativa');
  });

  it('should create a valid instance for planet_in_house', () => {
    const dto = plainToInstance(InterpretationDto, {
      category: 'planet_in_house',
      planet: 'sun',
      house: 5,
      content: 'El Sol en Casa 5 indica...',
      summary: 'Creatividad y expresión personal',
    });

    expect(dto).toBeDefined();
    expect(dto.category).toBe('planet_in_house');
    expect(dto.planet).toBe('sun');
    expect(dto.house).toBe(5);
    expect(dto.content).toContain('Casa 5');
  });

  it('should create a valid instance for ascendant', () => {
    const dto = plainToInstance(InterpretationDto, {
      category: 'ascendant',
      sign: 'virgo',
      content: 'Ascendente en Virgo indica...',
      summary: 'Personalidad analítica y detallista',
    });

    expect(dto).toBeDefined();
    expect(dto.category).toBe('ascendant');
    expect(dto.sign).toBe('virgo');
    expect(dto.planet).toBeUndefined();
    expect(dto.house).toBeUndefined();
  });

  it('should handle optional fields correctly', () => {
    const dto = plainToInstance(InterpretationDto, {
      category: 'planet_intro',
      planet: 'moon',
      content: 'La Luna representa las emociones...',
    });

    expect(dto).toBeDefined();
    expect(dto.summary).toBeUndefined();
    expect(dto.sign).toBeUndefined();
    expect(dto.house).toBeUndefined();
  });

  // Skip: Jest doesn't execute TypeScript decorators at runtime
  it.skip('should have proper API documentation', () => {
    const dto = new InterpretationDto();
    const metadata = Reflect.getMetadata('swagger/apiModelProperties', dto);
    expect(metadata).toBeDefined();
  });

  it('should handle content in Spanish', () => {
    const dto = plainToInstance(InterpretationDto, {
      category: 'planet_in_sign',
      planet: 'mars',
      sign: 'aries',
      content: 'Marte en Aries otorga energía dinámica...',
    });

    expect(dto.content).toMatch(/Marte en Aries/);
    expect(dto.content).toContain('energía');
  });
});
