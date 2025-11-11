import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = 3000;

const resolveLocalhost = () => {
  const expoConfigHost =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.manifest?.hostUri ??
    Constants.manifest?.debuggerHost;

  if (expoConfigHost) {
    const host = expoConfigHost.split(':')[0];
    if (host) {
      return `http://${host}:${DEFAULT_PORT}`;
    }
  }

  if (Platform.OS === 'android') {
    // Android emulator loopback
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }

  return `http://localhost:${DEFAULT_PORT}`;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? resolveLocalhost();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};


