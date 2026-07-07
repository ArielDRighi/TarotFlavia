import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RegistroPage from './page';

// The route file must only delegate to the feature component (no logic in app/)
vi.mock('@/components/features/auth', () => ({
  RegisterPage: () => <div data-testid="register-page">Register Page Mock</div>,
}));

describe('RegistroPage route', () => {
  it('should render the RegisterPage feature component', () => {
    render(<RegistroPage />);

    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });
});
