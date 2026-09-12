import { ChineseHoroscopeGuide } from '@/components/features/chinese-horoscope/ChineseHoroscopeGuide';
import { ChineseHoroscopeHub } from '@/components/features/chinese-horoscope/ChineseHoroscopeHub';

/**
 * Horóscopo chino (`/horoscopo-chino`): el hub interactivo arriba y, debajo, la
 * nota de uso en el HTML (T-SEO-015). Está en el menú, así que el guardarraíl
 * le exige 500 palabras propias. La metadata vive en `layout.tsx`.
 */
export default function HoroscopoChinoPage() {
  return (
    <>
      <ChineseHoroscopeHub />
      <ChineseHoroscopeGuide />
    </>
  );
}
