import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { CheckItem } from './check-item';

describe('CheckItem', () => {
  it('renderiza un <li> con el texto y un icono de check decorativo', () => {
    render(
      <ul>
        <CheckItem>1 carta del día</CheckItem>
      </ul>
    );

    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('1 carta del día');
    const icon = item.querySelector('svg');
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveClass('text-primary');
  });

  it('acepta hijos con JSX', () => {
    render(
      <ul>
        <CheckItem>
          Crear una lectura (tienes <strong>2</strong> restantes)
        </CheckItem>
      </ul>
    );

    expect(screen.getByRole('listitem')).toHaveTextContent(
      'Crear una lectura (tienes 2 restantes)'
    );
    expect(screen.getByText('2').tagName).toBe('STRONG');
  });

  it('permite cambiar el tono del icono y agregar clases', () => {
    render(
      <ul>
        <CheckItem tone="success" className="text-sm" data-testid="beneficio">
          3 tiradas por día
        </CheckItem>
      </ul>
    );

    const item = screen.getByTestId('beneficio');
    expect(item).toHaveClass('text-sm');
    expect(item.querySelector('svg')).toHaveClass('text-green-600');
  });
});
