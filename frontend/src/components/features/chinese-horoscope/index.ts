/**
 * Chinese Horoscope Components
 *
 * Barrel export for all Chinese horoscope-related components
 */

export { AnimalCalculator } from './AnimalCalculator';
export type { AnimalCalculatorProps } from './AnimalCalculator';

export { ChineseAnimalCard } from './ChineseAnimalCard';
export type { ChineseAnimalCardProps } from './ChineseAnimalCard';

export { ChineseAnimalSelector } from './ChineseAnimalSelector';
export type { ChineseAnimalSelectorProps } from './ChineseAnimalSelector';

export { ChineseAnimalSymbol } from './ChineseAnimalSymbol';
export type { ChineseAnimalSymbolProps } from './ChineseAnimalSymbol';

export { ChineseCompatibility } from './ChineseCompatibility';
export type { ChineseCompatibilityProps } from './ChineseCompatibility';

export { ChineseHoroscopeDetail } from './ChineseHoroscopeDetail';
export type { ChineseHoroscopeDetailProps } from './ChineseHoroscopeDetail';

export { ChineseHoroscopeSkeleton } from './ChineseHoroscopeSkeleton';

export { ChineseHoroscopeWidget } from './ChineseHoroscopeWidget';

export { ElementSelectorModal } from './ElementSelectorModal';
export type { ElementSelectorModalProps } from './ElementSelectorModal';

export { YearSelectorModal } from './YearSelectorModal';
export type { YearSelectorModalProps } from './YearSelectorModal';

export { YearInputBanner } from './YearInputBanner';
export type { YearInputBannerProps } from './YearInputBanner';

// `AnimalHoroscopeRoute`, `AnimalProfile` y `AnimalHoroscopePanel` se importan
// por ruta directa a propósito, y no se exportan acá: el componente de ruta es
// de servidor y arrastra las 12 fichas de contenido estático. Sacarlas del barrel
// evita que un client component las meta en su bundle sin darse cuenta.
