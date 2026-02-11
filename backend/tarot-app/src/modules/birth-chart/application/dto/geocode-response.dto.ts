import { ApiProperty } from '@nestjs/swagger';

/**
 * Resultado de geocoding de un lugar
 */
export class GeocodedPlaceDto {
  @ApiProperty({ example: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs' })
  placeId: string;

  @ApiProperty({ example: 'Buenos Aires, Argentina' })
  displayName: string;

  @ApiProperty({ example: 'Buenos Aires' })
  city: string;

  @ApiProperty({ example: 'Argentina' })
  country: string;

  @ApiProperty({ example: -34.6037 })
  latitude: number;

  @ApiProperty({ example: -58.3816 })
  longitude: number;

  @ApiProperty({ example: 'America/Argentina/Buenos_Aires' })
  timezone: string;
}

/**
 * Respuesta de búsqueda de lugares
 */
export class GeocodeSearchResponseDto {
  @ApiProperty({ type: [GeocodedPlaceDto] })
  results: GeocodedPlaceDto[];

  @ApiProperty({ example: 5 })
  count: number;
}
