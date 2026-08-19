import { describe, it, expect, vi } from 'vitest';

import { generateMetadata, generateStaticParams } from './page';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

// `notFound()` corta el render lanzando; el mock reproduce ese contrato (T-SEO-006).
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

describe('/horoscopo-chino/[animal] — metadata', () => {
  it('⚠️ T-PROD-020: genera title y canonical propios del animal', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ animal: ChineseZodiacAnimal.RAT }),
    });

    expect(metadata.title).toContain('Rata');
    expect(metadata.alternates?.canonical).toBe('/horoscopo-chino/rat');
  });

  it('⚠️ T-PROD-020: ningún animal comparte el título con otro', async () => {
    const titles = await Promise.all(
      Object.values(ChineseZodiacAnimal).map(async (animal) => {
        const metadata = await generateMetadata({ params: Promise.resolve({ animal }) });
        return metadata.title;
      })
    );

    expect(new Set(titles).size).toBe(Object.values(ChineseZodiacAnimal).length);
  });

  it('⚠️ T-SEO-006: un animal inválido corta con notFound(), no con metadata noindex', async () => {
    // Antes respondía 200 con metadata `noindex`: un soft-404. Solo el status
    // HTTP saca la URL del índice.
    await expect(
      generateMetadata({ params: Promise.resolve({ animal: 'unicornio' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe('/horoscopo-chino/[animal] — generateStaticParams', () => {
  it('prerenderiza los 12 animales', () => {
    const params = generateStaticParams();

    expect(params).toHaveLength(12);
    expect(params).toContainEqual({ animal: ChineseZodiacAnimal.RAT });
  });
});
