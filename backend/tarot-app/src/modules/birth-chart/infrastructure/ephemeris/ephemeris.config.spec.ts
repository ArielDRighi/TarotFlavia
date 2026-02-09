import ephemerisConfig from './ephemeris.config';

describe('ephemerisConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default values when no env vars are set', () => {
    delete process.env.EPHEMERIS_HOUSE_SYSTEM;
    delete process.env.EPHEMERIS_ZODIAC_TYPE;
    delete process.env.EPHEMERIS_PRECISION;

    const config = ephemerisConfig();

    expect(config.houseSystem).toBe('placidus');
    expect(config.zodiacType).toBe('tropical');
    expect(config.precision).toBe(1);
  });

  it('should return all 10 planets', () => {
    const config = ephemerisConfig();

    expect(config.planets).toHaveLength(10);
    expect(config.planets).toContain('sun');
    expect(config.planets).toContain('moon');
    expect(config.planets).toContain('pluto');
  });

  it('should use environment variables when set', () => {
    process.env.EPHEMERIS_HOUSE_SYSTEM = 'koch';
    process.env.EPHEMERIS_ZODIAC_TYPE = 'sidereal';
    process.env.EPHEMERIS_PRECISION = '2';

    const config = ephemerisConfig();

    expect(config.houseSystem).toBe('koch');
    expect(config.zodiacType).toBe('sidereal');
    expect(config.precision).toBe(2);
  });
});
