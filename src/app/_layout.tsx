import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useSettings } from '@/hooks/useSettings';
import { GluestackProvider } from '@/providers/GluestackProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { StorageBootstrap } from '@/providers/StorageBootstrap';
import { WorkoutHistoryProvider } from '@/providers/WorkoutHistoryProvider';
import { WorkoutProvider } from '@/providers/WorkoutProvider';
import { WorkoutRoutineProvider } from '@/providers/WorkoutRoutineProvider';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedApp() {
  const systemColorScheme = useColorScheme();
  const { settings } = useSettings();

  const effectiveColorScheme =
    settings.theme === 'system' ? systemColorScheme : settings.theme;

  return (
    <WorkoutProvider>
      <WorkoutRoutineProvider>
        <WorkoutHistoryProvider>
          <ThemeProvider
            value={effectiveColorScheme === 'dark' ? DarkTheme : DefaultTheme}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="workout/[id]"
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="workout-log/[id]"
                options={{ headerShown: true }}
              />
              <Stack.Screen name="settings" options={{ headerShown: true }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WorkoutHistoryProvider>
      </WorkoutRoutineProvider>
    </WorkoutProvider>
  );
}

export default function RootLayout() {
  return (
    <StorageBootstrap>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <SettingsProvider>
            <GluestackProvider>
              <ThemedApp />
            </GluestackProvider>
          </SettingsProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </StorageBootstrap>
  );
}
