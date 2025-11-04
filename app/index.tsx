import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuthStore } from "../store/authStore";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasNavigated = useRef(false);
  const prevAuthState = useRef(isAuthenticated);

  useEffect(() => {
    // Check auth state on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Reset navigation flag when auth state changes
    if (prevAuthState.current !== isAuthenticated) {
      hasNavigated.current = false;
      prevAuthState.current = isAuthenticated;
    }

    // Defer navigation to ensure Root Layout is mounted
    const timer = setTimeout(() => {
      try {
        // Handle routing based on auth state
        // segments[0] will be undefined on index route, or the current route group
        const currentSegment = segments[0];
        const inAuthGroup = currentSegment === "auth";
        const inTabsGroup = currentSegment === "(tabs)";

        // Only navigate if we're not already in the correct group
        if (isAuthenticated && !inTabsGroup) {
          // User is authenticated but not in tabs, redirect to tabs
          hasNavigated.current = true;
          router.replace("/(tabs)");
        } else if (!isAuthenticated && !inAuthGroup) {
          // User is not authenticated but not in auth, redirect to auth
          hasNavigated.current = true;
          router.replace("/auth/login");
        }
      } catch (error) {
        // Router might not be ready yet, will retry on next render
        // Reset the flag so we can retry
        hasNavigated.current = false;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, segments, router]);

  // Show loading screen while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
