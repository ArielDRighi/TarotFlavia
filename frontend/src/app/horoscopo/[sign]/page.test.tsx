import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Page, { generateMetadata, generateStaticParams } from './page';
import { ZODIAC_SIGN_PROFILES } from '@/lib/constants/zodiac-sign-profiles.data';
import { ZodiacSign } from '@/types/horoscope.types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  // `notFound()` corta el render lanzando; el mock reproduce ese contrato para
  // poder aseverar que la ruta lo llama (T-SEO-006).
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({ user: null }),
}));

// El horóscopo del día es lo único que se mockea: depende de la API y del día
// local del visitante. La ficha estática se renderiza de verdad, que es
// justamente lo que mide el crawler.
vi.mock('@/hooks/api/useHoroscope', () => ({
  useLocalHoroscope: () => ({ data: null, isLoading: false, error: null }),
}));

/** Renderiza el server component ya resuelto, con los providers de cliente. */
async function renderPage(sign: string) {
  const ui = await Page({ params: Promise.resolve({ sign }) });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

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

  it('⚠️ T-SEO-006: un signo inválido corta con notFound(), no con metadata noindex', async () => {
    // Antes devolvía `canonical: './'` + `noindex` sobre un 200. Un 200 con la
    // página de "no encontrado" es el soft-404 que Google indexa igual; el
    // status HTTP es lo único que lo cierra.
    await expect(
      generateMetadata({ params: Promise.resolve({ sign: 'unicornio' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe('/horoscopo/[sign] — generateStaticParams', () => {
  it('prerenderiza los 12 signos', () => {
    const params = generateStaticParams();

    expect(params).toHaveLength(12);
    expect(params).toContainEqual({ sign: ZodiacSign.ARIES });
  });
});

describe('/horoscopo/[sign] — contenido servido (T-SEO-004)', () => {
  it('sirve la ficha del signo sin depender de la API del horóscopo', async () => {
    const profile = ZODIAC_SIGN_PROFILES[ZodiacSign.LIBRA];
    await renderPage(ZodiacSign.LIBRA);

    expect(screen.getByRole('heading', { level: 1, name: /Libra/ })).toBeInTheDocument();
    expect(screen.getByText(profile.intro[0])).toBeInTheDocument();
    expect(screen.getByText(profile.dailyAreas.money)).toBeInTheDocument();
    expect(screen.getByText(profile.oppositeNote)).toBeInTheDocument();
  });

  it('el horóscopo del día sigue montándose debajo de la ficha', async () => {
    await renderPage(ZodiacSign.LIBRA);

    const profile = screen.getByTestId('zodiac-sign-profile');
    const panel = screen.getByTestId('horoscope-sign-panel');

    expect(profile).toContainElement(panel);
  });

  it('⚠️ T-SEO-006: un segmento inválido corta el render con notFound()', async () => {
    await expect(renderPage('unicornio')).rejects.toThrow('NEXT_NOT_FOUND');

    expect(screen.queryByTestId('horoscope-sign-panel')).not.toBeInTheDocument();
  });
});
