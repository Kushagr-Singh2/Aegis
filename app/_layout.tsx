/**
 * Root Layout — Stack navigator
 *
 * Entry point for Expo Router. Wraps the entire app in providers
 * and configures the root Stack navigator.
 *
 * Phase 2 screens added:
 *   destination-search  — full-screen search (slide_from_bottom)
 *   route-preview       — full-screen route selection (slide_from_right)
 *   active-journey      — full-screen active monitoring (fade)
 *   journey-complete    — journey completion celebration (slide_from_bottom)
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

        {/* Phase 2 — Journey flow screens */}
        <Stack.Screen
          name="destination-search"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="route-preview"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="active-journey"
          options={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen
          name="journey-complete"
          options={{ headerShown: false, animation: 'slide_from_bottom', gestureEnabled: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
