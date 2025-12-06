import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea', () => {
  describe('rendering', () => {
    it('should render a textarea element', () => {
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render with the data-slot attribute', () => {
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveAttribute('data-slot', 'textarea');
    });

    it('should render with placeholder text', () => {
      render(<Textarea placeholder="Enter your text" />);

      const textarea = screen.getByPlaceholderText('Enter your text');
      expect(textarea).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<Textarea defaultValue="Initial content" data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveValue('Initial content');
    });
  });

  describe('className merging', () => {
    it('should apply default base classes', () => {
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveClass('border-input');
      expect(textarea).toHaveClass('rounded-md');
      expect(textarea).toHaveClass('w-full');
    });

    it('should merge custom className with base classes', () => {
      render(<Textarea className="custom-class my-extra-class" data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveClass('custom-class');
      expect(textarea).toHaveClass('my-extra-class');
      expect(textarea).toHaveClass('border-input'); // base class still present
    });
  });

  describe('aria-invalid state', () => {
    it('should support aria-invalid attribute', () => {
      render(<Textarea aria-invalid="true" data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should render without aria-invalid by default', () => {
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('disabled state', () => {
    it('should apply disabled attribute when passed', () => {
      render(<Textarea disabled data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toBeDisabled();
    });

    it('should apply disabled styling classes', () => {
      render(<Textarea disabled data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveClass('disabled:cursor-not-allowed');
      expect(textarea).toHaveClass('disabled:opacity-50');
    });

    it('should be enabled by default', () => {
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).not.toBeDisabled();
    });
  });

  describe('user interaction', () => {
    it('should allow typing when enabled', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      await user.type(textarea, 'Hello World');

      expect(textarea).toHaveValue('Hello World');
    });

    it('should not allow typing when disabled', async () => {
      const user = userEvent.setup();
      render(<Textarea disabled data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      await user.type(textarea, 'Hello World');

      expect(textarea).toHaveValue('');
    });
  });

  describe('accessibility', () => {
    it('should be focusable when enabled', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      await user.click(textarea);

      expect(textarea).toHaveFocus();
    });

    it('should support aria-label for accessibility', () => {
      render(<Textarea aria-label="Message input" data-testid="test-textarea" />);

      const textarea = screen.getByLabelText('Message input');
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria-describedby for accessibility', () => {
      render(
        <>
          <Textarea aria-describedby="description" data-testid="test-textarea" />
          <span id="description">Enter your message here</span>
        </>
      );

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('props spreading', () => {
    it('should forward additional props to the textarea element', () => {
      render(
        <Textarea
          data-testid="test-textarea"
          id="my-textarea"
          name="message"
          rows={5}
          maxLength={500}
        />
      );

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveAttribute('id', 'my-textarea');
      expect(textarea).toHaveAttribute('name', 'message');
      expect(textarea).toHaveAttribute('rows', '5');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });

    it('should support required attribute', () => {
      render(<Textarea required data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toBeRequired();
    });

    it('should support readOnly attribute', () => {
      render(<Textarea readOnly defaultValue="Read only content" data-testid="test-textarea" />);

      const textarea = screen.getByTestId('test-textarea');
      expect(textarea).toHaveAttribute('readOnly');
    });
  });
});
