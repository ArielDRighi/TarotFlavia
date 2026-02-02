import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { Hemisphere } from '../../enums/hemisphere.enum';

describe('LocationService', () => {
  let service: LocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService],
    }).compile();

    service = module.get<LocationService>(LocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHemisphereByCountry', () => {
    it('should return SOUTH for Argentina', () => {
      expect(service.getHemisphereByCountry('AR')).toBe(Hemisphere.SOUTH);
    });

    it('should return SOUTH for Chile', () => {
      expect(service.getHemisphereByCountry('CL')).toBe(Hemisphere.SOUTH);
    });

    it('should return SOUTH for Brazil', () => {
      expect(service.getHemisphereByCountry('BR')).toBe(Hemisphere.SOUTH);
    });

    it('should return SOUTH for Australia', () => {
      expect(service.getHemisphereByCountry('AU')).toBe(Hemisphere.SOUTH);
    });

    it('should return SOUTH for New Zealand', () => {
      expect(service.getHemisphereByCountry('NZ')).toBe(Hemisphere.SOUTH);
    });

    it('should return SOUTH for South Africa', () => {
      expect(service.getHemisphereByCountry('ZA')).toBe(Hemisphere.SOUTH);
    });

    it('should return NORTH for United States', () => {
      expect(service.getHemisphereByCountry('US')).toBe(Hemisphere.NORTH);
    });

    it('should return NORTH for Mexico', () => {
      expect(service.getHemisphereByCountry('MX')).toBe(Hemisphere.NORTH);
    });

    it('should return NORTH for Spain', () => {
      expect(service.getHemisphereByCountry('ES')).toBe(Hemisphere.NORTH);
    });

    it('should return NORTH for United Kingdom', () => {
      expect(service.getHemisphereByCountry('GB')).toBe(Hemisphere.NORTH);
    });

    it('should handle lowercase country codes', () => {
      expect(service.getHemisphereByCountry('ar')).toBe(Hemisphere.SOUTH);
      expect(service.getHemisphereByCountry('us')).toBe(Hemisphere.NORTH);
    });

    it('should handle mixed case country codes', () => {
      expect(service.getHemisphereByCountry('Ar')).toBe(Hemisphere.SOUTH);
      expect(service.getHemisphereByCountry('Us')).toBe(Hemisphere.NORTH);
    });
  });

  describe('getHemisphereByLatitude', () => {
    it('should return SOUTH for negative latitudes', () => {
      expect(service.getHemisphereByLatitude(-34.603722)).toBe(
        Hemisphere.SOUTH,
      ); // Buenos Aires
      expect(service.getHemisphereByLatitude(-33.865143)).toBe(
        Hemisphere.SOUTH,
      ); // Sydney
      expect(service.getHemisphereByLatitude(-23.55052)).toBe(Hemisphere.SOUTH); // São Paulo
    });

    it('should return NORTH for positive latitudes', () => {
      expect(service.getHemisphereByLatitude(40.7128)).toBe(Hemisphere.NORTH); // New York
      expect(service.getHemisphereByLatitude(51.5074)).toBe(Hemisphere.NORTH); // London
      expect(service.getHemisphereByLatitude(19.4326)).toBe(Hemisphere.NORTH); // México City
    });

    it('should return NORTH for latitude 0 (equator)', () => {
      expect(service.getHemisphereByLatitude(0)).toBe(Hemisphere.NORTH);
    });

    it('should return SOUTH for extreme southern latitudes', () => {
      expect(service.getHemisphereByLatitude(-90)).toBe(Hemisphere.SOUTH); // South Pole
    });

    it('should return NORTH for extreme northern latitudes', () => {
      expect(service.getHemisphereByLatitude(90)).toBe(Hemisphere.NORTH); // North Pole
    });

    it('should handle small negative latitudes', () => {
      expect(service.getHemisphereByLatitude(-0.1)).toBe(Hemisphere.SOUTH);
    });

    it('should handle small positive latitudes', () => {
      expect(service.getHemisphereByLatitude(0.1)).toBe(Hemisphere.NORTH);
    });
  });
});
