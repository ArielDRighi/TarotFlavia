import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import AstrologiaPage from './page';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    'data-testid': dataTestId,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    'data-testid'?: string;
  } & Record<string, unknown>) => (
    <a href={href} data-testid={dataTestId} {...rest}>
      {children}
    </a>
  ),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AstrologiaPage (/enciclopedia/astrologia)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar las 3 sub-secciones de astrología', () => {
    render(<AstrologiaPage />);

    expect(screen.getByTestId('astrologia-section-signos')).toBeInTheDocument();
    expect(screen.getByTestId('astrologia-section-planetas')).toBeInTheDocument();
    expect(screen.getByTestId('astrologia-section-casas')).toBeInTheDocument();
  });

  it('links de sub-secciones deben tener href correcto', () => {
    render(<AstrologiaPage />);

    expect(screen.getByTestId('astrologia-link-signos')).toHaveAttribute(
      'href',
      '/enciclopedia/astrologia/signos'
    );
    expect(screen.getByTestId('astrologia-link-planetas')).toHaveAttribute(
      'href',
      '/enciclopedia/astrologia/planetas'
    );
    expect(screen.getByTestId('astrologia-link-casas')).toHaveAttribute(
      'href',
      '/enciclopedia/astrologia/casas'
    );
  });
});
