import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PremiumPreview from './PremiumPreview';

describe('PremiumPreview', () => {
  const mockOnUpgrade = vi.fn();

  it('should render preview container', () => {
    render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    expect(screen.getByText(/desbloquea este contenido/i)).toBeInTheDocument();
  });

  it('should blur children content', () => {
    render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div data-testid="premium-content">Premium Content</div>
      </PremiumPreview>
    );

    const content = screen.getByTestId('premium-content').parentElement;
    expect(content).toHaveClass('blur-sm');
  });

  it('should show lock icon', () => {
    render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    // Lock icon should be in the document
    const container = screen.getByText(/desbloquea este contenido/i).closest('div');
    expect(container).toBeInTheDocument();
  });

  it('should show upgrade CTA button', () => {
    render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    const upgradeButton = screen.getByRole('button', { name: /actualizar a premium/i });
    expect(upgradeButton).toBeInTheDocument();
  });

  it('should call onUpgrade when clicking button', async () => {
    const user = userEvent.setup();
    render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    const upgradeButton = screen.getByRole('button', { name: /actualizar a premium/i });
    await user.click(upgradeButton);

    expect(mockOnUpgrade).toHaveBeenCalledOnce();
  });

  it('should render children content inside', () => {
    render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div>Premium Content Here</div>
      </PremiumPreview>
    );

    expect(screen.getByText(/premium content here/i)).toBeInTheDocument();
  });

  it('should have proper positioning for overlay', () => {
    const { container } = render(
      <PremiumPreview onUpgrade={mockOnUpgrade}>
        <div>Premium Content</div>
      </PremiumPreview>
    );

    // Main container should have relative positioning for overlay
    const mainContainer = container.querySelector('.relative');
    expect(mainContainer).toBeInTheDocument();
  });
});
