import axios, { AxiosError } from 'axios';
import { User, UserCreate, UserLogin, Token } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'library_access_token';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Auth API calls
export const authService = {
  register: async (data: UserCreate): Promise<User> => {
    const response = await authAPI.post<User>('/auth/register', data);
    return response.data;
  },

  login: async (username: string, password: string): Promise<Token> => {
    // OAuth2 expects form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await authAPI.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const token = response.data;
    setToken(token.access_token);
    return token;
  },

  logout: (): void => {
    removeToken();
  },

  getCurrentUser: async (): Promise<User> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await authAPI.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};

// Handle authentication errors
authAPI.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default authService;
