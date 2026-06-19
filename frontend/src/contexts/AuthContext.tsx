'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import { setAuth, getUser, getToken, clearAuth } from '@/lib/auth';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
    if (data.success) {
      setAuth(data.data.token, data.data.user);
      setUser(data.data.user);
      setToken(data.data.token);
      router.push('/dashboard');
    }
  }, [router]);

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/google', { credential });
    if (data.success) {
      setAuth(data.data.token, data.data.user);
      setUser(data.data.user);
      setToken(data.data.token);
      router.push('/dashboard');
    }
  }, [router]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    const token = getToken();
    if (token) {
      setAuth(token, updatedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, logout, updateUser }}>
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
