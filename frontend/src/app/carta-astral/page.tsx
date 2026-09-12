import { BirthChartGuide } from '@/components/features/birth-chart/BirthChartGuide';
import { BirthChartPageContent } from '@/components/features/birth-chart/BirthChartPageContent/BirthChartPageContent';

/**
 * Carta astral (`/carta-astral`): el formulario arriba (una carta gratis sin
 * registro) y debajo la nota de uso en el HTML (T-SEO-015). La metadata vive
 * en `layout.tsx`.
 */
export default function BirthChartPage() {
  return (
    <>
      <BirthChartPageContent />
      <BirthChartGuide />
    </>
  );
}
