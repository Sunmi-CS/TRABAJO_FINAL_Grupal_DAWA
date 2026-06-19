'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Metadata } from 'next';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message ?? 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setGoogleLoading(true);
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch {
      setError('Error al autenticar con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark">Bienvenido de vuelta</h2>
        <p className="text-dark/60 text-sm mt-1">Ingresa a tu cuenta de PetCare</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="login-email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          id="login-password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-dark/40 hover:text-dark/70 transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          autoComplete="current-password"
          {...register('password')}
        />

        <Button
          id="login-submit-btn"
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Iniciar sesión
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-dark/10" />
        <span className="text-dark/40 text-xs">o continúa con</span>
        <div className="flex-1 h-px bg-dark/10" />
      </div>

      <div className={`flex justify-center ${googleLoading ? 'opacity-50 pointer-events-none' : ''}`}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Error al conectar con Google')}
          theme="outline"
          size="large"
          width={300}
          text="signin_with"
          shape="rectangular"
        />
      </div>

      <p className="text-center text-sm text-dark/60 mt-6">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Regístrate aquí
        </Link>
      </p>
    </div>
  );
}
