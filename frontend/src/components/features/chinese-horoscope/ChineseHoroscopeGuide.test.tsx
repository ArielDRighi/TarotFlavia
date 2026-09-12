import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { ChineseHoroscopeGuide } from './ChineseHoroscopeGuide';
import { CHINESE_HOROSCOPE_GUIDE } from '@/lib/constants/chinese-horoscope-guide.data';

describe('ChineseHoroscopeGuide (T-SEO-015)', () => {
  it('renderiza el título como h2, las secciones como h3 y el enlace a la guía de la enciclopedia', () => {
    render(<ChineseHoroscopeGuide />);

    const guide = screen.getByTestId('chinese-horoscope-guide');
    expect(within(guide).getByRole('heading', { level: 2 })).toHaveTextContent(
      CHINESE_HOROSCOPE_GUIDE.title
    );
    expect(within(guide).getAllByRole('heading', { level: 3 })).toHaveLength(
      CHINESE_HOROSCOPE_GUIDE.sections.length
    );
    expect(
      within(guide).getByRole('link', { name: CHINESE_HOROSCOPE_GUIDE.links[0].label })
    ).toHaveAttribute('href', '/enciclopedia/guias/guia-horoscopo-chino');
  });
});
