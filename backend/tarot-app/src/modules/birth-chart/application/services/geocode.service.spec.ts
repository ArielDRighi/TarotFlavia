import { GeocodeService } from './geocode.service';

describe('GeocodeService', () => {
  let service: GeocodeService;

  beforeEach(() => {
    service = new GeocodeService();
  });

  it('should return matching places by query', () => {
    const result = service.searchPlaces('buenos aires');

    expect(result.count).toBeGreaterThan(0);
    expect(result.results[0].displayName).toContain('Buenos Aires');
  });

  it('should return empty result for unknown query', () => {
    const result = service.searchPlaces('ciudad-inexistente-xyz');

    expect(result).toEqual({ results: [], count: 0 });
  });
});
