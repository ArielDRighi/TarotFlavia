import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LecturasPlaceholderContent } from './LecturasPlaceholderContent';

describe('LecturasPlaceholderContent', () => {
  it('should render the main heading', () => {
    render(<LecturasPlaceholderContent />);
    expect(screen.getByRole('heading', { name: /lecturas/i })).toBeInTheDocument();
  });

  it('should render construction message', () => {
    render(<LecturasPlaceholderContent />);
    expect(screen.getByText(/en construcción/i)).toBeInTheDocument();
  });

  it('should render data-testid for the container', () => {
    render(<LecturasPlaceholderContent />);
    expect(screen.getByTestId('lecturas-placeholder')).toBeInTheDocument();
  });

  it('should render informative description text', () => {
    render(<LecturasPlaceholderContent />);
    expect(screen.getByTestId('lecturas-placeholder-description')).toBeInTheDocument();
  });
});
