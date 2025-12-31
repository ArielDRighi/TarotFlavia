import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterCTAModal from './RegisterCTAModal';

describe('RegisterCTAModal', () => {
  const mockOnClose = vi.fn();
  const mockOnRegister = vi.fn();

  it('should render modal when open', () => {
    render(<RegisterCTAModal open={true} onClose={mockOnClose} onRegister={mockOnRegister} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/¿Te gustó tu lectura?/i)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(<RegisterCTAModal open={false} onClose={mockOnClose} onRegister={mockOnRegister} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show benefits of registering', () => {
    render(<RegisterCTAModal open={true} onClose={mockOnClose} onRegister={mockOnRegister} />);

    expect(screen.getByText(/Guarda tu historial/i)).toBeInTheDocument();
    expect(screen.getByText(/2 lecturas diarias/i)).toBeInTheDocument();
    expect(screen.getByText(/Todas las tiradas/i)).toBeInTheDocument();
  });

  it('should call onRegister when clicking register button', async () => {
    const user = userEvent.setup();
    render(<RegisterCTAModal open={true} onClose={mockOnClose} onRegister={mockOnRegister} />);

    const registerButton = screen.getByRole('button', { name: /registrarme gratis/i });
    await user.click(registerButton);

    expect(mockOnRegister).toHaveBeenCalledOnce();
  });

  it('should call onClose when clicking "No, gracias" button', async () => {
    const user = userEvent.setup();
    render(<RegisterCTAModal open={true} onClose={mockOnClose} onRegister={mockOnRegister} />);

    const closeButton = screen.getByRole('button', { name: /no, gracias/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('should have primary button for register and secondary for close', () => {
    render(<RegisterCTAModal open={true} onClose={mockOnClose} onRegister={mockOnRegister} />);

    const registerButton = screen.getByRole('button', { name: /registrarme gratis/i });
    const closeButton = screen.getByRole('button', { name: /no, gracias/i });

    // Primary button should have gradient classes
    expect(registerButton).toHaveClass('bg-gradient-to-r');
    // Secondary button should have outline variant (has border class)
    expect(closeButton.className).toContain('border');
  });

  it('should be accessible with proper ARIA labels', () => {
    render(<RegisterCTAModal open={true} onClose={mockOnClose} onRegister={mockOnRegister} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName();
  });
});
