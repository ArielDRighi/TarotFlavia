import { plainToInstance } from 'class-transformer';
import { InterpretationDto } from './interpretation-response.dto';

describe('InterpretationDto', () => {
  it('should create a valid InterpretationDto with all fields', () => {
    const input = {
      category: 'planet_in_sign',
      planet: 'sun',
      sign: 'leo',
      house: 5,
      content: 'El Sol en Leo representa...',
      summary: 'Personalidad carismática y creativa',
    };

    const dto = plainToInstance(InterpretationDto, input);

    expect(dto).toBeDefined();
    expect(dto.category).toBe('planet_in_sign');
    expect(dto.planet).toBe('sun');
    expect(dto.sign).toBe('leo');
    expect(dto.house).toBe(5);
    expect(dto.content).toBe('El Sol en Leo representa...');
    expect(dto.summary).toBe('Personalidad carismática y creativa');
  });

  it('should create InterpretationDto with only required fields', () => {
    const input = {
      category: 'planet_in_sign',
      content: 'El Sol en Leo representa...',
    };

    const dto = plainToInstance(InterpretationDto, input);

    expect(dto).toBeDefined();
    expect(dto.category).toBe('planet_in_sign');
    expect(dto.content).toBe('El Sol en Leo representa...');
    expect(dto.planet).toBeUndefined();
    expect(dto.sign).toBeUndefined();
    expect(dto.house).toBeUndefined();
    expect(dto.summary).toBeUndefined();
  });

  it('should handle planet_in_house category', () => {
    const input = {
      category: 'planet_in_house',
      planet: 'moon',
      house: 4,
      content: 'La Luna en Casa 4 indica...',
      summary: 'Conexión profunda con el hogar',
    };

    const dto = plainToInstance(InterpretationDto, input);

    expect(dto.category).toBe('planet_in_house');
    expect(dto.planet).toBe('moon');
    expect(dto.house).toBe(4);
  });

  it('should handle aspect category', () => {
    const input = {
      category: 'aspect',
      content: 'El trígono entre Sol y Luna...',
      summary: 'Armonía emocional',
    };

    const dto = plainToInstance(InterpretationDto, input);

    expect(dto.category).toBe('aspect');
    expect(dto.content).toBe('El trígono entre Sol y Luna...');
  });

  it('should handle house_cusp category', () => {
    const input = {
      category: 'house_cusp',
      house: 1,
      sign: 'virgo',
      content: 'Ascendente en Virgo sugiere...',
      summary: 'Personalidad analítica y detallista',
    };

    const dto = plainToInstance(InterpretationDto, input);

    expect(dto.category).toBe('house_cusp');
    expect(dto.house).toBe(1);
    expect(dto.sign).toBe('virgo');
  });

  it('should handle long content text', () => {
    const longContent = 'A'.repeat(1000);
    const input = {
      category: 'planet_in_sign',
      content: longContent,
    };

    const dto = plainToInstance(InterpretationDto, input);

    expect(dto.content).toBe(longContent);
    expect(dto.content.length).toBe(1000);
  });
});
