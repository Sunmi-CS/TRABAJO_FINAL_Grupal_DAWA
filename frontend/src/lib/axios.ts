import axios from 'axios';
import Cookies from 'js-cookie';

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
    const token = Cookies.get('petcare_token') ?? (typeof window !== 'undefined' ? localStorage.getItem('petcare_token') : null);
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
      // Token expirado o inválido
      Cookies.remove('petcare_token');
      Cookies.remove('petcare_user');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('petcare_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
