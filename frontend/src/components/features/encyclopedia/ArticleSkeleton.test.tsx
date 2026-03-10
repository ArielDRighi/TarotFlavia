import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleSkeleton } from './ArticleSkeleton';

describe('ArticleSkeleton', () => {
  it('debe renderizar el skeleton por defecto', () => {
    render(<ArticleSkeleton />);

    expect(screen.getByTestId('article-skeleton')).toBeInTheDocument();
  });

  it('debe renderizar el número correcto de ítems skeleton', () => {
    render(<ArticleSkeleton count={6} />);

    const items = screen.getAllByTestId('article-skeleton-item');
    expect(items).toHaveLength(6);
  });

  it('debe renderizar 4 ítems por defecto', () => {
    render(<ArticleSkeleton />);

    const items = screen.getAllByTestId('article-skeleton-item');
    expect(items).toHaveLength(4);
  });

  it('debe aplicar className personalizado', () => {
    render(<ArticleSkeleton className="mi-clase" />);

    expect(screen.getByTestId('article-skeleton')).toHaveClass('mi-clase');
  });
});
