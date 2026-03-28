import StatsContainer from '@/components/StatsView';
import { ThemedView } from '@/components/ThemedView';
import { Stack } from 'expo-router';

export default function StatsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '', headerBackTitle: 'Back' }} />
      <ThemedView className="flex-1">
        <StatsContainer />
      </ThemedView>
    </>
  );
}
