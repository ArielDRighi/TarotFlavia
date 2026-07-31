import { describe, it, expect } from 'vitest';

import { generateMetadata, generateStaticParams } from './page';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

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

  it('⚠️ T-PROD-020: un animal inválido no hereda el canonical del hub', async () => {
    // Con `{}` heredaba `canonical: '/horoscopo-chino'` del layout: una URL
    // basura declarándose duplicada de otra, en un 200.
    const metadata = await generateMetadata({ params: Promise.resolve({ animal: 'unicornio' }) });

    expect(metadata.alternates?.canonical).toBe('./');
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });
});

describe('/horoscopo-chino/[animal] — generateStaticParams', () => {
  it('prerenderiza los 12 animales', () => {
    const params = generateStaticParams();

    expect(params).toHaveLength(12);
    expect(params).toContainEqual({ animal: ChineseZodiacAnimal.RAT });
  });
});
