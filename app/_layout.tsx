import { Stack } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check auth state on app load
    checkAuth();
  }, [checkAuth]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
