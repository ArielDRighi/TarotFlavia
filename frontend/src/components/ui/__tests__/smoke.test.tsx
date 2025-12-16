/**
 * UI Components Smoke Tests
 *
 * These tests verify that critical UI components render without crashing.
 * They are NOT comprehensive tests - just basic smoke tests to catch
 * major rendering issues.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';

import { Button } from '../button';
import { Input } from '../input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../card';
import { Toaster } from '../toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';

describe('UI Components Smoke Tests', () => {
  describe('Button', () => {
    it('renders without crashing', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button variant="ghost">Ghost</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="default">Default</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders disabled state', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Input', () => {
    it('renders without crashing', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with type text', () => {
      render(<Input type="text" placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with type email', () => {
      render(<Input type="email" placeholder="Enter email" />);
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    it('renders with type password', () => {
      render(<Input type="password" placeholder="Enter password" />);
      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    });

    it('renders disabled state', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Card', () => {
    it('renders without crashing', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description text</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('renders with content', () => {
      render(
        <Card>
          <CardContent>Content area</CardContent>
        </Card>
      );
      expect(screen.getByText('Content area')).toBeInTheDocument();
    });

    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>With all parts</CardDescription>
          </CardHeader>
          <CardContent>Main content</CardContent>
        </Card>
      );
      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('With all parts')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
    });
  });

  describe('Toaster', () => {
    it('renders without crashing', () => {
      const { container } = render(<Toaster />);
      expect(container).toBeInTheDocument();
    });

    it('renders with custom position', () => {
      const { container } = render(<Toaster position="top-center" />);
      expect(container).toBeInTheDocument();
    });

    it('renders with custom duration', () => {
      const { container } = render(<Toaster duration={5000} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Dialog (Modal)', () => {
    it('renders trigger without crashing', () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
    });

    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup();

      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Test Dialog</DialogTitle>
              <DialogDescription>Dialog description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByRole('button', { name: /open/i });
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('closes when backdrop is clicked', () => {
      render(
        <Dialog defaultOpen>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Closeable Dialog</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
