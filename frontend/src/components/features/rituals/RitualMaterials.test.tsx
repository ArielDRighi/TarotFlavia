import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RitualMaterials } from './RitualMaterials';
import { MaterialType, type RitualMaterial } from '@/types/ritual.types';

describe('RitualMaterials', () => {
  const mockMaterials: RitualMaterial[] = [
    {
      id: 1,
      name: 'Vela blanca',
      description: 'Preferiblemente de cera natural',
      type: MaterialType.REQUIRED,
      alternative: null,
      quantity: 1,
      unit: null,
    },
    {
      id: 2,
      name: 'Papel y bolígrafo',
      description: null,
      type: MaterialType.REQUIRED,
      alternative: null,
      quantity: 2,
      unit: 'unidades',
    },
    {
      id: 3,
      name: 'Incienso de salvia',
      description: null,
      type: MaterialType.OPTIONAL,
      alternative: 'Palo santo',
      quantity: 1,
      unit: null,
    },
    {
      id: 4,
      name: 'Cristal de cuarzo',
      description: null,
      type: MaterialType.OPTIONAL,
      alternative: 'Piedra de luna',
      quantity: 1,
      unit: null,
    },
  ];

  it('should render title', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText('Materiales Necesarios')).toBeInTheDocument();
  });

  it('should separate required and optional materials', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText('Requeridos')).toBeInTheDocument();
    expect(screen.getByText('Opcionales')).toBeInTheDocument();
  });

  it('should display all required materials', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText('Vela blanca')).toBeInTheDocument();
    expect(screen.getByText('Papel y bolígrafo')).toBeInTheDocument();
  });

  it('should display all optional materials', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText('Incienso de salvia')).toBeInTheDocument();
    expect(screen.getByText('Cristal de cuarzo')).toBeInTheDocument();
  });

  it('should display material description when available', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText('Preferiblemente de cera natural')).toBeInTheDocument();
  });

  it('should display quantity when greater than 1', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText(/× 2 unidades/i)).toBeInTheDocument();
  });

  it('should display alternative for optional materials', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByText(/Alternativa: Palo santo/i)).toBeInTheDocument();
    expect(screen.getByText(/Alternativa: Piedra de luna/i)).toBeInTheDocument();
  });

  it('should not show optional section if no optional materials', () => {
    const requiredOnly = mockMaterials.filter((m) => m.type === MaterialType.REQUIRED);
    render(<RitualMaterials materials={requiredOnly} />);

    expect(screen.queryByText('Opcionales')).not.toBeInTheDocument();
  });

  it('should not show required section if no required materials', () => {
    const optionalOnly = mockMaterials.filter((m) => m.type === MaterialType.OPTIONAL);
    render(<RitualMaterials materials={optionalOnly} />);

    expect(screen.queryByText('Requeridos')).not.toBeInTheDocument();
  });

  it('should have correct data-testid', () => {
    render(<RitualMaterials materials={mockMaterials} />);

    expect(screen.getByTestId('ritual-materials')).toBeInTheDocument();
  });
});
