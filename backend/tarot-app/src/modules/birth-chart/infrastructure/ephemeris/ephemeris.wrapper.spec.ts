import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EphemerisWrapper } from './ephemeris.wrapper';
import { EphemerisInput } from './ephemeris.types';

// Mock sweph module
jest.mock('sweph', () => ({
  constants: {
    SE_GREG_CAL: 1,
    SE_SUN: 0,
    SE_MOON: 1,
    SE_MERCURY: 2,
    SE_VENUS: 3,
    SE_MARS: 4,
    SE_JUPITER: 5,
    SE_SATURN: 6,
    SE_URANUS: 7,
    SE_NEPTUNE: 8,
    SE_PLUTO: 9,
    SEFLG_SWIEPH: 2,
    SEFLG_SPEED: 256,
    OK: 0,
    ERR: -1,
  },
  set_ephe_path: jest.fn(),
  julday: jest.fn(),
  calc_ut: jest.fn(),
  houses: jest.fn(),
  sidtime: jest.fn(),
  close: jest.fn(),
}));

import * as sweph from 'sweph';

const mockedSweph = jest.mocked(sweph);

describe('EphemerisWrapper', () => {
  let wrapper: EphemerisWrapper;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string): string | undefined => {
      const config: Record<string, string> = {
        'ephemeris.houseSystem': 'placidus',
      };
      return config[key] ?? defaultValue;
    }),
  };

  const validInput: EphemerisInput = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    latitude: -34.6037,
    longitude: -58.3816,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EphemerisWrapper,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    wrapper = module.get<EphemerisWrapper>(EphemerisWrapper);
    jest.clearAllMocks();

    // Reset config mock
    mockConfigService.get.mockImplementation(
      (key: string, defaultValue?: string) => {
        const config: Record<string, string> = {
          'ephemeris.houseSystem': 'placidus',
        };
        return config[key] ?? defaultValue;
      },
    );
  });

  describe('onModuleInit', () => {
    it('should initialize successfully', () => {
      wrapper.onModuleInit();

      expect(wrapper['isInitialized']).toBe(true);
    });

    it('should set ephemeris path if SWEPH_PATH is configured', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'SWEPH_PATH') return '/custom/path';
          if (key === 'ephemeris.houseSystem') return 'placidus';
          return defaultValue;
        },
      );

      wrapper.onModuleInit();

      expect(mockedSweph.set_ephe_path).toHaveBeenCalledWith('/custom/path');
    });

    it('should not set ephemeris path if SWEPH_PATH is not configured', () => {
      wrapper.onModuleInit();

      expect(mockedSweph.set_ephe_path).not.toHaveBeenCalled();
    });

    it('should throw if initialization fails', () => {
      mockedSweph.set_ephe_path.mockImplementation(() => {
        throw new Error('init failed');
      });
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'SWEPH_PATH') return '/bad/path';
          if (key === 'ephemeris.houseSystem') return 'placidus';
          return defaultValue;
        },
      );

      expect(() => wrapper.onModuleInit()).toThrow('init failed');
    });
  });

  describe('calculate', () => {
    beforeEach(() => {
      wrapper.onModuleInit();

      // Setup default mocks
      mockedSweph.julday.mockReturnValue(2448027.1041666665);
      mockedSweph.calc_ut.mockReturnValue({
        flag: 258,
        error: '',
        data: [280.37, 0.0002, 0.983, 1.019, -0.0000009, -0.000007],
      } as never);
      mockedSweph.houses.mockReturnValue({
        flag: 0,
        data: {
          houses: [
            104.19, 124.5, 152.3, 185.7, 215.4, 243.8, 284.19, 304.5, 332.3,
            5.7, 35.4, 63.8,
          ],
          points: [104.19, 34.44, 12.5, 200.1, 100.2, 290.3, 10.4, 190.5],
        },
      } as never);
      mockedSweph.sidtime.mockReturnValue(6.037);
    });

    it('should throw if not initialized', () => {
      const uninitWrapper = new EphemerisWrapper(
        mockConfigService as unknown as ConfigService,
      );

      expect(() => uninitWrapper.calculate(validInput)).toThrow(
        'Swiss Ephemeris not initialized',
      );
    });

    it('should calculate Julian Day correctly', () => {
      wrapper.calculate(validInput);

      // hour decimal = 14 + 30/60 = 14.5
      expect(mockedSweph.julday).toHaveBeenCalledWith(
        1990,
        5,
        15,
        14.5,
        sweph.constants.SE_GREG_CAL,
      );
    });

    it('should calculate all 10 planets', () => {
      const result = wrapper.calculate(validInput);

      expect(result.planets).toHaveLength(10);
      expect(mockedSweph.calc_ut).toHaveBeenCalledTimes(10);
    });

    it('should return correct planet names in order', () => {
      const result = wrapper.calculate(validInput);

      const planetNames = result.planets.map((p) => p.name);
      expect(planetNames).toEqual([
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto',
      ]);
    });

    it('should map planet data correctly from sweph result', () => {
      mockedSweph.calc_ut.mockReturnValue({
        flag: 258,
        error: '',
        data: [120.5, 1.2, 0.985, -0.5, 0.001, -0.00001],
      } as never);

      const result = wrapper.calculate(validInput);

      expect(result.planets[0]).toEqual({
        name: 'sun',
        longitude: 120.5,
        latitude: 1.2,
        distance: 0.985,
        longitudeSpeed: -0.5,
      });
    });

    it('should call calc_ut with correct flags (SWIEPH | SPEED)', () => {
      wrapper.calculate(validInput);

      const expectedFlags =
        sweph.constants.SEFLG_SWIEPH | sweph.constants.SEFLG_SPEED;
      expect(mockedSweph.calc_ut).toHaveBeenCalledWith(
        2448027.1041666665,
        sweph.constants.SE_SUN,
        expectedFlags,
      );
    });

    it('should calculate 12 house cusps', () => {
      const result = wrapper.calculate(validInput);

      expect(result.houses.cusps).toHaveLength(12);
    });

    it('should call houses with correct parameters', () => {
      wrapper.calculate(validInput);

      expect(mockedSweph.houses).toHaveBeenCalledWith(
        2448027.1041666665,
        -34.6037,
        -58.3816,
        'P', // Placidus
      );
    });

    it('should extract ascendant and midheaven from houses result', () => {
      const result = wrapper.calculate(validInput);

      expect(result.houses.ascendant).toBe(104.19);
      expect(result.houses.midheaven).toBe(34.44);
    });

    it('should return Julian Day in result', () => {
      const result = wrapper.calculate(validInput);

      expect(result.julianDay).toBe(2448027.1041666665);
    });

    it('should return sidereal time in result', () => {
      const result = wrapper.calculate(validInput);

      expect(result.siderealTime).toBe(6.037);
    });

    it('should use Koch house system when configured', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'ephemeris.houseSystem') return 'koch';
          return defaultValue;
        },
      );
      const kochWrapper = new EphemerisWrapper(
        mockConfigService as unknown as ConfigService,
      );
      kochWrapper.onModuleInit();

      kochWrapper.calculate(validInput);

      expect(mockedSweph.houses).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        'K', // Koch
      );
    });

    it('should use Whole Sign house system when configured', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'ephemeris.houseSystem') return 'whole_sign';
          return defaultValue;
        },
      );
      const wsWrapper = new EphemerisWrapper(
        mockConfigService as unknown as ConfigService,
      );
      wsWrapper.onModuleInit();

      wsWrapper.calculate(validInput);

      expect(mockedSweph.houses).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        'W', // Whole Sign
      );
    });

    it('should default to Placidus for unknown house system', () => {
      mockConfigService.get.mockImplementation(
        (key: string, defaultValue?: string) => {
          if (key === 'ephemeris.houseSystem') return 'unknown_system';
          return defaultValue;
        },
      );
      const unknownWrapper = new EphemerisWrapper(
        mockConfigService as unknown as ConfigService,
      );
      unknownWrapper.onModuleInit();

      unknownWrapper.calculate(validInput);

      expect(mockedSweph.houses).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        'P', // Default Placidus
      );
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      wrapper.onModuleInit();
      mockedSweph.julday.mockReturnValue(2448027.1041666665);
      mockedSweph.sidtime.mockReturnValue(6.037);
      mockedSweph.houses.mockReturnValue({
        flag: 0,
        data: {
          houses: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
          points: [0, 270, 0, 0, 0, 0, 0, 0],
        },
      } as never);
    });

    it('should return empty position when calc_ut throws', () => {
      mockedSweph.calc_ut
        .mockImplementationOnce(() => {
          throw new Error('calc error');
        })
        .mockReturnValue({
          flag: 258,
          error: '',
          data: [100, 0, 1, 1, 0, 0],
        } as never);

      const result = wrapper.calculate(validInput);

      expect(result.planets[0]).toEqual({
        name: 'sun',
        longitude: 0,
        latitude: 0,
        distance: 0,
        longitudeSpeed: 0,
      });
      // Other planets should still calculate
      expect(result.planets[1].longitude).toBe(100);
    });

    it('should return empty houses when houses() throws', () => {
      mockedSweph.calc_ut.mockReturnValue({
        flag: 258,
        error: '',
        data: [100, 0, 1, 1, 0, 0],
      } as never);
      mockedSweph.houses.mockImplementation(() => {
        throw new Error('houses error');
      });

      const result = wrapper.calculate(validInput);

      // Should return fallback equal houses
      expect(result.houses.cusps).toHaveLength(12);
      expect(result.houses.cusps[0]).toBe(0);
      expect(result.houses.cusps[1]).toBe(30);
      expect(result.houses.ascendant).toBe(0);
      expect(result.houses.midheaven).toBe(270);
    });

    it('should throw when overall calculation fails', () => {
      mockedSweph.julday.mockImplementation(() => {
        throw new Error('julday failed');
      });

      expect(() => wrapper.calculate(validInput)).toThrow(
        'Ephemeris calculation failed',
      );
    });
  });

  describe('validateCoordinates', () => {
    it('should return true for valid coordinates', () => {
      expect(wrapper.validateCoordinates(-34.6037, -58.3816)).toBe(true);
    });

    it('should return true for boundary values', () => {
      expect(wrapper.validateCoordinates(-90, -180)).toBe(true);
      expect(wrapper.validateCoordinates(90, 180)).toBe(true);
      expect(wrapper.validateCoordinates(0, 0)).toBe(true);
    });

    it('should return false for latitude out of range', () => {
      expect(wrapper.validateCoordinates(-91, 0)).toBe(false);
      expect(wrapper.validateCoordinates(91, 0)).toBe(false);
    });

    it('should return false for longitude out of range', () => {
      expect(wrapper.validateCoordinates(0, -181)).toBe(false);
      expect(wrapper.validateCoordinates(0, 181)).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should return true for valid years', () => {
      expect(wrapper.validateDate(1990)).toBe(true);
      expect(wrapper.validateDate(2000)).toBe(true);
      expect(wrapper.validateDate(2026)).toBe(true);
    });

    it('should return true for boundary years', () => {
      expect(wrapper.validateDate(1800)).toBe(true);
      expect(wrapper.validateDate(2400)).toBe(true);
    });

    it('should return false for years out of range', () => {
      expect(wrapper.validateDate(1799)).toBe(false);
      expect(wrapper.validateDate(2401)).toBe(false);
    });
  });

  describe('close', () => {
    it('should call sweph.close()', () => {
      wrapper.onModuleInit();

      wrapper.close();

      expect(mockedSweph.close).toHaveBeenCalled();
      expect(wrapper['isInitialized']).toBe(false);
    });
  });
});
