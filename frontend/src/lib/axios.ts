import axios from 'axios';
import { clearAuth, getToken, normalizeRedirectPath } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor: agregar token JWT a cada petición
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor: manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();

      if (typeof window !== 'undefined') {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const redirectTarget = normalizeRedirectPath(currentPath);
        const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';

        if (!isAuthPage) {
          window.location.href = `/login?redirect=${encodeURIComponent(redirectTarget)}`;
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
