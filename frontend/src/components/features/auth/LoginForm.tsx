'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schemas';

/**
 * LoginForm component
 *
 * A complete login form with email/password fields, client-side validation,
 * and integration with the auth store.
 *
 * Features:
 * - Email and password validation with Zod
 * - Toast notification for login errors (via authStore)
 * - Inline error message display as fallback
 * - Loading state with disabled inputs during submission
 * - Automatic redirect to /perfil on successful login
 */
export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('[LoginForm] onSubmit called with:', { email: data.email });

    setIsSubmitting(true);
    setLoginError(null); // Clear previous error

    try {
      console.log('[LoginForm] Calling login...');
      await login(data.email, data.password);

      console.log('[LoginForm] Login successful, redirecting to /perfil');
      // Only redirect if login succeeded (no exception thrown)
      router.push('/perfil');
    } catch (error) {
      // Login failed - show inline error message
      // Form fields remain populated for user to correct
      console.error('[LoginForm] Login failed:', error);

      const axiosError = error as { response?: { status?: number } };
      const isUnauthorized = axiosError.response?.status === 401;

      const errorMessage = isUnauthorized
        ? 'Email o contraseña incorrectos. Por favor, verifica tus credenciales e intenta nuevamente.'
        : 'Error al iniciar sesión. Por favor, intenta de nuevo más tarde.';

      console.log('[LoginForm] Setting error message:', errorMessage);
      setLoginError(errorMessage);
    } finally {
      console.log('[LoginForm] Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-soft w-full max-w-md rounded-2xl">
      <CardHeader className="text-center">
        <h1 className="text-primary font-serif text-3xl">Bienvenido al Oráculo</h1>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Login Error Message */}
          {loginError && (
            <div
              className="bg-destructive/10 border-destructive/30 text-destructive rounded-lg border p-4 text-sm"
              role="alert"
              aria-live="polite"
            >
              <p className="font-medium">{loginError}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={isSubmitting}
              className="focus:border-primary bg-gray-50"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              className="focus:border-primary bg-gray-50"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center">
        <Link
          href="/recuperar-password"
          className="text-muted-foreground hover:text-primary text-sm"
        >
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/registro" className="text-primary text-sm hover:underline">
          Crear cuenta nueva
        </Link>
      </CardFooter>
    </Card>
  );
}
