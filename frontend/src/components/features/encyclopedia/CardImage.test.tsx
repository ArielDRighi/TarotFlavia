import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CardImage } from './CardImage';

describe('CardImage', () => {
  describe('Rendering', () => {
    it('should render card image', () => {
      render(<CardImage src="/images/tarot/fool.jpg" alt="El Loco" />);

      const img = screen.getByAltText('El Loco');
      expect(img).toBeInTheDocument();
    });

    it('should have data-testid attribute', () => {
      render(<CardImage src="/images/tarot/fool.jpg" alt="El Loco" />);

      expect(screen.getByTestId('card-image')).toBeInTheDocument();
    });

    it('should render zoom trigger container', () => {
      render(<CardImage src="/images/tarot/fool.jpg" alt="El Loco" />);

      const trigger = screen.getByTestId('card-image-trigger');
      expect(trigger).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<CardImage src="/images/tarot/fool.jpg" alt="El Loco" className="custom-class" />);

      expect(screen.getByTestId('card-image')).toHaveClass('custom-class');
    });
  });

  describe('Modal interaction', () => {
    it('should open modal when image is clicked', async () => {
      const user = userEvent.setup();
      render(<CardImage src="/images/tarot/fool.jpg" alt="El Loco" />);

      const trigger = screen.getByTestId('card-image-trigger');
      await user.click(trigger);

      expect(screen.getByTestId('card-image-modal')).toBeInTheDocument();
    });

    it('should show full-size image in modal', async () => {
      const user = userEvent.setup();
      render(<CardImage src="/images/tarot/fool.jpg" alt="El Loco" />);

      const trigger = screen.getByTestId('card-image-trigger');
      await user.click(trigger);

      const images = screen.getAllByAltText('El Loco');
      expect(images.length).toBeGreaterThan(1);
    });
  });
});
