import { RitualStep } from './ritual-step.entity';

describe('RitualStep Entity', () => {
  it('should create an instance', () => {
    const step = new RitualStep();
    expect(step).toBeDefined();
    expect(step).toBeInstanceOf(RitualStep);
  });

  it('should have all required properties', () => {
    const step = new RitualStep();
    step.id = 1;
    step.ritualId = 1;
    step.stepNumber = 1;
    step.title = 'Preparar el espacio';
    step.description = 'Limpia y ordena tu espacio sagrado';

    expect(step.id).toBe(1);
    expect(step.ritualId).toBe(1);
    expect(step.stepNumber).toBe(1);
    expect(step.title).toBe('Preparar el espacio');
    expect(step.description).toBe('Limpia y ordena tu espacio sagrado');
  });

  it('should allow nullable optional fields', () => {
    const step = new RitualStep();
    step.durationSeconds = null;
    step.imageUrl = null;
    step.mantra = null;
    step.visualization = null;

    expect(step.durationSeconds).toBeNull();
    expect(step.imageUrl).toBeNull();
    expect(step.mantra).toBeNull();
    expect(step.visualization).toBeNull();
  });

  it('should accept duration in seconds', () => {
    const step = new RitualStep();
    step.durationSeconds = 180;

    expect(step.durationSeconds).toBe(180);
  });

  it('should accept mantra text', () => {
    const step = new RitualStep();
    step.mantra = 'Bajo esta luna nueva, planto las semillas de mis deseos';

    expect(step.mantra).toBe(
      'Bajo esta luna nueva, planto las semillas de mis deseos',
    );
  });

  it('should accept visualization text', () => {
    const step = new RitualStep();
    step.visualization =
      'Imagina una luz plateada de luna envolviendo todo tu ser';

    expect(step.visualization).toBe(
      'Imagina una luz plateada de luna envolviendo todo tu ser',
    );
  });

  it('should accept image url', () => {
    const step = new RitualStep();
    step.imageUrl = '/images/steps/preparar-espacio.jpg';

    expect(step.imageUrl).toBe('/images/steps/preparar-espacio.jpg');
  });

  it('should track step order correctly', () => {
    const step1 = new RitualStep();
    step1.stepNumber = 1;

    const step2 = new RitualStep();
    step2.stepNumber = 2;

    const step3 = new RitualStep();
    step3.stepNumber = 3;

    expect(step1.stepNumber).toBeLessThan(step2.stepNumber);
    expect(step2.stepNumber).toBeLessThan(step3.stepNumber);
  });
});
