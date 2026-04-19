import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FreeReadingUpgradeBanner from './FreeReadingUpgradeBanner';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('FreeReadingUpgradeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the upgrade banner with correct text', () => {
    render(<FreeReadingUpgradeBanner />);

    expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
  });

  it('should display the upgrade message about personalized interpretation', () => {
    render(<FreeReadingUpgradeBanner />);

    expect(screen.getByText(/interpretación personalizada y profunda/i)).toBeInTheDocument();
  });

  it('should display the CTA button', () => {
    render(<FreeReadingUpgradeBanner />);

    const ctaButton = screen.getByRole('button', { name: /premium/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('should navigate to /premium when CTA button is clicked', () => {
    render(<FreeReadingUpgradeBanner />);

    const ctaButton = screen.getByRole('button', { name: /premium/i });
    fireEvent.click(ctaButton);

    expect(mockPush).toHaveBeenCalledWith('/premium');
  });
});
