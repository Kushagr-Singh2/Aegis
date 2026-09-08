/**
 * Root Layout — Stack navigator
 *
 * Entry point for Expo Router. Wraps the entire app in providers
 * and configures the root Stack navigator.
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  const initializeApp = useAppStore((s) => s.initializeApp);

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.background.primary,
          },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
