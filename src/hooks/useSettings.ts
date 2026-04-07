import { useShallow } from 'zustand/react/shallow';

import { useSettingsStore } from '@/store/settingsStore';

export function useSettings() {
  return useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      isLoaded: state.isLoaded,
      updateTheme: state.updateTheme,
      updateExerciseDefaults: state.updateExerciseDefaults,
      updateNotificationSettings: state.updateNotificationSettings,
      setNotificationsEnabled: state.setNotificationsEnabled,
    })),
  );
}
