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
    'PetCare centraliza la gestión de guarderías para mascotas con registro de mascotas, reservas y control de servicios.',
  keywords: ['guardería mascotas', 'petcare', 'cuidado de mascotas', 'reservas mascotas', 'servicios para mascotas'],
  openGraph: {
    title: 'PetCare - Guardería para Mascotas',
    description: 'Gestiona mascotas, reservas y servicios desde una sola plataforma.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  const content = <AuthProvider>{children}</AuthProvider>;

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
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            {content}
          </GoogleOAuthProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
