import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native-css-interop';
import { AppProvider } from '@/context/AppContext';
import '@/global.css';

// Configure dark mode flag for NativeWind / CSS interop
try {
  (StyleSheet as any).setFlag?.('darkMode', 'class');
} catch (e) {
  // Ignore in environments where flag is already configured
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/[step]" />
          <Stack.Screen name="onboarding/building" />
          <Stack.Screen name="onboarding/plan" />
          <Stack.Screen name="onboarding/plan-includes" />
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AppProvider>
    </SafeAreaProvider>
  );
}
