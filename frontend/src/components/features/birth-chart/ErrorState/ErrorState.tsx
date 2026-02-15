'use client';

import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
  showHomeLink?: boolean;
  showBackLink?: boolean;
  variant?: 'page' | 'inline' | 'card';
  className?: string;
}

export function ErrorState({
  title = 'Algo salió mal',
  message,
  error,
  onRetry,
  isRetrying = false,
  showHomeLink = false,
  showBackLink = false,
  variant = 'page',
  className,
}: ErrorStateProps) {
  // Extraer mensaje del error
  const errorMessage =
    message ||
    (error instanceof Error ? error.message : error) ||
    'Ha ocurrido un error inesperado. Por favor intenta de nuevo.';

  // Variante inline (pequeña, para dentro de componentes)
  if (variant === 'inline') {
    return (
      <Alert variant="destructive" className={className} data-testid="error-state-container">
        <AlertCircle data-testid="error-state-icon" className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex items-center gap-4">
          <span>{errorMessage}</span>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
              {isRetrying ? (
                <RefreshCw
                  data-testid="error-state-retry-spinner"
                  className="h-3 w-3 animate-spin"
                />
              ) : (
                'Reintentar'
              )}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Variante card (mediana, para secciones)
  if (variant === 'card') {
    return (
      <div
        role="alert"
        aria-live="polite"
        data-testid="error-state-container"
        className={cn(
          'border-destructive/50 bg-destructive/5 rounded-lg border p-6 text-center',
          className
        )}
      >
        <AlertCircle
          data-testid="error-state-icon"
          className="text-destructive mx-auto mb-4 h-8 w-8"
        />
        <h3 className="mb-2 font-semibold">{title}</h3>
        <p className="text-muted-foreground mb-4 text-sm">{errorMessage}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} disabled={isRetrying}>
            {isRetrying && (
              <RefreshCw
                data-testid="error-state-retry-spinner"
                className="mr-2 h-4 w-4 animate-spin"
              />
            )}
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  // Variante page (grande, página completa)
  return (
    <div
      role="alert"
      aria-live="polite"
      data-testid="error-state-container"
      className={cn(
        'flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center',
        className
      )}
    >
      <div
        data-testid="error-state-icon-container"
        className="bg-destructive/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full"
      >
        <AlertCircle data-testid="error-state-icon" className="text-destructive h-10 w-10" />
      </div>

      <h1 className="mb-2 text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mb-8 max-w-md">{errorMessage}</p>

      {(onRetry || showBackLink || showHomeLink) && (
        <div data-testid="error-state-actions" className="flex flex-col gap-3 sm:flex-row">
          {onRetry && (
            <Button onClick={onRetry} disabled={isRetrying}>
              {isRetrying && (
                <RefreshCw
                  data-testid="error-state-retry-spinner"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              )}
              Intentar de nuevo
            </Button>
          )}

          {showBackLink && (
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft data-testid="error-state-back-icon" className="mr-2 h-4 w-4" />
              Volver
            </Button>
          )}

          {showHomeLink && (
            <Button variant="outline" asChild>
              <Link href="/">
                <Home data-testid="error-state-home-icon" className="mr-2 h-4 w-4" />
                Ir al inicio
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
