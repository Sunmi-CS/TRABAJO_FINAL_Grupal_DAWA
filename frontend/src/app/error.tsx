'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-dark mb-2">Algo salió mal</h1>
          <p className="text-dark/60 text-sm mb-6">
            {error.message ?? 'Ocurrió un error inesperado. Por favor intenta de nuevo.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="btn-primary">
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <Link href="/dashboard" className="btn-outline">
              <Home className="w-4 h-4" />
              Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
