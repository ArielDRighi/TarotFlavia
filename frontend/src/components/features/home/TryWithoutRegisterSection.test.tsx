import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TryWithoutRegisterSection } from './TryWithoutRegisterSection';

describe('TryWithoutRegisterSection', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it('should render section title when quota available', () => {
    render(<TryWithoutRegisterSection />);

    const title = screen.getByRole('heading', {
      name: /prueba sin compromiso/i,
      level: 2,
    });

    expect(title).toBeInTheDocument();
  });

  it('should render explanation text when quota available', () => {
    render(<TryWithoutRegisterSection />);

    const explanation = screen.getByText(/1 carta aleatoria sin necesidad de registrarte/i);

    expect(explanation).toBeInTheDocument();
  });

  it('should render call-to-action button with correct link when quota available', () => {
    render(<TryWithoutRegisterSection />);

    const ctaButton = screen.getByRole('link', { name: /carta del día gratis/i });

    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/carta-del-dia');
  });

  it('should show limit reached message when quota consumed today', () => {
    // Set sessionStorage to indicate quota consumed today
    const today = new Date().toISOString();
    sessionStorage.setItem('tarot_daily_card_consumed', today);

    render(<TryWithoutRegisterSection />);

    const title = screen.getByRole('heading', {
      name: /límite diario alcanzado/i,
      level: 2,
    });

    expect(title).toBeInTheDocument();
  });

  it('should show registration CTA when quota consumed', () => {
    // Set sessionStorage to indicate quota consumed today
    const today = new Date().toISOString();
    sessionStorage.setItem('tarot_daily_card_consumed', today);

    render(<TryWithoutRegisterSection />);

    const registerButton = screen.getByRole('link', { name: /crear cuenta gratis/i });
    const loginButton = screen.getByRole('link', { name: /iniciar sesión/i });

    expect(registerButton).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it('should reset quota if consumed date is from previous day', () => {
    // Set sessionStorage with yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    sessionStorage.setItem('tarot_daily_card_consumed', yesterday.toISOString());

    render(<TryWithoutRegisterSection />);

    // Should show available quota
    const title = screen.getByRole('heading', {
      name: /prueba sin compromiso/i,
      level: 2,
    });

    expect(title).toBeInTheDocument();
  });

  it('should have proper semantic structure with section tag', () => {
    const { container } = render(<TryWithoutRegisterSection />);

    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
  });

  it('should display sparkles icon when quota available', () => {
    render(<TryWithoutRegisterSection />);

    const visualElement = screen.getByTestId('try-without-register-icon');
    expect(visualElement).toBeInTheDocument();
  });

  it('should display clock icon when limit reached', () => {
    // Set quota consumed
    const today = new Date().toISOString();
    sessionStorage.setItem('tarot_daily_card_consumed', today);

    render(<TryWithoutRegisterSection />);

    const visualElement = screen.getByTestId('try-without-register-icon');
    expect(visualElement).toBeInTheDocument();
  });
});
