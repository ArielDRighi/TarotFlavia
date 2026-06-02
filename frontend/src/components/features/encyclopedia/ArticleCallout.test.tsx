import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ArticleCallout } from './ArticleCallout';

describe('ArticleCallout', () => {
  it('should render its children', () => {
    render(<ArticleCallout variant="clave">Mensaje importante.</ArticleCallout>);

    expect(screen.getByTestId('article-callout')).toBeInTheDocument();
    expect(screen.getByText('Mensaje importante.')).toBeInTheDocument();
  });

  it('should show the "Clave" label for the clave variant', () => {
    render(<ArticleCallout variant="clave">Texto.</ArticleCallout>);

    expect(screen.getByText('Clave')).toBeInTheDocument();
  });

  it('should show the "Sabías que…" label for the sabias variant', () => {
    render(<ArticleCallout variant="sabias">Texto.</ArticleCallout>);

    expect(screen.getByText('Sabías que…')).toBeInTheDocument();
  });

  it('should expose the label as an accessible name (role note)', () => {
    render(<ArticleCallout variant="clave">Texto.</ArticleCallout>);

    expect(screen.getByRole('note', { name: 'Clave' })).toBeInTheDocument();
  });

  it('should apply additional className when provided', () => {
    render(
      <ArticleCallout variant="clave" className="extra-test-class">
        Texto.
      </ArticleCallout>
    );

    expect(screen.getByTestId('article-callout')).toHaveClass('extra-test-class');
  });
});
