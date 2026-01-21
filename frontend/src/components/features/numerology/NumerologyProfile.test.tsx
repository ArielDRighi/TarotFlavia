import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { NumerologyProfile } from './NumerologyProfile';
import type { NumerologyResponseDto } from '@/types/numerology.types';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  },
}));

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

  it('should render life path card', () => {
    render(<NumerologyProfile profile={mockProfile} />);

    expect(screen.getByTestId('number-card-7')).toBeInTheDocument();
  });

  it('should show premium interpretation CTA when canGenerateInterpretation is true and no interpretation', () => {
    render(<NumerologyProfile profile={mockProfile} canGenerateInterpretation={true} />);

    expect(screen.getByText(/interpretación personalizada/i)).toBeInTheDocument();
    expect(screen.getByText(/generar interpretación/i)).toBeInTheDocument();
  });

  it('should show upgrade message when canGenerateInterpretation is false', () => {
    render(<NumerologyProfile profile={mockProfile} canGenerateInterpretation={false} />);

    expect(screen.getByText('PREMIUM')).toBeInTheDocument();
    expect(screen.getByText(/interpretación profunda y personalizada/i)).toBeInTheDocument();
  });

  it('should call onRequestInterpretation when button is clicked', () => {
    const onRequestInterpretation = vi.fn();

    render(
      <NumerologyProfile
        profile={mockProfile}
        canGenerateInterpretation={true}
        onRequestInterpretation={onRequestInterpretation}
      />
    );

    const button = screen.getByText(/generar interpretación/i);
    button.click();

    expect(onRequestInterpretation).toHaveBeenCalledTimes(1);
  });

  it('should disable button when isGeneratingInterpretation is true', () => {
    render(
      <NumerologyProfile
        profile={mockProfile}
        canGenerateInterpretation={true}
        isGeneratingInterpretation={true}
      />
    );

    expect(screen.getByText(/generando.../i)).toBeDisabled();
  });

  it('should display interpretation when provided', () => {
    const interpretation = {
      id: 1,
      userId: 1,
      interpretation: 'Tu perfil numerológico muestra...',
      lifePath: 7,
      expressionNumber: 5,
      soulUrge: 3,
      personality: 2,
      birthdayNumber: 25,
      generatedAt: '2026-01-21T00:00:00Z',
      aiProvider: 'groq',
      aiModel: 'llama-3.1-70b-versatile',
    };

    render(<NumerologyProfile profile={mockProfile} interpretation={interpretation} />);

    expect(screen.getByText(/tu perfil numerológico muestra.../i)).toBeInTheDocument();
  });

  it('should show generation date for interpretation', () => {
    const interpretation = {
      id: 1,
      userId: 1,
      interpretation: 'Interpretación...',
      lifePath: 7,
      expressionNumber: null,
      soulUrge: null,
      personality: null,
      birthdayNumber: 25,
      generatedAt: '2026-01-21T00:00:00Z',
      aiProvider: 'groq',
      aiModel: 'llama-3.1-70b-versatile',
    };

    render(<NumerologyProfile profile={mockProfile} interpretation={interpretation} />);

    expect(screen.getByText(/generada el/i)).toBeInTheDocument();
  });
});
