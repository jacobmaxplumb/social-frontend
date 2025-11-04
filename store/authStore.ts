import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AUTH_KEY = '@auth_state';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  
  login: async () => {
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    set({ isAuthenticated: true, isInitialized: true });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const authState = await AsyncStorage.getItem(AUTH_KEY);
    set({ isAuthenticated: authState === 'true', isInitialized: true });
  },
}));

