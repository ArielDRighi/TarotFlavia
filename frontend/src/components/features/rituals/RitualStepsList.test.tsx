import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RitualStepsList } from './RitualStepsList';
import type { RitualStep } from '@/types/ritual.types';

describe('RitualStepsList', () => {
  const mockSteps: RitualStep[] = [
    {
      id: 1,
      stepNumber: 1,
      title: 'Preparar el espacio',
      description: 'Limpia y ordena tu espacio sagrado',
      durationSeconds: 180,
      imageUrl: null,
      mantra: null,
      visualization: null,
    },
    {
      id: 2,
      stepNumber: 2,
      title: 'Encender la vela',
      description: 'Enciende la vela con intención',
      durationSeconds: 60,
      imageUrl: null,
      mantra: 'Enciendo esta luz para iluminar mi camino',
      visualization: null,
    },
    {
      id: 3,
      stepNumber: 3,
      title: 'Centrar la energía',
      description: 'Realiza tres respiraciones profundas',
      durationSeconds: 180,
      imageUrl: null,
      mantra: null,
      visualization: 'Imagina una luz plateada de luna envolviendo todo tu ser',
    },
  ];

  it('should render title', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getByText('Pasos del Ritual')).toBeInTheDocument();
  });

  it('should render all steps', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getByText('Preparar el espacio')).toBeInTheDocument();
    expect(screen.getByText('Encender la vela')).toBeInTheDocument();
    expect(screen.getByText('Centrar la energía')).toBeInTheDocument();
  });

  it('should render step numbers', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should render step descriptions', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getByText('Limpia y ordena tu espacio sagrado')).toBeInTheDocument();
    expect(screen.getByText('Enciende la vela con intención')).toBeInTheDocument();
    expect(screen.getByText('Realiza tres respiraciones profundas')).toBeInTheDocument();
  });

  it('should format duration correctly for seconds', () => {
    const stepsWithSeconds: RitualStep[] = [
      {
        id: 1,
        stepNumber: 1,
        title: 'Test',
        description: 'Test',
        durationSeconds: 45,
        imageUrl: null,
        mantra: null,
        visualization: null,
      },
    ];
    render(<RitualStepsList steps={stepsWithSeconds} />);

    expect(screen.getByText(/45s/i)).toBeInTheDocument();
  });

  it('should format duration correctly for minutes', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getAllByText(/3m/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/1m/i)).toBeInTheDocument();
  });

  it('should display mantra when available', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getByText(/Enciendo esta luz para iluminar mi camino/i)).toBeInTheDocument();
  });

  it('should display visualization when available', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(
      screen.getByText(/Imagina una luz plateada de luna envolviendo todo tu ser/i)
    ).toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(<RitualStepsList steps={mockSteps} />);

    expect(screen.getByTestId('ritual-steps-list')).toBeInTheDocument();
  });
});
