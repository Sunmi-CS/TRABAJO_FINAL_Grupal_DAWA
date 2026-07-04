'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import { setAuth, getToken, clearAuth, normalizeRedirectPath } from '@/lib/auth';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (name: string, email: string, password: string, redirectTo?: string) => Promise<void>;
  loginWithGoogle: (credential: string, redirectTo?: string) => Promise<void>;
  logout: (redirectTo?: string) => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const completeAuth = useCallback((nextToken: string, nextUser: User, redirectTo?: string) => {
    setAuth(nextToken, nextUser);
    setUser(nextUser);
    setToken(nextToken);
    router.replace(normalizeRedirectPath(redirectTo));
    router.refresh();
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Session expired');
        }

        const payload = await response.json() as { data: User };
        if (!cancelled) {
          setAuth(storedToken, payload.data);
          setUser(payload.data);
          setToken(storedToken);
        }
      } catch {
        clearAuth();
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, redirectTo?: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    if (data.success) {
      completeAuth(data.data.token, data.data.user, redirectTo);
    }
  }, [completeAuth]);

  const register = useCallback(async (name: string, email: string, password: string, redirectTo?: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', { name, email, password });
    if (data.success) {
      completeAuth(data.data.token, data.data.user, redirectTo);
    }
  }, [completeAuth]);

  const loginWithGoogle = useCallback(async (credential: string, redirectTo?: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/google', { credential });
    if (data.success) {
      completeAuth(data.data.token, data.data.user, redirectTo);
    }
  }, [completeAuth]);

  const logout = useCallback((redirectTo?: string) => {
    clearAuth();
    setUser(null);
    setToken(null);
    router.replace(redirectTo ? normalizeRedirectPath(redirectTo) : '/login');
    router.refresh();
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    setToken((currentToken) => {
      if (currentToken) {
        setAuth(currentToken, updatedUser);
      }

      return currentToken;
    });
  }, []);

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
