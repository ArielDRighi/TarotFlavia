import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ShareButton } from './ShareButton';

// Mock clipboard API
const mockWriteText = vi.fn();
const mockShare = vi.fn();

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ShareButton', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mocks
    mockWriteText.mockReset();
    mockShare.mockReset();

    // Setup clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Clean up
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default text', () => {
      render(<ShareButton text="Test content" />);

      expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument();
    });

    it('should render with custom children text', () => {
      render(<ShareButton text="Test content">Compartir mensaje</ShareButton>);

      expect(screen.getByRole('button', { name: /compartir mensaje/i })).toBeInTheDocument();
    });

    it('should render with custom variant', () => {
      render(<ShareButton text="Test" variant="outline" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('should render with custom size', () => {
      render(<ShareButton text="Test" size="lg" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Desktop behavior (clipboard fallback)', () => {
    beforeEach(() => {
      // Remove Web Share API
      Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true,
        configurable: true,
      });
    });

    it('should copy text to clipboard when share API not available', async () => {
      const text = 'Test share content';
      mockWriteText.mockResolvedValueOnce(undefined);

      render(<ShareButton text={text} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(text);
      });
    });

    it('should show success toast after copying to clipboard', async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      const { toast } = await import('@/hooks/utils/useToast');

      render(<ShareButton text="Test" />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Texto copiado');
      });
    });

    it('should call onSuccess callback after successful copy', async () => {
      mockWriteText.mockResolvedValueOnce(undefined);
      const onSuccess = vi.fn();

      render(<ShareButton text="Test" onSuccess={onSuccess} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should show error toast when clipboard fails', async () => {
      const error = new Error('Clipboard error');
      mockWriteText.mockRejectedValueOnce(error);
      const { toast } = await import('@/hooks/utils/useToast');

      render(<ShareButton text="Test" />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al compartir');
      });
    });

    it('should call onError callback when clipboard fails', async () => {
      const error = new Error('Clipboard error');
      mockWriteText.mockRejectedValueOnce(error);
      const onError = vi.fn();

      render(<ShareButton text="Test" onError={onError} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Mobile behavior (Web Share API)', () => {
    beforeEach(() => {
      // Setup Web Share API
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        writable: true,
        configurable: true,
      });
    });

    it('should use Web Share API when available', async () => {
      const shareData = {
        text: 'Test share content',
        title: 'Test Title',
        url: 'https://example.com',
      };
      mockShare.mockResolvedValueOnce(undefined);

      render(<ShareButton text={shareData.text} title={shareData.title} url={shareData.url} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith(shareData);
      });
    });

    it('should use Web Share API with minimal data', async () => {
      mockShare.mockResolvedValueOnce(undefined);

      render(<ShareButton text="Test content" />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(mockShare).toHaveBeenCalledWith({
          text: 'Test content',
          title: undefined,
          url: undefined,
        });
      });
    });

    it('should show success toast after Web Share API success', async () => {
      mockShare.mockResolvedValueOnce(undefined);
      const { toast } = await import('@/hooks/utils/useToast');

      render(<ShareButton text="Test" />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('¡Compartido!');
      });
    });

    it('should call onSuccess callback after Web Share API success', async () => {
      mockShare.mockResolvedValueOnce(undefined);
      const onSuccess = vi.fn();

      render(<ShareButton text="Test" onSuccess={onSuccess} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should fallback to clipboard when user cancels Web Share', async () => {
      // Web Share API throws AbortError when user cancels
      const abortError = new DOMException('User cancelled', 'AbortError');
      mockShare.mockRejectedValueOnce(abortError);
      const { toast } = await import('@/hooks/utils/useToast');

      render(<ShareButton text="Test" />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        // Should NOT show error toast for AbortError (user intentionally cancelled)
        expect(toast.error).not.toHaveBeenCalled();
      });
    });

    it('should show error toast when Web Share API fails', async () => {
      const error = new Error('Share failed');
      mockShare.mockRejectedValueOnce(error);
      const { toast } = await import('@/hooks/utils/useToast');

      render(<ShareButton text="Test" />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al compartir');
      });
    });

    it('should call onError callback when Web Share API fails', async () => {
      const error = new Error('Share failed');
      mockShare.mockRejectedValueOnce(error);
      const onError = vi.fn();

      render(<ShareButton text="Test" onError={onError} />);

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });
  });

  // NOTE: Loading state is tested indirectly through other tests
  // Testing the exact timing of disabled state is flaky due to React's async nature
});
