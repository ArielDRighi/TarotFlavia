/**
 * Tests for Birth Chart Result Layout (TDD - Red Phase)
 *
 * Layout simple que solo establece metadata y renderiza children.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import ResultLayout from './layout';

describe('ResultLayout', () => {
  it('should render children', () => {
    render(
      <ResultLayout>
        <div data-testid="child-content">Test Content</div>
      </ResultLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should pass through children without modification', () => {
    render(
      <ResultLayout>
        <span className="test-class">Multiple</span>
        <span>Children</span>
      </ResultLayout>
    );

    expect(screen.getByText('Multiple')).toHaveClass('test-class');
    expect(screen.getByText('Children')).toBeInTheDocument();
  });

  it('should render multiple children elements', () => {
    render(
      <ResultLayout>
        <div>First Child</div>
        <div>Second Child</div>
        <div>Third Child</div>
      </ResultLayout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});
