import { Injectable } from '@nestjs/common';
import { Hemisphere } from '../../enums/hemisphere.enum';

/**
 * Servicio para detectar el hemisferio geográfico del usuario
 * Utilizado para personalizar eventos del calendario sagrado según las estaciones
 */
@Injectable()
export class LocationService {
  // Países del hemisferio sur (principales)
  private readonly southernCountries = new Set<string>([
    // Sudamérica
    'AR', // Argentina
    'CL', // Chile
    'UY', // Uruguay
    'PY', // Paraguay
    'BR', // Brasil
    'BO', // Bolivia
    'PE', // Perú
    'EC', // Ecuador (parcial, pero mayoría sur)

    // Oceanía
    'AU', // Australia
    'NZ', // Nueva Zelanda
    'FJ', // Fiji
    'PG', // Papúa Nueva Guinea
    'NC', // Nueva Caledonia
    'PF', // Polinesia Francesa

    // África Sur
    'ZA', // Sudáfrica
    'NA', // Namibia
    'BW', // Botsuana
    'ZW', // Zimbabue
    'MZ', // Mozambique
    'MG', // Madagascar
    'LS', // Lesoto
    'SZ', // Eswatini

    // Otras islas del hemisferio sur
    'RE', // Reunión
    'MU', // Mauricio
  ]);

  /**
   * Determina el hemisferio basándose en el código de país
   * @param countryCode - Código ISO 3166-1 alpha-2 del país (ej: 'AR', 'US')
   * @returns Hemisphere.SOUTH si el país está en el hemisferio sur, Hemisphere.NORTH de lo contrario
   */
  getHemisphereByCountry(countryCode: string): Hemisphere {
    return this.southernCountries.has(countryCode.toUpperCase())
      ? Hemisphere.SOUTH
      : Hemisphere.NORTH;
  }

  /**
   * Determina el hemisferio basándose en la latitud
   * @param latitude - Latitud en grados decimales (-90 a 90)
   * @returns Hemisphere.SOUTH si latitud < 0, Hemisphere.NORTH si latitud >= 0
   */
  getHemisphereByLatitude(latitude: number): Hemisphere {
    return latitude < 0 ? Hemisphere.SOUTH : Hemisphere.NORTH;
  }
}
