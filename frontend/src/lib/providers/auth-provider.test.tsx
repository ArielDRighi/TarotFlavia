import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AuthProvider } from './auth-provider';

/**
 * Guardarraíl T-PROD-022.
 *
 * `AuthProvider` devolvía una pantalla de "Verificando sesión..." **en lugar de**
 * `children` mientras la sesión no estuviera resuelta. Como vive en el layout
 * raíz y en el servidor `_hasHydrated` es SIEMPRE `false` (no existe
 * `localStorage`), **todo render SSR del sitio entero era ese splash**.
 *
 * Medido en producción con el user-agent de Googlebot, antes del arreglo:
 *
 *     /                              → "Auguria Verificando sesión..."  (3 palabras)
 *     /enciclopedia/tarot/the-fool   → "Auguria Verificando sesión..."  (3 palabras)
 *     /horoscopo/aries               → "Auguria Verificando sesión..."  (3 palabras)
 *
 * Eso le costó al sitio el rechazo de AdSense por "contenido de poco valor" y es
 * la mitad que faltaba del "Duplicada: Google eligió otra canónica" de T-PROD-020:
 * los títulos quedaron únicos, pero los cuerpos seguían siendo todos idénticos.
 *
 * La regla que fija este test: **el contenido de la página se renderiza siempre**.
 * Cada componente que necesite ocultar algo hasta tener sesión se protege solo
 * (`HomePageContent` con su skeleton, `useRequireAuth` en rutas privadas, y
 * `useAdsEnabled`, que ya exige `_hasHydrated` para no mostrarle un anuncio a un
 * Premium).
 */

const mockCheckAuth = vi.fn();

interface MockAuthState {
  checkAuth: () => void;
  isLoading: boolean;
  _hasHydrated: boolean;
}

let mockState: MockAuthState;

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (state: MockAuthState) => unknown) => selector(mockState),
}));

function renderWithState(state: Partial<MockAuthState>) {
  mockState = {
    checkAuth: mockCheckAuth,
    isLoading: false,
    _hasHydrated: true,
    ...state,
  };

  return render(
    <AuthProvider>
      <main data-testid="contenido">Significado de El Loco en el tarot</main>
    </AuthProvider>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('⚠️ T-PROD-022: renderiza el contenido aunque el store todavía no hidrató', () => {
    // Éste es el caso del servidor: `_hasHydrated` nunca llega a true en SSR, así
    // que es exactamente lo que recibe Googlebot.
    renderWithState({ _hasHydrated: false, isLoading: true });

    expect(screen.getByTestId('contenido')).toBeInTheDocument();
    expect(screen.getByText('Significado de El Loco en el tarot')).toBeInTheDocument();
  });

  it('⚠️ T-PROD-022: renderiza el contenido mientras se valida la sesión', () => {
    renderWithState({ _hasHydrated: true, isLoading: true });

    expect(screen.getByTestId('contenido')).toBeInTheDocument();
  });

  it('⚠️ T-PROD-022: no bloquea el sitio con la pantalla de "Verificando sesión"', () => {
    renderWithState({ _hasHydrated: false, isLoading: true });

    expect(screen.queryByText(/verificando sesión/i)).not.toBeInTheDocument();
  });

  it('renderiza el contenido con la sesión ya resuelta', () => {
    renderWithState({ _hasHydrated: true, isLoading: false });

    expect(screen.getByTestId('contenido')).toBeInTheDocument();
  });

  it('valida la sesión una vez que el store hidrató', () => {
    renderWithState({ _hasHydrated: true, isLoading: false });

    expect(mockCheckAuth).toHaveBeenCalledOnce();
  });

  it('no valida la sesión antes de hidratar: leería un token que todavía no está', () => {
    renderWithState({ _hasHydrated: false, isLoading: true });

    expect(mockCheckAuth).not.toHaveBeenCalled();
  });
});
