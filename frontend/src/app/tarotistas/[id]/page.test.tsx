import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TarotistaPerfilPage from './page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock TarotistaProfilePage component (will be tested separately)
vi.mock('@/components/features/marketplace/TarotistaProfilePage', () => ({
  TarotistaProfilePage: ({ id }: { id: number }) => (
    <div data-testid="tarotista-profile-page">Profile for tarotista {id}</div>
  ),
}));

describe('TarotistaPerfilPage (Route)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render TarotistaProfilePage component with numeric ID', async () => {
    const params = { id: '123' };

    render(<TarotistaPerfilPage params={params} />);

    await waitFor(() => {
      expect(screen.getByTestId('tarotista-profile-page')).toBeInTheDocument();
      expect(screen.getByText(/profile for tarotista 123/i)).toBeInTheDocument();
    });
  });

  it('should convert string ID to number', async () => {
    const params = { id: '456' };

    render(<TarotistaPerfilPage params={params} />);

    await waitFor(() => {
      expect(screen.getByText(/profile for tarotista 456/i)).toBeInTheDocument();
    });
  });
});
