import { describe, it, expect } from 'vitest';

import { generateMetadata, generateStaticParams } from './page';
import { ZodiacSign } from '@/types/horoscope.types';

describe('/horoscopo/[sign] — metadata', () => {
  it('⚠️ T-PROD-020: genera title y description propios del signo', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ sign: ZodiacSign.TAURUS }),
    });

    expect(metadata.title).toContain('Tauro');
    expect(metadata.description).toContain('Tauro');
  });

  it('⚠️ T-PROD-020: ningún signo comparte el título con otro', async () => {
    const titles = await Promise.all(
      Object.values(ZodiacSign).map(async (sign) => {
        const metadata = await generateMetadata({ params: Promise.resolve({ sign }) });
        return metadata.title;
      })
    );

    expect(new Set(titles).size).toBe(Object.values(ZodiacSign).length);
  });

  it('declara el canonical del signo', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ sign: ZodiacSign.ARIES }),
    });

    expect(metadata.alternates?.canonical).toBe('/horoscopo/aries');
  });

  it('cae a la metadata heredada si el signo no existe', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ sign: 'unicornio' }) });

    expect(metadata).toEqual({});
  });
});

describe('/horoscopo/[sign] — generateStaticParams', () => {
  it('prerenderiza los 12 signos', () => {
    const params = generateStaticParams();

    expect(params).toHaveLength(12);
    expect(params).toContainEqual({ sign: ZodiacSign.ARIES });
  });
});
