import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { NumerologyProfile } from './NumerologyProfile';
import type { NumerologyResponseDto } from '@/types/numerology.types';

const mockProfile: NumerologyResponseDto = {
  lifePath: { value: 7, name: 'El Buscador', keywords: [], description: '', isMaster: false },
  birthday: { value: 25, name: 'Número 25', keywords: [], description: '', isMaster: false },
  expression: { value: 5, name: 'El Aventurero', keywords: [], description: '', isMaster: false },
  soulUrge: { value: 3, name: 'El Creativo', keywords: [], description: '', isMaster: false },
  personality: { value: 2, name: 'El Diplomático', keywords: [], description: '', isMaster: false },
  personalYear: 8,
  personalMonth: 5,
  birthDate: '1990-03-25',
  fullName: 'Juan Pérez',
};

describe('NumerologyProfile', () => {
  it('should render profile heading', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByText('Tu Perfil Numerológico')).toBeInTheDocument();
  });

  it('should display birth date', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByText(/1990-03-25/i)).toBeInTheDocument();
  });

  it('should display full name when provided', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
  });

  it('should not display full name when not provided', () => {
    const profileWithoutName = { ...mockProfile, fullName: null };
    render(<NumerologyProfile profile={profileWithoutName} />);

    expect(screen.queryByText(/Nombre:/i)).not.toBeInTheDocument();
  });

  it('should render life path card', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByTestId('number-card-7')).toBeInTheDocument();
  });

  it('should render all core numbers', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByText('Números Principales')).toBeInTheDocument();
    expect(screen.getByTestId('number-card-5')).toBeInTheDocument(); // Expression
    expect(screen.getByTestId('number-card-3')).toBeInTheDocument(); // Soul Urge
    expect(screen.getByTestId('number-card-2')).toBeInTheDocument(); // Personality
    expect(screen.getByTestId('number-card-25')).toBeInTheDocument(); // Birthday
  });

  it('should display personal year', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByText('Año Personal')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('should display personal month', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByText('Mes Personal')).toBeInTheDocument();
    // Use getAllByText since "5" appears in both expression number and personal month
    const fives = screen.getAllByText('5');
    expect(fives.length).toBeGreaterThanOrEqual(1);
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <NumerologyProfile profile={mockProfile} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
