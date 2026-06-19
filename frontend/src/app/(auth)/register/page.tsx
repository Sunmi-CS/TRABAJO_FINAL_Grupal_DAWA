'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';
import { AuthResponse } from '@/types';
import { setAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (response.data.success) {
        setAuth(response.data.data.token, response.data.data.user);
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message ?? 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch {
      setError('Error al registrarse con Google');
    }
  };

  return (
    <div className="card animate-slide-up">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-dark">Crea tu cuenta</h2>
        <p className="text-dark/60 text-sm mt-1">Únete a la comunidad PetCare</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="register-name"
          label="Nombre completo"
          type="text"
          placeholder="Tu nombre"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />

        <Input
          id="register-email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@email.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          id="register-password"
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar contraseña"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          id="register-confirm-password"
          label="Confirmar contraseña"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button
          id="register-submit-btn"
          type="submit"
          isLoading={isLoading}
          className="w-full"
          size="lg"
        >
          Crear cuenta
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-dark/10" />
        <span className="text-dark/40 text-xs">o regístrate con</span>
        <div className="flex-1 h-px bg-dark/10" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Error al conectar con Google')}
          theme="outline"
          size="large"
          text="signup_with"
          shape="rectangular"
        />
      </div>

      <p className="text-center text-sm text-dark/60 mt-6">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
