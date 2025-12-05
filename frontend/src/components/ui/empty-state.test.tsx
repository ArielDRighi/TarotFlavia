import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Inbox } from 'lucide-react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  describe('rendering', () => {
    it('should render the title', () => {
      render(<EmptyState title="No items found" message="Try adding some items" />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('should render the message', () => {
      render(<EmptyState title="No items" message="Your list is empty" />);

      expect(screen.getByText('Your list is empty')).toBeInTheDocument();
    });

    it('should apply font-serif to the title', () => {
      render(<EmptyState title="Title" message="Message" />);

      const title = screen.getByText('Title');
      expect(title).toHaveClass('font-serif');
    });

    it('should apply muted styling to the message', () => {
      render(<EmptyState title="Title" message="Message" />);

      const message = screen.getByText('Message');
      expect(message).toHaveClass('text-muted-foreground');
    });

    it('should center content vertically', () => {
      const { container } = render(<EmptyState title="Title" message="Message" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });
  });

  describe('icon', () => {
    it('should not render icon wrapper when icon is not provided', () => {
      render(<EmptyState title="Title" message="Message" />);

      expect(screen.queryByTestId('empty-state-icon')).not.toBeInTheDocument();
    });

    it('should render the icon when provided', () => {
      render(
        <EmptyState title="Title" message="Message" icon={<Inbox data-testid="inbox-icon" />} />
      );

      expect(screen.getByTestId('inbox-icon')).toBeInTheDocument();
    });

    it('should apply soft gray styling to the icon wrapper', () => {
      render(
        <EmptyState title="Title" message="Message" icon={<Inbox data-testid="inbox-icon" />} />
      );

      const iconWrapper = screen.getByTestId('empty-state-icon');
      expect(iconWrapper).toHaveClass('text-muted-foreground/50');
    });
  });

  describe('action button', () => {
    it('should not render action button when action is not provided', () => {
      render(<EmptyState title="Title" message="Message" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render action button with correct label when action is provided', () => {
      render(
        <EmptyState
          title="Title"
          message="Message"
          action={{ label: 'Add item', onClick: () => {} }}
        />
      );

      expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
    });

    it('should call onClick when action button is clicked', () => {
      const handleClick = vi.fn();
      render(
        <EmptyState
          title="Title"
          message="Message"
          action={{ label: 'Add item', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Add item' });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom props', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <EmptyState title="Title" message="Message" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should spread additional props to the container', () => {
      render(<EmptyState title="Title" message="Message" data-testid="custom-empty" />);

      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
    });
  });
});
