import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import NotFound from './not-found';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('NotFound Page', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render the 404 title with mystical theme', () => {
    render(<NotFound />);
    expect(screen.getByText('404 - Camino no encontrado')).toBeInTheDocument();
  });

  it('should display mystical message', () => {
    render(<NotFound />);
    expect(screen.getByText('Los astros no reconocen este destino')).toBeInTheDocument();
  });

  it('should have a "Volver al inicio" button', () => {
    render(<NotFound />);
    const button = screen.getByRole('button', { name: /volver al inicio/i });
    expect(button).toBeInTheDocument();
  });

  it('should have a card icon', () => {
    render(<NotFound />);
    const icon = screen.getByTestId('card-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should have background color bg-main', () => {
    const { container } = render(<NotFound />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('bg-bg-main');
  });

  it('should have centered content vertically and horizontally', () => {
    const { container } = render(<NotFound />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should have font-serif on title', () => {
    render(<NotFound />);
    const title = screen.getByText('404 - Camino no encontrado');
    expect(title).toHaveClass('font-serif');
  });

  it('should navigate to home when button is clicked', async () => {
    render(<NotFound />);
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: /volver al inicio/i });

    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should have minimum height of screen', () => {
    const { container } = render(<NotFound />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });
});
