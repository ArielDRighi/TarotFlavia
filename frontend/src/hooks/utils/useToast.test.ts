import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast as sonnerToast } from 'sonner';
import { useToast, toast } from './useToast';

// Mock sonner's toast
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  }),
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toast function', () => {
    it('should export toast function', () => {
      expect(toast).toBeDefined();
      expect(typeof toast).toBe('function');
    });

    it('should export toast.success method', () => {
      expect(toast.success).toBeDefined();
      expect(typeof toast.success).toBe('function');
    });

    it('should export toast.error method', () => {
      expect(toast.error).toBeDefined();
      expect(typeof toast.error).toBe('function');
    });

    it('should export toast.info method', () => {
      expect(toast.info).toBeDefined();
      expect(typeof toast.info).toBe('function');
    });

    it('should export toast.dismiss method', () => {
      expect(toast.dismiss).toBeDefined();
      expect(typeof toast.dismiss).toBe('function');
    });
  });

  describe('useToast hook', () => {
    it('should return toast object with all methods', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toast).toBeDefined();
      expect(result.current.toast.success).toBeDefined();
      expect(result.current.toast.error).toBeDefined();
      expect(result.current.toast.info).toBeDefined();
      expect(result.current.toast.dismiss).toBeDefined();
    });

    it('should call success toast with correct parameters', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast.success('Success message');
      });

      expect(sonnerToast.success).toHaveBeenCalledWith('Success message', expect.any(Object));
    });

    it('should call error toast with correct parameters', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast.error('Error message');
      });

      expect(sonnerToast.error).toHaveBeenCalledWith('Error message', expect.any(Object));
    });

    it('should call info toast with correct parameters', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast.info('Info message');
      });

      expect(sonnerToast.info).toHaveBeenCalledWith('Info message', expect.any(Object));
    });

    it('should support description in toast options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast.success('Title', { description: 'Description text' });
      });

      expect(sonnerToast.success).toHaveBeenCalledWith(
        'Title',
        expect.objectContaining({ description: 'Description text' })
      );
    });

    it('should support custom duration in toast options', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.toast.success('Title', { duration: 5000 });
      });

      expect(sonnerToast.success).toHaveBeenCalledWith(
        'Title',
        expect.objectContaining({ duration: 5000 })
      );
    });
  });
});

describe('Toast Types', () => {
  it('should have ToastOptions type exported', () => {
    // Type check - this test verifies the types are correctly exported
    const options: Parameters<typeof toast.success>[1] = {
      description: 'test',
      duration: 3000,
    };
    expect(options).toBeDefined();
  });
});
