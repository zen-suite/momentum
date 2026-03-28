import { useShallow } from 'zustand/react/shallow';

import { useSettingsStore } from '@/store/settingsStore';

export function useSettings() {
  return useSettingsStore(
    useShallow((state) => ({
      settings: state.settings,
      updateTheme: state.updateTheme,
      updateExerciseDefaults: state.updateExerciseDefaults,
    })),
  );
}
