import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { HomeSectionHeader } from './HomeSectionHeader';
import type { HomeSectionCopy } from '@/lib/constants/home-editorial.data';

const COPY: HomeSectionCopy = {
  heading: 'Sección de prueba',
  lead: 'Bajada de la sección.',
  href: '/destino',
  linkLabel: 'Ver todo',
};

describe('HomeSectionHeader (T-SEO-022)', () => {
  it('abre con el ornamento tipográfico, oculto a lectores de pantalla', () => {
    render(<HomeSectionHeader copy={COPY} />);

    const ornament = screen.getByTestId('home-section-ornament');
    expect(ornament).toHaveAttribute('aria-hidden', 'true');
    expect(ornament).toHaveClass('editorial-ornament');
  });

  it('por defecto es tono claro y conserva el subrayado dorado', () => {
    render(<HomeSectionHeader copy={COPY} />);

    const header = screen.getByTestId('home-section-header');
    expect(header).toHaveAttribute('data-tone', 'light');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(COPY.heading);
    expect(screen.getByRole('link', { name: COPY.linkLabel })).toHaveAttribute('href', COPY.href);
    expect(screen.getByText(COPY.lead)).toBeInTheDocument();
  });

  it('en tono oscuro el texto va en crema y el enlace en dorado', () => {
    render(<HomeSectionHeader copy={COPY} tone="dark" />);

    expect(screen.getByTestId('home-section-header')).toHaveAttribute('data-tone', 'dark');
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-text-on-dark');
    expect(screen.getByRole('link', { name: COPY.linkLabel })).toHaveClass('text-secondary');
  });

  it('puede omitir el enlace cuando el padre lo renderiza en otro lugar', () => {
    render(<HomeSectionHeader copy={COPY} withLink={false} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
