import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata: Metadata = {
  title: {
    default: 'PetCare - Guardería para Mascotas',
    template: '%s | PetCare',
  },
  description:
    'PetCare es la plataforma líder para gestión de guarderías para mascotas. Registra tus mascotas, solicita reservas y lleva el control de todos los servicios.',
  keywords: ['guardería mascotas', 'petcare', 'cuidado de mascotas', 'reservas mascotas'],
  openGraph: {
    title: 'PetCare - Guardería para Mascotas',
    description: 'La plataforma más completa para cuidar a tu mascota',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>{children}</AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
