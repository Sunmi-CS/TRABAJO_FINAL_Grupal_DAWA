import Cookies from 'js-cookie';
import { User } from '@/types';

const TOKEN_KEY = 'petcare_token';
const USER_KEY = 'petcare_user';
const DEFAULT_AUTH_REDIRECT = '/dashboard';

const AUTH_COOKIE_OPTIONS = {
  expires: 7,
  sameSite: 'lax' as const,
  secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false,
};

export const normalizeRedirectPath = (redirectTo?: string | null): string => {
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return redirectTo;
};

export const setAuth = (token: string, user: User): void => {
  Cookies.set(TOKEN_KEY, token, AUTH_COOKIE_OPTIONS);
  Cookies.set(USER_KEY, JSON.stringify(user), AUTH_COOKIE_OPTIONS);
};

export const getToken = (): string | null =>
  Cookies.get(TOKEN_KEY) ?? null;

export const getUser = (): User | null => {
  const userStr = Cookies.get(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch {
    Cookies.remove(USER_KEY);
    return null;
  }
};

export const clearAuth = (): void => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
};

export const getDefaultAuthRedirect = (): string => DEFAULT_AUTH_REDIRECT;
