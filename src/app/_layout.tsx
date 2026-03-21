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
import { useColorScheme } from '@/hooks/useColorScheme';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <GluestackUIProvider mode="system">
      <WorkoutProvider>
        <WorkoutLogProvider>
        <WorkoutHistoryProvider>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{ presentation: 'modal', title: 'Modal' }}
            />
            <Stack.Screen name="workout/[id]" options={{ headerShown: true }} />
            <Stack.Screen name="workout-log/[id]" options={{ headerShown: true }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
        </WorkoutHistoryProvider>
        </WorkoutLogProvider>
      </WorkoutProvider>
    </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
