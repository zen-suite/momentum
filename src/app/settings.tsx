import SettingsContainer from '@/components/SettingsView';
import { ThemedView } from '@/components/ThemedView';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '', headerBackTitle: 'Back' }} />
      <ThemedView className="flex-1">
        <SettingsContainer />
      </ThemedView>
    </>
  );
}
