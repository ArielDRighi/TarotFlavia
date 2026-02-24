/**
 * Convierte grados decimales a formato sexagesimal (GG°MM')
 *
 * @param signDegree - Grados dentro del signo (0–30 decimal)
 * @returns String en formato "X° Y'"
 *
 * @example
 * formatDegreeSexagesimal(26.0)    // "26° 0'"
 * formatDegreeSexagesimal(14.1666) // "14° 10'"
 * formatDegreeSexagesimal(15.5)    // "15° 30'"
 */
export function formatDegreeSexagesimal(signDegree: number): string {
  let deg = Math.floor(signDegree);
  let min = Math.round((signDegree - deg) * 60);
  if (min === 60) {
    deg += 1;
    min = 0;
  }
  return `${deg}° ${min}'`;
}
