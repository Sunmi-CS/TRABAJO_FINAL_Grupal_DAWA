import Cookies from 'js-cookie';
import { User } from '@/types';

const TOKEN_KEY = 'petcare_token';
const USER_KEY = 'petcare_user';

export const setAuth = (token: string, user: User): void => {
  Cookies.set(TOKEN_KEY, token);
  Cookies.set(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null =>
  Cookies.get(TOKEN_KEY) ?? null;

export const getUser = (): User | null => {
  const userStr = Cookies.get(USER_KEY);
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const clearAuth = (): void => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
};