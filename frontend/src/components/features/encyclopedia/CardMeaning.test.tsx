import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CardMeaning } from './CardMeaning';

describe('CardMeaning', () => {
  const defaultProps = {
    meaningUpright:
      'Nuevos comienzos, aventura y libertad. Un espíritu libre listo para emprender el viaje.',
    meaningReversed:
      'Imprudencia, ingenuidad excesiva. Decisiones apresuradas sin pensar en las consecuencias.',
  };

  describe('Rendering', () => {
    it('should render the component with data-testid', () => {
      render(<CardMeaning {...defaultProps} />);

      expect(screen.getByTestId('card-meaning')).toBeInTheDocument();
    });

    it('should render upright meaning by default', () => {
      render(<CardMeaning {...defaultProps} />);

      expect(screen.getByText(defaultProps.meaningUpright)).toBeInTheDocument();
    });

    it('should render Derecha tab trigger', () => {
      render(<CardMeaning {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /derecha/i })).toBeInTheDocument();
    });

    it('should render Invertida tab trigger', () => {
      render(<CardMeaning {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /invertida/i })).toBeInTheDocument();
    });
  });

  describe('Tab switching', () => {
    it('should show reversed meaning when Invertida tab is clicked', async () => {
      const user = userEvent.setup();
      render(<CardMeaning {...defaultProps} />);

      const reversedTab = screen.getByRole('tab', { name: /invertida/i });
      await user.click(reversedTab);

      expect(screen.getByText(defaultProps.meaningReversed)).toBeInTheDocument();
    });

    it('should show upright meaning when Derecha tab is clicked after switching', async () => {
      const user = userEvent.setup();
      render(<CardMeaning {...defaultProps} />);

      const reversedTab = screen.getByRole('tab', { name: /invertida/i });
      await user.click(reversedTab);

      const uprightTab = screen.getByRole('tab', { name: /derecha/i });
      await user.click(uprightTab);

      expect(screen.getByText(defaultProps.meaningUpright)).toBeInTheDocument();
    });
  });
});
