import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';
import { create } from 'zustand';
import { api, setAuthToken } from '../lib/api';
import { AuthResponse } from '../types/api';

type AuthUser = AuthResponse['user'];

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AUTH_KEY = '@auth_state_v1';

const serializeAuthData = async (data: AuthResponse) => {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(data));
};

const deserializeAuthData = async (): Promise<AuthResponse | null> => {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch (error) {
    await AsyncStorage.removeItem(AUTH_KEY);
    return null;
  }
};

const clearAuthData = async () => {
  await AsyncStorage.removeItem(AUTH_KEY);
};

const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      error?: { message?: string };
      message?: string;
    }>;

    const message =
      axiosError.response?.data?.error?.message ??
      axiosError.response?.data?.message ??
      axiosError.message;
    return message ?? 'An unexpected error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isInitialized: false,
  token: null,
  user: null,

  login: async (username: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        username,
        password,
      });

      const { token, user } = response.data;
      setAuthToken(token);
      await serializeAuthData({ token, user });
      set({
        isAuthenticated: true,
        isInitialized: true,
        token,
        user,
      });
    } catch (error) {
      await clearAuthData();
      set({
        isAuthenticated: false,
        isInitialized: true,
        token: null,
        user: null,
      });
      throw new Error(extractErrorMessage(error));
    }
  },

  register: async (username: string, password: string) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        username,
        password,
      });

      const { token, user } = response.data;
      setAuthToken(token);
      await serializeAuthData({ token, user });
      set({
        isAuthenticated: true,
        isInitialized: true,
        token,
        user,
      });
    } catch (error) {
      throw new Error(extractErrorMessage(error));
    }
  },

  logout: async () => {
    await clearAuthData();
    setAuthToken(null);
    set({
      isAuthenticated: false,
      isInitialized: true,
      token: null,
      user: null,
    });
  },

  checkAuth: async () => {
    const stored = await deserializeAuthData();

    if (stored?.token && stored.user) {
      setAuthToken(stored.token);
      set({
        isAuthenticated: true,
        isInitialized: true,
        token: stored.token,
        user: stored.user,
      });
      return;
    }

    setAuthToken(null);
    set({
      isAuthenticated: false,
      isInitialized: true,
      token: null,
      user: null,
    });
  },
}));


