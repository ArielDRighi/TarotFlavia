import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { PendulumBlockedContent } from './PendulumBlockedContent';

describe('PendulumBlockedContent', () => {
  it('should not render when open is false', () => {
    render(<PendulumBlockedContent open={false} category="salud" onClose={vi.fn()} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should render when open is true', () => {
    render(<PendulumBlockedContent open={true} category="salud" onClose={vi.fn()} />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('should display health category message', () => {
    render(<PendulumBlockedContent open={true} category="salud" onClose={vi.fn()} />);

    expect(screen.getByText(/tema de salud detectado/i)).toBeInTheDocument();
    expect(screen.getByText(/profesional de la salud/i)).toBeInTheDocument();
  });

  it('should display legal category message', () => {
    render(<PendulumBlockedContent open={true} category="legal" onClose={vi.fn()} />);

    expect(screen.getByText(/tema legal detectado/i)).toBeInTheDocument();
    expect(screen.getByText(/abogado o profesional legal/i)).toBeInTheDocument();
  });

  it('should display financial category message', () => {
    render(<PendulumBlockedContent open={true} category="financiero" onClose={vi.fn()} />);

    expect(screen.getByText(/tema financiero detectado/i)).toBeInTheDocument();
    expect(screen.getByText(/asesor financiero profesional/i)).toBeInTheDocument();
  });

  it('should display default message for unknown category', () => {
    render(<PendulumBlockedContent open={true} category="unknown" onClose={vi.fn()} />);

    expect(screen.getByText(/contenido sensible detectado/i)).toBeInTheDocument();
    expect(screen.getByText(/profesional apropiado/i)).toBeInTheDocument();
  });

  it('should display no consumption message', () => {
    render(<PendulumBlockedContent open={true} category="salud" onClose={vi.fn()} />);

    expect(screen.getByText(/no se ha consumido tu consulta/i)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<PendulumBlockedContent open={true} category="salud" onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /entendido/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
