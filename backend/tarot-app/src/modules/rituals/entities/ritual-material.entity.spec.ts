import { RitualMaterial } from './ritual-material.entity';
import { MaterialType } from '../domain/enums';

describe('RitualMaterial Entity', () => {
  it('should create an instance', () => {
    const material = new RitualMaterial();
    expect(material).toBeDefined();
    expect(material).toBeInstanceOf(RitualMaterial);
  });

  it('should have all required properties', () => {
    const material = new RitualMaterial();
    material.id = 1;
    material.ritualId = 1;
    material.name = 'Vela blanca';
    material.type = MaterialType.REQUIRED;

    expect(material.id).toBe(1);
    expect(material.ritualId).toBe(1);
    expect(material.name).toBe('Vela blanca');
    expect(material.type).toBe(MaterialType.REQUIRED);
  });

  it('should validate material type enum', () => {
    const material = new RitualMaterial();

    material.type = MaterialType.REQUIRED;
    expect(material.type).toBe('required');

    material.type = MaterialType.OPTIONAL;
    expect(material.type).toBe('optional');

    material.type = MaterialType.ALTERNATIVE;
    expect(material.type).toBe('alternative');
  });

  it('should allow nullable optional fields', () => {
    const material = new RitualMaterial();
    material.description = null;
    material.alternative = null;
    material.unit = null;

    expect(material.description).toBeNull();
    expect(material.alternative).toBeNull();
    expect(material.unit).toBeNull();
  });

  it('should have default quantity of 1', () => {
    const material = new RitualMaterial();
    material.quantity = 1;

    expect(material.quantity).toBe(1);
  });

  it('should accept quantity and unit', () => {
    const material = new RitualMaterial();
    material.quantity = 3;
    material.unit = 'unidades';

    expect(material.quantity).toBe(3);
    expect(material.unit).toBe('unidades');
  });

  it('should accept description', () => {
    const material = new RitualMaterial();
    material.description = 'Preferiblemente de cera de abeja';

    expect(material.description).toBe('Preferiblemente de cera de abeja');
  });

  it('should accept alternative material', () => {
    const material = new RitualMaterial();
    material.name = 'Salvia blanca';
    material.alternative = 'Palo santo';

    expect(material.name).toBe('Salvia blanca');
    expect(material.alternative).toBe('Palo santo');
  });

  it('should distinguish between required and optional materials', () => {
    const requiredMaterial = new RitualMaterial();
    requiredMaterial.type = MaterialType.REQUIRED;

    const optionalMaterial = new RitualMaterial();
    optionalMaterial.type = MaterialType.OPTIONAL;

    expect(requiredMaterial.type).toBe('required');
    expect(optionalMaterial.type).toBe('optional');
    expect(requiredMaterial.type).not.toBe(optionalMaterial.type);
  });
});
