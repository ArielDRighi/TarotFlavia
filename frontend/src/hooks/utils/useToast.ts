import { toast as sonnerToast } from 'sonner';

/**
 * Toast options for customizing notifications
 */
export interface ToastOptions {
  /** Optional description text shown below the title */
  description?: string;
  /** Duration in milliseconds before auto-dismiss (default: 3000ms) */
  duration?: number;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Default toast options
 */
const DEFAULT_OPTIONS: Partial<ToastOptions> = {
  duration: 3000,
};

/**
 * Wrapper around sonner toast with predefined styles for success, error, and info
 */
export const toast = Object.assign(
  /**
   * Show a default toast notification
   * @param message - The message to display
   * @param options - Optional toast configuration
   */
  (message: string, options?: ToastOptions) => {
    return sonnerToast(message, { ...DEFAULT_OPTIONS, ...options });
  },
  {
    /**
     * Show a success toast with green left border
     * @param message - The success message to display
     * @param options - Optional toast configuration
     */
    success: (message: string, options?: ToastOptions) => {
      return sonnerToast.success(message, { ...DEFAULT_OPTIONS, ...options });
    },

    /**
     * Show an error toast with red left border
     * @param message - The error message to display
     * @param options - Optional toast configuration
     */
    error: (message: string, options?: ToastOptions) => {
      return sonnerToast.error(message, { ...DEFAULT_OPTIONS, ...options });
    },

    /**
     * Show an info toast with blue left border
     * @param message - The info message to display
     * @param options - Optional toast configuration
     */
    info: (message: string, options?: ToastOptions) => {
      return sonnerToast.info(message, { ...DEFAULT_OPTIONS, ...options });
    },

    /**
     * Dismiss a toast by ID or all toasts if no ID provided
     * @param toastId - Optional toast ID to dismiss
     */
    dismiss: (toastId?: string | number) => {
      return sonnerToast.dismiss(toastId);
    },
  }
);

/**
 * Hook to access toast notifications
 * @returns Object containing toast methods
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 *
 * // Success notification
 * toast.success('Reading saved successfully!');
 *
 * // Error notification
 * toast.error('Failed to save reading');
 *
 * // Info notification
 * toast.info('Your session will expire in 5 minutes');
 *
 * // With description
 * toast.success('Reading saved', {
 *   description: 'Your tarot reading has been saved to your history'
 * });
 * ```
 */
export function useToast() {
  return { toast };
}

export type { ToastOptions as ToastProps };
