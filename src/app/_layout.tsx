import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { WorkoutHistoryProvider } from '@/providers/WorkoutHistoryProvider';
import { WorkoutLogProvider } from '@/providers/WorkoutLogProvider';
import { WorkoutProvider } from '@/providers/WorkoutProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSettings } from '@/hooks/useSettings';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

function ThemedApp() {
  const systemColorScheme = useColorScheme();
  const { settings } = useSettings();

  const effectiveColorScheme =
    settings.theme === 'system' ? systemColorScheme : settings.theme;

  return (
    <GluestackUIProvider mode={settings.theme}>
      <WorkoutProvider>
        <WorkoutLogProvider>
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
        </WorkoutLogProvider>
      </WorkoutProvider>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SettingsProvider>
          <ThemedApp />
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
