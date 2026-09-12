import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Page, { generateMetadata, generateStaticParams, revalidate } from './page';
import { ZODIAC_SIGN_PROFILES } from '@/lib/constants/zodiac-sign-profiles.data';
import { ZodiacSign } from '@/types/horoscope.types';
import type { ServedDailyHoroscope } from '@/types/horoscope.types';

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

// La ficha estática se renderiza de verdad, que es justamente lo que mide el
// crawler. Lo que se mockea es la API: el horóscopo del día resuelto en el
// servidor (T-SEO-016) y el hook cliente que lo reemplaza por el día local.
const mockGetCanonicalHoroscopeForSign =
  vi.fn<(sign: ZodiacSign) => Promise<ServedDailyHoroscope | undefined>>();

vi.mock('@/lib/api/horoscope-server', () => ({
  getCanonicalHoroscopeForSign: (sign: ZodiacSign) => mockGetCanonicalHoroscopeForSign(sign),
}));

vi.mock('@/hooks/api/useHoroscope', () => ({
  useLocalHoroscope: () => ({ data: undefined, isLoading: false, error: null }),
}));

vi.mock('@/hooks/utils/useLocalToday', () => ({
  useLocalToday: () => '2026-09-12',
}));

const SERVED_LIBRA: ServedDailyHoroscope = {
  canonicalDate: '2026-09-12',
  isShowingPreviousDay: false,
  horoscope: {
    id: 7,
    zodiacSign: ZodiacSign.LIBRA,
    horoscopeDate: '2026-09-12',
    generalContent: 'Libra: hoy el equilibrio llega por donde menos lo esperás.',
    areas: {
      love: { content: 'Una charla pendiente encuentra su momento.', score: 8 },
      wellness: { content: 'Bajá el ritmo a la tarde.', score: 6 },
      money: { content: 'Revisá un gasto fijo.', score: 5 },
    },
    luckyNumber: 4,
    luckyColor: 'Verde',
    luckyTime: 'Tarde',
  },
};

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

describe('/horoscopo/[sign] — horóscopo del día en el HTML (T-SEO-016)', () => {
  beforeEach(() => {
    mockGetCanonicalHoroscopeForSign.mockReset();
  });

  it('revalida cada hora: el horóscopo cambia una vez por día y el cron puede atrasarse', () => {
    expect(revalidate).toBe(3600);
  });

  it('resuelve la predicción del signo en el servidor y la pone en el HTML', async () => {
    mockGetCanonicalHoroscopeForSign.mockResolvedValue(SERVED_LIBRA);

    await renderPage(ZodiacSign.LIBRA);

    expect(mockGetCanonicalHoroscopeForSign).toHaveBeenCalledWith(ZodiacSign.LIBRA);
    expect(screen.getByTestId('horoscope-detail')).toBeInTheDocument();
    expect(
      screen.getByText('Libra: hoy el equilibrio llega por donde menos lo esperás.')
    ).toBeInTheDocument();
    expect(screen.getByText('2026-09-12')).toBeInTheDocument();
  });

  it('sirve la ficha igual si la API no tiene horóscopo (el cliente reintenta)', async () => {
    mockGetCanonicalHoroscopeForSign.mockResolvedValue(undefined);

    await renderPage(ZodiacSign.LIBRA);

    expect(screen.getByRole('heading', { level: 1, name: /Libra/ })).toBeInTheDocument();
    expect(screen.queryByTestId('horoscope-detail')).not.toBeInTheDocument();
  });
});

describe('/horoscopo/[sign] — contenido servido (T-SEO-004)', () => {
  beforeEach(() => {
    mockGetCanonicalHoroscopeForSign.mockResolvedValue(undefined);
  });

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
  });
});
