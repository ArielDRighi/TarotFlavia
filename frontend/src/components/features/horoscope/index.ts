'use client';

export { ZodiacSignSelector } from './ZodiacSignSelector';
export { ZodiacSignCard } from './ZodiacSignCard';
export { ZodiacSymbol } from './ZodiacSymbol';
export { HoroscopeDetail } from './HoroscopeDetail';
// `HoroscopeSignRoute`, `ZodiacSignProfile` y `HoroscopeSignPanel` NO se
// exportan acá a propósito (T-SEO-004): este barrel es `'use client'`, y meter
// los componentes de servidor de la ruta arrastraría la ficha entera —y sus
// perfiles— al bundle del navegador. La ruta los importa por su path directo.
export { HoroscopeAreaCard } from './HoroscopeAreaCard';
export { HoroscopeSkeleton } from './HoroscopeSkeleton';
export { HoroscopeWidget } from './HoroscopeWidget';
