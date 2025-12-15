import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from './loading';

describe('Loading (Global)', () => {
  it('should render loading spinner', () => {
    render(<Loading />);

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should render "Cargando..." text', () => {
    render(<Loading />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('should be centered on the page', () => {
    render(<Loading />);

    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
  });

  it('should use large spinner size', () => {
    render(<Loading />);

    const spinnerIcon = screen.getByTestId('spinner-icon');
    expect(spinnerIcon).toHaveClass('h-8', 'w-8');
  });
});
