import SettingsContainer from '@/components/SettingsView';
import { TabScreenLayout } from '@/components/TabScreenLayout';
import { Stack } from 'expo-router';

export default function SettingsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TabScreenLayout>
        <SettingsContainer />
      </TabScreenLayout>
    </>
  );
}
