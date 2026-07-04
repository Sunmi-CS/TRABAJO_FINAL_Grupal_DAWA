import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/services'];
const AUTH_PATHS = ['/login', '/register'];
const ADMIN_PATHS = ['/dashboard/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('petcare_token')?.value;
  const userCookie = request.cookies.get('petcare_user')?.value;

  if (AUTH_PATHS.some((path) => pathname === path)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname === path)) {
    return NextResponse.next();
  }

  // Rutas protegidas: redirigir al login si no está autenticado
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  // Rutas de administrador
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    try {
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)',
  ],
};
