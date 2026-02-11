import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para un lugar geocodificado
 *
 * Contiene información completa de una ubicación geográfica:
 * - Identificador único (placeId)
 * - Nombre completo y ciudad/país
 * - Coordenadas geográficas (lat/long)
 * - Zona horaria IANA
 *
 * Usado para validar y normalizar lugares de nacimiento en cartas astrales
 */
export class GeocodedPlaceDto {
  @ApiProperty({
    example: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs',
    description: 'Identificador único del lugar (Google Place ID o similar)',
  })
  placeId: string;

  @ApiProperty({
    example: 'Buenos Aires, Argentina',
    description: 'Nombre completo del lugar para mostrar al usuario',
  })
  displayName: string;

  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Nombre de la ciudad',
  })
  city: string;

  @ApiProperty({
    example: 'Argentina',
    description: 'Nombre del país',
  })
  country: string;

  @ApiProperty({
    example: -34.6037,
    description: 'Latitud en formato decimal (-90 a 90)',
  })
  latitude: number;

  @ApiProperty({
    example: -58.3816,
    description: 'Longitud en formato decimal (-180 a 180)',
  })
  longitude: number;

  @ApiProperty({
    example: 'America/Argentina/Buenos_Aires',
    description: 'Zona horaria en formato IANA (tz database)',
  })
  timezone: string;
}

/**
 * DTO para respuesta de búsqueda de lugares
 *
 * Contiene una lista de lugares que coinciden con la búsqueda del usuario.
 * Permite al usuario seleccionar el lugar correcto de nacimiento.
 *
 * Ejemplo de uso:
 * - Usuario busca "Paris"
 * - API devuelve: Paris (Francia), Paris (Texas, USA), etc.
 */
export class GeocodeSearchResponseDto {
  @ApiProperty({
    type: [GeocodedPlaceDto],
    description: 'Lista de lugares que coinciden con la búsqueda',
  })
  results: GeocodedPlaceDto[];

  @ApiProperty({
    example: 5,
    description: 'Cantidad total de resultados encontrados',
  })
  count: number;
}
