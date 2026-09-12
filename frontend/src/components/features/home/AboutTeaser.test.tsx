import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { AboutTeaser } from './AboutTeaser';
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import { ROUTES } from '@/lib/constants/routes';

describe('AboutTeaser (T-SEO-014)', () => {
  it('muestra quiénes somos con link a /sobre-nosotros', () => {
    render(<AboutTeaser />);

    expect(screen.getByTestId('home-about')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      HOME_EDITORIAL.about.heading
    );
    expect(screen.getByText(HOME_EDITORIAL.about.body)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: HOME_EDITORIAL.about.linkLabel })).toHaveAttribute(
      'href',
      ROUTES.SOBRE_NOSOTROS
    );
  });
});
